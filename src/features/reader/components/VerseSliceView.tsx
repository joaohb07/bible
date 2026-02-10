import type { BookId, TranslationId } from "../../../shared/bible/refs";
import type { VerseData } from "../pagination/types";
import Verse from "./Verse";

export default function VerseSliceView(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  verses: VerseData[];
}) {
  return (
    <div className="verse-slice">
      {props.verses.map((v) => (
        <Verse
          key={v.verse}
          refObj={{
            translation: props.translation,
            book: props.book,
            chapter: props.chapter,
            verse: v.verse,
          }}
          text={v.text}
        />
      ))}
    </div>
  );
}

