import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Home.css';
import allAudioHistory from '../Data/AllTimeAudio';

function AlbumInfo() {
  const { albumName, artistName } = useParams();
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const filtered = {};

    allAudioHistory.forEach(item => {
      const album = item.albumName || item.master_metadata_album_album_name;
      const artist = item.artistName || item.master_metadata_album_artist_name;
      const title = item.trackName || item.master_metadata_track_name;

      if (
        album && artist && title &&
        album.toLowerCase() === decodeURIComponent(albumName).toLowerCase() &&
        artist.toLowerCase() === decodeURIComponent(artistName).toLowerCase()
      ) {
        if (!filtered[title]) {
          filtered[title] = { name: title, count: 0 };
        }
        filtered[title].count += 1;
      }
    });

    const sorted = Object.values(filtered).sort((a, b) => b.count - a.count);
    setSongs(sorted);
  }, [albumName, artistName]);

  return (
    <div className="home-container">
      <button className="back-button" onClick={() => navigate(-1)}>← Tilbake</button>
      <div className="content-section">
        <h2 className="section-title">{decodeURIComponent(albumName)}</h2>
        <h3 className="section-subtitle">
          av{' '}
          <button
            className="artist-name-button"
            onClick={() => navigate(`/artist/${encodeURIComponent(artistName)}`)}
          >
            {decodeURIComponent(artistName)}
          </button>
        </h3>

        <ul className="track-list">
          {songs.map((song, index) => (
            <li key={index} className="track-item">
              <span className="track-index">{index + 1}.</span>
              <div className="track-info">
                <div className="track-title">
                  <button
                    className="artist-name-button"
                    onClick={() => navigate(`/song/${encodeURIComponent(song.name)}/${encodeURIComponent(artistName)}`)}
                  >
                    {song.name}
                  </button>
                </div>
                <div className="track-artist">Spilt {song.count} ganger</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AlbumInfo;