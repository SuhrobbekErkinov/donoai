"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight } from "lucide-react";
import { login, type LoginState } from "./actions";

type Demo = {
  initials: string;
  name: string;
  email: string;
  password: string;
  department: string;
  role: "ADMIN" | "EMPLOYEE";
};

const DEMO_USERS: Demo[] = [
  {
    initials: "SC",
    name: "Sarah Chen",
    email: "sarah@acmebank.test",
    password: "demo",
    department: "Compliance",
    role: "ADMIN",
  },
  {
    initials: "MP",
    name: "Marcus Park",
    email: "marcus@acmebank.test",
    password: "demo",
    department: "Customer Service",
    role: "EMPLOYEE",
  },
  {
    initials: "PS",
    name: "Priya Sharma",
    email: "priya@acmebank.test",
    password: "demo",
    department: "Loan Origination",
    role: "EMPLOYEE",
  },
  {
    initials: "DR",
    name: "Diego Rodriguez",
    email: "diego@acmebank.test",
    password: "demo",
    department: "Branch Operations",
    role: "EMPLOYEE",
  },
];

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[13px]">
            Work email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@acmebank.com"
            className="h-11"
            required
          />
          {state?.fieldErrors?.email && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[13px]">
              Password
            </Label>
            <span className="text-[11px] text-muted-foreground">
              Demo password is{" "}
              <span className="rounded bg-muted px-1 py-0.5 font-mono">
                demo
              </span>
            </span>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
            required
          />
          {state?.fieldErrors?.password && (
            <p className="text-xs text-destructive">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        {state?.error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{state.error}</div>
          </div>
        )}

        <SubmitButton />
      </form>

      <div>
        <div className="mb-3 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Demo accounts
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid gap-2">
          {DEMO_USERS.map((u) => (
            <button
              type="button"
              key={u.email}
              onClick={() => {
                setEmail(u.email);
                setPassword(u.password);
              }}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-all hover:border-ring hover:shadow-soft"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-foreground to-brand text-[11px] font-semibold text-white">
                {u.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[13.5px] font-medium">
                  {u.name}
                  {u.role === "ADMIN" && (
                    <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                      Admin
                    </span>
                  )}
                </div>
                <div className="truncate text-[11.5px] text-muted-foreground">
                  {u.department}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="h-11 w-full text-[14px]"
    >
      {pending ? "Signing in…" : "Sign in to DonoAI"}
      {!pending && <ArrowRight className="ml-1 h-4 w-4" />}
    </Button>
  );
}
