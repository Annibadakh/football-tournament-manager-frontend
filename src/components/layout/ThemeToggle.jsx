import { Monitor, Moon, Sun } from "lucide-react";
import useTheme from "@/hooks/useTheme";
import { THEME_MODE } from "@/constants/common.constants";
import { cn } from "@/utils/cn";

const OPTIONS = [
  { mode: THEME_MODE.LIGHT, label: "Light theme", Icon: Sun },
  { mode: THEME_MODE.DARK, label: "Dark theme", Icon: Moon },
  { mode: THEME_MODE.SYSTEM, label: "Use system theme", Icon: Monitor },
];

const ThemeToggle = ({ className = "" }) => {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-surface p-0.5",
        className,
      )}
    >
      {OPTIONS.map(({ mode: optionMode, label, Icon }) => {
        const isActive = mode === optionMode;
        return (
          <button
            key={optionMode}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            title={label}
            onClick={() => setMode(optionMode)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-full transition-colors",
              isActive ? "bg-brand-600 text-white" : "text-fg-muted hover:text-fg",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
