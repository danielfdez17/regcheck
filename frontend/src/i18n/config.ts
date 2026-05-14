export const SUPPORTED_LOCALES = ["en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "regcheck-locale";

export const NAMESPACES = [
  "common",
  "auth",
  "home",
  "playground",
  "errors",
] as const;

export type Namespace = (typeof NAMESPACES)[number];

const INTL_LOCALE_MAP: Record<Locale, string> = {
  en: "en-GB",
};

export function toIntlLocale(locale: string): string {
  if (locale in INTL_LOCALE_MAP) {
    return INTL_LOCALE_MAP[locale as Locale];
  }

  return locale;
}
