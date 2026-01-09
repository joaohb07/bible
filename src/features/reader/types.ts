import type { BookId } from "../../shared/bible/refs";

export type ChapterData = {
  book: BookId;
  chapter: number;
  verses: Array<{ verse: number; text: string }>;
};
