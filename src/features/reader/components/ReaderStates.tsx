import { useNavigate } from "react-router-dom";

export function ChapterSkeleton() {
  // skeleton bem simples, sem libs
  const rows = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((i) => (
        <div
          key={i}
          style={{
            height: 18,
            borderRadius: 8,
            background: "rgba(0,0,0,0.08)",
            width: i % 3 === 0 ? "70%" : "100%",
          }}
        />
      ))}
    </div>
  );
}

export function ChapterError(props: {
  title?: string;
  message: string;
  technical?: string;
  onRetry?: () => void;
}) {
  const nav = useNavigate();

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.12)",
        background: "rgba(255,255,255,0.75)",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800 }}>
        {props.title ?? "Não foi possível carregar o capítulo"}
      </div>

      <div style={{ opacity: 0.8 }}>{props.message}</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {props.onRetry && (
          <button onClick={props.onRetry} style={{ cursor: "pointer" }}>
            ↻ Tentar novamente
          </button>
        )}
        <button onClick={() => nav("/")} style={{ cursor: "pointer" }}>
          ⟵ Voltar ao início
        </button>
      </div>

      {props.technical && (
        <pre
          style={{
            margin: 0,
            padding: 10,
            borderRadius: 10,
            background: "rgba(0,0,0,0.06)",
            overflow: "auto",
            fontSize: 12,
            opacity: 0.8,
          }}
        >
          {props.technical}
        </pre>
      )}
    </div>
  );
}
