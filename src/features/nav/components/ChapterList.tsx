export default function ChapterList(props: {
  chapters: number;
  activeChapter: number;
  onSelect: (chapter: number) => void;
}) {
  const items = Array.from({ length: props.chapters }, (_, i) => i + 1);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Capítulos</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((n) => {
          const active = n === props.activeChapter;
          return (
            <button
              key={n}
              onClick={() => props.onSelect(n)}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: active ? "#111" : "#fff",
                color: active ? "#fff" : "#111",
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
