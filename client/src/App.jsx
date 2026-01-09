import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toggleTheme } from "./theme.js";

import CharactersPage from "./pages/CharactersPage.jsx";
import CharacterDetail from "./pages/CharacterDetail.jsx";
import EpisodesPage from "./pages/EpisodesPage.jsx";
import EpisodeDetail from "./pages/EpisodeDetail.jsx";
import LocationsPage from "./pages/LocationsPage.jsx";
import LocationDetail from "./pages/LocationDetail.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";

import { getFavoriteIds, subscribeFavorites } from "./favorites.js";
import ToastHost from "./components/ToastHost.jsx";

function Nav({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? "navlink active" : "navlink")}
    >
      {children}
    </NavLink>
  );
}

export default function App() {
  const navigate = useNavigate();

  // theme
  const [themeLabel, setThemeLabel] = useState(
    document.documentElement.getAttribute("data-theme") === "light"
      ? "Light"
      : "Dark"
  );

  // favorites counter
  const [favCount, setFavCount] = useState(getFavoriteIds().length);

  useEffect(() => {
    return subscribeFavorites((ids) => setFavCount(ids.length));
  }, []);

  function onToggleTheme() {
    const next = toggleTheme();
    setThemeLabel(next === "light" ? "Light" : "Dark");
  }

  function goRandomCharacter() {
    const id = Math.floor(Math.random() * 826) + 1;
    navigate(`/characters/${id}`);
  }

  return (
    <div className="container">
      {/* HERO / HEADER */}
      <div className="card hero">
        <div>
          <h1>Rick & Morty Explorer</h1>
          <p>
            Search characters, episodes and locations.  
            Server-side proxy • URL state • Favorites • Prefetch.
          </p>

          <div style={{ marginTop: 10 }} className="topnav">
            <Nav to="/characters">Characters</Nav>
            <Nav to="/episodes">Episodes</Nav>
            <Nav to="/locations">Locations</Nav>
            <Nav to="/favorites">
              Favorites <span style={{ opacity: 0.7 }}>({favCount})</span>
            </Nav>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <button className="btn" onClick={onToggleTheme}>
            Theme: {themeLabel}
          </button>
          <button className="btn btn-primary" onClick={goRandomCharacter}>
            Random character
          </button>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<Navigate to="/characters" replace />} />

        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/characters/:id" element={<CharacterDetail />} />

        <Route path="/episodes" element={<EpisodesPage />} />
        <Route path="/episodes/:id" element={<EpisodeDetail />} />

        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/locations/:id" element={<LocationDetail />} />

        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>

      {/* TOASTS */}
      <ToastHost />
    </div>
  );
}
