import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiGet } from "../api/http.js";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import FavButton from "../components/FavButton.jsx";
import { cacheHas, cacheSet } from "../api/cache.js";

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  let label = status || "Unknown";
  let color = "var(--muted)";

  if (s === "alive") color = "var(--good)";
  else if (s === "dead") color = "var(--bad)";
  else color = "var(--warn)";

  return (
    <span className="badge" style={{ borderColor: "var(--border)" }}>
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

function clampPage(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x < 1) return 1;
  return Math.floor(x);
}

function TrendingSkeleton() {
  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{
            minWidth: 210,
            padding: 12,
            boxShadow: "none",
            borderColor: "var(--border)",
          }}
        >
          <div className="skeleton" style={{ height: 140, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 14, width: "70%", marginTop: 10 }} />
          <div className="skeleton" style={{ height: 14, width: "50%", marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

export default function CharactersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // init from URL
  const initialName = searchParams.get("name") || "";
  const initialPage = clampPage(searchParams.get("page") || 1);

  const [query, setQuery] = useState(initialName);
  const [appliedQuery, setAppliedQuery] = useState(initialName);
  const [page, setPage] = useState(initialPage);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Trending
  const trendingIds = "1,2,3,4,5,6";
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // keep URL synced
  useEffect(() => {
    const next = new URLSearchParams();
    if (appliedQuery.trim()) next.set("name", appliedQuery.trim());
    if (page !== 1) next.set("page", String(page));
    setSearchParams(next, { replace: true });
  }, [appliedQuery, page, setSearchParams]);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (appliedQuery.trim()) p.set("name", appliedQuery.trim());
    p.set("page", String(page));
    return p.toString();
  }, [appliedQuery, page]);

  async function prefetchCharacter(id) {
    const key = `character:${id}`;
    if (cacheHas(key)) return;
    try {
      const res = await apiGet(`/api/characters/${id}`);
      cacheSet(key, res);
    } catch {
      // ignore
    }
  }

  // Load Trending once
  useEffect(() => {
    let cancelled = false;

    async function loadTrending() {
      setTrendingLoading(true);
      try {
        const res = await apiGet(`/api/characters/${trendingIds}`);
        const arr = Array.isArray(res) ? res : [res];

        // кладём в кэш, чтобы detail был мгновенный
        arr.forEach((c) => cacheSet(`character:${c.id}`, c));

        if (!cancelled) setTrending(arr);
      } catch {
        if (!cancelled) setTrending([]);
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    }

    loadTrending();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await apiGet(`/api/characters?${qs}`);
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
    return () => {
      cancelled = true;
    };
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
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Characters</h2>
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="badge">Search + pagination • via server proxy</span>
            {(appliedQuery || page !== 1) && <span className="badge">URL synced</span>}
            <span className="badge" title="Hover a card to prefetch details">Prefetch on hover</span>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}
        >
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name (Rick, Morty...)"
          />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
          {(appliedQuery || page !== 1) && (
            <button className="btn" type="button" onClick={onClear}>
              Clear
            </button>
          )}
        </form>
      </div>

      <div style={{ height: 14 }} />

      {/* TRENDING */}
      <div className="card" style={{ padding: 12, boxShadow: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900 }}>Popular today</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Quick picks (fast open thanks to prefetch)
            </div>
          </div>
          <span className="badge">IDs: {trendingIds}</span>
        </div>

        <div style={{ height: 10 }} />

        {trendingLoading ? (
          <TrendingSkeleton />
        ) : trending.length === 0 ? (
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            Trending failed to load (it’s ok, search still works).
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
            {trending.map((c) => (
              <Link
                key={c.id}
                to={`/characters/${c.id}`}
                className="card"
                style={{
                  minWidth: 210,
                  textDecoration: "none",
                  color: "inherit",
                  padding: 12,
                  boxShadow: "none",
                }}
                onMouseEnter={() => prefetchCharacter(c.id)}
                title="Open details"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  style={{
                    width: "100%",
                    height: 140,
                    objectFit: "cover",
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                  }}
                />
                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontWeight: 900, lineHeight: 1.15 }}>{c.name}</div>
                  <FavButton id={c.id} />
                </div>
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <StatusBadge status={c.status} />
                  <span className="badge">{c.species}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 14 }} />

      {/* LIST STATES */}
      {loading && <SkeletonGrid count={12} card="character" />}

      {!loading && error && (
        <div className="card" style={{ padding: 14, borderColor: "rgba(239,68,68,0.35)" }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Something went wrong</div>
          <div style={{ color: "var(--muted)", marginBottom: 12 }}>
            Это backend proxy ошибка. Проверь: <b>/api/characters?name=rick&page=1</b>
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

      {/* LIST */}
      {!loading && !error && data && data.results.length > 0 && (
        <>
          <div className="grid">
            {data.results.map((c) => (
              <Link
                key={c.id}
                to={`/characters/${c.id}`}
                className="card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  padding: 12,
                  transition: "transform .08s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  prefetchCharacter(c.id);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)";
                }}
                title="Open details"
              >
                <img src={c.image} alt={c.name} className="thumb" />

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ fontWeight: 900, letterSpacing: "-0.01em" }}>{c.name}</div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <StatusBadge status={c.status} />
                    <FavButton id={c.id} />
                  </div>
                </div>

                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
                  {c.species} • {c.gender}
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="badge">Origin: {c.origin?.name}</span>
                  <span className="badge">Last: {c.location?.name}</span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ height: 14 }} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ color: "var(--muted)" }}>
              Page <b>{page}</b>
              {data?.info?.pages ? ` of ${data.info.pages}` : ""}
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
