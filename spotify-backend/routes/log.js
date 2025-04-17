import express from 'express';
import axios from 'axios';
import { initDB } from '../db.js';
import { refreshAccessToken } from '../spotify.js';
const router = express.Router();

router.post('/log', async (req, res) => {
  const db = await initDB();
  let token = await db.get(`SELECT * FROM tokens LIMIT 1`);

  // Refresh token if expired
  if (Date.now() > token.expires_at) {
    const data = await refreshAccessToken(token.refresh_token);
    token.access_token = data.access_token;
    token.expires_at = Date.now() + data.expires_in * 1000;
    await db.run(`UPDATE tokens SET access_token = ?, expires_at = ?`, token.access_token, token.expires_at);
  }

  const resSpotify = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
    headers: {
      Authorization: `Bearer ${token.access_token}`
    }
  });

  const listens = resSpotify.data.items;

  for (const item of listens) {
    const id = item.played_at;
    const name = item.track.name;
    const artist = item.track.artists.map(a => a.name).join(', ');
    const played_at = item.played_at;
    const duration_ms = item.track.duration_ms;

    await db.run(`
      INSERT OR IGNORE INTO listens (id, name, artist, played_at, duration_ms)
      VALUES (?, ?, ?, ?, ?)`, id, name, artist, played_at, duration_ms);
  }

  res.json({ saved: listens.length });
});

export default router;
