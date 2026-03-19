import { useEffect, useRef, useState } from "react";
import type { SetURLSearchParams } from "react-router-dom";

type StorageReader = (key: string) => string | null;
type StorageWriter = (key: string, value: string) => void;

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(Math.floor(n), min), max);
}

/**
 * Synchronizes the current page index across:
 * - URL query param (?p=)
 * - localStorage (per chapter + layout key)
 *
 * The hook uses a guard to prevent URL <-> state feedback loops.
 */
export function usePageIndexSync(params: {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  lastPageKey: string;
  pagesLength?: number;
  readStorage: StorageReader;
  writeStorage: StorageWriter;
}) {
  const {
    searchParams,
    setSearchParams,
    lastPageKey,
    pagesLength,
    readStorage,
    writeStorage,
  } = params;

  const [pageIndex, setPageIndex] = useState(0);

  // Prevents URL->state->URL loops when we intentionally sync from URL/storage.
  const syncingRef = useRef(false);

  // 1) URL / localStorage -> state
  useEffect(() => {
    const max = Math.max(0, (pagesLength ?? 1) - 1);

    const pRaw = searchParams.get("p");
    const pUrl = pRaw != null ? Number(pRaw) : NaN;

    if (Number.isFinite(pUrl) && pUrl >= 0) {
      syncingRef.current = true;
      setPageIndex(clampInt(pUrl, 0, max));
      return;
    }

    const saved = readStorage(lastPageKey);
    const pSaved = saved != null ? Number(saved) : NaN;
    const next = Number.isFinite(pSaved) && pSaved >= 0 ? Math.floor(pSaved) : 0;

    syncingRef.current = true;
    setPageIndex(clampInt(next, 0, max));
  }, [searchParams, lastPageKey, pagesLength, readStorage]);

  // 2) state -> URL + localStorage
  useEffect(() => {
    const max = Math.max(0, (pagesLength ?? 1) - 1);
    const clamped = clampInt(pageIndex, 0, max);

    // Enforce invariants: state must stay within bounds.
    if (clamped !== pageIndex) {
      setPageIndex(clamped);
      return;
    }

    // Persist current page index for this chapter+layout.
    writeStorage(lastPageKey, String(clamped));

    // Skip URL write if we just synced from URL/storage.
    if (syncingRef.current) {
      syncingRef.current = false;
      return;
    }

    const currentP = searchParams.get("p");
    if (currentP === String(clamped)) return;

    const next = new URLSearchParams(searchParams);
    next.set("p", String(clamped));
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, lastPageKey, pagesLength, writeStorage]);

  return { pageIndex, setPageIndex };
}