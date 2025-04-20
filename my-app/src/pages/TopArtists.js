import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import allAudioHistory from '../Data/AllTimeAudio';

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

    fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setProfile(data));
  }, [navigate]);

  useEffect(() => {
    if (timeRange === 'all_time') {
      const artistMap = {};

      allAudioHistory.forEach(item => {
        const artist = item.artistName || item.master_metadata_album_artist_name;
        const duration = item.msPlayed || item.ms_played;

        if (artist && duration > 0) {
          if (!artistMap[artist]) {
            artistMap[artist] = {
              name: artist,
              totalMs: 0,
              count: 0,
            };
          }

          artistMap[artist].totalMs += duration;
          artistMap[artist].count += 1;
        }
      });

      const sorted = Object.values(artistMap)
        .sort((a, b) => b.totalMs - a.totalMs)
        .slice(0, 50);

      setTopArtists(sorted);
      return;
    }

    const token = localStorage.getItem('spotifyToken');
    fetch(`https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setTopArtists(data.items || []));
  }, [timeRange]);

  if (!profile) return <p>Laster inn...</p>;

  return (
    <div className="home-container">
      <button className="back-button" onClick={() => navigate('/home')}>
        ← Tilbake
      </button>

      <div className="tracks-section">
        <h2>Dine mest hørte artister</h2>

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
          <button
            className={timeRange === 'all_time' ? 'active' : ''}
            onClick={() => setTimeRange('all_time')}
          >
            All Time
          </button>
        </div>

        <ul className="track-list">
          {topArtists.map((artist, index) => (
            <li key={artist.id || artist.name} className="track-item">
              <span className="track-index">{index + 1}.</span>
              <div className="track-info">
                <div className="track-title">{artist.name}</div>
                <div className="track-artist">
                  {timeRange === 'all_time'
                    ? `Totalt: ${(artist.totalMs / 60000).toFixed(1)} min (${artist.count} ganger)`
                    : `Popularitet: ${artist.popularity}`}
                </div>
              </div>
              {timeRange !== 'all_time' && artist.images?.[2]?.url && (
                <img
                  src={artist.images[2].url}
                  alt={artist.name}
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

export default TopArtists;
