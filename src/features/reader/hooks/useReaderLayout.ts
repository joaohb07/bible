import { useMemo } from "react";
import { getBookById } from "../../../shared/bible/books";
import type { BookId, TranslationId } from "../../../shared/bible/refs";

type UseReaderLayoutParams = {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  isMobile: boolean;
  width: number;
};

export function useReaderLayout(params: UseReaderLayoutParams) {
  const { translation, book, chapter, isMobile, width } = params;

  /**
   * Reader title displayed in the page header.
   */
  const title = useMemo(() => {
    const meta = getBookById(book);
    const name = meta?.names[translation] ?? book;
    return `${name} ${chapter}`;
  }, [translation, book, chapter]);

  /**
   * Stable chapter identity used for pagination caching.
   */
  const chapterKey = useMemo(() => {
    return `${translation}:${book}:${chapter}`;
  }, [translation, book, chapter]);

  /**
   * Layout identity used to cache pagination results per device/layout combination.
   * Width affects line wrapping and therefore pagination behavior.
   */
  const layoutKey = useMemo(() => {
    const fontScale = 1;
    const lineHeight = 1.4;
    return `${isMobile ? 1 : 0}|${width}|${fontScale}|${lineHeight}`;
  }, [isMobile, width]);

  /**
   * Storage key for persisting the last visited page within this chapter/layout.
   */
  const lastPageKey = useMemo(() => {
    return `bible:lastPage:${chapterKey}:${layoutKey}`;
  }, [chapterKey, layoutKey]);

  return {
    title,
    chapterKey,
    layoutKey,
    lastPageKey,
  };
}