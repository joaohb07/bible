import { useEffect, type ReactNode } from "react";

export default function Drawer(props: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
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
    <div
      role="dialog"
      aria-modal="true"
      className="drawer-overlay"
      onClick={props.onClose}
    >
      <div className="nav-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="nav-card">
          <div className="nav-title-row">
            <h3 className="nav-title">{props.title ?? "Menu"}</h3>
            <button
              className="nav-close-btn"
              onClick={props.onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="nav-body">{props.children}</div>
        </div>
      </div>
    </div>
  );
}
