import { useParams } from "react-router-dom";
import BookStage from "../../features/reader/components/BookStage";
import type { TranslationId } from "../../shared/bible/refs";

export default function ReaderPage() {
  const { translation, book, chapter } = useParams();

  // defaults seguros
  const t = (translation ?? "pt") as TranslationId;
  const b = book ?? "genesis";
  const c = Number(chapter ?? "1") || 1;

  return (
    <div style={{ padding: 24 }}>
      <BookStage translation={t} book={b} chapter={c} />
    </div>
  );
}
