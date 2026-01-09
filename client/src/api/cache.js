const map = new Map();

export function cacheGet(key) {
  return map.get(key);
}

export function cacheSet(key, value) {
  map.set(key, value);
}

export function cacheHas(key) {
  return map.has(key);
}
