import express from "express";
import db from "../db.js";

const router = express.Router();

/**
 * GET /api/search?q=...&limit=20
 * Fulltekst-søk på track/artist/album.
 */
router.get("/", (req, res) => {
  const q = (req.query.q || "").toString().trim();
  const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);

  if (!q) return res.json({ items: [] });

  // FTS5: bruk quotes for å matche fraser, ellers prefix
  const term = q.includes(" ") ? `"${q}"` : `${q}*`;

  const rows = db
    .prepare(
      `
      SELECT tv.track_id, tv.track_name, tv.artist_name, tv.album_name,
             bm25(search_fts, 1.0, 1.5, 2.0) AS rank
      FROM search_fts
      JOIN tracks_view tv ON tv.track_id = search_fts.rowid
      WHERE search_fts MATCH ?
      ORDER BY rank ASC
      LIMIT ?
    `
    )
    .all(term, limit);

  res.json({ items: rows });
});

/**
 * GET /api/plays/by-track/:trackId  (for detaljer på en sang)
 */
router.get("/by-track/:trackId", (req, res) => {
  const trackId = Number(req.params.trackId);
  if (!Number.isFinite(trackId)) return res.status(400).json({ error: "Bad trackId" });

  const plays = db
    .prepare(
      `SELECT played_at, ms_played, platform, conn_country, skipped
       FROM plays
       WHERE track_id = ?
       ORDER BY played_at DESC
       LIMIT 500`
    )
    .all(trackId);

  res.json({ items: plays });
});

export default router;
