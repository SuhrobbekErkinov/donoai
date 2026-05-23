"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-auth";
import { ReportInputSchema, type ReportInput } from "@/lib/schemas";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

// Convert any Date to that week's Monday at 00:00 UTC.
function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getUTCDay() || 7; // Sunday(0) → 7
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export async function listReports() {
  const user = await requireUser();
  return db.weeklyReport.findMany({
    where: { userId: user.id },
    orderBy: { weekStart: "desc" },
  });
}

export async function getReport(id: string) {
  const user = await requireUser();
  return db.weeklyReport.findFirst({
    where: { id, userId: user.id },
  });
}

export async function createBlankReport(): Promise<never> {
  return openReportForWeek(new Date().toISOString());
}

// Open (or create) the report for the week containing the given date.
// Used by both "this week" and the calendar strip.
export async function openReportForWeek(weekStartISO: string): Promise<never> {
  const user = await requireUser();
  const weekStart = startOfWeek(new Date(weekStartISO));
  const report = await db.weeklyReport.upsert({
    where: { userId_weekStart: { userId: user.id, weekStart } },
    create: { userId: user.id, weekStart },
    update: {},
  });
  revalidatePath("/reports");
  redirect(`/reports/${report.id}`);
}

export async function saveReport(
  id: string,
  raw: ReportInput,
): Promise<Result> {
  const user = await requireUser();
  const parsed = ReportInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }
  const found = await db.weeklyReport.findFirst({
    where: { id, userId: user.id },
    select: { id: true, status: true },
  });
  if (!found) return { ok: false, error: "Not found" };
  if (found.status === "SUBMITTED") {
    return { ok: false, error: "Cannot edit a submitted report" };
  }
  await db.weeklyReport.update({
    where: { id },
    data: {
      tasksCompleted: parsed.data.tasksCompleted,
      challenges: parsed.data.challenges,
      keyActivities: parsed.data.keyActivities,
    },
  });
  revalidatePath("/reports");
  revalidatePath(`/reports/${id}`);
  return { ok: true };
}

export async function submitReport(id: string): Promise<Result> {
  const user = await requireUser();
  const found = await db.weeklyReport.findFirst({
    where: { id, userId: user.id },
    select: { id: true, status: true },
  });
  if (!found) return { ok: false, error: "Not found" };
  if (found.status === "SUBMITTED") return { ok: true };
  await db.weeklyReport.update({
    where: { id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });
  revalidatePath("/reports");
  revalidatePath(`/reports/${id}`);
  return { ok: true };
}

export async function deleteReport(id: string): Promise<Result> {
  const user = await requireUser();
  const found = await db.weeklyReport.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!found) return { ok: false, error: "Not found" };
  await db.weeklyReport.delete({ where: { id } });
  revalidatePath("/reports");
  return { ok: true };
}
