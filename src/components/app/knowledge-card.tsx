import Link from "next/link";
import { TypeIcon } from "./type-badge";
import type { KnowledgeType } from "@/lib/enums";

export type KnowledgeCardProps = {
  id: string;
  title: string;
  type: KnowledgeType | string;
  summary: string | null;
  tags: string[];
  author: { name: string };
  createdAt: Date;
};

export function KnowledgeCard({
  item,
  compact = false,
}: {
  item: KnowledgeCardProps;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/knowledge/${item.id}`}
      className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-px hover:border-ring hover:shadow-soft"
    >
      <TypeIcon type={item.type} />
      <div className="min-w-0 flex-1">
        <h3 className="text-[15.5px] font-semibold leading-snug tracking-tight">
          {item.title}
        </h3>
        {item.summary && !compact && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {item.summary}
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted-foreground">
          <span className="font-medium text-foreground/70">
            {item.author.name}
          </span>
          <span>·</span>
          <span>
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
          {item.tags.length > 0 && (
            <>
              <span>·</span>
              <div className="flex flex-wrap items-center gap-1">
                {item.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="text-[10.5px]">
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
