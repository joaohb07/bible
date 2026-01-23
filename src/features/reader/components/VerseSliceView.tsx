import type { TranslationId, BookId } from "../../../shared/bible/refs";
import type { ChapterData } from "../types";
import Verse from "./Verse";
import { useHighlights } from "../../highlights/hooks/useHighlights";

type VerseData = ChapterData["verses"][number];

export default function VerseSliceView(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  verses: VerseData[];
}) {
  const h = useHighlights();

  return (
    <>
      {props.verses.map((v) => {
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
    </>
  );
}
