import type { TranslationId } from "../../../shared/bible/refs";
import type { BibleBook } from "../../../shared/bible/books";

export default function BookList(props: {
  translation: TranslationId;
  books: BibleBook[];
  activeBookId: string;
  onSelect: (bookId: string) => void;
}) {
  return (
    <div className="book-list">
      <div className="book-list-item-list">
        {props.books.map((b) => {
          const active = b.id === props.activeBookId;
          return (
            <button
              key={b.id}
              onClick={() => props.onSelect(b.id)}
              className={`nav-item ${active ? "is-active" : ""}`}
            >
              {b.names[props.translation]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
