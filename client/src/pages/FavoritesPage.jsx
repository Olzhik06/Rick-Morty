import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api/http.js";
import { getFavoriteIds, subscribeFavorites } from "../favorites.js";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import FavButton from "../components/FavButton.jsx";

export default function FavoritesPage() {
  const [ids, setIds] = useState(getFavoriteIds());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const idsKey = useMemo(() => ids.slice().sort((a, b) => a - b).join(","), [ids]);

  useEffect(() => subscribeFavorites(setIds), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);

      if (ids.length === 0) {
        setItems([]);
        return;
      }

      setLoading(true);
      try {
        const res = await apiGet(`/api/characters/${idsKey}`);
        const arr = Array.isArray(res) ? res : [res];
        if (!cancelled) setItems(arr);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [idsKey, ids.length]);

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Favorites</h2>
          <div style={{ marginTop: 8 }} className="badge">
            Saved characters: <b>{ids.length}</b>
          </div>
        </div>

        <Link to="/characters" className="btn" style={{ textDecoration: "none" }}>
          Browse characters
        </Link>
      </div>

      <div style={{ height: 14 }} />

      {loading && <SkeletonGrid count={Math.min(12, Math.max(4, ids.length))} card="character" />}

      {!loading && error && (
        <div className="card" style={{ padding: 14, borderColor: "rgba(239,68,68,0.35)" }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Failed to load favorites</div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--muted)" }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      {!loading && !error && ids.length === 0 && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>No favorites yet</div>
          <div style={{ color: "var(--muted)" }}>
            Open Characters and press the heart on a card.
          </div>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid">
          {items.map((c) => (
            <Link
              key={c.id}
              to={`/characters/${c.id}`}
              className="card"
              style={{ textDecoration: "none", color: "inherit", padding: 12 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 900 }}>{c.name}</div>
                <FavButton id={c.id} onChange={() => setIds(getFavoriteIds())} />
              </div>

              <img src={c.image} alt={c.name} className="thumb" style={{ marginTop: 10 }} />

              <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>
                {c.status} • {c.species} • {c.gender}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
