-- Aktiver FTS5 hvis tilgjengelig (SQLite 3.9+)
-- Struktur: artists, albums, tracks, plays + FTS for raskt søk.

BEGIN;

CREATE TABLE IF NOT EXISTS artists (
  artist_id INTEGER PRIMARY KEY,
  artist_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS albums (
  album_id INTEGER PRIMARY KEY,
  album_name TEXT NOT NULL,
  artist_id INTEGER NOT NULL,
  UNIQUE(album_name, artist_id),
  FOREIGN KEY (artist_id) REFERENCES artists(artist_id)
);

DROP VIEW IF EXISTS tracks_view;
DROP TABLE IF EXISTS tracks;

CREATE TABLE IF NOT EXISTS tracks (
  track_id    INTEGER PRIMARY KEY,
  track_name  TEXT NOT NULL,
  artist_id   INTEGER NOT NULL,
  album_id    INTEGER,          -- kan være NULL
  duration_ms INTEGER,
  UNIQUE(track_name, artist_id, album_id),
  FOREIGN KEY (artist_id) REFERENCES artists(artist_id),
  FOREIGN KEY (album_id)  REFERENCES albums(album_id)
);

CREATE TABLE IF NOT EXISTS plays (
  play_id INTEGER PRIMARY KEY,
  track_id INTEGER NOT NULL,
  played_at TEXT NOT NULL,      -- ISO8601
  ms_played INTEGER NOT NULL,
  platform TEXT,                -- optional (source)
  conn_country TEXT,            -- optional
  shuffle TEXT,                 -- optional
  skipped INTEGER DEFAULT 0,    -- optional
  raw JSON,                     -- hele rå-objektet hvis du vil bevare alt
  FOREIGN KEY (track_id) REFERENCES tracks(track_id)
);

-- View for enklere join
CREATE VIEW IF NOT EXISTS tracks_view AS
SELECT
  t.track_id,
  t.track_name,
  a.artist_name,
  al.album_name
FROM tracks t
JOIN artists a ON a.artist_id = t.artist_id
LEFT JOIN albums al ON al.album_id = t.album_id;
-- FTS5 for lynraskt søk
CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
  track_name, artist_name, album_name, content=''
);

-- Indekser
CREATE INDEX IF NOT EXISTS idx_plays_track ON plays(track_id);
CREATE INDEX IF NOT EXISTS idx_plays_played_at ON plays(played_at);

COMMIT;
