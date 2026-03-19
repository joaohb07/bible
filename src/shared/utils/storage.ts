/**
 * Safely reads a raw string value from localStorage.
 * Returns null when the key does not exist or storage is unavailable.
 */
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely writes a raw string value to localStorage.
 * Failures are ignored because persistence is best-effort.
 */
export function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

/**
 * Safely reads and parses a JSON value from localStorage.
 * Returns the provided fallback on missing keys, parse errors, or storage failures.
 */
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely serializes and writes a JSON value to localStorage.
 * Failures are ignored because persistence is best-effort.
 */
export function writeJson<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}