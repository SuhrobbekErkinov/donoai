import type { en } from "./en";

// Deep-partial isn't needed — uz/ru must be complete. Strict shape match.
export type Dictionary = {
  [K in keyof typeof en]: { [P in keyof (typeof en)[K]]: string };
};
