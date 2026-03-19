import { readStorage, writeStorage } from "../../../shared/utils/storage";
import { normalizeBreaks } from "./paginationMath";

export type PagingCache = {
  n: number; // verse count used when the cache was computed
  breaks: number[]; // normalized breakpoints: [0, ..., n]
  pages: number;
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Builds the storage key for cached pagination data.
 */
export function getPagingCacheKey(chapterKey: string, layoutKey: string) {
  return `bible:paging:${chapterKey}:${layoutKey}`;
}

/**
 * Reads cached pagination data and validates it against the current verse count.
 *
 * Validation rules:
 * - must exist
 * - verse count must match (prevents stale cache reuse)
 * - breaks must be a valid array
 */
export function readPagingCache(
  cacheKey: string,
  verseCount: number
): number[] | null {
  const cached = safeParse<PagingCache>(readStorage(cacheKey));

  if (
    cached &&
    cached.n === verseCount &&
    Array.isArray(cached.breaks) &&
    cached.breaks.length >= 2
  ) {
    return normalizeBreaks(cached.breaks, verseCount);
  }

  return null;
}

/**
 * Writes normalized pagination breaks to cache.
 *
 * The breaks are normalized before persistence to guarantee:
 * - first index is 0
 * - last index is verseCount
 * - strictly increasing sequence
 */
export function writePagingCache(
  cacheKey: string,
  verseCount: number,
  breaks: number[]
) {
  const normalized = normalizeBreaks(breaks, verseCount);

  writeStorage(
    cacheKey,
    JSON.stringify({
      n: verseCount,
      breaks: normalized,
      pages: Math.max(0, normalized.length - 1),
    } satisfies PagingCache)
  );

  return normalized;
}