import type { TranslationId } from "../../../shared/bible/refs";
import { formatReference } from "../../../shared/bible/format";

export default function ReaderHeader(props: {
  translation: TranslationId;
  bookId: string;
  chapter: number;
  onOpenNav: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.12)",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(6px)",
      }}
    >
      <button onClick={props.onOpenNav} aria-label="Abrir navegação">
        ☰
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          {formatReference({
            translation: props.translation,
            bookId: props.bookId,
            chapter: props.chapter,
          })}
        </div>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          /read/{props.translation}/{props.bookId}/{props.chapter}
        </div>
      </div>
    </div>
  );
}
