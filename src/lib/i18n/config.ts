export const LOCALES = ["en", "uz", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "donoai_locale";

// Native names shown in the switcher.
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  uz: "O‘zbekcha",
  ru: "Русский",
};

// How the AI is told to answer.
export const LOCALE_AI_INSTRUCTION: Record<Locale, string> = {
  en: "Respond in English.",
  uz: "Respond in Uzbek. Write your entire answer in the Uzbek language (o‘zbek tilida).",
  ru: "Respond in Russian. Write your entire answer in the Russian language (на русском языке).",
};

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}
