"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "./dropdown";
import { Globe, Check, Loader2 } from "lucide-react";
import { setLocale } from "@/server/locale";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const choose = (loc: Locale, close: () => void) => {
    close();
    if (loc === current) return;
    start(async () => {
      await setLocale(loc);
      router.refresh();
    });
  };

  return (
    <Dropdown
      align="end"
      panelClassName="w-44"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label="Change language"
          aria-expanded={open}
          className="flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="uppercase">{current}</span>
        </button>
      )}
    >
      {(close) =>
        LOCALES.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => choose(loc, close)}
            className="flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-2">
              <span className="w-7 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {loc}
              </span>
              {LOCALE_LABELS[loc]}
            </span>
            {current === loc && <Check className="h-4 w-4 text-brand" />}
          </button>
        ))
      }
    </Dropdown>
  );
}
