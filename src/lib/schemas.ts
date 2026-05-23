// Zod input schemas for every mutating server action.
import { z } from "zod";
import { KnowledgeTypeSchema } from "./enums";

export const KnowledgeInputSchema = z.object({
  title: z.string().min(3).max(160),
  content: z.string().min(10).max(20_000),
  type: KnowledgeTypeSchema.default("DOCUMENT"),
  tags: z.array(z.string().min(1).max(40)).max(10).default([]),
  sourceFilename: z.string().max(200).nullable().optional(),
});
export type KnowledgeInput = z.infer<typeof KnowledgeInputSchema>;

export const ReportInputSchema = z.object({
  weekStart: z.string(), // ISO date (Monday)
  tasksCompleted: z.string().max(8000).default(""),
  challenges: z.string().max(8000).default(""),
  keyActivities: z.string().max(8000).default(""),
});
export type ReportInput = z.infer<typeof ReportInputSchema>;

export const AssistantQuerySchema = z.object({
  conversationId: z.string().optional(), // omit = start new conversation
  question: z.string().min(1).max(4000),
});
export type AssistantQuery = z.infer<typeof AssistantQuerySchema>;
