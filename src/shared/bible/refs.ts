export type TranslationId = "pt" | "en" | "la";
export type BookId = string;

export type VerseRef = {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  verse: number;
};
