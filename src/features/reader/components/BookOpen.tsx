// React primitives for component state, memoized derived values, and effectful sync with the browser.
import { useEffect, useRef, useState } from "react";

// Router utilities to navigate programmatically and keep the current page index in the URL query string.
import { useNavigate, useSearchParams } from "react-router-dom";

// Domain types that identify a Bible book and a translation.
import type { BookId, TranslationId } from "../../../shared/bible/refs";

// i18n helper for translating UI labels based on the current translation/language.
import { t } from "../../../shared/i18n/ui";

// Data loader for the current chapter (verses, loading and error states), plus hooks for pagination and page index synchronization.
import { useChapter } from "../hooks/useChapter";
import { usePageIndexSync } from "../hooks/usePageIndexSync";
import { useReaderNavigation } from "../hooks/useReaderNavigation";
import { useReaderLayout } from "../hooks/useReaderLayout";

// Pagination engine that computes deterministic page slices using anchored offsets.
import { useAnchoredPagination } from "../hooks/useAnchoredPagination";

// Presentational components for rendering a single verse and a slice of verses (one page).
import ReaderMeasureHost from "./ReaderMeasureHost";
import ReaderUnderbar from "./ReaderUnderbar";
import ReaderHeader from "./ReaderHeader";
import ReaderPageColumn from "./ReaderPageColumn";
import ReaderLanguageSheet from "./ReaderLanguageSheet";

// Shared hooks for viewport/layout behavior and theme handling.
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { useElementSize } from "../../../shared/hooks/useElementSize";
import { useTheme } from "../../../shared/hooks/useTheme";

// Util for persisting the last read position (book/chapter) to localStorage, enabling "resume reading" behavior on the home screen.
import { saveLastRead } from "../../../shared/utils/lastRead";
import { readStorage, writeStorage } from "../../../shared/utils/storage";


