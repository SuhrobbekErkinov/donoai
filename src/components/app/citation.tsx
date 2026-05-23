"use client";

import Link from "next/link";

export function CitationBadge({
  id,
  index,
}: {
  id: string;
  index: number;
}) {
  return (
    <Link
      href={`/knowledge/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Open source in new tab"
      className="mx-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-md border border-brand-soft bg-brand-soft px-1 align-text-bottom text-[10px] font-semibold text-accent-foreground transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground"
    >
      {index}
    </Link>
  );
}

export function renderWithCitations(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const order: string[] = [];
  let lastIndex = 0;
  const re = /\[K([A-Za-z0-9_-]+)\]/g;
  for (const m of text.matchAll(re)) {
    const id = m[1];
    const start = m.index ?? 0;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    if (!order.includes(id)) order.push(id);
    const index = order.indexOf(id) + 1;
    parts.push(<CitationBadge key={`${start}-${id}`} id={id} index={index} />);
    lastIndex = start + m[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
