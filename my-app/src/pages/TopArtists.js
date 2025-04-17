import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function TopArtists() {
  const [profile, setProfile] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [timeRange, setTimeRange] = useState('short_term');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');

    if (!token) {
      navigate('/home');
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

    // Hent topp artister for valgt periode
    fetch(`https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setTopArtists(data.items || []));
  }, [navigate, timeRange]);

  if (!profile) return <p>Laster inn...</p>;

  return (
    <div className="home-container">
      {/* Tilbakeknapp */}
      <button className="back-button" onClick={() => navigate('/home')}>
        ← Tilbake
      </button>

      <div className="tracks-section">
        <h2>Dine mest hørte artister</h2>

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

        {/* Liste med artister */}
        <ul className="track-list">
          {topArtists.map((artist, index) => (
            <li key={artist.id} className="track-item">
              <span className="track-index">{index + 1}.</span>
              <div className="track-info">
                <div className="track-title">{artist.name}</div>
                <div className="track-artist">Popularitet: {artist.popularity}</div>
              </div>
              <img
                src={artist.images?.[2]?.url}
                alt={artist.name}
                className="track-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TopArtists;
