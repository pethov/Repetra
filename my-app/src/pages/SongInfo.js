import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./Home.css";
import { lookupTrack, playsByTrack } from "../utils/api";

function formatMinutes(ms) {
  if (!ms) return "0 min";
  const minutes = Math.round(ms / 60000);
  return `${minutes} min`;
}

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || "-";
  }
}

function weekdayName(dateIso) {
  const d = new Date(dateIso);
  // Norsk ukedag
  return d.toLocaleDateString("nb-NO", { weekday: "long" });
}

export default function SongInfo() {
  const { songName } = useParams(); // fra /song/:songName/
  const navigate = useNavigate();

  const decodedName = decodeURIComponent(songName || "");
  const [track, setTrack] = useState(null);  // { track_id, track, artist, album }
  const [plays, setPlays] = useState([]);    // [{ played_at, ms_played, ... }]
  const [loading, setLoading] = useState(true);

  // 1) Slå opp låten i DB (via backend)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await lookupTrack(decodedName);
        const items = res?.items || [];
        // Velg "beste" match: eksakt navn (case-insensitive), ellers første
        const exact = items.find(
          (t) => (t.track || "").toLowerCase() === decodedName.toLowerCase()
        );
        const chosen = exact || items[0] || null;
        setTrack(chosen);

        if (chosen?.track_id) {
          const p = await playsByTrack(chosen.track_id);
          setPlays(p?.items || []);
        } else {
          setPlays([]);
        }
      } catch (e) {
        console.error(e);
        setTrack(null);
        setPlays([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [decodedName]);

  // 2) Avled statistikk
  const stats = useMemo(() => {
    if (!plays.length) {
      return {
        totalMs: 0,
        count: 0,
        firstPlay: null,
        lastPlay: null,
        topWeekday: null,
      };
    }
    const sorted = [...plays].sort(
      (a, b) => new Date(a.played_at) - new Date(b.played_at)
    );
    const firstPlay = sorted[0]?.played_at || null;
    const lastPlay = sorted[sorted.length - 1]?.played_at || null;

    let totalMs = 0;
    const weekdayCount = new Map(); // "mandag" -> antall
    for (const p of plays) {
      const ms = p.ms_played || 0;
      totalMs += ms;
      const wd = weekdayName(p.played_at);
      weekdayCount.set(wd, (weekdayCount.get(wd) || 0) + 1);
    }
    // Finn mest spilte ukedag
    let topWeekday = null;
    let topCnt = -1;
    for (const [wd, cnt] of weekdayCount.entries()) {
      if (cnt > topCnt) {
        topCnt = cnt;
        topWeekday = wd;
      }
    }

    return {
      totalMs,
      count: plays.length,
      firstPlay,
      lastPlay,
      topWeekday,
    };
  }, [plays]);

  if (loading) return <p>Henter sangdata…</p>;

  if (!track) {
    return (
      <div className="home-container">
        <button className="back-button" onClick={() => navigate(-1)}>← Tilbake</button>
        <div className="content-section">
          <h2 className="section-title">Fant ikke sangen «{decodedName}»</h2>
          <p>Prøv et annet navn, eller sjekk at den finnes i din lyttehistorikk.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <button className="back-button" onClick={() => navigate(-1)}>← Tilbake</button>

      <div className="content-section">
        <h2 className="section-title">{track.track}</h2>

        <div className="track-artist" style={{ marginBottom: 8 }}>
          <button
            className="artist-name-button"
            onClick={() => navigate(`/artist/${encodeURIComponent(track.artist)}`)}
          >
            {track.artist}
          </button>
          {track.album ? (
            <>
              <span> — </span>
              <button
                className="artist-name-button"
                onClick={() =>
                  navigate(`/album/${encodeURIComponent(track.album)}/${encodeURIComponent(track.artist)}`)
                }
              >
                {track.album}
              </button>
            </>
          ) : null}
        </div>

        <div className="track-time" style={{ marginBottom: 16 }}>
          <div><strong>Totalt spilt:</strong> {formatMinutes(stats.totalMs)}{stats.count ? ` (${stats.count} ganger)` : ""}</div>
          <div><strong>Første gang:</strong> {stats.firstPlay ? formatDateTime(stats.firstPlay) : "-"}</div>
          <div><strong>Siste gang:</strong> {stats.lastPlay ? formatDateTime(stats.lastPlay) : "-"}</div>
          <div><strong>Mest spilt ukedag:</strong> {stats.topWeekday || "-"}</div>
        </div>

        <h3 style={{ margin: "12px 0" }}>Siste avspillinger</h3>
        <ul className="track-list">
          {plays.slice(0, 30).map((p, i) => (
            <li key={i} className="track-item">
              <span className="track-index">{i + 1}.</span>
              <div className="track-info">
                <div className="track-title">{formatDateTime(p.played_at)}</div>
                <div className="track-time">{Math.round((p.ms_played || 0) / 1000)} s</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
