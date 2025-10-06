import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const DB_PATH = process.env.DB_PATH || "./db/spotify.db";

// Sørg for at db-mappen finnes
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");

// Kjør schema ved første oppstart
const needInit = !db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='plays'")
  .get();

if (needInit) {
  const schemaSql = fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf-8");
  db.exec(schemaSql);
}

export default db;
