import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Drawer from "../../../shared/ui/Drawer";
import type { TranslationId } from "../../../shared/bible/refs";
import {
  getBookById,
  getBooksByTestament,
  type Testament,
} from "../../../shared/bible/books";
import { t } from "../../../shared/i18n/ui";
import TestamentTabs from "./TestamentTabs";
import BookList from "./BookList";
import ChapterList from "./ChapterList";

export default function DrawerNav(props: {
  open: boolean;
  onClose: () => void;
  translation: TranslationId;
  bookId: string;
  chapter: number;
}) {
  const nav = useNavigate();

  const currentBook = useMemo(
    () => getBookById(props.bookId) ?? getBookById("genesis"),
    [props.bookId]
  );

  const [testament, setTestament] = useState<Testament>(
    currentBook?.testament ?? "old"
  );

  const books = useMemo(() => getBooksByTestament(testament), [testament]);

  const safeBookId = currentBook?.id ?? "genesis";
  const safeBookName =
    currentBook?.names?.[props.translation] ?? safeBookId;

  const safeChapters = currentBook?.chapters ?? 50;

  function go(nextBook: string, nextChapter: number) {
    nav(`/read/${props.translation}/${nextBook}/${nextChapter}`);
  }

  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      title={t(props.translation, "nav.title")}
    >
      <TestamentTabs
        value={testament}
        onChange={setTestament}
        translation={props.translation}
      />

      <div className="nav-section-title">
        {t(props.translation, "nav.books")}
      </div>
      <BookList
        translation={props.translation}
        books={books}
        activeBookId={safeBookId}
        onSelect={(bookId) => go(bookId, 1)}
      />

      <div className="nav-section-title">
        {t(props.translation, "nav.chaptersFor", { book: safeBookName })}
      </div>
      <ChapterList
        chapters={safeChapters}
        activeChapter={props.chapter}
        onSelect={(c) => go(safeBookId, c)}
      />
    </Drawer>
  );
}
