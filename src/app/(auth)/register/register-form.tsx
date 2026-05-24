"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight } from "lucide-react";
import { register, type RegisterState } from "./actions";

export function RegisterForm() {
  const [state, formAction] = useActionState<RegisterState, FormData>(
    register,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-[13px]">
          Full name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          className="h-11"
          required
        />
        {state?.fieldErrors?.name && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.name[0]}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-[13px]">
          Work email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
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
        <Label htmlFor="password" className="text-[13px]">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
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
      {pending ? "Creating account…" : "Create account"}
      {!pending && <ArrowRight className="ml-1 h-4 w-4" />}
    </Button>
  );
}
