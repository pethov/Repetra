import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { getTopArtists } from "../utils/api";

function TopArtists() {
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all_time");
  const navigate = useNavigate();

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

  function toRange(tr) {
    const today = new Date();
    const to = today.toISOString().slice(0, 10);
    const d = new Date(today);
    if (tr === "short_term") { d.setMonth(d.getMonth() - 1); return { from: d.toISOString().slice(0,10), to }; }
    if (tr === "medium_term") { d.setMonth(d.getMonth() - 6); return { from: d.toISOString().slice(0,10), to }; }
    if (tr === "long_term") { d.setFullYear(d.getFullYear() - 1); return { from: d.toISOString().slice(0,10), to }; }
    return {};
  }

  useEffect(() => {
    setLoading(true);
    const { from, to } = toRange(timeRange);
    getTopArtists(50, from, to)
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [timeRange]);

  if (!profile) return <p>Laster inn…</p>;
  if (loading) return <p>Henter top artists…</p>;

  return (
    <div className="home-container">
      <button className="back-button" onClick={() => navigate("/home")}>← Tilbake</button>
      <div className="content-section">
        <h2 className="section-title">Dine mest hørte artister</h2>

        <div className="nav-links">
          <button className={timeRange==="short_term"?"active":""} onClick={()=>setTimeRange("short_term")}>Sist måned</button>
          <button className={timeRange==="medium_term"?"active":""} onClick={()=>setTimeRange("medium_term")}>Siste 6 mnd</button>
          <button className={timeRange==="long_term"?"active":""} onClick={()=>setTimeRange("long_term")}>Siste år</button>
          <button className={timeRange==="all_time"?"active":""} onClick={()=>setTimeRange("all_time")}>All Time</button>
        </div>

        <ol className="track-list">
          {items.map((a, idx) => (
            <li key={a.artist_id ?? idx} className="track-item">
              <span className="track-index">{idx+1}.</span>
              <div className="track-info">
                <div className="track-title">
                  <button
                    className="artist-name-button"
                    onClick={() => navigate(`/artist/${encodeURIComponent(a.artist)}`)}
                  >
                    {a.artist}
                  </button>
                </div>
                <div className="track-time">
                  Totalt: {Math.round((a.ms_played||0)/60000)} min{a.plays ? ` (${a.plays} ganger)` : ""}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default TopArtists;
