import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import allAudioHistory from '../Data/AllTimeAudio';

function TopAlbums() {
  const [profile, setProfile] = useState(null);
  const [topAlbums, setTopAlbums] = useState([]);
  const [timeRange, setTimeRange] = useState('short_term');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');
    if (!token) {
      navigate('/');
      return;
    }

    // Hent brukerprofil
    fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setProfile(data));
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');

    if (timeRange === 'all_time') {
      const albumMap = {};

      allAudioHistory.forEach(item => {
        const album = item.albumName || item.master_metadata_album_album_name;
        const artist = item.artistName || item.master_metadata_album_artist_name;
        const duration = item.msPlayed || item.ms_played;

        if (album && artist && duration > 0) {
          const key = `${album} - ${artist}`;
          if (!albumMap[key]) {
            albumMap[key] = { name: album, artist: artist, totalMs: 0, count: 0 };
          }
          albumMap[key].totalMs += duration;
          albumMap[key].count += 1;
        }
      });

      const sorted = Object.values(albumMap)
        .sort((a, b) => b.totalMs - a.totalMs)
        .slice(0, 50);

      // Hent bilde fra Spotify for hvert album
      Promise.all(
        sorted.map(async album => {
          const res = await fetch(`https://api.spotify.com/v1/search?q=album:${encodeURIComponent(album.name)}%20artist:${encodeURIComponent(album.artist)}&type=album&limit=1`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          album.image = data.albums?.items?.[0]?.images?.[1]?.url || null;
          return album;
        })
      ).then(albumsWithImages => setTopAlbums(albumsWithImages));

      return;
    }

    fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        const albumMap = {};

        data.items?.forEach(track => {
          const album = track.album?.name;
          const artist = track.artists?.[0]?.name;
          const duration = track.duration_ms;
          const image = track.album?.images?.[1]?.url;

          if (album && artist && duration > 0) {
            const key = `${album} - ${artist}`;
            if (!albumMap[key]) {
              albumMap[key] = { name: album, artist: artist, totalMs: 0, count: 0, image: image };
            }
            albumMap[key].totalMs += duration;
            albumMap[key].count += 1;
          }
        });

        const sorted = Object.values(albumMap)
          .sort((a, b) => b.totalMs - a.totalMs)
          .slice(0, 50);

        setTopAlbums(sorted);
      });
  }, [timeRange]);

  if (!profile) return <p>Laster inn...</p>;

  return (
    <div className="home-container">
      <button className="back-button" onClick={() => navigate('/home')}>
        ← Tilbake
      </button>

      <div className="content-section">
        <h2 className="section-title">Dine mest hørte albumer</h2>

        <div className="nav-links">
          <button className={timeRange === 'short_term' ? 'active' : ''} onClick={() => setTimeRange('short_term')}>Sist måned</button>
          <button className={timeRange === 'medium_term' ? 'active' : ''} onClick={() => setTimeRange('medium_term')}>Siste 6 mnd</button>
          <button className={timeRange === 'long_term' ? 'active' : ''} onClick={() => setTimeRange('long_term')}>Siste år</button>
          <button className={timeRange === 'all_time' ? 'active' : ''} onClick={() => setTimeRange('all_time')}>All Time</button>
        </div>

        <ul className="track-list">
          {topAlbums.map((album, index) => (
            <li key={index} className="track-item">
              <span className="track-index">{index + 1}.</span>
              <div className="track-info">
                <div className="track-title"><button
                    className="artist-name-button"
                    onClick={() => navigate(`/album/${encodeURIComponent(album.name)}/${encodeURIComponent(album.artist)}`)}
                  >
                    {album.name}
                  </button></div>
                <div className="track-artist">
                  <button
                    className="artist-name-button"
                    onClick={() => navigate(`/artist/${encodeURIComponent(album.artist)}`)}
                  >
                    {album.artist}
                  </button>
                </div>
                <div className="track-time">
                  Totalt: {(album.totalMs / 60000).toFixed(1)} min ({album.count} ganger)
                </div>
              </div>
              {album.image && (
                <img
                  src={album.image}
                  alt={album.name}
                  className="track-cover"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TopAlbums;
