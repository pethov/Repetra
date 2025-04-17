import express from 'express';
import { initDB } from '../db.js';
const router = express.Router();

router.get('/tracks', async (req, res) => {
  const db = await initDB();
  const result = await db.all(`
    SELECT name, artist, COUNT(*) AS plays, SUM(duration_ms)/60000 AS minutes
    FROM listens
    GROUP BY name, artist
    ORDER BY minutes DESC
    LIMIT 50
  `);

  res.json(result);
});

export default router;
