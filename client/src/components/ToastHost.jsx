import { useEffect, useState } from "react";

let pushFn = null;

export function toast(message) {
  pushFn?.(message);
}

export default function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    pushFn = (message) => {
      const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
      setItems((prev) => [{ id, message }, ...prev].slice(0, 3));
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
      }, 2200);
    };
    return () => {
      pushFn = null;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 9999,
      }}
    >
      {items.map((t) => (
        <div
          key={t.id}
          className="card"
          style={{
            padding: "10px 12px",
            minWidth: 240,
            boxShadow: "0 10px 30px rgba(0,0,0,.20)",
          }}
        >
          <div style={{ fontWeight: 800 }}>{t.message}</div>
        </div>
      ))}
    </div>
  );
}
