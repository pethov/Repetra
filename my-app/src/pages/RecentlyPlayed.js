import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function RecentlyPlayed() {
  const [recentTracks, setRecentTracks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');
    if (!token) {
      navigate('/');
      return;
    }

    fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (!data?.items) {
          console.error('Ingen data mottatt:', data);
          return;
        }

        const cleaned = data.items.map(item => ({
          name: item.track.name,
          artist: item.track.artists[0]?.name || 'Ukjent',
          playedAt: new Date(item.played_at).toLocaleString('no-NO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));

        setRecentTracks(cleaned);
      })
      .catch(error => {
        console.error('Feil ved henting av nylig spilte sanger:', error);
      });
  }, [navigate]);

  return (
    <div className="home-container">
      <button className="back-button" onClick={() => navigate('/home')}>
        ← Tilbake
      </button>

      <h2 className="section-title">Sist avspilte sanger</h2>

      <ul className="track-list">
        {recentTracks.map((track, index) => (
          <li key={index} className="track-item">
            <span className="track-index">{index + 1}.</span>

            <div className="track-info">
              <div className="track-title">
              <button
                    className="artist-name-button"
                    onClick={() => navigate(`/song/${encodeURIComponent(track.name)}`)}
                  >
                    {track.name}
                  </button>
              </div>

              <div className="track-artist">
              <button
                    className="artist-name-button"
                    onClick={() => navigate(`/Artist/${encodeURIComponent(track.artist)}`)}
                  >
                    {track.artist}
                  </button>
              </div>

              <div className="track-time">Spilt: {track.playedAt}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecentlyPlayed;
