import { pgTable, text, serial, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { scansTable } from "./scans";

export const tumorTypeEnum = pgEnum("tumor_type", ["glioma", "meningioma", "pituitary", "no_tumor"]);
export const riskLevelEnum = pgEnum("risk_level", ["low", "medium", "high", "critical"]);

export const analysisTable = pgTable("analysis", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").notNull().references(() => scansTable.id).unique(),
  tumorType: tumorTypeEnum("tumor_type").notNull(),
  confidence: real("confidence").notNull(),
  riskLevel: riskLevelEnum("risk_level").notNull(),
  summary: text("summary"),
  keyFindings: text("key_findings"),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analysisTable).omit({ id: true, analyzedAt: true });
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysisTable.$inferSelect;
