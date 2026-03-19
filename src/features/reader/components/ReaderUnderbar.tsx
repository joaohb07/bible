import type { TranslationId } from "../../../shared/bible/refs";
import { t } from "../../../shared/i18n/ui";

type Props = {
  translation: TranslationId;
  theme: "light" | "dark";
  onToggleTheme: () => void;

  hidePrev: boolean;
  hideNext: boolean;
  onPrev: () => void;
  onNext: () => void;

  onOpenLanguagePicker: () => void;
};

/**
 * Reader underbar controls:
 * - theme toggle
 * - previous/next navigation (hidden at Bible boundaries)
 * - translation selection trigger
 */
export default function ReaderUnderbar({
  translation,
  theme,
  onToggleTheme,
  hidePrev,
  hideNext,
  onPrev,
  onNext,
  onOpenLanguagePicker,
}: Props) {
  return (
    <div className="book-underbar">
      <button
        className="lang-pill"
        onClick={onToggleTheme}
        title={t(translation, theme === "dark" ? "reader.themeDark" : "reader.themeLight")}
        aria-label={t(translation, theme === "dark" ? "reader.themeDark" : "reader.themeLight")}
        type="button"
      >
        {theme === "dark" ? "💡 Off" : "💡 On"}
      </button>

      {!hidePrev && (
        <button
          className="lang-pill"
          onClick={onPrev}
          title={t(translation, "reader.prev")}
          type="button"
        >
          {t(translation, "reader.prev")}
        </button>
      )}

      <button className="lang-pill" onClick={onOpenLanguagePicker} type="button">
        {t(translation, "reader.translationPill", {
          id: translation.toUpperCase(),
        })}
      </button>

      {!hideNext && (
        <button
          className="lang-pill"
          onClick={onNext}
          title={t(translation, "reader.next")}
          type="button"
        >
          {t(translation, "reader.next")}
        </button>
      )}
    </div>
  );
}