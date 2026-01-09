import { useMemo, useSyncExternalStore } from "react";
import type { VerseRef } from "../../../shared/bible/refs";
import { createLocalHighlightsStore } from "../store/localHighlightsStore";

// store singleton
const store = createLocalHighlightsStore();

// trigger simples (pra re-render)
let listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}

export function useHighlights() {
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => 0
  );

  return useMemo(
    () => ({
      isHighlighted(ref: VerseRef) {
        return store.has(ref);
      },
      toggle(ref: VerseRef) {
        store.toggle(ref);
        emit();
      },
    }),
    []
  );
}
