const KEY = "rm_favorites_v1";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("favorites:changed"));
}

export function getFavoriteIds() {
  return read();
}

export function isFavorite(id) {
  return read().includes(Number(id));
}

export function toggleFavorite(id) {
  const nid = Number(id);
  const ids = read();
  const next = ids.includes(nid) ? ids.filter((x) => x !== nid) : [nid, ...ids];
  write(next);
  return next;
}

export function subscribeFavorites(cb) {
  const handler = () => cb(getFavoriteIds());
  window.addEventListener("favorites:changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("favorites:changed", handler);
    window.removeEventListener("storage", handler);
  };
}
