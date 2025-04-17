import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

export async function refreshAccessToken(refresh_token) {
  const res = await axios.post(SPOTIFY_TOKEN_URL, new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET
  }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return res.data;
}
