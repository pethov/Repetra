import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import searchRouter from "./routes/search.js";
import topRouter from "./routes/top.js";
import lookupRouter from "./routes/lookup.js";
import db from "./db.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/search", searchRouter);
app.use("/api/top", topRouter);
app.use("/api/lookup", lookupRouter);

const PORT = process.env.PORT || 5050;

app.get("/api/debug", (_req, res) => {
  try {
    const r1 = db.prepare("SELECT COUNT(*) AS c FROM artists").get().c;
    const r2 = db.prepare("SELECT COUNT(*) AS c FROM albums").get().c;
    const r3 = db.prepare("SELECT COUNT(*) AS c FROM tracks").get().c;
    const r4 = db.prepare("SELECT COUNT(*) AS c FROM plays").get().c;
    const one = db.prepare(`
      SELECT t.track_name AS track, a.artist_name AS artist, SUM(p.ms_played) AS ms
      FROM plays p
      JOIN tracks t ON t.track_id = p.track_id
      JOIN artists a ON a.artist_id = t.artist_id
      GROUP BY t.track_id
      ORDER BY ms DESC
      LIMIT 1`).get();
    res.json({ counts: { artists: r1, albums: r2, tracks: r3, plays: r4 }, top_example: one || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.listen(PORT, () => console.log(`🎧 Backend running on http://localhost:${PORT}`));
