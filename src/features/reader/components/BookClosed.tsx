import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TranslationId } from "../../../shared/bible/refs";
import { getTranslation } from "../../../shared/bible/translations";
import { t } from "../../../shared/i18n/ui";
import BottomSheet from "../../../shared/ui/BottomSheet";
import LanguagePicker from "../../settings/components/LanguagePicker";

const LS_KEY = "bible:translation";

function lsGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export default function BookClosed() {
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);

  const [translation, setTranslation] = useState<TranslationId>("pt");

  useEffect(() => {
    const saved = lsGet(LS_KEY) as TranslationId | null;
    if (saved === "pt" || saved === "en" || saved === "la") {
      setTranslation(saved);
    }
  }, []);

  const label = useMemo(() => {
    return getTranslation(translation)?.label ?? translation.toUpperCase();
  }, [translation]);

  function openBook() {
    navigate(`/read/${translation}/genesis/1`);
  }

  return (
    <>
      <div
        className="book-closed"
        role="button"
        tabIndex={0}
        onClick={openBook}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openBook();
        }}
        aria-label={t(translation, "cover.openAria")}
      >
        <div className="book-title">
          <h1>{t(translation, "cover.title")}</h1>
        </div>

        <div className="book-cta">
          <span>{t(translation, "cover.clickToBegin")}</span>

          <button
            type="button"
            className="cover-lang-pill"
            onClick={(e) => {
              e.stopPropagation();
              setLangOpen(true);
            }}
          >
            {t(translation, "cover.languagePill", { label })}
          </button>
        </div>
      </div>

      <BottomSheet
        open={langOpen}
        onClose={() => setLangOpen(false)}
        title={t(translation, "cover.selectLanguage")}
      >
        <LanguagePicker
          value={translation}
          onSelect={(next) => {
            setTranslation(next);
            lsSet(LS_KEY, next);
            setLangOpen(false);
          }}
        />
      </BottomSheet>
    </>
  );
}