export default function BookOpen(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  onOpenNav: () => void;
}) {
  // Router navigation for closing the reader and switching chapters/books/translations.
  const nav = useNavigate();

  // Chapter loader: provides verses plus loading/error states.
  const res = useChapter(props);

  // Controls the translation picker bottom sheet.
  const [langOpen, setLangOpen] = useState(false);

  // Query string state used to store the current page index (`?p=`).
  const [sp, setSp] = useSearchParams();

  // Responsive breakpoint: mobile uses 1 page; desktop uses a 2-page spread.
  const isMobile = useMediaQuery("(max-width: 880px)");

  // Theme state and toggle behavior (also applies `.theme-dark` on <body> via the hook).
  const { theme, toggle: toggleTheme } = useTheme();

  // Handler for closing the reader and returning to the home screen.
  function onCloseReader() {
    nav("/");
  }

  // Opens the language selection bottom sheet.
  function onOpenLanguagePicker() {
    setLangOpen(true);
  }

  // Closes the language selection bottom sheet.
  function onCloseLanguagePicker() {
    setLangOpen(false);
  }

  // Centralized navigation helper for child components and hooks.
  function navigateTo(path: string) {
    nav(path);
  }

  /**
   * Measures the real viewport area used to render the page content.
   * Pagination needs an accurate height to compute stable breaks.
   */
  const { ref: bodyRef, width, height } = useElementSize<HTMLDivElement>();

  /**
   * Computes the layout configuration for the reader based on the current props and viewport.
   */
  const { title, chapterKey, layoutKey, lastPageKey } = useReaderLayout({
    translation: props.translation,
    book: props.book,
    chapter: props.chapter,
    isMobile,
    width,
  });

  // The actual verse list for this chapter (empty while loading).
  const verses = res.data?.verses ?? [];

  /**
   * Pagination should only run once we have:
   * - chapter data loaded
   * - a valid measured viewport size
   */
  const paginationEnabled = !!res.data && width > 0 && height > 0;

  /**
   * Invisible measurement host:
   * We render the full chapter here using the same typography/layout classes,
   * allowing `useAnchoredPagination` to compute stable offsets per verse.
   */
  const measureHostRef = useRef<HTMLDivElement | null>(null);

  /**
   * Deterministic page slices computed by anchored pagination.
   * - `pages` is the final array of verse slices per page (preferred).
   * - `breaks` is a lower-level representation used as a fallback for total page count.
   */
  const { pages, breaks } = useAnchoredPagination({
    verses,
    enabled: paginationEnabled,
    pageHeightPx: height,
    chapterKey,
    layoutKey,
    hostRef: measureHostRef,
  });

  /**
   * Total pages in the current chapter for the current layout.
   * Prefer `pages.length` when available; otherwise derive from `breaks`.
   */
  const totalPages = pages?.length ?? (breaks ? Math.max(0, breaks.length - 1) : 0);

  // Synchronize the current page index across URL query params and localStorage.
  const { pageIndex, setPageIndex } = usePageIndexSync({
    searchParams: sp,
    setSearchParams: setSp,
    lastPageKey,
    pagesLength: pages?.length,
    readStorage,
    writeStorage,
  });

  /**
   * Persist the global reading position (book/chapter) so the app can resume
   * from the cover/home screen.
   */
  useEffect(() => {
    saveLastRead({ book: props.book, chapter: props.chapter });
  }, [props.book, props.chapter]);

  // Page indexes for the current visible spread.
  const leftIndex = pageIndex;
  const rightIndex = pageIndex + 1;

  // Reader navigation rules encapsulated in a custom hook for reuse and testability.
  const { isAtBibleStart, isAtBibleEnd, onNext, onPrev } = useReaderNavigation({
    translation: props.translation,
    book: props.book,
    chapter: props.chapter,
    isMobile,
    pagesReady: !!pages,
    totalPages,
    pageIndex,
    setPageIndex,
    layoutKey,
    navigate: navigateTo,
  });

  // Loading and error boundaries for chapter data.
  if (res.loading) return <div className="glass">{t(props.translation, "app.loading")}</div>;

  if (res.error) {
    return <div className="glass">{t(props.translation, "app.error", { msg: res.error })}</div>;
  }

  if (!res.data) return null;

  return (
    <div className={`book-spread${theme === "dark" ? " theme-dark" : ""}`}>
      <div className="book-gutter" />

      {/* 
        Hidden measurement host:
        Renders the entire chapter off-screen with the same paged layout so the pagination
        engine can compute deterministic verse offsets.
      */}
      <ReaderMeasureHost
        translation={props.translation}
        book={props.book}
        chapter={props.chapter}
        verses={verses}
        width={width}
        hostRef={measureHostRef}
      />

      <div className="book-spread-inner">
        {/* Left page (always present). On desktop, this is the left page of the spread. */}
        <section className="page page-left page-col">

          {/* Reader header with title, page count and close button. */}
          <ReaderHeader
            translation={props.translation}
            title={title}
            totalPages={totalPages}
            hasPages={!!pages}
            onOpenNav={props.onOpenNav}
            onClose={onCloseReader}
          />

          {/* 
            Page viewport:
            This is the element we measure to determine the effective page size for pagination.
          */}
          <ReaderPageColumn
            translation={props.translation}
            book={props.book}
            chapter={props.chapter}
            pageNumber={pageIndex + 1}
            hasPages={!!pages}
            versesSlice={pages?.[leftIndex] ?? null}
            viewportRef={bodyRef}
          />

        </section>

        {/* Right page (desktop only). On mobile we render a single-page layout. */}
        {!isMobile && (
          <section className="page page-right page-col">
            <ReaderPageColumn
              translation={props.translation}
              book={props.book}
              chapter={props.chapter}
              pageNumber={pageIndex + 2}
              hasPages={!!pages}
              versesSlice={pages?.[rightIndex] ?? null}
            />
          </section>
        )}
      </div>

      {/* Reader underbar: theme toggle, navigation, and translation picker trigger. */}
      <ReaderUnderbar
        translation={props.translation}
        theme={theme}
        onToggleTheme={toggleTheme}
        hidePrev={isAtBibleStart}
        hideNext={isAtBibleEnd}
        onPrev={onPrev}
        onNext={onNext}
        onOpenLanguagePicker={onOpenLanguagePicker}
      />

      {/* Translation selection modal (bottom sheet). */}
      <ReaderLanguageSheet
        open={langOpen}
        onClose={onCloseLanguagePicker}
        translation={props.translation}
        book={props.book}
        chapter={props.chapter}
        onNavigate={navigateTo}
      />
    </div>
  );
}