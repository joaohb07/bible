import { BIBLE_BOOKS } from "../../../shared/bible/books";
import type { TranslationId } from "../../../shared/bible/refs";

function bookIndex(bookId: string) {
  return BIBLE_BOOKS.findIndex(b => b.id === bookId);
}

export function nextChapterRef(bookId: string, chapter: number) {
  const bi = bookIndex(bookId);
  const b = bi >= 0 ? BIBLE_BOOKS[bi] : null;
  if (!b) return { book: "genesis", chapter: 1 };

  if (chapter < b.chapters) return { book: b.id, chapter: chapter + 1 };

  const nb = BIBLE_BOOKS[bi + 1];
  if (nb) return { book: nb.id, chapter: 1 };

  return { book: b.id, chapter: b.chapters };
}

export function prevChapterRef(bookId: string, chapter: number) {
  const bi = bookIndex(bookId);
  const b = bi >= 0 ? BIBLE_BOOKS[bi] : null;
  if (!b) return { book: "genesis", chapter: 1 };

  if (chapter > 1) return { book: b.id, chapter: chapter - 1 };

  const pb = BIBLE_BOOKS[bi - 1];
  if (pb) return { book: pb.id, chapter: pb.chapters };

  return { book: b.id, chapter: 1 };
}

export function getSavedLastPage(params: {
  translation: TranslationId;
  book: string;
  chapter: number;
  layoutKey: string;
}) {
  const chapterKey = `${params.translation}:${params.book}:${params.chapter}`;
  const lastKey = `bible:lastPage:${chapterKey}:${params.layoutKey}`;

  // 1) Prefer the explicit "last page" key.
  try {
    const saved = localStorage.getItem(lastKey);
    const pSaved = saved != null ? Number(saved) : NaN;
    if (Number.isFinite(pSaved) && pSaved >= 0) return Math.floor(pSaved);
  } catch {
    // ignore
  }

  // 2) Fallback: if pagination cache exists, use its total pages to jump to last page.
  const pagingKey = `bible:paging:${chapterKey}:${params.layoutKey}`;
  try {
    const raw = localStorage.getItem(pagingKey);
    const obj = raw ? JSON.parse(raw) : null;
    const pages = obj?.pages;

    if (Number.isFinite(pages) && pages > 0) return Math.max(0, Math.floor(pages) - 1);
  } catch {
    // ignore
  }

  return 0;
}