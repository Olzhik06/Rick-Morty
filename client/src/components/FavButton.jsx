import { isFavorite, toggleFavorite } from "../favorites.js";
import { toast } from "./ToastHost.jsx";

export default function FavButton({ id, size = 36, onChange }) {
  const fav = isFavorite(id);

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const nextIds = toggleFavorite(id);
    const nowFav = nextIds.includes(Number(id));

    toast(nowFav ? "Added to favorites" : "Removed from favorites");
    onChange?.();
  }

  return (
    <button
      className="btn"
      onClick={onClick}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      title={fav ? "Remove from favorites" : "Add to favorites"}
      style={{
        width: size,
        height: size,
        padding: 0,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>
        {fav ? "❤️" : "🤍"}
      </span>
    </button>
  );
}
