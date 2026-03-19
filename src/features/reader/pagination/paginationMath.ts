/**
 * Normalizes raw break indexes into a strictly increasing list that:
 * - always starts at 0
 * - always ends at n
 * - never goes out of bounds
 * - never contains duplicates or regressions
 */
export function normalizeBreaks(breaks: number[], n: number) {
  const out: number[] = [];

  for (const raw of breaks) {
    const b = Math.max(0, Math.min(n, Math.floor(raw)));

    if (out.length === 0) {
      out.push(0);
    }

    if (b > out[out.length - 1]) {
      out.push(b);
    }
  }

  if (out.length === 0) out.push(0);
  if (out[out.length - 1] !== n) out.push(n);
  if (out.length < 2) out.push(n);

  return out;
}

/**
 * Builds a deterministic fallback where each verse occupies its own page.
 * Used when DOM measurement fails or is incomplete.
 */
export function buildOneVersePerPageBreaks(n: number) {
  const breaks: number[] = [];

  for (let i = 0; i <= n; i++) {
    breaks.push(i);
  }

  return normalizeBreaks(breaks, n);
}

/**
 * Computes page breaks from measured verse top/bottom offsets.
 * Each page grows from a start verse until the next verse would exceed the page height.
 *
 * Guarantees forward progress by forcing at least one verse per page.
 */
export function computeBreaksByOffsets(params: {
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

    // Ensure forward progress even if a single verse exceeds the page height.
    if (i <= start) i = start + 1;

    breaks.push(i);
    start = i;
  }

  return normalizeBreaks(breaks, n);
}

/**
 * Slices an array into pages using normalized [start, end) break pairs.
 */
export function sliceByBreaks<T>(items: T[], breaks: number[]) {
  const pages: T[][] = [];

  for (let i = 0; i < breaks.length - 1; i++) {
    const a = breaks[i];
    const b = breaks[i + 1];

    if (b > a) {
      pages.push(items.slice(a, b));
    }
  }

  return pages;
}