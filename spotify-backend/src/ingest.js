import fs from "fs";
import path from "path";
import fg from "fast-glob";
import dotenv from "dotenv";
import db from "./db.js";
dotenv.config();

const DATA_DIR = process.env.DATA_DIR || "../my-app/src/Data";

const insertArtist = db.prepare(`
  INSERT INTO artists (artist_name) VALUES (?)
  ON CONFLICT(artist_name) DO NOTHING
`);
const getArtistId = db.prepare(`SELECT artist_id FROM artists WHERE artist_name = ?`);

const insertAlbum = db.prepare(`
  INSERT INTO albums (album_name, artist_id) VALUES (?, ?)
  ON CONFLICT(album_name, artist_id) DO NOTHING
`);
const getAlbumId = db.prepare(`
  SELECT album_id FROM albums WHERE album_name = ? AND artist_id = ?
`);

const insertTrack = db.prepare(`
  INSERT INTO tracks (track_name, artist_id, album_id, duration_ms)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(track_name, artist_id, album_id) DO NOTHING
`);


function getTrackId(track_name, artist_id, album_id) {
  if (album_id == null) {
    return db
      .prepare(
        `SELECT track_id FROM tracks
         WHERE track_name = ? AND artist_id = ? AND album_id IS NULL`
      )
      .get(track_name, artist_id)?.track_id ?? null;
  } else {
    return db
      .prepare(
        `SELECT track_id FROM tracks
         WHERE track_name = ? AND artist_id = ? AND album_id = ?`
      )
      .get(track_name, artist_id, album_id)?.track_id ?? null;
  }
}


const insertPlay = db.prepare(`
  INSERT INTO plays (track_id, played_at, ms_played, platform, conn_country, shuffle, skipped, raw)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertFTS = db.prepare(`
  INSERT INTO search_fts(rowid, track_name, artist_name, album_name) VALUES (?, ?, ?, ?)
`);

// Enkel normalisering fra Extended Streaming History
function normalize(entry) {
  const track  = entry.master_metadata_track_name || entry.track_name || null;
  const artist = entry.master_metadata_album_artist_name || entry.artist_name || null;
  const album  = entry.master_metadata_album_album_name || entry.album_name || null;

  const ts = entry.ts || entry.endTime;
  const played_at = ts ? new Date(ts).toISOString() : null;

  // ms_played: tall
  let ms_played = null;
  if (typeof entry.ms_played === "number") ms_played = entry.ms_played;
  else if (typeof entry.msPlayed === "number") ms_played = entry.msPlayed;

  // varighet (valgfritt)
  const duration_ms =
    typeof entry.track_duration_ms === "number" ? entry.track_duration_ms : null;

  // strenger
  const platform = entry.platform ?? entry.source ?? null;
  const conn_country = entry.conn_country ?? entry.country ?? null;

  // shuffle: number|null (IKKE boolean)
  let shuffle = null;
  if (entry.shuffle !== undefined && entry.shuffle !== null) {
    shuffle = entry.shuffle ? 1 : 0;
  }

  // skipped: number (0/1)
  const skipped = entry.skip_reason ? 1 : 0;

  return {
    track,
    artist,
    album,
    played_at,
    ms_played,
    duration_ms,
    platform: platform == null ? null : String(platform),
    conn_country: conn_country == null ? null : String(conn_country),
    shuffle,       // number|null
    skipped        // number
  };
}


function upsertArtist(name) {
  if (!name) return null;
  insertArtist.run(name);
  return getArtistId.get(name)?.artist_id ?? null;
}

function upsertAlbum(name, artist_id) {
  if (!name || !artist_id) return null;
  insertAlbum.run(name, artist_id);
  return getAlbumId.get(name, artist_id)?.album_id ?? null;
}

function upsertTrack(track_name, artist_id, album_id, duration_ms) {
  if (!track_name || !artist_id) return null;
  insertTrack.run(track_name, artist_id, album_id ?? null, duration_ms ?? null);
  return getTrackId(track_name, artist_id, album_id ?? null);
}

function buildFTS(batch) {
  const insertMany = db.transaction((rows) => {
    for (const r of rows) {
      insertFTS.run(r.track_id, r.track_name, r.artist_name, r.album_name);
    }
  });
  insertMany(batch);
}

(async function main() {
  const files = await fg(["**/*.json"], { cwd: DATA_DIR, absolute: true });
  if (!files.length) {
    console.error(`Fant ingen JSON-filer i ${DATA_DIR}`);
    process.exit(1);
  }

  console.log(`Finner ${files.length} filer…`);

  const insertPlayTx = db.transaction((rows) => {
    for (const e of rows) {
      const n = normalize(e);
      if (!n.track || !n.artist || !n.played_at || !n.ms_played) continue;

      const artist_id = upsertArtist(n.artist);
      const album_id = upsertAlbum(n.album, artist_id);
      const track_id = upsertTrack(n.track, artist_id, album_id, n.duration_ms);

      if (!track_id) continue;

      insertPlay.run(
          track_id,
          n.played_at ? String(n.played_at) : null,
          Number(n.ms_played),
          n.platform,          // allerede string|null
          n.conn_country,      // allerede string|null
          n.shuffle,           // number|null
          Number(n.skipped),   // number
          JSON.stringify(e) 
      );
    }
  });

  let ftsBatch = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf-8");
    let arr;
    try {
      arr = JSON.parse(raw);
    } catch (err) {
      console.warn(`Kunne ikke parse: ${file}`, err.message);
      continue;
    }

    console.log(`Ingest: ${path.basename(file)} (${arr.length} rader)`);
    insertPlayTx(arr);

    // Samle FTS data for tracks i denne batchen
    const rows = db.prepare(`
      SELECT t.track_id, t.track_name, a.artist_name, al.album_name
      FROM tracks t
      JOIN artists a ON a.artist_id = t.artist_id
      LEFT JOIN albums al ON al.album_id = t.album_id
    `).all();
    ftsBatch = rows; // i enkel versjon reindexer vi etter hver fil
  }

  // Rebuild FTS (enkel strategi)
  db.prepare("DELETE FROM search_fts").run();
  buildFTS(ftsBatch);

  console.log("✅ Ferdig! Data er lastet inn og søkeindeks oppdatert.");
  db.close();
})();

