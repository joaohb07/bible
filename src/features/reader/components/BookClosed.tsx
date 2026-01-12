import { useNavigate } from "react-router-dom";

export default function BookClosed() {
  const navigate = useNavigate();

  return (
    <button
      className="book-closed"
      type="button"
      onClick={() => navigate("/read/pt/genesis/1")}
      aria-label="Open the Holy Bible"
    >
      <div className="book-title">
        <h1>Holy Bible</h1>
      </div>

      <div className="book-cta">
        <span>Click to begin</span>
        <div className="hint">Português • English • Latin</div>
      </div>
    </button>
  );
}
