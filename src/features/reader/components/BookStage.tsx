import type { TranslationId, BookId } from "../../../shared/bible/refs";
import BookOpen from "./BookOpen";

export default function BookStage(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
}) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <BookOpen {...props} />
    </div>
  );
}
