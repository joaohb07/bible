import BottomSheet from "../../../shared/ui/BottomSheet";
import LanguagePicker from "../../settings/components/LanguagePicker";
import type { BookId, TranslationId } from "../../../shared/bible/refs";
import { t } from "../../../shared/i18n/ui";

type Props = {
  open: boolean;
  onClose: () => void;
  translation: TranslationId;
  book: BookId;
  chapter: number;
  onNavigate: (path: string) => void;
};

export default function ReaderLanguageSheet(props: Props) {
  const { open, onClose, translation, book, chapter, onNavigate } = props;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t(translation, "reader.selectTranslation")}
    >
      <LanguagePicker
        value={translation}
        onSelect={(next) => {
          const qs = new URLSearchParams(window.location.search);
          qs.delete("p");
          const q = qs.toString();

          onNavigate(`/read/${next}/${book}/${chapter}${q ? `?${q}` : ""}`);
          onClose();
        }}
      />
    </BottomSheet>
  );
}