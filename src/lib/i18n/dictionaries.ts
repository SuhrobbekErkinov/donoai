import { en } from "./en";
import { uz } from "./uz";
import { ru } from "./ru";
import type { Locale } from "./config";
import type { Dictionary } from "./types";

export const dictionaries: Record<Locale, Dictionary> = { en, uz, ru };
export type { Dictionary };
