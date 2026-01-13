export default function ChapterList(props: {
  chapters: number;
  activeChapter: number;
  onSelect: (chapter: number) => void;
}) {
  const items = Array.from({ length: props.chapters }, (_, i) => i + 1);

  return (
    <div className="chapter-list">
      <div className="chapter-grid">
        {items.map((n) => {
          const active = n === props.activeChapter;
          return (
            <button
              key={n}
              onClick={() => props.onSelect(n)}
              className={`nav-chip ${active ? "is-active" : ""}`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
