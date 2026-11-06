"use client";

import React, { createContext, useContext, useSyncExternalStore, useCallback } from "react";
import { uz } from "./uz";
import { ru } from "./ru";

export type Language = "uz" | "ru";
export type TranslationDict = typeof uz;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationDict;
}

const STORAGE_KEY = "vaqt_saroyi_lang";
let memoryLang: Language = "uz";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && (e.newValue === "uz" || e.newValue === "ru")) {
      memoryLang = e.newValue as Language;
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Language {
  if (typeof window === "undefined") return "uz";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "uz" || saved === "ru") {
      memoryLang = saved;
    }
  } catch {
    // ignore storage error
  }
  return memoryLang;
}

function getServerSnapshot(): Language {
  return "uz";
}

const I18nContext = createContext<I18nContextType>({
  lang: "uz",
  setLang: () => {},
  t: uz,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLang = useCallback((newLang: Language) => {
    memoryLang = newLang;
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
    listeners.forEach((l) => l());
  }, []);

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
