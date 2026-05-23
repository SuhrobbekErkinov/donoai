import { IconBadge } from "./icon-badge";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center",
        className,
      )}
    >
      <IconBadge tone="neutral" size="lg">
        {icon}
      </IconBadge>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {description && (
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
