export * from "./memo";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (value: number): string => {
  if (isNaN(value) || value < 0) {
    return "0:00";
  }

  let totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = String(Math.floor(totalSeconds / 60));
  let seconds = String(Math.floor(totalSeconds % 60));

  seconds = seconds.padStart(2, "0");

  if (hours > 0) {
    minutes = minutes.padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  } else {
    return `${minutes}:${seconds}`;
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const getDisplayLanguage = (language: string): string => {
  const languageMap: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    ar: "Arabic",
    hi: "Hindi",
    bn: "Bengali",
    tr: "Turkish",
    nl: "Dutch",
    sv: "Swedish",
    no: "Norwegian",
    da: "Danish",
    fi: "Finnish",
    pl: "Polish",
    cs: "Czech",
    hu: "Hungarian",
    ro: "Romanian",
    bg: "Bulgarian",
    hr: "Croatian",
    sk: "Slovak",
    sl: "Slovenian",
    et: "Estonian",
    lv: "Latvian",
    lt: "Lithuanian",
    uk: "Ukrainian",
    be: "Belarusian",
    mk: "Macedonian",
    sq: "Albanian",
    sr: "Serbian",
    bs: "Bosnian",
    me: "Montenegrin",
  };

  return languageMap[language?.toLowerCase()] || language || "Unknown";
};
