import type { ChapterData } from "../types";
import type { TranslationId, BookId } from "../../../shared/bible/refs";
import Verse from "./Verse";
import { useHighlights } from "../../highlights/hooks/useHighlights";

export default function ChapterView(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  data: ChapterData;
}) {
  const h = useHighlights();

  return (
    <div>
      {props.data.verses.map((v) => {
        const refObj = {
          translation: props.translation,
          book: props.book,
          chapter: props.chapter,
          verse: v.verse,
        };
        return (
          <Verse
            key={v.verse}
            refObj={refObj}
            text={v.text}
            highlighted={h.isHighlighted(refObj)}
            onToggleHighlight={() => h.toggle(refObj)}
          />
        );
      })}
    </div>
  );
}
