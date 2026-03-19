const LAST_READ_KEY = "bible:lastRead";

export type LastRead = { book: string; chapter: number };

/**
 * Persists the global reading position (book/chapter).
 * Intended to be used by the reader to resume from the cover/home screen.
 */
export function saveLastRead(pos: LastRead) {
  try {
    localStorage.setItem(
      LAST_READ_KEY,
      JSON.stringify({
        book: pos.book,
        chapter: Math.max(1, Math.floor(pos.chapter)),
      })
    );
  } catch {
    // Best-effort persistence.
  }
}

/**
 * Loads the last saved global reading position.
 * Returns null if missing or invalid.
 */
export function loadLastRead(): LastRead | null {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    if (!raw) return null;

    const obj = JSON.parse(raw) as Partial<LastRead>;
    if (!obj.book || typeof obj.book !== "string") return null;
    if (!Number.isFinite(obj.chapter) || (obj.chapter as number) < 1) return null;

    return { book: obj.book, chapter: Math.floor(obj.chapter as number) };
  } catch {
    return null;
  }
}