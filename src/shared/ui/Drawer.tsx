import type { ReactNode } from "react";

export default function Drawer(props: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!props.open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={props.onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 360,
          maxWidth: "90vw",
          height: "100%",
          background: "#fff",
          padding: 16,
          boxShadow: "-8px 0 24px rgba(0,0,0,0.25)",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <strong style={{ fontSize: 18, flex: 1 }}>
            {props.title ?? "Menu"}
          </strong>
          <button onClick={props.onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div style={{ marginTop: 16 }}>{props.children}</div>
      </div>
    </div>
  );
}
