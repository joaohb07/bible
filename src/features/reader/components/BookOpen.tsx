import type { TranslationId, BookId } from "../../../shared/bible/refs";
import { useChapter } from "../hooks/useChapter";
import ChapterView from "./ChapterView";
import { ChapterError, ChapterSkeleton } from "./ReaderStates";

export default function BookOpen(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
}) {
  const res = useChapter(props);

  if (res.loading) return <ChapterSkeleton />;

  if (res.error) {
    return (
      <ChapterError
        message="Verifique se o capítulo existe nos arquivos de dados (public/assets/data) e tente novamente."
        technical={res.error}
        onRetry={() => res.reload()}
      />
    );
  }

  if (!res.data) {
    return (
      <ChapterError
        message="Nenhum dado foi retornado para este capítulo."
        onRetry={() => res.reload()}
      />
    );
  }

  return (
    <ChapterView
      translation={props.translation}
      book={props.book}
      chapter={props.chapter}
      data={res.data}
    />
  );
}
