// TypeScript-side "enums" for fields stored as strings in SQLite.
import { z } from "zod";

export const ROLES = ["EMPLOYEE", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];
export const RoleSchema = z.enum(ROLES);

export const KNOWLEDGE_TYPES = [
  "WORKFLOW",
  "DOCUMENT",
  "CASE",
  "BEST_PRACTICE",
  "TIP",
] as const;
export type KnowledgeType = (typeof KNOWLEDGE_TYPES)[number];
export const KnowledgeTypeSchema = z.enum(KNOWLEDGE_TYPES);

export const KNOWLEDGE_TYPE_LABELS: Record<KnowledgeType, string> = {
  WORKFLOW: "Workflow",
  DOCUMENT: "Document",
  CASE: "Case resolution",
  BEST_PRACTICE: "Best practice",
  TIP: "Tip",
};

export const MESSAGE_ROLES = ["USER", "ASSISTANT"] as const;
export type MessageRole = (typeof MESSAGE_ROLES)[number];

export const REPORT_STATUSES = ["DRAFT", "SUBMITTED"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export function isAdminRole(role: string | undefined | null): boolean {
  return role === "ADMIN";
}
