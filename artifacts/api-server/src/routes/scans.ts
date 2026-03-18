import { Router } from "express";
import { db } from "@workspace/db";
import { scansTable, scanNotesTable, usersTable, analysisTable } from "@workspace/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `scan-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const reqUser = (req as any).user;
    const { page = "1", limit = "20", status, patientId } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];

    if (reqUser.role === "student") {
      conditions.push(eq(scansTable.patientId, reqUser.userId));
    } else if (patientId) {
      conditions.push(eq(scansTable.patientId, parseInt(patientId)));
    }

    if (status && ["pending", "analyzed", "reviewed"].includes(status)) {
      conditions.push(eq(scansTable.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const scans = await db.select({
      id: scansTable.id,
      imageUrl: scansTable.imageUrl,
      status: scansTable.status,
      patientId: scansTable.patientId,
      patientName: usersTable.fullName,
      uploadedById: scansTable.uploadedById,
      notes: scansTable.notes,
      createdAt: scansTable.createdAt,
      updatedAt: scansTable.updatedAt,
    })
      .from(scansTable)
      .leftJoin(usersTable, eq(scansTable.patientId, usersTable.id))
      .where(whereClause)
      .orderBy(desc(scansTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(scansTable)
      .where(whereClause);

    res.json({ scans, total: Number(count), page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const reqUser = (req as any).user;
    const { notes } = req.body;
    let patientId = req.body.patientId ? parseInt(req.body.patientId) : reqUser.userId;

    const imageUrl = req.file ? `/api/uploads/${req.file.filename}` : null;

    const [scan] = await db.insert(scansTable).values({
      imageUrl,
      status: "pending",
      patientId,
      uploadedById: reqUser.userId,
      notes: notes || null,
    }).returning();

    const patient = await db.select({ fullName: usersTable.fullName })
      .from(usersTable).where(eq(usersTable.id, scan.patientId)).limit(1);

    res.status(201).json({ ...scan, patientName: patient[0]?.fullName || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [scan] = await db.select({
      id: scansTable.id,
      imageUrl: scansTable.imageUrl,
      status: scansTable.status,
      patientId: scansTable.patientId,
      patientName: usersTable.fullName,
      uploadedById: scansTable.uploadedById,
      notes: scansTable.notes,
      createdAt: scansTable.createdAt,
      updatedAt: scansTable.updatedAt,
    })
      .from(scansTable)
      .leftJoin(usersTable, eq(scansTable.patientId, usersTable.id))
      .where(eq(scansTable.id, id))
      .limit(1);

    if (!scan) {
      res.status(404).json({ message: "Scan not found" });
      return;
    }

    const [analysis] = await db.select().from(analysisTable).where(eq(analysisTable.scanId, id)).limit(1);

    const doctorNotes = await db.select({
      id: scanNotesTable.id,
      scanId: scanNotesTable.scanId,
      doctorId: scanNotesTable.doctorId,
      doctorName: usersTable.fullName,
      note: scanNotesTable.note,
      createdAt: scanNotesTable.createdAt,
    })
      .from(scanNotesTable)
      .leftJoin(usersTable, eq(scanNotesTable.doctorId, usersTable.id))
      .where(eq(scanNotesTable.scanId, id));

    const analysisResult = analysis ? {
      ...analysis,
      keyFindings: analysis.keyFindings ? JSON.parse(analysis.keyFindings) : [],
    } : undefined;

    res.json({ ...scan, analysis: analysisResult, doctorNotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(scanNotesTable).where(eq(scanNotesTable.scanId, id));
    await db.delete(analysisTable).where(eq(analysisTable.scanId, id));
    await db.delete(scansTable).where(eq(scansTable.id, id));
    res.json({ message: "Scan deleted successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/notes", authMiddleware, async (req, res) => {
  try {
    const scanId = parseInt(req.params.id);
    const doctorId = (req as any).user.userId;
    const { note } = req.body;

    if (!note) {
      res.status(400).json({ message: "Note is required" });
      return;
    }

    const [scanNote] = await db.insert(scanNotesTable).values({
      scanId,
      doctorId,
      note,
    }).returning();

    const [doctor] = await db.select({ fullName: usersTable.fullName })
      .from(usersTable).where(eq(usersTable.id, doctorId)).limit(1);

    res.status(201).json({ ...scanNote, doctorName: doctor?.fullName || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
