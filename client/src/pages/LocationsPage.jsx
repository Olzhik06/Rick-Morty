import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api/http.js";
import SkeletonGrid from "../components/SkeletonGrid.jsx";

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

export default function LocationsPage() {
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState(null); // { info, results }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (appliedQuery.trim()) p.set("name", appliedQuery.trim());
    p.set("page", String(page));
    return p.toString();
  }, [appliedQuery, page]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await apiGet(`/api/locations?${qs}`);
      setData(res);
    } catch (e) {
      if (e?.status === 404) {
        setData({ info: { pages: 0, next: null, prev: null }, results: [] });
        setError(null);
      } else {
        setError(e);
        setData(null);
      }
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
  }, [qs]);

  function onSubmit(e) {
    e.preventDefault();
    setAppliedQuery(query);
    setPage(1);
  }

  function onClear() {
    setQuery("");
    setAppliedQuery("");
    setPage(1);
  }

  const canPrev = data?.info?.prev != null && page > 1;
  const canNext = data?.info?.next != null;

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Locations</h2>
          <div style={{ marginTop: 8 }}>
            <Badge>Search + pagination • via server proxy</Badge>
          </div>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location by name"
          />
          <button className="btn btn-primary" type="submit">Search</button>
          {appliedQuery && (
            <button className="btn" type="button" onClick={onClear}>Clear</button>
          )}
        </form>
      </div>

      <div style={{ height: 14 }} />

      {loading && <SkeletonGrid count={10} card="location" />}

      {!loading && error && (
        <div className="card" style={{ padding: 14, borderColor: "rgba(239,68,68,0.35)" }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Something went wrong</div>
          <div style={{ color: "var(--muted)", marginBottom: 12 }}>
            Check backend and try again.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={load}>Retry</button>
            <button className="btn" onClick={onClear}>Reset search</button>
          </div>
          <pre style={{ marginTop: 12, whiteSpace: "pre-wrap", color: "var(--muted)" }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      {!loading && !error && data && data.results.length === 0 && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>No results</div>
          <div style={{ color: "var(--muted)", marginBottom: 12 }}>
            Try another name or clear the search.
          </div>
          <button className="btn" onClick={onClear}>Clear</button>
        </div>
      )}

      {!loading && !error && data && data.results.length > 0 && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {data.results.map((loc) => (
              <Link
                key={loc.id}
                to={`/locations/${loc.id}`}
                className="card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  padding: 12,
                  transition: "transform .08s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0px)"; }}
                title="Open details"
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900, letterSpacing: "-0.01em" }}>{loc.name}</div>
                  <Badge>{loc.type || "Unknown type"}</Badge>
                </div>

                <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>
                  Dimension: <b>{loc.dimension || "—"}</b>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge>Residents: {loc.residents?.length ?? 0}</Badge>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ height: 14 }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ color: "var(--muted)" }}>
              Page <b>{page}</b>{data?.info?.pages ? ` of ${data.info.pages}` : ""}
              {appliedQuery ? ` • query: "${appliedQuery}"` : ""}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" disabled={!canPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Prev
              </button>
              <button className="btn" disabled={!canNext} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
