import NavbarDropdown from "./components/navbar-dropdown";
import { useAppTranslation } from "./i18n/hooks/use-app-translation";
import type { ThemeMode } from "./theme-provider";
import { useTheme } from "./theme-provider";

const THEME_MODES: ThemeMode[] = ["light", "dark", "system"];

export default function ThemeToggle() {
  const { themeMode, setThemeMode } = useTheme();
  const { t } = useAppTranslation("common");

  return (
    <NavbarDropdown
      menuLabel={t("theme.legend")}
      onChange={setThemeMode}
      options={THEME_MODES.map((mode) => ({
        value: mode,
        label: t(`theme.${mode}`),
      }))}
      triggerLabel={t(`theme.${themeMode}`)}
      value={themeMode}
    />
  );
}
