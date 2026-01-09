import type { VerseRef } from "../../../shared/bible/refs";

export interface HighlightsStore {
  has(ref: VerseRef): boolean;
  toggle(ref: VerseRef): void;
}
