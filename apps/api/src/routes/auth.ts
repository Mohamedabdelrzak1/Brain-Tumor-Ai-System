import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { generateToken, hashPassword, comparePassword, authMiddleware } from "../lib/auth";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ message: "Account is deactivated" });
      return;
    }

    const token = generateToken({ userId: user.id, role: user.role });
    const { password: _, resetCode: __, resetCodeExpiry: ___, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, organization, role } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const hashed = await hashPassword(password);
    const userRole = role && ["admin", "doctor", "student"].includes(role) ? role : "student";

    const [newUser] = await db.insert(usersTable).values({
      fullName,
      email,
      password: hashed,
      role: userRole,
      organization: organization || null,
    }).returning();

    const token = generateToken({ userId: newUser.id, role: newUser.role });
    const { password: _, resetCode: __, resetCodeExpiry: ___, ...safeUser } = newUser;
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    if (user) {
      await db.update(usersTable)
        .set({ resetCode: code, resetCodeExpiry: expiry })
        .where(eq(usersTable.email, email));
    }

    console.log(`[RESET CODE for ${email}]: ${code}`);
    res.json({ message: "If the email exists, a reset code has been sent", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ message: "Email and code required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !user.resetCode || !user.resetCodeExpiry) {
      res.status(400).json({ message: "Invalid or expired code" });
      return;
    }

    if (user.resetCode !== code || new Date() > user.resetCodeExpiry) {
      res.status(400).json({ message: "Invalid or expired code" });
      return;
    }

    res.json({ message: "Code verified successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (!email || !code || !newPassword || !confirmPassword) {
      res.status(400).json({ message: "All fields required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !user.resetCode || user.resetCode !== code) {
      res.status(400).json({ message: "Invalid or expired code" });
      return;
    }

    const hashed = await hashPassword(newPassword);
    await db.update(usersTable)
      .set({ password: hashed, resetCode: null, resetCodeExpiry: null })
      .where(eq(usersTable.email, email));

    res.json({ message: "Password reset successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const { password, resetCode, resetCodeExpiry, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ message: "All fields required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }

    const hashed = await hashPassword(newPassword);
    await db.update(usersTable).set({ password: hashed }).where(eq(usersTable.id, userId));

    res.json({ message: "Password changed successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Requested endpoint: POST /api/Auth/logout
// JWT-based auth is stateless, so logout is client-side (delete token).
router.post("/logout", authMiddleware, async (_req, res) => {
  res.json({ success: true });
});

export default router;
