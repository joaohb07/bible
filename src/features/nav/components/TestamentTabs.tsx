import type { TranslationId } from "../../../shared/bible/refs";
import type { Testament } from "../../../shared/bible/books";
import { t } from "../../../shared/i18n/ui";

export default function TestamentTabs(props: {
  value: Testament;
  onChange: (t: Testament) => void;
  translation: TranslationId;
}) {
  const Tab = (tt: Testament, label: string) => {
    const active = props.value === tt;

    return (
      <button
        type="button"
        onClick={() => props.onChange(tt)}
        className={`testament-tab ${active ? "is-active" : ""}`}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="testament-tabs" role="tablist" aria-label="Testament tabs">
      {Tab("old", t(props.translation, "nav.oldTestament"))}
      {Tab("new", t(props.translation, "nav.newTestament"))}
    </div>
  );
}
