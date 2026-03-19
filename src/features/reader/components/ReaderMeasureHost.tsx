import React from "react";
import type { TranslationId, BookId } from "../../../shared/bible/refs";
import Verse from "./Verse";

type Props = {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  verses: { verse: number; text: string }[];
  width: number;
  hostRef: React.RefObject<HTMLDivElement | null>;
};

export default function ReaderMeasureHost({
  translation,
  book,
  chapter,
  verses,
  width,
  hostRef,
}: Props) {
  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="chapter-body chapter-body--paged paging-measure-host"
      style={{ width: width || 600 }}
    >
      {verses.map((v, idx) => (
        <Verse
          key={v.verse}
          refObj={{
            translation,
            book,
            chapter,
            verse: v.verse,
          }}
          text={v.text}
          dataIndex={idx}
        />
      ))}
    </div>
  );
}