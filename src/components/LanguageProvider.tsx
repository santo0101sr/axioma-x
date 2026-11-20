"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Languages } from "lucide-react";

export type Locale = "es" | "en";

interface LanguageContextValue {
  locale: Locale;
  isEn: boolean;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "es",
  isEn: false,
  toggleLocale: () => {},
  setLocale: () => {},
});

const STORAGE_KEY = "axioma-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "es") {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    document.documentElement.lang = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage errors
    }
  }

  function toggleLocale() {
    setLocale(locale === "es" ? "en" : "es");
  }

  return (
    <LanguageContext.Provider
      value={{
        locale,
        isEn: locale === "en",
        toggleLocale,
        setLocale,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, toggleLocale } = useLanguage();
  const isEs = locale === "es";

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={isEs ? "Switch to English" : "Cambiar a Español"}
      title={isEs ? "Switch to English" : "Cambiar a Español"}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-300/80 bg-white/80 px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:shadow-none dark:hover:border-white/20 dark:hover:bg-white/[0.09] dark:hover:text-white ${className}`}
    >
      <Languages className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400" />
      <span className="font-mono text-[11px] font-bold tracking-wide">
        {isEs ? "ES" : "EN"}
      </span>
    </button>
  );
}
