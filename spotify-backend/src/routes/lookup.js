import express from "express";
import db from "../db.js";

const router = express.Router();

/** GET /api/lookup/track?name=...&artist=... */
router.get("/track", (req, res) => {
  const name = (req.query.name || "").trim();
  const artist = (req.query.artist || "").trim();
  if (!name) return res.json({ items: [] });

  const rows = db.prepare(
    `
    SELECT t.track_id, t.track_name AS track, a.artist_name AS artist, al.album_name AS album
    FROM tracks t
    JOIN artists a ON a.artist_id = t.artist_id
    LEFT JOIN albums al ON al.album_id = t.album_id
    WHERE t.track_name LIKE ? AND (? = '' OR a.artist_name LIKE ?)
    ORDER BY t.track_name
    LIMIT 20
    `
  ).all(`%${name}%`, artist, `%${artist}%`);

  res.json({ items: rows });
});

/** GET /api/lookup/artist?name=... */
router.get("/artist", (req, res) => {
  const name = (req.query.name || "").trim();
  if (!name) return res.json({ items: [] });

  const rows = db.prepare(
    `SELECT artist_id, artist_name AS artist FROM artists WHERE artist_name LIKE ? ORDER BY artist_name LIMIT 20`
  ).all(`%${name}%`);

  res.json({ items: rows });
});

/** GET /api/lookup/album?name=...&artist=... */
router.get("/album", (req, res) => {
  const name = (req.query.name || "").trim();
  const artist = (req.query.artist || "").trim();
  if (!name) return res.json({ items: [] });

  const rows = db.prepare(
    `
    SELECT al.album_id, al.album_name AS album, a.artist_name AS artist
    FROM albums al
    JOIN artists a ON a.artist_id = al.artist_id
    WHERE al.album_name LIKE ? AND (? = '' OR a.artist_name LIKE ?)
    ORDER BY al.album_name
    LIMIT 20
    `
  ).all(`%${name}%`, artist, `%${artist}%`);

  res.json({ items: rows });
});

export default router;
