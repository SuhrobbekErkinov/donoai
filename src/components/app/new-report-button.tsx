"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { createBlankReport } from "@/server/reports";

export function NewReportButton() {
  const [pending, start] = useTransition();
  const { t } = useI18n();
  return (
    <Button onClick={() => start(() => createBlankReport())} disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {t.reports.openThisWeek}
    </Button>
  );
}
