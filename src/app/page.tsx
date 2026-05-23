import Link from "next/link";
import { LinkButton } from "@/components/ui/link-button";
import {
  ShieldCheck,
  BookOpen,
  MessageSquareText,
  FileText,
  ArrowRight,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeaturesSection />
        <ProofSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-foreground to-brand text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">DonoAI</span>
        </Link>
        <nav className="flex items-center gap-1.5">
          <LinkButton href="/login" variant="ghost" size="sm">
            Sign in
          </LinkButton>
          <LinkButton href="/login" size="sm">
            Try the demo <ArrowRight className="ml-1 h-4 w-4" />
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-grain relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 -top-40 -z-0 h-[500px] bg-gradient-to-b from-brand-soft/40 via-background to-background"
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 pt-20 pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-32">
        {/* Left: copy */}
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-soft">
            <Lock className="h-3 w-3 text-brand" />
            Bank-grade · locally trainable
          </div>
          <h1 className="mt-5 text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[56px]">
            Your bank's{" "}
            <span className="bg-gradient-to-r from-foreground via-brand to-foreground bg-clip-text text-transparent">
              institutional memory
            </span>
            , always on call.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            DonoAI captures the workflows, resolved cases, and best practices
            your team already knows — then answers in seconds, citing the
            source. New hires onboard faster. Knowledge stops walking out the
            door.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton
              href="/login"
              size="lg"
              className="h-12 px-6 text-[15px]"
            >
              Try the live demo
              <ArrowRight className="ml-1 h-4 w-4" />
            </LinkButton>
            <LinkButton
              href="#features"
              size="lg"
              variant="outline"
              className="h-12 px-6 text-[15px]"
            >
              See how it works
            </LinkButton>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              Citations on every answer
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              SSO ready
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              Audit-friendly
            </span>
          </div>
        </div>

        {/* Right: floating chat mockup */}
        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative hidden lg:block">
      {/* The card */}
      <div className="relative rounded-2xl border border-border bg-card p-5 shadow-lift">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 pb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted" />
          <span className="ml-3 text-[11px] text-muted-foreground">
            donoai.acmebank.com
          </span>
        </div>

        {/* User bubble */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-[13.5px] text-background">
            What's the deadline for filing a SAR?
          </div>
        </div>

        {/* Assistant block */}
        <div className="mt-4 flex gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-foreground to-brand text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="mb-1 text-[11px] font-medium text-muted-foreground">
              DonoAI
            </div>
            <p className="text-[13.5px] leading-relaxed text-foreground">
              You must file a Suspicious Activity Report within{" "}
              <span className="font-medium">30 calendar days</span> of detecting
              the activity
              <span className="mx-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-brand-soft bg-brand-soft px-1 align-text-bottom text-[10px] font-medium text-accent-foreground">
                1
              </span>
              . Two common mistakes
              <span className="mx-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-brand-soft bg-brand-soft px-1 align-text-bottom text-[10px] font-medium text-accent-foreground">
                1
              </span>
              :
            </p>
            <ul className="mt-2 space-y-1 text-[13.5px] text-foreground">
              <li className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                Missing the 30-day window (clock starts at detection)
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                Tipping off the customer
              </li>
            </ul>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
              <BookOpen className="h-3.5 w-3.5 text-brand" />
              <span className="text-[11px] text-muted-foreground">
                Source:
              </span>
              <span className="text-[11.5px] font-medium">
                Filing a Suspicious Activity Report (SAR)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating sparkle accent */}
      <div className="absolute -right-4 -top-4 grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card shadow-lift">
        <Sparkles className="h-5 w-5 text-brand" />
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-brand">
            Three surfaces, one knowledge base
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Capture what your team knows. Answer with their words.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Knowledge Feed"
            body="Employees publish workflows, case resolutions, and best practices. Tagged, searchable, attributed."
            tone="brand"
          />
          <FeatureCard
            icon={<MessageSquareText className="h-5 w-5" />}
            title="AI Assistant"
            body="Ask in plain English. Every answer is grounded in your bank's documented practice — and cites the source."
            tone="violet"
          />
          <FeatureCard
            icon={<FileText className="h-5 w-5" />}
            title="Weekly Reports"
            body="Auto-drafted from what each employee actually did. Less time reporting, more time on the customer."
            tone="amber"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tone: "brand" | "violet" | "amber";
}) {
  const tones: Record<typeof tone, string> = {
    brand: "bg-brand-soft text-accent-foreground",
    violet: "bg-violet-100 text-violet-800",
    amber: "bg-amber-100 text-amber-800",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-transform hover:-translate-y-0.5">
      <div
        className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}
      >
        {icon}
      </div>
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

function ProofSection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-brand">
              Built for compliance teams
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">
              Citations on every answer. Audit logs by design.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Banking compliance can't run on "the AI made it up." Every DonoAI
              answer cites the specific knowledge item it drew from — clickable,
              author-attributed, dated. If a policy changes, the source updates
              and so do future answers.
            </p>
          </div>
          <div className="space-y-3">
            <ProofRow text="Per-organization knowledge isolation" />
            <ProofRow text="Author attribution and timestamps on every item" />
            <ProofRow text="Every assistant reply cites its sources" />
            <ProofRow text="AI layer swappable for self-hosted models" />
            <ProofRow text="Built on a 1M-token context — no chunking gymnastics" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProofRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-foreground to-brand text-white">
            <ShieldCheck className="h-3 w-3" />
          </div>
          <span>DonoAI — institutional memory for modern banks.</span>
        </div>
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          Sign in →
        </Link>
      </div>
    </footer>
  );
}
