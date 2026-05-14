import { Router } from "express";
import { db } from "@workspace/db";
import { analysisTable, scanNotesTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

// POST /api/doctor-notes
// body: { analysisId: number, note: string }
router.post("/", authMiddleware, async (req, res) => {
  try {
    const doctorId = (req as any).user.userId as number;
    const analysisId = Number(req.body?.analysisId);
    const note = (req.body?.note as string | undefined)?.trim();

    if (!analysisId || Number.isNaN(analysisId)) {
      res.status(400).json({ message: "analysisId is required" });
      return;
    }
    if (!note) {
      res.status(400).json({ message: "note is required" });
      return;
    }

    const [analysis] = await db.select().from(analysisTable).where(eq(analysisTable.id, analysisId)).limit(1);
    if (!analysis) {
      res.status(404).json({ message: "Analysis not found" });
      return;
    }

    const [created] = await db.insert(scanNotesTable).values({
      scanId: analysis.scanId,
      doctorId,
      note,
    }).returning();

    const [doctor] = await db
      .select({ fullName: usersTable.fullName })
      .from(usersTable)
      .where(eq(usersTable.id, doctorId))
      .limit(1);

    res.status(201).json({ ...created, doctorName: doctor?.fullName || null, analysisId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/doctor-notes/:analysisId
router.get("/:analysisId", authMiddleware, async (req, res) => {
  try {
    const analysisId = Number(req.params.analysisId);
    if (!analysisId || Number.isNaN(analysisId)) {
      res.status(400).json({ message: "Invalid analysisId" });
      return;
    }

    const [analysis] = await db.select().from(analysisTable).where(eq(analysisTable.id, analysisId)).limit(1);
    if (!analysis) {
      res.status(404).json({ message: "Analysis not found" });
      return;
    }

    const notes = await db
      .select({
        id: scanNotesTable.id,
        scanId: scanNotesTable.scanId,
        doctorId: scanNotesTable.doctorId,
        doctorName: usersTable.fullName,
        note: scanNotesTable.note,
        createdAt: scanNotesTable.createdAt,
      })
      .from(scanNotesTable)
      .leftJoin(usersTable, eq(scanNotesTable.doctorId, usersTable.id))
      .where(eq(scanNotesTable.scanId, analysis.scanId));

    res.json({ analysisId, notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/doctor-notes/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      res.status(400).json({ message: "Invalid id" });
      return;
    }

    await db.delete(scanNotesTable).where(eq(scanNotesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

