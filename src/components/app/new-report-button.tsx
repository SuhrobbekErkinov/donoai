"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { createBlankReport } from "@/server/reports";

export function NewReportButton() {
  const [pending, start] = useTransition();
  return (
    <Button onClick={() => start(() => createBlankReport())} disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      Open this week's report
    </Button>
  );
}
