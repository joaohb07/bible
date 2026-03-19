export type MeasuredOffsets = {
  tops: number[];
  bottoms: number[];
  allMeasured: boolean;
};

/**
 * Measures verse offsets from the rendered host element.
 *
 * Each verse node must expose a `data-verse-idx` attribute so offsets can be
 * mapped back to the original verse order.
 */
export function measureVerseOffsets(host: HTMLElement, verseCount: number): MeasuredOffsets {
  const nodes = host.querySelectorAll<HTMLElement>("[data-verse-idx]");

  const tops: number[] = new Array(verseCount);
  const bottoms: number[] = new Array(verseCount);
  const seen: boolean[] = new Array(verseCount).fill(false);

  nodes.forEach((el) => {
    const idxStr = el.getAttribute("data-verse-idx");
    if (idxStr == null) return;

    const idx = Number(idxStr);
    if (!Number.isFinite(idx)) return;
    if (idx < 0 || idx >= verseCount) return;

    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;

    tops[idx] = top;
    bottoms[idx] = bottom;
    seen[idx] = true;
  });

  return {
    tops,
    bottoms,
    allMeasured: seen.every(Boolean),
  };
}