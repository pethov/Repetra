import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./Home.css";
import { lookupAlbum, getTopTracks } from "../utils/api";

export default function AlbumInfo() {
  const { albumName, artistName } = useParams();
  const navigate = useNavigate();
  const [canonicalAlbum, setCanonicalAlbum] = useState(decodeURIComponent(albumName));
  const [canonicalArtist, setCanonicalArtist] = useState(decodeURIComponent(artistName));
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all_time");

  useEffect(() => {
    (async () => {
      const res = await lookupAlbum(decodeURIComponent(albumName), decodeURIComponent(artistName));
      const best = res.items?.find(
        a =>
          a.album.toLowerCase() === decodeURIComponent(albumName).toLowerCase() &&
          a.artist.toLowerCase() === decodeURIComponent(artistName).toLowerCase()
      );
      setCanonicalAlbum(best?.album || decodeURIComponent(albumName));
      setCanonicalArtist(best?.artist || decodeURIComponent(artistName));
    })();
  }, [albumName, artistName]);

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
    getTopTracks(200, from, to)
      .then((data) => setTracks(data.items || []))
      .finally(() => setLoading(false));
  }, [timeRange]);

  const filtered = useMemo(
    () =>
      tracks.filter(
        t =>
          (t.album || "").toLowerCase() === (canonicalAlbum || "").toLowerCase() &&
          (t.artist || "").toLowerCase() === (canonicalArtist || "").toLowerCase()
      ),
    [tracks, canonicalAlbum, canonicalArtist]
  );

  const totalMs = filtered.reduce((s, x) => s + (x.ms_played || 0), 0);
  const totalPlays = filtered.reduce((s, x) => s + (x.plays || 0), 0);

  if (loading) return <p>Henter albumdata…</p>;

  return (
    <div className="home-container">
      <button className="back-button" onClick={() => navigate(-1)}>← Tilbake</button>

      <div className="content-section">
        <h2 className="section-title">{canonicalAlbum}</h2>
        <div className="track-artist" style={{ marginBottom: 8 }}>
          <button
            className="artist-name-button"
            onClick={() => navigate(`/artist/${encodeURIComponent(canonicalArtist)}`)}
          >
            {canonicalArtist}
          </button>
        </div>

        <div className="nav-links">
          <button className={timeRange==="short_term"?"active":""} onClick={()=>setTimeRange("short_term")}>Sist måned</button>
          <button className={timeRange==="medium_term"?"active":""} onClick={()=>setTimeRange("medium_term")}>Siste 6 mnd</button>
          <button className={timeRange==="long_term"?"active":""} onClick={()=>setTimeRange("long_term")}>Siste år</button>
          <button className={timeRange==="all_time"?"active":""} onClick={()=>setTimeRange("all_time")}>All Time</button>
        </div>

        <div className="track-time" style={{ marginBottom: 12 }}>
          Totalt: {Math.round(totalMs/60000)} min{totalPlays ? ` (${totalPlays} ganger)` : ""}
        </div>

        <ol className="track-list">
          {filtered.map((t, idx) => (
            <li key={t.track_id ?? idx} className="track-item">
              <span className="track-index">{idx+1}.</span>
              <div className="track-info">
                <div className="track-title">
                  <button
                    className="artist-name-button"
                    onClick={() => navigate(`/song/${encodeURIComponent(t.track)}`)}
                  >
                    {t.track}
                  </button>
                </div>
                <div className="track-time">
                  {Math.round((t.ms_played||0)/60000)} min{t.plays ? ` (${t.plays} ganger)` : ""}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
