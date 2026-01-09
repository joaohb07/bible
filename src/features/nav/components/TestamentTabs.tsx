import type { Testament } from "../../../shared/bible/books";

export default function TestamentTabs(props: {
  value: Testament;
  onChange: (t: Testament) => void;
}) {
  const Tab = (t: Testament, label: string) => (
    <button
      onClick={() => props.onChange(t)}
      style={{
        flex: 1,
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: props.value === t ? "#111" : "#fff",
        color: props.value === t ? "#fff" : "#111",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {Tab("old", "AT")}
      {Tab("new", "NT")}
    </div>
  );
}
