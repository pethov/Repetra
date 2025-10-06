import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import searchRouter from "./routes/search.js";
import db from "./db.js"; // sørger for init
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/search", searchRouter);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🎧 Backend running on http://localhost:${PORT}`));
