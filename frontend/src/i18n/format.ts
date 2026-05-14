import i18n from "./index";
import { toIntlLocale } from "./config";

type DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export function formatDateTime(
  timestamp: string,
  options: DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  },
): string {
  return new Intl.DateTimeFormat(toIntlLocale(i18n.language), options).format(
    new Date(timestamp),
  );
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(toIntlLocale(i18n.language)).format(value);
}
