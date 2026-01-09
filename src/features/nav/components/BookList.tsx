import type { TranslationId } from "../../../shared/bible/refs";
import type { BibleBook } from "../../../shared/bible/books";

export default function BookList(props: {
  translation: TranslationId;
  books: BibleBook[];
  activeBookId: string;
  onSelect: (bookId: string) => void;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Livros</div>
      <div style={{ display: "grid", gap: 6 }}>
        {props.books.map((b) => {
          const active = b.id === props.activeBookId;
          return (
            <button
              key={b.id}
              onClick={() => props.onSelect(b.id)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: active ? "rgba(0,0,0,0.08)" : "#fff",
                cursor: "pointer",
              }}
            >
              {b.names[props.translation]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
