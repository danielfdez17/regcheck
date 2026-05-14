import { useTranslation } from "react-i18next";

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale,
} from "../config";
import { useAppTranslation } from "../hooks/use-app-translation";

function resolveActiveLocale(language: string | undefined): Locale {
  const candidate = language?.split("-")[0];

  if (candidate !== undefined && SUPPORTED_LOCALES.includes(candidate as Locale)) {
    return candidate as Locale;
  }

  return DEFAULT_LOCALE;
}

export default function LocaleSwitcher() {
  const { i18n } = useTranslation();
  const { t } = useAppTranslation("common");

  if (SUPPORTED_LOCALES.length <= 1) {
    return null;
  }

  const activeLocale = resolveActiveLocale(i18n.resolvedLanguage ?? i18n.language);

  return (
    <fieldset className="locale-toggle">
      <legend className="sr-only">{t("locale.legend")}</legend>
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          className="locale-toggle-option"
          data-active={activeLocale === locale}
          aria-label={t(`locale.${locale}`)}
          aria-pressed={activeLocale === locale}
          onClick={() => {
            void i18n.changeLanguage(locale);
          }}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </fieldset>
  );
}
