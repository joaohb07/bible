import type { TranslationId } from "../bible/refs";

export type UiKey =
  | "app.loading"
  | "app.error"
  | "reader.calculatingPages"
  | "reader.translationPill"
  | "reader.selectTranslation"
  | "reader.menu"
  | "reader.prev"
  | "reader.next"
  | "reader.totalPages"
  | "reader.pageSingle"
  | "reader.closeBook"
  | "nav.title"
  | "nav.oldTestament"
  | "nav.newTestament"
  | "nav.books"
  | "nav.chaptersFor"
  | "cover.title"
  | "cover.clickToBegin"
  | "cover.openAria"
  | "cover.languagePill"
  | "cover.selectLanguage"
  | "reader.themeLight"
  | "reader.themeDark";

type Dict = Record<UiKey, string>;

const UI: Record<TranslationId, Dict> = {
  pt: {
    "app.loading": "Carregando…",
    "app.error": "Erro: {msg}",
    "reader.calculatingPages": "Calculando páginas…",
    "reader.translationPill": "Tradução: {id} ▴",
    "reader.selectTranslation": "Selecionar tradução",
    "reader.menu": "Menu",
    "reader.prev": "‹ Anterior",
    "reader.next": "Próximo ›",
    "reader.totalPages": "{total} páginas",
    "reader.pageSingle": "Página {page}",
    "reader.closeBook": "Fechar Bíblia",
    "reader.themeLight": "Modo claro",
    "reader.themeDark": "Modo escuro",


    "nav.title": "Navegação",
    "nav.oldTestament": "Antigo Testamento",
    "nav.newTestament": "Novo Testamento",
    "nav.books": "Livros",
    "nav.chaptersFor": "Capítulos — {book}",

    "cover.title": "Bíblia Sagrada",
    "cover.clickToBegin": "Clique para começar",
    "cover.openAria": "Abrir a Bíblia Sagrada",
    "cover.languagePill": "{label} ▴",
    "cover.selectLanguage": "Selecionar idioma",
  },

  en: {
    "app.loading": "Loading…",
    "app.error": "Error: {msg}",
    "reader.calculatingPages": "Calculating pages…",
    "reader.translationPill": "Translation: {id} ▴",
    "reader.selectTranslation": "Select translation",
    "reader.menu": "Menu",
    "reader.prev": "‹ Previous",
    "reader.next": "Next ›",
    "reader.totalPages": "{total} pages",
    "reader.pageSingle": "Page {page}",
    "reader.closeBook": "Close Bible",
    "reader.themeLight": "Light mode",
    "reader.themeDark": "Dark mode",


    "nav.title": "Navigation",
    "nav.oldTestament": "Old Testament",
    "nav.newTestament": "New Testament",
    "nav.books": "Books",
    "nav.chaptersFor": "Chapters — {book}",

    "cover.title": "Holy Bible",
    "cover.clickToBegin": "Click to begin",
    "cover.openAria": "Open the Holy Bible",
    "cover.languagePill": "{label} ▴",
    "cover.selectLanguage": "Select language",
  },

  la: {
    "app.loading": "Onus…",
    "app.error": "Error: {msg}",
    "reader.calculatingPages": "Paginas computantur…",
    "reader.translationPill": "Versio: {id} ▴",
    "reader.selectTranslation": "Elige versionem",
    "reader.menu": "Menu",
    "reader.prev": "‹ Prior",
    "reader.next": "Proxima ›",
    "reader.totalPages": "{total} paginae",
    "reader.pageSingle": "Pagina {page}",
    "reader.closeBook": "Claude Bibliam",
    "reader.themeLight": "Modus clarus",
    "reader.themeDark": "Modus obscurus",


    "nav.title": "Navigatio",
    "nav.oldTestament": "Vetus Testamentum",
    "nav.newTestament": "Novum Testamentum",
    "nav.books": "Libri",
    "nav.chaptersFor": "Capitula — {book}",

    "cover.title": "Biblia Sacra",
    "cover.clickToBegin": "Tange ut incipias",
    "cover.openAria": "Aperi Bibliam Sacram",
    "cover.languagePill": "{label} ▴",
    "cover.selectLanguage": "Elige linguam",
  },
};

export function t(
  lang: TranslationId,
  key: UiKey,
  vars?: Record<string, string | number>
) {
  const template = UI[lang]?.[key] ?? UI.en[key] ?? key;
  if (!vars) return template;

  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
