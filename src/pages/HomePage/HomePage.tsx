export default function HomePage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>The Bible</h1>
      <a href={`${import.meta.env.BASE_URL}read/pt/genesis/1`}>Open</a>
    </div>
  );
}
