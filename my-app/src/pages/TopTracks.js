import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { getTopTracks } from "../utils/api";

function TopTracks() {
  const [profile, setProfile] = useState(null);     // beholder profilhenting som før
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all_time"); // nå er all_time default (fra DB)
  const navigate = useNavigate();

  // Hent brukerprofil (Spotify) for å holde eksisterende layout/knapper
  useEffect(() => {
    const token = localStorage.getItem("spotifyToken");
    if (!token) {
      navigate("/");
      return;
    }
    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setProfile)
      .catch(() => setProfile({ display_name: "You" }));
  }, [navigate]);

  // Map UI-valg til backend-interval (valgfritt)
  function toRange(tr) {
    // returnerer { from, to } for backend, eller {} for all time
    const today = new Date();
    const to = today.toISOString().slice(0, 10); // YYYY-MM-DD
    const d = new Date(today);

    if (tr === "short_term") { // ca siste 1 mnd
      d.setMonth(d.getMonth() - 1);
      return { from: d.toISOString().slice(0, 10), to };
    }
    if (tr === "medium_term") { // ca siste 6 mnd
      d.setMonth(d.getMonth() - 6);
      return { from: d.toISOString().slice(0, 10), to };
    }
    if (tr === "long_term") { // ca siste 12 mnd
      d.setFullYear(d.getFullYear() - 1);
      return { from: d.toISOString().slice(0, 10), to };
    }
    return {}; // all_time
  }

  // Hent top tracks fra backend
  useEffect(() => {
    setLoading(true);
    const { from, to } = toRange(timeRange);

    getTopTracks(50, from, to)
      .then((data) => setItems(data.items || []))
      .catch((e) => {
        console.error(e);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [timeRange]);

  if (!profile) return <p>Laster inn…</p>;
  if (loading) return <p>Henter top tracks…</p>;

  return (
    <div className="home-container">
      <button className="back-button" onClick={() => navigate("/home")}>
        ← Tilbake
      </button>

      <div className="content-section">
        <h2 className="section-title">Dine mest hørte sanger</h2>

        <div className="nav-links">
          <button
            className={timeRange === "short_term" ? "active" : ""}
            onClick={() => setTimeRange("short_term")}
          >
            Sist måned
          </button>
          <button
            className={timeRange === "medium_term" ? "active" : ""}
            onClick={() => setTimeRange("medium_term")}
          >
            Siste 6 mnd
          </button>
          <button
            className={timeRange === "long_term" ? "active" : ""}
            onClick={() => setTimeRange("long_term")}
          >
            Siste år
          </button>
          <button
            className={timeRange === "all_time" ? "active" : ""}
            onClick={() => setTimeRange("all_time")}
          >
            All Time
          </button>
        </div>

        <ul className="track-list">
          {items.map((t, index) => {
            // Backend /api/top/tracks returnerer:
            // { track_id, track, artist, album, plays, ms_played }
            const minutes = Math.round((t.ms_played || 0) / 60000);
            return (
              <li key={t.track_id ?? index} className="track-item">
                <span className="track-index">{index + 1}.</span>
                <div className="track-info">
                  <div className="track-title">
                    <button
                      className="artist-name-button"
                      onClick={() => navigate(`/song/${encodeURIComponent(t.track)}`)}
                    >
                      {t.track}
                    </button>
                  </div>
                  <div className="track-artist">
                    <button
                      className="artist-name-button"
                      onClick={() => navigate(`/artist/${encodeURIComponent(t.artist)}`)}
                    >
                      {t.artist}
                    </button>
                    {t.album ? <span> — {t.album}</span> : null}
                  </div>
                  <div className="track-time">
                    Totalt: {minutes} min{t.plays ? ` (${t.plays} ganger)` : ""}
                  </div>
                </div>
                {/* Ingen album-cover i backend-responsen per nå */}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default TopTracks;
