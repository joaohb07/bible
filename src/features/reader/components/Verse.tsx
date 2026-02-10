import type { VerseRef } from "../../../shared/bible/refs";

export default function Verse(props: {
  refObj: VerseRef;
  text: string;
  dataIndex?: number;
}) {
  return (
    <div
      data-verse={props.refObj.verse}
      data-verse-idx={props.dataIndex}
      className="verse-line"
    >
      <div className="verse-num">{props.refObj.verse}</div>
      <div className="verse-text">{props.text}</div>
    </div>
  );
}
