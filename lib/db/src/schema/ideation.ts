import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const ideationSessionsTable = pgTable("ideation_sessions", {
  id: serial("id").primaryKey(),
  mode: text("mode").notNull().default("explore"),
  pillarType: text("pillar_type"),
  configSnapshot: jsonb("config_snapshot").$type<{
    categories: string[];
    tags: string[];
    regions: string[];
    batchSize: number;
    exclusionList: string[];
  }>().notNull(),
  status: text("status").notNull().default("pending"),
  researchData: jsonb("research_data").$type<Record<string, unknown>>(),
  generatedCount: integer("generated_count").notNull().default(0),
  acceptedCount: integer("accepted_count").notNull().default(0),
  rejectedCount: integer("rejected_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const ideationIdeasTable = pgTable("ideation_ideas", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  pillarType: text("pillar_type").notNull(),
  title: text("title").notNull(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  riskFlags: jsonb("risk_flags").$type<{
    level: string;
    flags: { type: string; description: string }[];
  }>(),
  status: text("status").notNull().default("generated"),
  refinedContent: jsonb("refined_content").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ideationRejectionLogTable = pgTable("ideation_rejection_log", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").notNull(),
  sessionId: integer("session_id").notNull(),
  ideaTitle: text("idea_title").notNull(),
  pillarType: text("pillar_type").notNull(),
  rejectionTag: text("rejection_tag").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ideationExclusionListTable = pgTable("ideation_exclusion_list", {
  id: serial("id").primaryKey(),
  phrase: text("phrase").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ideationPromptTemplatesTable = pgTable("ideation_prompt_templates", {
  id: serial("id").primaryKey(),
  pillarType: text("pillar_type").notNull().unique(),
  promptText: text("prompt_text").notNull(),
  defaultPromptText: text("default_prompt_text").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type IdeationSession = typeof ideationSessionsTable.$inferSelect;
export type IdeationIdea = typeof ideationIdeasTable.$inferSelect;
export type IdeationRejectionLog = typeof ideationRejectionLogTable.$inferSelect;
export type IdeationExclusionItem = typeof ideationExclusionListTable.$inferSelect;
export type IdeationPromptTemplate = typeof ideationPromptTemplatesTable.$inferSelect;
