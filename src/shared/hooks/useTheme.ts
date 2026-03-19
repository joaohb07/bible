import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const THEME_KEY = "bible:theme";

function lsGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function getTheme(): ThemeMode {
  const v = lsGet(THEME_KEY);
  return v === "dark" ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => getTheme());

  useEffect(() => {
    document.body.classList.toggle("theme-dark", theme === "dark");
    lsSet(THEME_KEY, theme);
  }, [theme]);

  function toggle() {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  }

  return { theme, toggle };
}