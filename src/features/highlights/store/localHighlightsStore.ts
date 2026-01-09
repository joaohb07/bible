import type { HighlightsStore } from "./HighlightsStore";
import type { VerseRef } from "../../../shared/bible/refs";
import { readJson, writeJson } from "../../../shared/utils/storage";

const KEY = "bible.highlights.v1";

type Db = Record<string, true>;

function k(ref: VerseRef) {
  return `${ref.translation}|${ref.book}|${ref.chapter}|${ref.verse}`;
}

export function createLocalHighlightsStore(): HighlightsStore {
  let db = readJson<Db>(KEY, {});

  function persist() {
    writeJson(KEY, db);
  }

  return {
    has(ref) {
      return Boolean(db[k(ref)]);
    },
    toggle(ref) {
      const key = k(ref);
      if (db[key]) delete db[key];
      else db[key] = true;
      persist();
    },
  };
}
