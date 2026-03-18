import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const scanStatusEnum = pgEnum("scan_status", ["pending", "analyzed", "reviewed"]);

export const scansTable = pgTable("scans", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url"),
  status: scanStatusEnum("status").notNull().default("pending"),
  patientId: integer("patient_id").notNull().references(() => usersTable.id),
  uploadedById: integer("uploaded_by_id").notNull().references(() => usersTable.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const scanNotesTable = pgTable("scan_notes", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").notNull().references(() => scansTable.id),
  doctorId: integer("doctor_id").notNull().references(() => usersTable.id),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertScanSchema = createInsertSchema(scansTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertScanNoteSchema = createInsertSchema(scanNotesTable).omit({ id: true, createdAt: true });
export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scansTable.$inferSelect;
export type ScanNote = typeof scanNotesTable.$inferSelect;
