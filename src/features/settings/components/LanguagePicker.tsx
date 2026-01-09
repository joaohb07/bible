import { useNavigate } from "react-router-dom";
import type { TranslationId } from "../../../shared/bible/refs";
import { TRANSLATIONS } from "../../../shared/bible/translations";

export default function LanguagePicker(props: {
  translation: TranslationId;
  bookId: string;
  chapter: number;
}) {
  const nav = useNavigate();

  function setTranslation(next: TranslationId) {
    nav(`/read/${next}/${props.bookId}/${props.chapter}`);
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >

      {TRANSLATIONS.map((t) => {
        const active = t.id === props.translation;
        return (
          <button
            key={t.id}
            onClick={() => setTranslation(t.id)}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: active ? "#111" : "#fff",
              color: active ? "#fff" : "#111",
              cursor: "pointer",
            }}
            aria-pressed={active}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
