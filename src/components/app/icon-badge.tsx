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
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    rose: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
    violet:
      "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
    emerald:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    sky: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
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
