import express from 'express';
import { initDB } from '../db.js';
const router = express.Router();

router.post('/auth', async (req, res) => {
  const { access_token, refresh_token, expires_in } = req.body;
  const db = await initDB();
  const expires_at = Date.now() + expires_in * 1000;

  await db.run(`DELETE FROM tokens`);
  await db.run(`INSERT INTO tokens (access_token, refresh_token, expires_at) VALUES (?, ?, ?)`,
    access_token, refresh_token, expires_at);

  res.json({ message: 'Token lagret' });
});

export default router;
