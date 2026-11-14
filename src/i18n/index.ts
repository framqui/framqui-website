import es from "./es.json";
import en from "./en.json";

export const DEFAULT_LOCALE = "es" as const;
export const LANG_STORAGE_KEY = "lang";

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

type MessageShape<T> = T extends string
  ? string
  : { [K in keyof T]: MessageShape<T[K]> };

type Messages = MessageShape<typeof es>;

const enMessages: Messages = en;
void enMessages;

export const dictionaries: Record<Locale, Messages> = {
  es,
  en,
};

export function isLocale(value: unknown): value is Locale {
  return value === "es" || value === "en";
}

function profileDictionary(locale: Locale): Record<string, unknown> | undefined {
  const node = document.getElementById("profile-messages");
  if (!node?.textContent) return undefined;
  try {
    const messages = JSON.parse(node.textContent) as Record<Locale, Record<string, unknown>>;
    return messages[locale];
  } catch {
    return undefined;
  }
}

export function translate(locale: Locale, key: string): string | undefined {
  const sources = [profileDictionary(locale), dictionaries[locale]];
  for (const source of sources) {
    if (!source) continue;
    const value = key.split(".").reduce<unknown>((current, part) => {
      if (!current || typeof current !== "object" || !(part in current)) return undefined;
      return (current as Record<string, unknown>)[part];
    }, source);
    if (typeof value === "string") return value;
  }
  return undefined;
}

function applyKey(locale: Locale, key: string | undefined, write: (value: string) => void) {
  if (!key) return;
  const value = translate(locale, key);
  if (value !== undefined) write(value);
}

export function applyLocale(locale: Locale) {
  document.documentElement.lang = locale;

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    applyKey(locale, element.dataset.i18n, (value) => {
      element.textContent = value;
    });
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-html]").forEach((element) => {
    applyKey(locale, element.dataset.i18nHtml, (value) => {
      element.innerHTML = value;
    });
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((element) => {
    applyKey(locale, element.dataset.i18nAria, (value) => {
      element.setAttribute("aria-label", value);
    });
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-content]").forEach((element) => {
    applyKey(locale, element.dataset.i18nContent, (value) => {
      element.setAttribute("content", value);
    });
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-alt]").forEach((element) => {
    applyKey(locale, element.dataset.i18nAlt, (value) => {
      element.setAttribute("alt", value);
    });
  });

  document.documentElement.classList.remove("i18n-pending");
}
