import type { BookId, TranslationId } from "../../../shared/bible/refs";
import { t } from "../../../shared/i18n/ui";
import VerseSliceView from "./VerseSliceView";

type Props = {
  translation: TranslationId;
  book: BookId;
  chapter: number;

  /** Current page index to display (1-based in UI) */
  pageNumber: number;

  /** If undefined, pagination is still computing */
  versesSlice?: Array<{ verse: number; text: string }> | null;

  /** Whether pagination results are available */
  hasPages: boolean;

  /** Optional ref to measure the viewport size (only needed on left page) */
  viewportRef?: React.Ref<HTMLDivElement>;
};

export default function ReaderPageColumn({
  translation,
  book,
  chapter,
  pageNumber,
  versesSlice,
  hasPages,
  viewportRef,
}: Props) {
  return (
    <>
      <div ref={viewportRef} className="page-viewport">
        <div className="chapter-body chapter-body--paged">
          {!hasPages ? (
            <div className="paging-loading">
              {t(translation, "reader.calculatingPages")}
            </div>
          ) : versesSlice ? (
            <VerseSliceView
              translation={translation}
              book={book}
              chapter={chapter}
              verses={versesSlice}
            />
          ) : (
            <div className="chapter-body--unpaged" />
          )}
        </div>
      </div>

      <div className="page-sub">
        {hasPages ? t(translation, "reader.pageSingle", { page: pageNumber }) : ""}
      </div>
    </>
  );
}