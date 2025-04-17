import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDB() {
  const db = await open({
    filename: './spotify.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY,
      access_token TEXT,
      refresh_token TEXT,
      expires_at INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS listens (
      id TEXT PRIMARY KEY,
      name TEXT,
      artist TEXT,
      played_at TEXT,
      duration_ms INTEGER
    );
  `);

  return db;
}
