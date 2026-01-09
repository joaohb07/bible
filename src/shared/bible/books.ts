import type { TranslationId } from "./refs";

export type Testament = "old" | "new";

export type BibleBook = {
  id: string;
  testament: Testament;
  chapters: number;
  names: Record<TranslationId, string>;
};

export const BIBLE_BOOKS: BibleBook[] = [
  {
    id: "genesis",
    testament: "old",
    chapters: 50,
    names: {
      pt: "Gênesis",
      en: "Genesis",
      la: "Genesis",
    },
  },
  {
    id: "matthew",
    testament: "new",
    chapters: 28,
    names: {
      pt: "Mateus",
      en: "Matthew",
      la: "Matthaeus",
    },
  },
];

export function getBooksByTestament(testament: Testament) {
  return BIBLE_BOOKS.filter((b) => b.testament === testament);
}

export function getBookById(id: string) {
  return BIBLE_BOOKS.find((b) => b.id === id);
}



