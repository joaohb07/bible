import { useEffect, useMemo, useRef, useState } from "react";
import type { ChapterData } from "../types";
import { buildPageBreaks, sliceByBreaks } from "./paginateVerses";
import type { VerseMeasurerRef } from "./PaginationMeasureHost";

export function usePaginatedChapter(params: {
  data: ChapterData;
  pageWidthPx: number;
  pageHeightPx: number;
  enabled: boolean;
}) {
  const { data, pageWidthPx, pageHeightPx, enabled } = params;

  const measurerRef = useRef<VerseMeasurerRef | null>(null);

  const [breaks, setBreaks] = useState<number[] | null>(null);
  const verses = data.verses ?? [];

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!enabled) return;
      if (!measurerRef.current) return;
      if (pageWidthPx <= 0 || pageHeightPx <= 0) return;

      const b = await buildPageBreaks({
        verses,
        pageHeight: pageHeightPx,
        measure: (slice) => measurerRef.current!.measure(slice),
      });

      if (alive) setBreaks(b);
    }

    setBreaks(null);
    run();

    return () => {
      alive = false;
    };
  }, [enabled, verses, pageWidthPx, pageHeightPx]);

  const pages = useMemo(() => {
    if (!breaks) return null;
    return sliceByBreaks(verses, breaks);
  }, [verses, breaks]);

  return { pages, breaks, measurerRef };
}
