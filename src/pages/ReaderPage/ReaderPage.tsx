import { useParams } from "react-router-dom";
import { useState } from "react";
import BookStage from "../../features/reader/components/BookStage";
import DrawerNav from "../../features/nav/components/DrawerNav";
import type { TranslationId } from "../../shared/bible/refs";

export default function ReaderPage() {
  const { translation, book, chapter } = useParams();
  const [open, setOpen] = useState(false);

  const t = (translation ?? "pt") as TranslationId;
  const b = book ?? "genesis";
  const c = Number(chapter ?? "1") || 1;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginTop: 16 }}>
        <BookStage
          translation={t}
          book={b}
          chapter={c}
          onOpenNav={() => setOpen(true)}
        />
      </div>

      <DrawerNav
        open={open}
        onClose={() => setOpen(false)}
        translation={t}
        bookId={b}
        chapter={c}
      />
    </div>
  );
}
