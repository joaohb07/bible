import { useEffect, useMemo, useState } from "react";
import type { TranslationId, BookId } from "../../../shared/bible/refs";
import type { ChapterData } from "../types";

const cache = new Map<string, ChapterData>();

type State =
  | { loading: true; error?: undefined; data?: undefined }
  | { loading: false; error: string; data?: undefined }
  | { loading: false; error?: undefined; data: ChapterData };

export function useChapter(args: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
}) {
  const key = useMemo(
    () => `${args.translation}|${args.book}|${args.chapter}`,
    [args.translation, args.book, args.chapter]
  );

  const [reloadTick, setReloadTick] = useState(0);

  const [state, setState] = useState<State>(() => {
    const hit = cache.get(key);
    if (hit) return { loading: false, data: hit };
    return { loading: true };
  });

  useEffect(() => {
    const hit = cache.get(key);
    if (hit) {
      setState({ loading: false, data: hit });
      return;
    }

    let cancelled = false;
    setState({ loading: true });

    const path = `${import.meta.env.BASE_URL}assets/data/${args.translation}/${args.book}/${args.chapter}.json`;

    fetch(path)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as ChapterData;
      })
      .then((data) => {
        if (cancelled) return;
        cache.set(key, data);
        setState({ loading: false, data });
      })
      .catch((e) => {
        if (cancelled) return;
        setState({ loading: false, error: String(e?.message ?? e) });
      });

    return () => {
      cancelled = true;
    };
  }, [key, args.translation, args.book, args.chapter, reloadTick]);

  return {
    ...state,
    reload: () => setReloadTick((x) => x + 1),
  };

}
