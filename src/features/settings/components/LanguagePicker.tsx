import { useNavigate } from "react-router-dom";
import type { TranslationId } from "../../../shared/bible/refs";
import { TRANSLATIONS } from "../../../shared/bible/translations";

export default function LanguagePicker(props: {
  translation: TranslationId;
  bookId: string;
  chapter: number;
  onDone?: () => void;
}) {
  const nav = useNavigate();

  function setTranslation(next: TranslationId) {
    nav(`/read/${next}/${props.bookId}/${props.chapter}`);
    props.onDone?.();
  }

  return (
    <div className="lang-picker">
      {TRANSLATIONS.map((t) => {
        const active = t.id === props.translation;

        return (
          <button
            key={t.id}
            className={`lang-btn ${active ? "active" : ""}`}
            onClick={() => setTranslation(t.id)}
            aria-pressed={active}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
