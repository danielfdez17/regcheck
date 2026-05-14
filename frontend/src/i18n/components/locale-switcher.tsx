import { useTranslation } from "react-i18next";

import NavbarDropdown from "../../components/navbar-dropdown";
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
    <NavbarDropdown
      menuLabel={t("locale.legend")}
      onChange={(locale) => {
        void i18n.changeLanguage(locale);
      }}
      options={SUPPORTED_LOCALES.map((locale) => ({
        value: locale,
        label: t(`locale.${locale}`),
        ariaLabel: t(`locale.${locale}`),
      }))}
      triggerLabel={activeLocale.toUpperCase()}
      value={activeLocale}
    />
  );
}
