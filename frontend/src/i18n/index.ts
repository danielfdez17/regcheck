import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  NAMESPACES,
  SUPPORTED_LOCALES,
} from "./config";
import enAuth from "./locales/en/auth.json";
import enCommon from "./locales/en/common.json";
import enErrors from "./locales/en/errors.json";
import enHome from "./locales/en/home.json";
import enPlayground from "./locales/en/playground.json";

import esAuth from "./locales/es/auth.json";
import esCommon from "./locales/es/common.json";
import esErrors from "./locales/es/errors.json";
import esHome from "./locales/es/home.json";
import esPlayground from "./locales/es/playground.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        home: enHome,
        playground: enPlayground,
        errors: enErrors,
      },
      es: {
        common: esCommon,
        auth: esAuth,
        home: esHome,
        playground: esPlayground,
        errors: esErrors,
      },
    },
    supportedLngs: [...SUPPORTED_LOCALES],
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: "common",
    ns: [...NAMESPACES],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      caches: ["localStorage"],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
