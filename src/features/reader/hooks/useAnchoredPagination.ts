// React primitives used to coordinate cached pagination state, async recomputation,
// and memoized page slicing.
import { useEffect, useMemo, useRef, useState } from "react";

// Verse data model used as the input source for pagination.
import type { VerseData } from "../types";

// Pure pagination helpers:
// - deterministic fallback breaks
// - break computation from measured offsets
// - conversion from breaks to verse slices
import {
  buildOneVersePerPageBreaks,
  computeBreaksByOffsets,
  sliceByBreaks,
} from "../pagination/paginationMath";

// DOM measurement helper that reads verse offsets from the hidden measurement host.
import { measureVerseOffsets } from "../pagination/paginationMeasure";

// Pagination cache helpers used to read/write previously computed breaks.
import {
  getPagingCacheKey,
  readPagingCache,
  writePagingCache,
} from "../pagination/pagingCache";

/**
 * Computes deterministic paginated verse slices using anchored DOM measurements.
 *
 * Responsibilities:
 * - load cached pagination breaks for the current chapter/layout
 * - debounce recomputation while layout settles
 * - measure verse offsets from the hidden host
 * - compute page breaks from offsets
 * - fallback to one-verse-per-page when measurement is incomplete
 * - persist the computed result back to cache
 *
 * The hook is intentionally an orchestrator:
 * pure math, DOM measurement, and cache I/O are delegated to dedicated helpers.
 */
export function useAnchoredPagination(params: {
  verses: VerseData[];
  enabled: boolean;
  pageHeightPx: number;

  chapterKey: string;
  layoutKey: string;

  hostRef: React.RefObject<HTMLElement | null>;

  debounceMs?: number;
}) {
  const {
    verses,
    enabled,
    pageHeightPx,
    chapterKey,
    layoutKey,
    hostRef,
    debounceMs = 180,
  } = params;

  /**
   * Stable cache identity for the current chapter/layout combination.
   * Any change here invalidates the previous pagination result and triggers a reload.
   */
  const cacheKey = useMemo(
    () => getPagingCacheKey(chapterKey, layoutKey),
    [chapterKey, layoutKey]
  );

  /**
   * Normalized break indexes in the form [0, ..., n].
   * Each adjacent pair defines a page slice range [start, end).
   */
  const [breaks, setBreaks] = useState<number[] | null>(null);

  /**
   * Indicates whether a fresh pagination computation is currently running.
   * Useful for debugging and future UI states, even if not heavily consumed yet.
   */
  const [isComputing, setIsComputing] = useState(false);

  /**
   * Load cached pagination immediately when cache identity or verse count changes.
   *
   * Cache is only accepted when it matches the current verse count, which prevents
   * stale results from being reused after data changes.
   */
  useEffect(() => {
    const cachedBreaks = readPagingCache(cacheKey, verses.length);
    setBreaks(cachedBreaks);
  }, [cacheKey, verses.length]);

  /**
   * Monotonic token used to invalidate outdated async computations.
   * If a newer run starts, older runs should not commit their result.
   */
  const tokenRef = useRef(0);

  /**
   * Debounce timer used to avoid recomputing pagination too aggressively while
   * layout is still changing (resize, mount, font/layout settling, etc.).
   */
  const timerRef = useRef<number | null>(null);

  /**
   * Recomputes pagination whenever the effective layout inputs change.
   *
   * Flow:
   * 1. clear any pending recomputation
   * 2. validate prerequisites
   * 3. debounce execution
   * 4. wait for layout to settle (double RAF)
   * 5. measure verse offsets from DOM
   * 6. fallback if measurement is incomplete
   * 7. compute anchored breaks
   * 8. persist and commit result
   */
  useEffect(() => {
    // Cancel any pending recomputation before scheduling a new one.
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Pagination is only meaningful when all required inputs are available.
    if (!enabled) return;
    if (!verses.length) return;
    if (!(pageHeightPx > 0)) return;
    if (!hostRef.current) return;

    const myToken = ++tokenRef.current;

    timerRef.current = window.setTimeout(() => {
      (async () => {
        setIsComputing(true);

        try {
          // Wait two animation frames so the browser has time to settle layout.
          // This greatly reduces unstable measurements during mount/resize transitions.
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

          // Abort if a newer computation has already started.
          if (tokenRef.current !== myToken) return;

          const host = hostRef.current;
          if (!host) return;

          const measured = measureVerseOffsets(host, verses.length);

          /**
           * Fallback path:
           * if not every verse could be measured, use a deterministic one-verse-per-page
           * strategy so pagination remains valid and non-overlapping.
           */
          if (!measured.allMeasured) {
            const fallbackBreaks = buildOneVersePerPageBreaks(verses.length);

            setBreaks(fallbackBreaks);
            writePagingCache(cacheKey, verses.length, fallbackBreaks);
            return;
          }

          const nextBreaks = computeBreaksByOffsets({
            tops: measured.tops,
            bottoms: measured.bottoms,
            pageHeight: pageHeightPx,
          });

          // Abort if a newer computation has superseded this one.
          if (tokenRef.current !== myToken) return;

          setBreaks(nextBreaks);
          writePagingCache(cacheKey, verses.length, nextBreaks);
        } finally {
          // Always clear the computing flag for the currently active run.
          // Stale runs may also reach this block, but the visible effect is harmless.
          setIsComputing(false);
        }
      })();
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, verses, pageHeightPx, cacheKey, hostRef, debounceMs]);

  /**
   * Materialized page slices derived from the current break list.
   * Each page is a non-overlapping slice of the original verse array.
   */
  const pages = useMemo(() => {
    if (!breaks) return null;
    return sliceByBreaks(verses, breaks);
  }, [verses, breaks]);

  return { pages, breaks, isComputing };
}