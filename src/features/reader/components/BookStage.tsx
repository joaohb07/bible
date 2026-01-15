import type { TranslationId, BookId } from "../../../shared/bible/refs";
import BookOpen from "./BookOpen";

export default function BookStage(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  onOpenNav: () => void;
}) {
  return (
    <div className="app-stage">
      <BookOpen {...props} />
    </div>
  );
}
