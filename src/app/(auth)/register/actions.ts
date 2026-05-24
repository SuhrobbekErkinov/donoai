"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { db } from "@/lib/db";

const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Use at least 6 characters."),
});

export type RegisterState = {
  error?: string;
  fieldErrors?: { name?: string[]; email?: string[]; password?: string[] };
} | null;

// New members join the shared workspace so they immediately see the existing
// knowledge base. Get-or-create keeps registration working on a fresh DB too.
async function sharedOrgId(): Promise<string> {
  const existing =
    (await db.organization.findFirst({ where: { slug: "acme" } })) ??
    (await db.organization.findFirst());
  if (existing) return existing.id;
  const created = await db.organization.create({
    data: { name: "Acme Bank", slug: "acme" },
  });
  return created.id;
}

export async function register(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const name = parsed.data.name;
  const email = parsed.data.email.toLowerCase().trim();
  const { password } = parsed.data;

  const taken = await db.user.findUnique({ where: { email } });
  if (taken) {
    return { fieldErrors: { email: ["That email is already registered."] } };
  }

  const orgId = await sharedOrgId();
  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.create({
    data: { name, email, passwordHash, role: "EMPLOYEE", orgId },
  });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) {
      // Account was created; let them sign in manually.
      redirect("/login");
    }
    throw e;
  }

  redirect("/dashboard");
}
