import express from "express";
import db from "../db.js";

const router = express.Router();

// Hjelpefunksjon (valgfritt filter på tid)
function timeClause(from, to) {
  const parts = [];
  const params = [];
  if (from) { parts.push("played_at >= ?"); params.push(new Date(from).toISOString()); }
  if (to)   { parts.push("played_at <  ?"); params.push(new Date(to).toISOString()); }
  return { whereSql: parts.length ? " AND " + parts.join(" AND ") : "", params };
}

/** GET /api/top/tracks?limit=50&from=YYYY-MM-DD&to=YYYY-MM-DD */
router.get("/tracks", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
  const { whereSql, params } = timeClause(req.query.from, req.query.to);

  const rows = db.prepare(
    `
    SELECT
      t.track_id,
      t.track_name AS track,
      a.artist_name AS artist,
      al.album_name AS album,
      COUNT(p.play_id) AS plays,
      SUM(p.ms_played) AS ms_played
    FROM plays p
    JOIN tracks t ON t.track_id = p.track_id
    JOIN artists a ON a.artist_id = t.artist_id
    LEFT JOIN albums al ON al.album_id = t.album_id
    WHERE 1=1 ${whereSql}
    GROUP BY t.track_id
    ORDER BY ms_played DESC
    LIMIT ?
    `
  ).all(...params, limit);

  res.json({ items: rows });
});

/** GET /api/top/artists?limit=50&from=&to= */
router.get("/artists", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
  const { whereSql, params } = timeClause(req.query.from, req.query.to);

  const rows = db.prepare(
    `
    SELECT
      a.artist_id,
      a.artist_name AS artist,
      COUNT(p.play_id) AS plays,
      SUM(p.ms_played) AS ms_played
    FROM plays p
    JOIN tracks t ON t.track_id = p.track_id
    JOIN artists a ON a.artist_id = t.artist_id
    WHERE 1=1 ${whereSql}
    GROUP BY a.artist_id
    ORDER BY ms_played DESC
    LIMIT ?
    `
  ).all(...params, limit);

  res.json({ items: rows });
});

/** GET /api/top/albums?limit=50&from=&to= */
router.get("/albums", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
  const { whereSql, params } = timeClause(req.query.from, req.query.to);

  const rows = db.prepare(
    `
    SELECT
      al.album_id,
      al.album_name AS album,
      a.artist_name AS artist,
      COUNT(p.play_id) AS plays,
      SUM(p.ms_played) AS ms_played
    FROM plays p
    JOIN tracks t ON t.track_id = p.track_id
    JOIN artists a ON a.artist_id = t.artist_id
    JOIN albums  al ON al.album_id  = t.album_id
    WHERE 1=1 ${whereSql}
    GROUP BY al.album_id
    ORDER BY ms_played DESC
    LIMIT ?
    `
  ).all(...params, limit);

  res.json({ items: rows });
});

export default router;
