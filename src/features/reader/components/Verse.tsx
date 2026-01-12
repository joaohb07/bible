import type { VerseRef } from "../../../shared/bible/refs";

export default function Verse(props: {
  refObj: VerseRef;
  text: string;
  highlighted: boolean;
  onToggleHighlight: () => void;
}) {
  return (
    <div
      onClick={props.onToggleHighlight}
      className={`verse-line ${props.highlighted ? "is-highlighted" : ""}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") props.onToggleHighlight();
      }}
      aria-pressed={props.highlighted}
    >
      <div className="verse-num">{props.refObj.verse}</div>
      <div className="verse-text">{props.text}</div>
    </div>
  );
}
