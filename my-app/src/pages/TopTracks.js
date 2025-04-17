import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function TopTracks() {
  const [profile, setProfile] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
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

    // Hent topp sanger for valgt periode
    fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setTopTracks(data.items || []));
  }, [navigate, timeRange]);

  if (!profile) return <p>Laster inn...</p>;

  return (
    <div className="home-container">
      {/* Tilbakeknapp */}
      <button className=" back-button" onClick={() => navigate('/home')}>
        ← Tilbake
      </button>

      <div className="content-section">
      <h2 className="section-title">Dine mest hørte sanger</h2>




        {/* Velg periode */}
        <div className="nav-links">
          <button
            className={timeRange === 'short_term' ? 'active' : ''}
            onClick={() => setTimeRange('short_term')}
          >
            Sist måned
          </button>
          <button
            className={timeRange === 'medium_term' ? 'active' : ''}
            onClick={() => setTimeRange('medium_term')}
          >
            Siste 6 mnd
          </button>
          <button
            className={timeRange === 'long_term' ? 'active' : ''}
            onClick={() => setTimeRange('long_term')}
          >
            Siste år
          </button>
        </div>

        {/* Liste med sanger */}
        <ul className="track-list">
          {topTracks.map((track, index) => (
            <li key={track.id} className="track-item">
              <span className="track-index">{index + 1}.</span>
              <div className="track-info">
                <div className="track-title">{track.name}</div>
                <div className="track-artist">{track.artists.map(a => a.name).join(', ')}</div>
              </div>
              <img
                src={track.album.images?.[2]?.url}
                alt={track.name}
                className="track-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TopTracks;
