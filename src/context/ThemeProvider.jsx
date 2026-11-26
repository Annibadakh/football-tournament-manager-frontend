import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { STORAGE_KEYS, THEME_MODE } from "@/constants/common.constants";
import { readStorage, writeStorage } from "@/utils/storage";

const DARK_QUERY = "(prefers-color-scheme: dark)";

const getSystemTheme = () =>
  window.matchMedia?.(DARK_QUERY).matches ? THEME_MODE.DARK : THEME_MODE.LIGHT;

const readSavedMode = () => {
  const saved = readStorage(STORAGE_KEYS.THEME, THEME_MODE.SYSTEM);
  return Object.values(THEME_MODE).includes(saved) ? saved : THEME_MODE.SYSTEM;
};

const ThemeProvider = ({ children }) => {
  const [mode, setModeState] = useState(readSavedMode);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  // Follow OS theme changes live while the user is on "System"
  useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY);
    if (!media) return undefined;
    const handleChange = () => setSystemTheme(getSystemTheme());
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const resolvedTheme = mode === THEME_MODE.SYSTEM ? systemTheme : mode;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === THEME_MODE.DARK);
  }, [resolvedTheme]);

  const setMode = useCallback((nextMode) => {
    setModeState(nextMode);
    writeStorage(STORAGE_KEYS.THEME, nextMode);
  }, []);

  const value = useMemo(() => ({ mode, resolvedTheme, setMode }), [mode, resolvedTheme, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
