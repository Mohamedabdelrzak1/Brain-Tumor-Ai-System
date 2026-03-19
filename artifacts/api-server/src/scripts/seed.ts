import { db } from "@workspace/db";
import { usersTable, scansTable, analysisTable, notificationsTable } from "@workspace/db/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // ─── Users ──────────────────────────────────────────────────────────────────
  const existingUsers = await db.select().from(usersTable);
  const emailSet = new Set(existingUsers.map(u => u.email));

  const usersToInsert = [
    { fullName: "Dr. Sarah Johnson", email: "sarah.johnson@braintumor.com", password: hash("Doctor123"), role: "doctor" as const, organization: "Metro General Hospital", isActive: true },
    { fullName: "Dr. Ahmed Hassan", email: "ahmed.hassan@braintumor.com", password: hash("Doctor123"), role: "doctor" as const, organization: "Cairo University Hospital", isActive: true },
    { fullName: "Dr. Emily Chen", email: "emily.chen@braintumor.com", password: hash("Doctor123"), role: "doctor" as const, organization: "Stanford Medical", isActive: true },
    { fullName: "John Smith", email: "john.smith@braintumor.com", password: hash("Student123"), role: "student" as const, organization: "Medical University", isActive: true },
    { fullName: "Maria Garcia", email: "maria.garcia@braintumor.com", password: hash("Student123"), role: "student" as const, organization: "City Hospital", isActive: true },
    { fullName: "Ali Mohamed", email: "ali.mohamed@braintumor.com", password: hash("Student123"), role: "student" as const, organization: "Cairo Medical", isActive: true },
    { fullName: "Sophie Williams", email: "sophie.williams@braintumor.com", password: hash("Student123"), role: "student" as const, organization: "London Medical School", isActive: true },
    { fullName: "Carlos Mendez", email: "carlos.mendez@braintumor.com", password: hash("Student123"), role: "student" as const, organization: "Madrid Clinic", isActive: true },
    { fullName: "Inactive Doctor", email: "inactive.doctor@braintumor.com", password: hash("Doctor123"), role: "doctor" as const, organization: "Old Hospital", isActive: false },
  ].filter(u => !emailSet.has(u.email));

  if (usersToInsert.length > 0) {
    await db.insert(usersTable).values(usersToInsert);
    console.log(`✅ Inserted ${usersToInsert.length} users`);
  } else {
    console.log("⏭️ Extra users already exist");
  }

  // ─── Get all users for seeding ────────────────────────────────────────────
  const allUsers = await db.select().from(usersTable);
  const students = allUsers.filter(u => u.role === "student");
  const doctors = allUsers.filter(u => u.role === "doctor");

  if (students.length === 0) {
    console.log("No students found, skipping scans");
    return;
  }

  // ─── Scans ─────────────────────────────────────────────────────────────────
  const existingScans = await db.select().from(scansTable);
  if (existingScans.length < 5) {
    const statusCycle = ["pending", "analyzed", "reviewed", "analyzed", "pending", "reviewed", "analyzed", "pending"] as const;
    const scansToInsert = students.flatMap((student, si) =>
      [0, 1].map((i) => ({
        patientId: student.id,
        uploadedById: student.id,
        imageUrl: null,
        status: statusCycle[(si * 2 + i) % statusCycle.length],
        createdAt: new Date(Date.now() - (si * 2 + i) * 86400000 * 2),
        updatedAt: new Date(Date.now() - (si * 2 + i) * 86400000 * 2),
      }))
    );

    const insertedScans = await db.insert(scansTable).values(scansToInsert).returning();
    console.log(`✅ Inserted ${insertedScans.length} scans`);

    // ─── Analysis ────────────────────────────────────────────────────────────
    const tumorTypes = ["glioma", "meningioma", "pituitary", "no_tumor", "glioma", "meningioma"] as const;
    const riskLevels = ["high", "medium", "low", "low", "critical", "medium"] as const;
    const summaries = [
      "AI analysis detected irregular tissue mass in the right frontal lobe. Characteristics are consistent with glioma. Immediate consultation recommended.",
      "Scan shows a well-defined mass near the dural surface, consistent with meningioma. Monitoring advised.",
      "Pituitary adenoma detected with mild mass effect. Endocrinology follow-up recommended.",
      "No significant abnormality detected. Brain structures appear normal. Routine follow-up advised.",
      "Large infiltrative mass with surrounding edema detected. High-grade glioma suspected. Urgent review required.",
      "Small calcified meningioma detected. Stable appearance, likely benign. Annual imaging recommended.",
    ];

    const analyzedScans = insertedScans.filter(s => s.status === "analyzed" || s.status === "reviewed");
    if (analyzedScans.length > 0) {
      const analysisToInsert = analyzedScans.map((scan, i) => ({
        scanId: scan.id,
        tumorType: tumorTypes[i % tumorTypes.length],
        confidence: 0.75 + (i % 5) * 0.05,
        riskLevel: riskLevels[i % riskLevels.length],
        summary: summaries[i % summaries.length],
        keyFindings: JSON.stringify([
          "Irregular tissue mass detected in imaging",
          "Mass effect on surrounding structures observed",
          "Signal characteristics suggest active lesion",
        ]),
        doctorReviewed: scan.status === "reviewed",
      }));
      await db.insert(analysisTable).values(analysisToInsert);
      console.log(`✅ Inserted ${analysisToInsert.length} analysis records`);
    }
  } else {
    console.log("⏭️ Scans already exist");
  }

  // ─── Notifications ────────────────────────────────────────────────────────
  const existingNotifs = await db.select().from(notificationsTable);
  if (existingNotifs.length < 3 && students.length > 0) {
    const notifData = students.slice(0, 4).flatMap((student, i) => [
      { userId: student.id, title: "Scan Result Available", message: "Your recent MRI scan result is ready. Please review.", type: "info" as const, isRead: false },
      { userId: student.id, title: "Doctor's Note Added", message: "Your doctor has added a clinical evaluation to your scan.", type: "success" as const, isRead: i > 0 },
    ]);
    await db.insert(notificationsTable).values(notifData);
    console.log(`✅ Inserted ${notifData.length} notifications`);
  }

  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
