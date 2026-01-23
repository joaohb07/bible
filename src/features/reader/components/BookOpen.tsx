import { useEffect, useMemo, useRef, useState } from "react";
import type { BookId, TranslationId } from "../../../shared/bible/refs";
import { getBookById } from "../../../shared/bible/books";
import LanguagePicker from "../../settings/components/LanguagePicker";
import BottomSheet from "../../../shared/ui/BottomSheet";
import { useChapter } from "../hooks/useChapter";

import PaginationMeasureHost from "../pagination/PaginationMeasureHost";
import { usePaginatedChapter } from "../pagination/usePaginatedChapter";
import VerseSliceView from "./VerseSliceView";

export default function BookOpen(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  onOpenNav: () => void;
}) {
  const res = useChapter(props);
  const [langOpen, setLangOpen] = useState(false);

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 880px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const title = useMemo(() => {
    const b = getBookById(props.book);
    const name = b?.names[props.translation] ?? props.book;
    return `${name} ${props.chapter}`;
  }, [props.translation, props.book, props.chapter]);

  // medir viewport real da página
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      setDims({
        w: Math.floor(r.width),
        h: Math.floor(r.height),
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isMobile, res.data]);

  const paginationEnabled = !!res.data && dims.w > 0 && dims.h > 0;

  const { pages, measurerRef } = usePaginatedChapter({
    data: res.data ?? null,
    pageWidthPx: dims.w,
    pageHeightPx: dims.h,
    enabled: paginationEnabled,
  });

  // EP2-7.2: página inicial fixa
  const pageIndex = 0;
  const leftIndex = pageIndex;
  const rightIndex = pageIndex + 1;

  if (res.loading)
    return <div className="glass" style={{ padding: 16 }}>Loading…</div>;
  if (res.error)
    return <div className="glass" style={{ padding: 16 }}>Error: {res.error}</div>;
  if (!res.data) return null;

  return (
    <div className="book-spread">
      <div className="book-gutter" />

      {/* Host invisível de medição */}
      <PaginationMeasureHost
        ref={measurerRef}
        widthPx={dims.w || 600}
      />

      <div className="book-spread-inner">
        {/* Página esquerda */}
        <section className="page page-left">
          <header className="page-header">
            <button
              className="page-nav-btn"
              onClick={props.onOpenNav}
            >
              ☰
            </button>
            <div>
              <h2>{title}</h2>
              <div className="page-sub">
                /read/{props.translation}/{props.book}/{props.chapter}
              </div>
            </div>
          </header>

          <div className="chapter-body" ref={bodyRef}>
            {!pages ? (
              <div style={{ opacity: 0.6 }}>Calculando páginas…</div>
            ) : pages[leftIndex] ? (
              <VerseSliceView
                translation={props.translation}
                book={props.book}
                chapter={props.chapter}
                verses={pages[leftIndex]}
              />
            ) : null}
          </div>
        </section>

        {/* Página direita (desktop) */}
        {!isMobile && (
          <section className="page page-right">
            <div className="chapter-body">
              {!pages ? null : pages[rightIndex] ? (
                <VerseSliceView
                  translation={props.translation}
                  book={props.book}
                  chapter={props.chapter}
                  verses={pages[rightIndex]}
                />
              ) : (
                <div style={{ opacity: 0.35 }} />
              )}
            </div>
          </section>
        )}
      </div>

      {/* underbar */}
      <div className="book-underbar">
        <button
          className="lang-pill"
          onClick={() => setLangOpen(true)}
        >
          Translation: {props.translation.toUpperCase()} ▴
        </button>
      </div>

      <BottomSheet
        open={langOpen}
        onClose={() => setLangOpen(false)}
        title="Select translation"
      >
        <LanguagePicker
          translation={props.translation}
          bookId={props.book}
          chapter={props.chapter}
          onDone={() => setLangOpen(false)}
        />
      </BottomSheet>
    </div>
  );
}
