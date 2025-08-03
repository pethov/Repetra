import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import allAudioHistory from '../Data/AllTimeAudio';
import './Home.css';

function SongInfo() {
  const { songName} = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [spotifyData, setSpotifyData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');
    const decodedSongName = decodeURIComponent(songName).toLowerCase();

    const filtered = allAudioHistory.filter(item => {
      const title = item.trackName || item.master_metadata_track_name;
      
      return title?.toLowerCase() === decodedSongName
    });

    if (filtered.length === 0) {
      setInfo(null);
      return;
    }

    const sortedByDate = [...filtered].sort(
      (a, b) => new Date(a.ts || a.endTime) - new Date(b.ts || b.endTime)
    );
    const firstListen = new Date(sortedByDate[0].ts || sortedByDate[0].endTime);
    const lastListen = new Date(sortedByDate[sortedByDate.length - 1].ts || sortedByDate[sortedByDate.length - 1].endTime);

    let totalMs = 0;
    let count = 0;
    const days = {};

    filtered.forEach(entry => {
      const duration = entry.msPlayed || entry.ms_played;
      const date = new Date(entry.ts || entry.endTime).toLocaleDateString('no-NO');
      totalMs += duration;
      count += 1;
      days[date] = (days[date] || 0) + 1;
    });

    const mostPlayedDay = Object.entries(days).sort((a, b) => b[1] - a[1])[0];

    const artist =
      filtered[0].artistName || filtered[0].master_metadata_album_artist_name;

    setInfo({
      name: decodeURIComponent(songName),
      artist,
      firstListen,
      lastListen,
      totalMs,
      count,
      mostPlayedDay,
    });

    fetch(
      `https://api.spotify.com/v1/search?q=track:${encodeURIComponent(songName)}%20artist:${encodeURIComponent(artist)}&type=track&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then(res => res.json())
      .then(data => {
        const track = data.tracks?.items?.[0];
        if (track) {
          setSpotifyData({
            album: track.album.name,
            releaseDate: track.album.release_date,
            image: track.album.images?.[0]?.url,
            uri: track.uri,
          });
        }
      });
  }, [songName]);

  if (!info) return <p>Laster info om sangen...</p>;

  return (
    <div className="home-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Tilbake
      </button>

      <div className="tracks-section">
        <h2 className="section-title">{info.name}</h2>
        <h3 className="section-subtitle">av <button
                  className="artist-name-button"
                  onClick={() => navigate(`/artist/${encodeURIComponent(info.artist)}`)}
                >
                  {info.artist}
                </button></h3>
        

        {spotifyData && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <img
                src={spotifyData.image}
                alt={info.name}
                style={{ width: '200px', borderRadius: '10px' }}
              />
              <p><strong>Album:</strong> {spotifyData.album}</p>
              <p><strong>Utgitt:</strong> {spotifyData.releaseDate}</p>
              <iframe
                src={`https://open.spotify.com/embed/track/${spotifyData.uri.split(':')[2]}`}
                width="300"
                height="80"
                frameBorder="0"
                allow="encrypted-media"
                title="Spotify Player"
                style={{ marginTop: '1rem' }}
              />
            </div>

            <ul className="track-list" style={{ minWidth: '300px' }}>
              <li className="track-item">
                <div className="track-info">
                  <div className="track-title">Første gang hørt</div>
                  <div className="track-artist">
                    {info.firstListen.toLocaleDateString('no-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </li>
              <li className="track-item">
                <div className="track-info">
                  <div className="track-title">Sist hørt på</div>
                  <div className="track-artist">
                    {info.lastListen.toLocaleDateString('no-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </li>
              <li className="track-item">
                <div className="track-info">
                  <div className="track-title">Antall ganger spilt</div>
                  <div className="track-artist">{info.count}</div>
                </div>
              </li>
              <li className="track-item">
                <div className="track-info">
                  <div className="track-title">Total lyttetid</div>
                  <div className="track-artist">{(info.totalMs / 60000).toFixed(1)} min</div>
                </div>
              </li>
              <li className="track-item">
                <div className="track-info">
                  <div className="track-title">Mest spilt dag</div>
                  <div className="track-artist">
                    {info.mostPlayedDay[0]} ({info.mostPlayedDay[1]} ganger)
                  </div>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default SongInfo;