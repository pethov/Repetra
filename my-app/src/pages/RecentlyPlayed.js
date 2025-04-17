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
    .then(data => {
        if (!data || !data.items) {
          console.error('Ingen data mottatt:', data);
          return;
        }
      
        const cleaned = data.items.map(item => ({
          name: item.track.name,
          artists: item.track.artists.map(a => a.name).join(', '),
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
      ;
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
            <div className="track-info">
              <div className="track-title">{track.name}</div>
              <div className="track-artist">{track.artists}</div>
              <div className="track-time">Spilt: {track.playedAt}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecentlyPlayed;
