export async function fetchTrackInfo(title, artist, token) {
    const query = encodeURIComponent(`${title} ${artist}`);
    const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;
  
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    const data = await res.json();
    return data.tracks?.items?.[0]; // kan være undefined
  }
  