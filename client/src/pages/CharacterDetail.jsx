import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../api/http.js";
import FavButton from "../components/FavButton.jsx";
import { cacheGet, cacheSet } from "../api/cache.js";

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  let label = status || "Unknown";
  let color = "var(--muted)";

  if (s === "alive") color = "var(--good)";
  else if (s === "dead") color = "var(--bad)";
  else color = "var(--warn)";

  return (
    <span className="badge">
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: color,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

function DetailSkeleton() {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 14 }} />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div className="skeleton" style={{ width: 260, height: 260, borderRadius: 18 }} />
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="skeleton" style={{ height: 26, width: "60%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 14, width: "45%", marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 14, width: "55%", marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 10 }} />
        </div>
      </div>
    </div>
  );
}

export default function CharacterDetail() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    const key = `character:${id}`;
    const cached = cacheGet(key);

    // Если уже есть данные из prefetch — покажем мгновенно
    if (cached) setData(cached);

    setLoading(!cached);
    setError(null);

    try {
      const res = await apiGet(`/api/characters/${id}`);
      cacheSet(key, res);
      setData(res);
    } catch (e) {
      setError(e);
      if (!cached) setData(null);
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
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div>
        <Link to="/characters" className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
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
        <Link to="/characters" className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
          ← Back
        </Link>
        <div style={{ height: 12 }} />
        <div className="card" style={{ padding: 16, borderColor: "rgba(239,68,68,0.35)" }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Failed to load character</div>
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
      <Link to="/characters" className="btn" style={{ display: "inline-block", textDecoration: "none" }}>
        ← Back
      </Link>

      <div style={{ height: 12 }} />

      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0 }}>{data.name}</h2>
              <FavButton id={data.id} size={40} />
            </div>

            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <StatusBadge status={data.status} />
              <Badge>{data.species}</Badge>
              <Badge>{data.gender}</Badge>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Badge>ID: {data.id}</Badge>
            <Badge>Created: {data.created ? new Date(data.created).toLocaleDateString() : "—"}</Badge>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 280, maxWidth: "100%" }}>
            <img
              src={data.image}
              alt={data.name}
              style={{ width: "100%", borderRadius: 18, border: "1px solid var(--border)" }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <div className="card" style={{ padding: 12, boxShadow: "none" }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Origin</div>
                <div style={{ color: "var(--muted)" }}>{data.origin?.name || "—"}</div>
              </div>

              <div className="card" style={{ padding: 12, boxShadow: "none" }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Last known location</div>
                <div style={{ color: "var(--muted)" }}>{data.location?.name || "—"}</div>
              </div>

              <div className="card" style={{ padding: 12, boxShadow: "none" }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Type</div>
                <div style={{ color: "var(--muted)" }}>{data.type?.trim() ? data.type : "—"}</div>
              </div>

              <div className="card" style={{ padding: 12, boxShadow: "none" }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Episodes</div>
                <div style={{ color: "var(--muted)" }}>{data.episode?.length ?? 0} appearances</div>
              </div>
            </div>

            <div style={{ height: 12 }} />
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Tip: hover a card in list to prefetch details (instant open).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
