import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "brain-tumor-secret-key-2024";

// =========================
// 🔐 TOKEN
// =========================
export function generateToken(payload: { userId: number; role: string }) {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role.toLowerCase(), // 🔥 FIX هنا
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
}

// =========================
// 🔑 PASSWORD
// =========================
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// =========================
// 🛡️ AUTH MIDDLEWARE
// =========================
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    // 🔥 نضمن lowercase
    (req as any).user = {
      ...decoded,
      role: decoded.role.toLowerCase(),
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// =========================
// 🔒 ROLE GUARD
// =========================
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}