import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const adminHash = await bcrypt.hash("Admin123", 10);
  const doctorHash = await bcrypt.hash("Doctor123", 10);
  const studentHash = await bcrypt.hash("Student123", 10);

  const users = [
    {
      fullName: "Admin User",
      email: "admin@braintumor.com",
      password: adminHash,
      role: "admin" as const,
      organization: "Brain Tumor System",
    },
    {
      fullName: "Dr. Sarah Johnson",
      email: "doctor@braintumor.com",
      password: doctorHash,
      role: "doctor" as const,
      organization: "General Hospital",
    },
    {
      fullName: "Jane Smith",
      email: "student@braintumor.com",
      password: studentHash,
      role: "student" as const,
      organization: "Medical University",
    },
  ];

  for (const user of users) {
    try {
      await db.insert(usersTable).values(user).onConflictDoNothing();
      console.log(`Created user: ${user.email} (${user.role})`);
    } catch (err) {
      console.log(`Skipping ${user.email} - already exists`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
