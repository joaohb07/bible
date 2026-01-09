import type { TranslationId } from "./refs";

export type TranslationMeta = {
  id: TranslationId;
  label: string;
  language: string;
};

export const TRANSLATIONS: TranslationMeta[] = [
  {
    id: "pt",
    label: "Português",
    language: "pt-BR",
  },
  {
    id: "en",
    label: "English",
    language: "en-US",
  },
  {
    id: "la",
    label: "Latim",
    language: "la",
  },
];

export function getTranslation(id: TranslationId) {
  return TRANSLATIONS.find((t) => t.id === id);
}
