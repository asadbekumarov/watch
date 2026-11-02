"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { uz } from "./uz";
import { ru } from "./ru";

export type Language = "uz" | "ru";
export type TranslationDict = typeof uz;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationDict;
}

const I18nContext = createContext<I18nContextType>({
  lang: "uz",
  setLang: () => {},
  t: uz,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("vaqt_saroyi_lang") as Language;
    if (saved === "uz" || saved === "ru") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("vaqt_saroyi_lang", newLang);
    } catch {
      // ignore
    }
  };

  const t = lang === "ru" ? ru : uz;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

