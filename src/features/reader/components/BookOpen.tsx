import { useMemo, useState } from "react";
import type { BookId, TranslationId } from "../../../shared/bible/refs";
import { getBookById } from "../../../shared/bible/books";
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

  const title = useMemo(() => {
    const b = getBookById(props.book);
    const name = b?.names[props.translation] ?? props.book;
    return `${name} ${props.chapter}`;
  }, [props.translation, props.book, props.chapter]);

  if (res.loading)
    return (
      <div className="glass">
        Loading…
      </div>
    );
  if (res.error)
    return (
      <div className="glass">
        Error: {res.error}
      </div>
    );
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
            <ChapterView
              translation={props.translation}
              book={props.book}
              chapter={props.chapter}
              data={res.data}
            />

            <div className="book-footer">
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
        </section>

        {/* Right page (empty for now) */}
        <section className="page page-right" aria-label="Right page">
          <div style={{ color: "rgba(0,0,0,0.35)", fontStyle: "italic" }}>
            {/* Later: pagination / continuation */}
          </div>
        </section>
      </div>
    </div>
  );
}
