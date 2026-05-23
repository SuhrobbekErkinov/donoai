import Link from "next/link";
import { LoginForm } from "./login-form";
import { ShieldCheck, Lock, BookOpen, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — desktop only */}
      <div className="bg-grain relative hidden flex-col justify-between overflow-hidden border-r border-border bg-gradient-to-br from-foreground via-foreground to-brand p-12 text-background lg:flex">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">DonoAI</span>
          </Link>
        </div>

        <div className="space-y-8">
          <p className="text-[28px] font-medium leading-[1.25] tracking-tight">
            "It used to take a new analyst three weeks to learn our SAR
            workflow.{" "}
            <span className="text-background/70">
              Now they ask DonoAI, and they're productive on day two."
            </span>
          </p>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-[12px] font-semibold">
              SC
            </div>
            <div>
              <div className="text-sm font-medium">Sarah Chen</div>
              <div className="text-xs text-background/60">
                Head of Compliance, Acme Bank
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <Stat icon={<BookOpen className="h-3.5 w-3.5" />} label="Knowledge items" value="8" />
          <Stat icon={<Sparkles className="h-3.5 w-3.5" />} label="Answers cited" value="100%" />
          <Stat icon={<Lock className="h-3.5 w-3.5" />} label="Workspace isolated" value="Yes" />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden"
          >
            <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-foreground to-brand text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            DonoAI
          </Link>

          <div className="mb-7">
            <h1 className="text-[28px] font-semibold tracking-[-0.015em]">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Secure access to your bank's institutional knowledge.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-[11px] text-muted-foreground">
            Protected by enterprise-grade access controls and audit logging.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-background/60">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
