import { cn } from "@/lib/utils";

// Square tinted icon container — the DonoAI signature visual element.
// Used in section headers, action cards, list rows, sidebar nav.
export function IconBadge({
  children,
  tone = "brand",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  tone?: "brand" | "amber" | "rose" | "violet" | "emerald" | "sky" | "neutral";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-soft text-accent-foreground",
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-800",
    violet: "bg-violet-100 text-violet-800",
    emerald: "bg-emerald-100 text-emerald-800",
    sky: "bg-sky-100 text-sky-800",
    neutral: "bg-muted text-muted-foreground",
  };
  const sizes: Record<string, string> = {
    sm: "h-7 w-7 rounded-md [&_svg]:h-3.5 [&_svg]:w-3.5",
    md: "h-10 w-10 rounded-lg [&_svg]:h-5 [&_svg]:w-5",
    lg: "h-12 w-12 rounded-xl [&_svg]:h-6 [&_svg]:w-6",
  };
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
