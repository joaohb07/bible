import { useEffect, useMemo, useState } from "react";
import type { BookId, TranslationId } from "../../../shared/bible/refs";
import { getBookById } from "../../../shared/bible/books";
import PagedChapterView from "./PagedChapterView";
import ChapterView from "./ChapterView";
import LanguagePicker from "../../settings/components/LanguagePicker";
import BottomSheet from "../../../shared/ui/BottomSheet";
import { useChapter } from "../hooks/useChapter";

export default function BookOpen(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  onOpenNav: () => void;
}) {
  const res = useChapter(props);
  const [langOpen, setLangOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 880px)");
    const apply = () => setIsMobile(mq.matches);

    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const title = useMemo(() => {
    const b = getBookById(props.book);
    const name = b?.names[props.translation] ?? props.book;
    return `${name} ${props.chapter}`;
  }, [props.translation, props.book, props.chapter]);

  if (res.loading) return <div className="glass" style={{ padding: 16 }}>Loading…</div>;
  if (res.error) return <div className="glass" style={{ padding: 16 }}>Error: {res.error}</div>;
  if (!res.data) return null;

  return (
    <div className="book-spread">
      <div className="book-gutter" />

      <div className="book-spread-inner">
        {/* Left page */}
        <section className="page page-left" aria-label="Left page">
          <header className="page-header">
            <button
              type="button"
              className="page-nav-btn"
              onClick={props.onOpenNav}
              aria-label="Open menu"
              title="Menu"
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

          <div className="chapter-body">
            {isMobile ? (
              <ChapterView
                translation={props.translation}
                book={props.book}
                chapter={props.chapter}
                data={res.data}
              />
            ) : (
              <PagedChapterView data={res.data} page="left" />
            )}
          </div>
        </section>

        {/* Right page (desktop only) */}
        {!isMobile && (
          <section className="page page-right" aria-label="Right page">
            <div className="chapter-body">
              <PagedChapterView data={res.data} page="right" />
            </div>
          </section>
        )}
      </div>

      {/* EXTRA "mini page" under the spread */}
      <div className="book-underbar">
        <button
          type="button"
          className="lang-pill"
          onClick={() => setLangOpen(true)}
          aria-label="Open translation selector"
          title="Translation"
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
