import { useCallback, useMemo } from "react";
import { BIBLE_BOOKS } from "../../../shared/bible/books";
import type { BookId, TranslationId } from "../../../shared/bible/refs";
import { nextChapterRef, prevChapterRef, getSavedLastPage } from "../domain/readerNavigation";

type GoToFn = (path: string) => void;

function buildReadPath(params: {
  translation: TranslationId;
  book: string;
  chapter: number;
  p?: number;
}) {
  const qs = new URLSearchParams();
  if (params.p != null) qs.set("p", String(Math.max(0, Math.floor(params.p))));
  const q = qs.toString();
  return `/read/${params.translation}/${params.book}/${params.chapter}${q ? `?${q}` : ""}`;
}

/**
 * Encapsulates reader navigation rules:
 * - page stepping (mobile 1 / desktop 2)
 * - Bible boundaries (hide prev/next at extremes)
 * - cross-chapter transitions
 * - restoring last page when navigating backwards
 */
export function useReaderNavigation(params: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  isMobile: boolean;
  pagesReady: boolean;
  totalPages: number;
  pageIndex: number;
  setPageIndex: (n: number) => void;
  layoutKey: string;
  navigate: GoToFn; // usually `nav(path)`
}) {
  const {
    translation,
    book,
    chapter,
    isMobile,
    pagesReady,
    totalPages,
    pageIndex,
    setPageIndex,
    layoutKey,
    navigate,
  } = params;

  const step = isMobile ? 1 : 2;

  const firstBookId = BIBLE_BOOKS[0]?.id;
  const lastBook = BIBLE_BOOKS[BIBLE_BOOKS.length - 1];

  const isAtBibleStart = useMemo(() => {
    return book === firstBookId && chapter === 1 && pageIndex === 0;
  }, [book, chapter, pageIndex, firstBookId]);

  const isAtLastPageOfChapter = useMemo(() => {
    return totalPages > 0 && pageIndex + step > totalPages - 1;
  }, [totalPages, pageIndex, step]);

  const isAtBibleEnd = useMemo(() => {
    return (
      !!lastBook &&
      book === lastBook.id &&
      chapter === lastBook.chapters &&
      isAtLastPageOfChapter
    );
  }, [book, chapter, lastBook, isAtLastPageOfChapter]);

  const goTo = useCallback(
    (nextBook: string, nextChapter: number, p?: number) => {
      navigate(
        buildReadPath({
          translation,
          book: nextBook,
          chapter: nextChapter,
          p,
        })
      );
    },
    [navigate, translation]
  );

  const onNext = useCallback(() => {
    if (!pagesReady || totalPages <= 0) return;

    const nextP = pageIndex + step;
    if (nextP <= totalPages - 1) {
      setPageIndex(nextP);
      return;
    }

    const nxt = nextChapterRef(book, chapter);
    goTo(nxt.book, nxt.chapter, 0);
  }, [pagesReady, totalPages, pageIndex, step, setPageIndex, book, chapter, goTo]);

  const onPrev = useCallback(() => {
    if (!pagesReady || totalPages <= 0) return;

    const prevP = pageIndex - step;
    if (prevP >= 0) {
      setPageIndex(prevP);
      return;
    }

    const prv = prevChapterRef(book, chapter);
    const last = getSavedLastPage({
      translation,
      book: prv.book,
      chapter: prv.chapter,
      layoutKey,
    });

    goTo(prv.book, prv.chapter, last);
  }, [pagesReady, totalPages, pageIndex, step, setPageIndex, book, chapter, translation, layoutKey, goTo]);

  return {
    step,
    isAtBibleStart,
    isAtBibleEnd,
    onNext,
    onPrev,
  };
}