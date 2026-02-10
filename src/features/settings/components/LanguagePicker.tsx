import type { TranslationId } from "../../../shared/bible/refs";
import { TRANSLATIONS } from "../../../shared/bible/translations";

export default function LanguagePicker(props: {
  value: TranslationId;
  onSelect: (id: TranslationId) => void;
}) {
  return (
    <div className="lang-picker">
      {TRANSLATIONS.map((tr) => {
        const active = tr.id === props.value;

        return (
          <button
            key={tr.id}
            className={`lang-btn ${active ? "active" : ""}`}
            onClick={() => props.onSelect(tr.id)}
            aria-pressed={active}
            type="button"
          >
            {tr.label}
          </button>
        );
      })}
    </div>
  );
}
