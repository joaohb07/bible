import type { VerseRef } from "../../../shared/bible/refs";

export default function Verse(props: {
  refObj: VerseRef;
  text: string;
  highlighted: boolean;
  onToggleHighlight: () => void;
}) {
  return (
    <p
      onClick={props.onToggleHighlight}
      style={{
        cursor: "pointer",
        padding: "6px 8px",
        borderRadius: 8,
        background: props.highlighted ? "rgba(255,230,120,0.35)" : "transparent",
      }}
    >
      <sup style={{ opacity: 0.7, marginRight: 6 }}>{props.refObj.verse}</sup>
      {props.text}
    </p>
  );
}
