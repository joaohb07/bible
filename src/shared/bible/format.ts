import type { TranslationId } from "./refs";
import { getBookById } from "./books";

export function formatReference(args: {
  translation: TranslationId;
  bookId: string;
  chapter: number;
}) {
  const book = getBookById(args.bookId);
  const name = book?.names[args.translation] ?? args.bookId;
  return `${name} ${args.chapter}`;
}
