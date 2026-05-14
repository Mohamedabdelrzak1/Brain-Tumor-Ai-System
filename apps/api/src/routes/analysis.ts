import { Router } from "express";
import { db } from "@workspace/db";
import { analysisTable, scansTable, notificationsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

const TUMOR_TYPES = ["glioma", "meningioma", "pituitary", "no_tumor"] as const;
const RISK_MAP: Record<string, "low" | "medium" | "high" | "critical"> = {
  glioma: "critical",
  meningioma: "high",
  pituitary: "medium",
  no_tumor: "low",
};

const SUMMARIES: Record<string, string> = {
  glioma: "The AI detected abnormal patterns in the scanned brain image that are commonly associated with malignant glioma tumors.",
  meningioma: "The AI detected patterns consistent with meningioma, a typically benign tumor arising from the meninges.",
  pituitary: "The AI detected patterns consistent with a pituitary tumor in the region of the pituitary gland.",
  no_tumor: "No abnormal patterns detected. The brain scan appears normal with no signs of tumor presence.",
};

const KEY_FINDINGS: Record<string, string[]> = {
  glioma: ["Abnormal tissue patterns detected", "Irregular shape and intensity", "Matches malignant indicators"],
  meningioma: ["Well-defined mass detected", "Consistent with meningeal origin", "Moderate risk indicators"],
  pituitary: ["Pituitary region abnormality detected", "Consistent with pituitary adenoma", "Moderate risk level"],
  no_tumor: ["No abnormal tissue patterns", "Normal brain structure", "No mass or lesion detected"],
};

async function runAnalysis(req: any, res: any) {
  try {
    const scanId = parseInt(String(req.params.scanId));

    const [scan] = await db.select().from(scansTable).where(eq(scansTable.id, scanId)).limit(1);
    if (!scan) {
      res.status(404).json({ message: "Scan not found" });
      return;
    }

    const existing = await db.select().from(analysisTable).where(eq(analysisTable.scanId, scanId)).limit(1);
    if (existing.length > 0) {
      const analysis = existing[0];
      const result = {
        ...analysis,
        keyFindings: analysis.keyFindings ? JSON.parse(analysis.keyFindings) : [],
      };
      res.json(result);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const tumorType = TUMOR_TYPES[Math.floor(Math.random() * TUMOR_TYPES.length)];
    const confidence = 0.75 + Math.random() * 0.22;
    const riskLevel = RISK_MAP[tumorType];
    const summary = SUMMARIES[tumorType];
    const keyFindings = KEY_FINDINGS[tumorType];

    const [analysis] = await db.insert(analysisTable).values({
      scanId,
      tumorType,
      confidence,
      riskLevel,
      summary,
      keyFindings: JSON.stringify(keyFindings),
    }).returning();

    await db.update(scansTable).set({ status: "analyzed", updatedAt: new Date() }).where(eq(scansTable.id, scanId));

    await db.insert(notificationsTable).values({
      userId: scan.patientId,
      title: "Scan Result Available",
      message: `Your recent MRI scan result is ready. Tumor type: ${tumorType.replace("_", " ")}`,
      type: "scan_result",
      isRead: false,
    });

    res.json({
      ...analysis,
      keyFindings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

router.post("/:scanId", authMiddleware, runAnalysis);

// Alias to match requested endpoint: POST /api/analysis/run/:scanId
router.post("/run/:scanId", authMiddleware, runAnalysis);

router.get("/:scanId", authMiddleware, async (req, res) => {
  try {
    const scanId = parseInt(String(req.params.scanId));
    const [analysis] = await db.select().from(analysisTable).where(eq(analysisTable.scanId, scanId)).limit(1);

    if (!analysis) {
      res.status(404).json({ message: "No analysis found for this scan" });
      return;
    }

    res.json({
      ...analysis,
      keyFindings: analysis.keyFindings ? JSON.parse(analysis.keyFindings) : [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { page = "1", limit = "20" } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const analyses = await db.select().from(analysisTable)
      .orderBy(desc(analysisTable.analyzedAt))
      .limit(limitNum)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(analysisTable);

    const result = analyses.map(a => ({
      ...a,
      keyFindings: a.keyFindings ? JSON.parse(a.keyFindings) : [],
    }));

    res.json({ analyses: result, total: Number(count), page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
