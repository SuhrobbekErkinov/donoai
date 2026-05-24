import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-[28px] font-semibold tracking-[-0.015em]">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Join your bank's workspace and start asking DonoAI.
        </p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
