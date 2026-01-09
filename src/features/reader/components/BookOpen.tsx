import type { TranslationId, BookId } from "../../../shared/bible/refs";
import { useChapter } from "../hooks/useChapter";
import ChapterView from "./ChapterView";

export default function BookOpen(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
}) {
  const res = useChapter(props);

  if (res.loading) return <div>Carregando…</div>;
  if (res.error) return <div>Error: {res.error}</div>;
  if (!res.data) return <div>No data.</div>;

  return (
    <ChapterView
      translation={props.translation}
      book={props.book}
      chapter={props.chapter}
      data={res.data}
    />
  );
}
