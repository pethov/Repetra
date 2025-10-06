const BASE = "http://localhost:5050/api";

export async function getTopTracks(limit = 50) {
  const res = await fetch(`${BASE}/top/tracks?limit=${limit}`);
  return res.json();
}
export async function getTopArtists(limit = 50) {
  const res = await fetch(`${BASE}/top/artists?limit=${limit}`);
  return res.json();
}
export async function getTopAlbums(limit = 50) {
  const res = await fetch(`${BASE}/top/albums?limit=${limit}`);
  return res.json();
}

export async function searchAll(q, limit = 20) {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  return res.json();
}

export async function lookupTrack(name, artist = "") {
  const url = `${BASE}/lookup/track?name=${encodeURIComponent(name)}&artist=${encodeURIComponent(artist)}`;
  const res = await fetch(url);
  return res.json();
}

export async function lookupArtist(name) {
  const res = await fetch(`${BASE}/lookup/artist?name=${encodeURIComponent(name)}`);
  return res.json();
}

export async function lookupAlbum(name, artist = "") {
  const res = await fetch(`${BASE}/lookup/album?name=${encodeURIComponent(name)}&artist=${encodeURIComponent(artist)}`);
  return res.json();
}

export async function playsByTrack(trackId) {
  const res = await fetch(`${BASE}/search/by-track/${trackId}`);
  return res.json();
}
