import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [profile, setProfile] = useState(null);
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
       // Kall din backend for å logge lytting
   // Kall din backend for å logge lytting
    fetch('http://localhost:5000/log')
      .then(res => res.json())
      .then(data => {
        console.log('Nylig spilt er logget:', data);
      })
      .catch(err => {
        console.error('Feil under logging til backend:', err);
      });
  }, [navigate]);

  if (!profile) return <p>Laster inn...</p>;

  return (
    <div className="home-container">
      <div className="profile-section">
        <img
          className="profile-image"
          src={profile.images?.[0]?.url}
          alt="Profilbilde"
        />
        <h1>Hei, {profile.display_name}</h1>
        <p>E-post: {profile.email}</p>
        <p>Land: {profile.country}</p>
        <p>Følgere: {profile.followers?.total ?? 'ukjent'}</p>
        {profile.external_urls?.spotify && (
          <p>
            Spotify-profil:{' '}
            <a href={profile.external_urls.spotify} target="_blank" rel="noreferrer">
              {profile.external_urls.spotify}
            </a>
          </p>
        )}

          <div className="nav-links">
            <button onClick={() => navigate('/TopTracks')}>Top Tracks</button>
            <button onClick={() => navigate('/TopArtists')}>Top Artists</button>
            <button onClick={() => navigate('/TopGenres')}>Top Genres</button>
            <button onClick={() => navigate('/RecentlyPlayed')}>Recently Played</button>
          </div>
        </div>
      </div>
  );
}

export default Home;
