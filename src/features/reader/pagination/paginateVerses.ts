import type { VerseData } from "./types";

export async function buildPageBreaks(params: {
  verses: VerseData[];
  pageHeight: number;
  measure: (slice: VerseData[]) => Promise<number>; // px
}): Promise<number[]> {
  const { verses, pageHeight, measure } = params;

  const breaks: number[] = [0];
  let start = 0;

  while (start < verses.length) {
    let lo = start + 1;
    let hi = verses.length;
    let best = lo;

    // binary search: maior "end" tal que height <= pageHeight
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const h = await measure(verses.slice(start, mid));

      if (h <= pageHeight) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    // safety: sempre avança
    if (best <= start) best = start + 1;

    breaks.push(best);
    start = best;
  }

  return breaks;
}

export function sliceByBreaks<T>(items: T[], breaks: number[]) {
  const pages: T[][] = [];
  for (let i = 0; i < breaks.length - 1; i++) {
    pages.push(items.slice(breaks[i], breaks[i + 1]));
  }
  return pages;
}
