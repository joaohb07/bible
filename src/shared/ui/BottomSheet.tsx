import { useEffect } from "react";

export default function BottomSheet(props: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!props.open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose]);

  if (!props.open) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={props.onClose} />

      <div className="sheet">
        <div className="sheet-handle" />
        {props.title && <div className="sheet-title">{props.title}</div>}
        <div className="sheet-content">{props.children}</div>
      </div>
    </>
  );
}
