import type { ThemeMode } from "./theme-provider";
import { useTheme } from "./theme-provider";

const THEME_OPTIONS: Array<{ label: string; value: ThemeMode }> = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

export default function ThemeToggle() {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <fieldset className="theme-toggle">
      <legend className="sr-only">Theme mode</legend>
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className="theme-toggle-option"
          data-active={themeMode === option.value}
          aria-pressed={themeMode === option.value}
          onClick={() => setThemeMode(option.value)}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}