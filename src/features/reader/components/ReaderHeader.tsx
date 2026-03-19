import type { TranslationId } from "../../../shared/bible/refs";
import { t } from "../../../shared/i18n/ui";

export default function ReaderHeader(props: {
  translation: TranslationId;
  title: string;
  totalPages: number;
  hasPages: boolean;
  onOpenNav: () => void;
  onClose: () => void;
}) {
  const { translation, title, totalPages, hasPages, onOpenNav, onClose } = props;

  return (
    <header className="page-header">
      {/* Opens navigation drawer */}
      <button
        className="page-nav-btn"
        onClick={onOpenNav}
        title={t(translation, "reader.menu")}
        type="button"
      >
        ☰
      </button>

      <div className="page-header-text">
        <div className="page-header-center">
          <h2>{title}</h2>

          <div className="page-sub">
            {hasPages
              ? t(translation, "reader.totalPages", { total: totalPages })
              : ""}
          </div>
        </div>

        {/* Close reader */}
        <button
          type="button"
          className="page-close-btn"
          onClick={onClose}
          title={t(translation, "reader.closeBook")}
        >
          {t(translation, "reader.closeBook")}
        </button>
      </div>
    </header>
  );
}