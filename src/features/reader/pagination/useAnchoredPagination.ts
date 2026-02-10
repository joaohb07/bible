import { useEffect, useMemo, useRef, useState } from "react";
import type { VerseData } from "./types";

type PagingCacheV2 = {
  v: 2;
  n: number; // quantidade de versos usada no cálculo
  breaks: number[]; // [0, ..., n]
  pages: number;
};

function safeParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function lsGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function normalizeBreaks(breaks: number[], n: number) {
  // garante: começa em 0, termina em n, estritamente crescente, no range [0..n]
  const out: number[] = [];

  for (const raw of breaks) {
    const b = Math.max(0, Math.min(n, Math.floor(raw)));
    if (out.length === 0) {
      out.push(0);
    }
    if (b > out[out.length - 1]) out.push(b);
  }

  if (out.length === 0) out.push(0);
  if (out[out.length - 1] !== n) out.push(n);

  // se por algum motivo ficou só [0], vira [0,n]
  if (out.length < 2) out.push(n);

  return out;
}

function computeBreaksByOffsets(params: {
  tops: number[];
  bottoms: number[];
  pageHeight: number;
}) {
  const { tops, bottoms, pageHeight } = params;
  const n = tops.length;

  const breaks: number[] = [0];
  let start = 0;

  while (start < n) {
    const limit = tops[start] + pageHeight;

    let i = start;
    while (i < n && bottoms[i] <= limit) i++;

    // safety: sempre avança
    if (i <= start) i = start + 1;

    breaks.push(i);
    start = i;
  }

  return normalizeBreaks(breaks, n);
}

function sliceByBreaks<T>(items: T[], breaks: number[]) {
  const pages: T[][] = [];
  for (let i = 0; i < breaks.length - 1; i++) {
    const a = breaks[i];
    const b = breaks[i + 1];
    // slices NÃO podem se sobrepor: [a,b)
    if (b > a) pages.push(items.slice(a, b));
  }
  return pages;
}

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

  const cacheKey = useMemo(
    () => `bible:paging:${chapterKey}:${layoutKey}`,
    [chapterKey, layoutKey]
  );

  const [breaks, setBreaks] = useState<number[] | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  // ✅ cache imediato (somente se bate com n)
  useEffect(() => {
    const cached = safeParse<PagingCacheV2>(lsGet(cacheKey));
    if (
      cached?.v === 2 &&
      cached.n === verses.length &&
      Array.isArray(cached.breaks) &&
      cached.breaks.length >= 2
    ) {
      setBreaks(normalizeBreaks(cached.breaks, verses.length));
    } else {
      setBreaks(null);
    }
  }, [cacheKey, verses.length]);

  const tokenRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!enabled) return;
    if (!verses.length) return;
    if (!(pageHeightPx > 0)) return;
    if (!hostRef.current) return;

    const myToken = ++tokenRef.current;

    timerRef.current = window.setTimeout(() => {
      (async () => {
        setIsComputing(true);

        // duas RAF pra garantir layout assentado
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        await new Promise<void>((r) => requestAnimationFrame(() => r()));

        if (tokenRef.current !== myToken) return;

        const host = hostRef.current;
        if (!host) return;

        const nodes = host.querySelectorAll<HTMLElement>("[data-verse-idx]");
        const tops: number[] = new Array(verses.length);
        const bottoms: number[] = new Array(verses.length);
        const seen: boolean[] = new Array(verses.length).fill(false);

        nodes.forEach((el) => {
          const idxStr = el.getAttribute("data-verse-idx");
          if (idxStr == null) return;
          const idx = Number(idxStr);
          if (!Number.isFinite(idx)) return;
          if (idx < 0 || idx >= verses.length) return;

          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;

          tops[idx] = top;
          bottoms[idx] = bottom;
          seen[idx] = true;
        });

        // valida se todos índices foram medidos
        const allMeasured = seen.every(Boolean);

        if (!allMeasured) {
          // fallback determinístico: 1 verso por página (sem overlap)
          const fallback: number[] = [];
          for (let i = 0; i <= verses.length; i++) fallback.push(i);

          const norm = normalizeBreaks(fallback, verses.length);
          setBreaks(norm);
          lsSet(
            cacheKey,
            JSON.stringify({
              v: 2,
              n: verses.length,
              breaks: norm,
              pages: norm.length - 1,
            } satisfies PagingCacheV2)
          );
          setIsComputing(false);
          return;
        }

        const nextBreaks = computeBreaksByOffsets({
          tops,
          bottoms,
          pageHeight: pageHeightPx,
        });

        if (tokenRef.current !== myToken) return;

        setBreaks(nextBreaks);
        lsSet(
          cacheKey,
          JSON.stringify({
            v: 2,
            n: verses.length,
            breaks: nextBreaks,
            pages: Math.max(0, nextBreaks.length - 1),
          } satisfies PagingCacheV2)
        );

        setIsComputing(false);
      })();
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, verses, pageHeightPx, cacheKey, hostRef, debounceMs]);

  const pages = useMemo(() => {
    if (!breaks) return null;
    return sliceByBreaks(verses, breaks);
  }, [verses, breaks]);

  return { pages, breaks, isComputing };
}
