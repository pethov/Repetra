import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import allAudioHistory from '../Data/AllTimeAudio';

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
  }, [navigate]);

  useEffect(() => {
    if (timeRange === 'all_time') {
      const trackMap = {};

      allAudioHistory.forEach(item => {
        const title = item.trackName || item.master_metadata_track_name;
        const artist = item.artistName || item.master_metadata_album_artist_name;
        const duration = item.msPlayed || item.ms_played;

        if (title && artist && duration > 0) {
          const key = `${title} - ${artist}`;
          if (!trackMap[key]) {
            trackMap[key] = { name: title, artists: artist, totalMs: 0, count: 0 };
          }
          trackMap[key].totalMs += duration;
          trackMap[key].count += 1;
        }
      });

      const sorted = Object.values(trackMap)
        .sort((a, b) => b.totalMs - a.totalMs)
        .slice(0, 50);

      setTopTracks(sorted);
      return;
    }

    const token = localStorage.getItem('spotifyToken');
    fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setTopTracks(data.items || []));
  }, [timeRange]);

  if (!profile) return <p>Laster inn...</p>;

  return (
    <div className="home-container">
      <button className="back-button" onClick={() => navigate('/home')}>
        ← Tilbake
      </button>

      <div className="content-section">
        <h2 className="section-title">Dine mest hørte sanger</h2>

        <div className="nav-links">
          <button className={timeRange === 'short_term' ? 'active' : ''} onClick={() => setTimeRange('short_term')}>Sist måned</button>
          <button className={timeRange === 'medium_term' ? 'active' : ''} onClick={() => setTimeRange('medium_term')}>Siste 6 mnd</button>
          <button className={timeRange === 'long_term' ? 'active' : ''} onClick={() => setTimeRange('long_term')}>Siste år</button>
          <button className={timeRange === 'all_time' ? 'active' : ''} onClick={() => setTimeRange('all_time')}>All Time</button>
        </div>

        <ul className="track-list">
          {topTracks.map((track, index) => (
            <li key={index} className="track-item">
              <span className="track-index">{index + 1}.</span>
              <div className="track-info">
                <div className="track-title">
                  <button
                    className="artist-name-button"
                    onClick={() => navigate(`/song/${encodeURIComponent(track.name)}/${encodeURIComponent(track.artists)}`)}
                  >
                    {track.name}
                  </button>
                </div>
                <div className="track-artist">
                  {Array.isArray(track.artists)
                    ? track.artists.map((artist, i) => (
                        <button
                          key={i}
                          className="artist-name-button"
                          onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
                        >
                          {artist.name}
                        </button>
                      ))
                    : (
                        <button
                          className="artist-name-button"
                          onClick={() => navigate(`/artist/${encodeURIComponent(track.artists)}`)}
                        >
                          {track.artists}
                        </button>
                      )}
                </div>
                {track.totalMs && (
                  <div className="track-time">
                    Totalt: {(track.totalMs / 60000).toFixed(1)} min ({track.count} ganger)
                  </div>
                )}
              </div>
              {track.album?.images && (
                <img
                  src={track.album.images[2]?.url}
                  alt={track.name}
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

export default TopTracks;
