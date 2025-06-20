import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import allAudioHistory from '../Data/AllTimeAudio';
import './Home.css';

function ArtistInfo() {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const [topTracks, setTopTracks] = useState([]);
  const [image, setImage] = useState(null);
  const [monthlyListeners, setMonthlyListeners] = useState(null);

  useEffect(() => {
    // Finn dine toppsanger for denne artisten
    const filtered = {};
    allAudioHistory.forEach(item => {
      const artist = item.artistName || item.master_metadata_album_artist_name;
      const title = item.trackName || item.master_metadata_track_name;
      const duration = item.msPlayed || item.ms_played;

      if (artist && title && duration > 0 && artist === artistName) {
        if (!filtered[title]) {
          filtered[title] = { name: title, totalMs: 0, count: 0 };
        }
        filtered[title].totalMs += duration;
        filtered[title].count += 1;
      }
    });

    const sorted = Object.values(filtered)
      .sort((a, b) => b.totalMs - a.totalMs)
      .slice(0, 6);

    setTopTracks(sorted);

    // Hent artist-data fra Spotify (for bilde og monthly listeners)
    const token = localStorage.getItem('spotifyToken');
    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        const artist = data.artists?.items?.[0];
        if (artist) {
          setImage(artist.images?.[0]?.url || null);
          setMonthlyListeners(artist.followers?.total || null); // Spotify gir ikke monthly listeners direkte
        }
      });

  }, [artistName]);

  return (
    <div className="home-container">
      <button className="back-button" onClick={() => navigate(-1)}>← Tilbake</button>

      <h2>{artistName}</h2>

      {image && <img src={image} alt={artistName} style={{ width: '200px', borderRadius: '10px' }} />}
      {monthlyListeners !== null && <p>Followers: {monthlyListeners.toLocaleString()}</p>}

      <h3>Dine 6 mest spilte sanger av {artistName}:</h3>
      <ul className="track-list">
        {topTracks.map((track, index) => (
          <li key={index} className="track-item">
            <span className="track-index">{index + 1}.</span>
            <div className="track-info">
              <div className="track-title">
              <button
                    className="artist-name-button"
                    onClick={() => navigate(`/song/${encodeURIComponent(track.name)}/ ${encodeURIComponent(track.artistName)}`)}
                  >
                    {track.name}
                  </button>
              </div>
              <div className="track-artist">
                Totalt: {(track.totalMs / 60000).toFixed(1)} min ({track.count} ganger)
              </div>
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default ArtistInfo;
