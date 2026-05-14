import type { ThemeMode } from "./theme-provider";
import { useTheme } from "./theme-provider";
import { useAppTranslation } from "./i18n/hooks/use-app-translation";

const THEME_MODES: ThemeMode[] = ["light", "dark", "system"];

export default function ThemeToggle() {
  const { themeMode, setThemeMode } = useTheme();
  const { t } = useAppTranslation("common");

  return (
    <fieldset className="theme-toggle">
      <legend className="sr-only">{t("theme.legend")}</legend>
      {THEME_MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          className="theme-toggle-option"
          data-active={themeMode === mode}
          aria-pressed={themeMode === mode}
          onClick={() => setThemeMode(mode)}
        >
          {t(`theme.${mode}`)}
        </button>
      ))}
    </fieldset>
  );
}
