import { useMemo } from "react";
import type { BookId, TranslationId } from "../../../shared/bible/refs";
import { getBookById } from "../../../shared/bible/books";
import ChapterView from "./ChapterView";
import { useChapter } from "../hooks/useChapter";

export default function BookOpen(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
}) {
  const res = useChapter(props);

  const title = useMemo(() => {
    const b = getBookById(props.book);
    const name = b?.names[props.translation] ?? props.book;
    return `${name} ${props.chapter}`;
  }, [props.translation, props.book, props.chapter]);

  if (res.loading) return <div className="glass" style={{ padding: 16 }}>Loading…</div>;
  if (res.error) return <div className="glass" style={{ padding: 16 }}>Error: {res.error}</div>;
  if (!res.data) return null;


  // res.data is guaranteed here because loading/error are handled
  return (
    <div className="book-spread">
      <div className="book-gutter" />

      <div className="book-spread-inner">
        {/* Left page */}
        <section className="page page-left" aria-label="Left page">
          <header className="page-header">
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
          </div>
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
