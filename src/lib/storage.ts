export class StorageController {
  private readonly prefix: string;

  constructor(prefix = "framqui") {
    this.prefix = prefix;
  }

  private fullKey(itemKey: string): string {
    return `${this.prefix}-${itemKey}`;
  }

  set<T>(itemKey: string, value: T): void {
    try {
      const serializedValue = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(this.fullKey(itemKey), serializedValue);
    } catch (error) {
      console.error(`Error saving key "${itemKey}" to localStorage:`, error);
    }
  }

  get<T>(itemKey: string, defaultValue: T): T {
    try {
      const value = localStorage.getItem(this.fullKey(itemKey));
      if (value === null) return defaultValue;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch {
      return defaultValue;
    }
  }

  remove(itemKey: string): void {
    try {
      localStorage.removeItem(this.fullKey(itemKey));
    } catch (error) {
      console.error(`Error removing key "${itemKey}" from localStorage:`, error);
    }
  }

  getSystemPrefersDark(): boolean {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  getWithSystemFallback<T>(itemKey: string, lightValue: T, darkValue: T): T {
    const stored = localStorage.getItem(this.fullKey(itemKey));
    if (stored !== null) {
      return this.get(itemKey, darkValue);
    }
    return this.getSystemPrefersDark() ? darkValue : lightValue;
  }
}

export const storage = new StorageController();