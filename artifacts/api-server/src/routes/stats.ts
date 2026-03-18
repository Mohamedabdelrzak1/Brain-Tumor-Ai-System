import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, scansTable, analysisTable } from "@workspace/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const [totalScans] = await db.select({ count: sql<number>`count(*)` }).from(scansTable);
    const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
    const [totalDoctors] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "doctor"));
    const [totalStudents] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "student"));
    const [pendingScans] = await db.select({ count: sql<number>`count(*)` }).from(scansTable).where(eq(scansTable.status, "pending"));
    const [analyzedScans] = await db.select({ count: sql<number>`count(*)` }).from(scansTable).where(eq(scansTable.status, "analyzed"));

    const [malignantCases] = await db.select({ count: sql<number>`count(*)` })
      .from(analysisTable)
      .where(sql`tumor_type != 'no_tumor'`);

    const [benignCases] = await db.select({ count: sql<number>`count(*)` })
      .from(analysisTable)
      .where(eq(analysisTable.tumorType, "no_tumor"));

    const recentScans = await db.select({
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
      .orderBy(desc(scansTable.createdAt))
      .limit(5);

    const tumorDist = await db.select({
      type: analysisTable.tumorType,
      count: sql<number>`count(*)`,
    })
      .from(analysisTable)
      .groupBy(analysisTable.tumorType);

    res.json({
      totalScans: Number(totalScans.count),
      totalUsers: Number(totalUsers.count),
      totalDoctors: Number(totalDoctors.count),
      totalStudents: Number(totalStudents.count),
      pendingScans: Number(pendingScans.count),
      analyzedScans: Number(analyzedScans.count),
      malignantCases: Number(malignantCases.count),
      benignCases: Number(benignCases.count),
      recentScans,
      tumorTypeDistribution: tumorDist.map(d => ({ type: d.type, count: Number(d.count) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
