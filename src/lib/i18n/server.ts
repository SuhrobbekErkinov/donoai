import { cookies } from "next/headers";
import { dictionaries } from "./dictionaries";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";

// Read the chosen locale from the cookie (server components / route handlers).
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, dict: dictionaries[locale] };
}
