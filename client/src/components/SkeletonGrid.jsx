export default function SkeletonGrid({ count = 12, card = "character" }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: 12 }}>
          {card === "character" && <div className="skeleton" style={{ height: 180, marginBottom: 10 }} />}
          <div className="skeleton" style={{ height: 16, width: "70%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, width: "45%" }} />
        </div>
      ))}
    </div>
  );
}
