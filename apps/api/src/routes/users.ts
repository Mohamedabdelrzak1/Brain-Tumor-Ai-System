import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { authMiddleware, requireRole } from "../lib/auth";

const router = Router();

router.get("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { role, page = "1", limit = "20" } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (role && ["admin", "doctor", "student"].includes(role)) {
      conditions.push(eq(usersTable.role, role));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const users = await db.select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      email: usersTable.email,
      role: usersTable.role,
      organization: usersTable.organization,
      avatar: usersTable.avatar,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    }).from(usersTable)
      .where(whereClause)
      .limit(limitNum)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(usersTable)
      .where(whereClause);

    res.json({ users, total: Number(count), page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await db.select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      email: usersTable.email,
      role: usersTable.role,
      organization: usersTable.organization,
      avatar: usersTable.avatar,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, id)).limit(1);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { fullName, email, organization, role, isActive } = req.body;

    const [updated] = await db.update(usersTable)
      .set({
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(organization !== undefined && { organization }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { password, resetCode, resetCodeExpiry, ...safeUser } = updated;
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(usersTable).where(eq(usersTable.id, id));
    res.json({ message: "User deleted successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
