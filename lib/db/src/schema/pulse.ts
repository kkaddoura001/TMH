import { pgTable, serial, text, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pulseTopicsTable = pgTable("pulse_topics", {
  id: serial("id").primaryKey(),
  topicId: text("topic_id").notNull().unique(),
  tag: text("tag").notNull(),
  tagColor: text("tag_color").notNull().default("#DC143C"),
  title: text("title").notNull(),
  stat: text("stat").notNull(),
  delta: text("delta").notNull(),
  deltaUp: boolean("delta_up").notNull().default(true),
  blurb: text("blurb").notNull(),
  source: text("source").notNull(),
  sparkData: jsonb("spark_data").$type<number[]>().notNull().default([]),
  liveConfig: jsonb("live_config").$type<{ baseValue: number; annualGrowth: number } | null>().default(null),
  sortOrder: serial("sort_order"),
  editorialStatus: text("editorial_status").notNull().default("approved"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPulseTopicSchema = createInsertSchema(pulseTopicsTable).omit({ id: true });
export type PulseTopic = typeof pulseTopicsTable.$inferSelect;
export type InsertPulseTopic = z.infer<typeof insertPulseTopicSchema>;
