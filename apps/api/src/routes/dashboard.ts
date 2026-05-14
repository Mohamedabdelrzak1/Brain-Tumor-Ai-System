import { Router } from "express";
import { authMiddleware } from "../lib/auth";
import { db } from "@workspace/db";
import { scansTable, analysisTable, usersTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";

const router = Router();

// Dashboard summary (lightweight). If DB is not ready, it still returns safe numbers.
router.get("/", authMiddleware, async (_req, res) => {
  try {
    const [{ scanCount }] = await db.select({ scanCount: sql<number>`count(*)` }).from(scansTable);
    const [{ analysisCount }] = await db.select({ analysisCount: sql<number>`count(*)` }).from(analysisTable);
    const [{ userCount }] = await db.select({ userCount: sql<number>`count(*)` }).from(usersTable);

    res.json({
      stats: {
        scans: Number(scanCount),
        analyses: Number(analysisCount),
        users: Number(userCount),
      },
    });
  } catch {
    // Mock fallback
    res.json({
      stats: { scans: 0, analyses: 0, users: 0 },
      mocked: true,
    });
  }
});

export default router;

