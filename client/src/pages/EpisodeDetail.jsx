import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../api/http.js";

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

function DetailSkeleton() {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 28, width: "60%", marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 10 }} />
      <div style={{ height: 10 }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div className="skeleton" style={{ height: 28, width: 160, borderRadius: 999 }} />
        <div className="skeleton" style={{ height: 28, width: 200, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export default function EpisodeDetail() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet(`/api/episodes/${id}`);
      setData(res);
    } catch (e) {
      setError(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await load();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div>
        <Link to="/episodes" className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
          ← Back
        </Link>
        <div style={{ height: 12 }} />
        <DetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Link to="/episodes" className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
          ← Back
        </Link>
        <div style={{ height: 12 }} />
        <div className="card" style={{ padding: 16, borderColor: "rgba(239,68,68,0.35)" }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Failed to load episode</div>
          <div style={{ color: "var(--muted)", marginBottom: 12 }}>Try again.</div>
          <button className="btn btn-primary" onClick={load}>Retry</button>
          <pre style={{ marginTop: 12, whiteSpace: "pre-wrap", color: "var(--muted)" }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <Link to="/episodes" className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
        ← Back
      </Link>

      <div style={{ height: 12 }} />

      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0 }}>{data.name}</h2>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge>{data.episode}</Badge>
              <Badge>Air: {data.air_date}</Badge>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Badge>ID: {data.id}</Badge>
            <Badge>Characters: {data.characters?.length ?? 0}</Badge>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div className="card" style={{ padding: 12, boxShadow: "none" }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Summary</div>
          <div style={{ color: "var(--muted)" }}>
            Episode <b>{data.episode}</b> aired on <b>{data.air_date}</b>. It features{" "}
            <b>{data.characters?.length ?? 0}</b> characters.
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          Tip: Later we can show the list of characters for this episode (optional “wow” upgrade).
        </div>
      </div>
    </div>
  );
}
