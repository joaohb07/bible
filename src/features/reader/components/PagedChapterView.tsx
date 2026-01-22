import type { ChapterData } from "../types";

type Props = {
  data: ChapterData;
  page: "left" | "right";
};

export default function PagedChapterView({ data, page }: Props) {
  const verses = data.verses ?? [];
  const mid = Math.ceil(verses.length / 2);

  const slice = page === "left" ? verses.slice(0, mid) : verses.slice(mid);

  return (
    <>
      {slice.map((v) => (
        <div key={v.verse} className="verse-line">
          <span className="verse-num">{v.verse}</span>
          <span className="verse-text">{v.text}</span>
        </div>
      ))}
    </>
  );
}
