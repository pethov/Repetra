import React, { useEffect, useState } from 'react';
import { generateCodeChallenge, generateRandomString } from '../utils/auth';
import './Home.css'; // bruker samme CSS for styling

const CLIENT_ID = '873284576ca1424ca93ef122637519bb';
const REDIRECT_URI = 'http://127.0.0.1:3000/callback';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played'
];

function Login() {
  const [loginUrl, setLoginUrl] = useState('');

  useEffect(() => {
    const verifier = generateRandomString(128);
    localStorage.setItem('verifier', verifier); // Må lagres før redirect

    generateCodeChallenge(verifier).then(challenge => {
      const url = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${encodeURIComponent(SCOPES.join(' '))}` +
        `&code_challenge_method=S256` +
        `&code_challenge=${challenge}`;

      setLoginUrl(url);
    });
  }, []);

  return (
    <div className="home-container">
      <div className="profile-section">
        <h1>Velkommen til RePetra</h1>
        <p>Logg inn for å se dine mest spilte sanger, artister og mer!</p>
        {loginUrl && (
          <a href={loginUrl} className="nav-link">Logg inn med Spotify</a>
        )}
      </div>
    </div>
  );
}

export default Login;
/*import React, { useEffect, useState } from 'react';
import { generateCodeChallenge, generateRandomString } from '../utils/auth';

const CLIENT_ID = '873284576ca1424ca93ef122637519bb';
const REDIRECT_URI = 'http://127.0.0.1:3000/callback';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read'
];

function Login() {
  const [loginUrl, setLoginUrl] = useState('');

  useEffect(() => {
    const verifier = generateRandomString(128);
    generateCodeChallenge(verifier).then(challenge => {
      localStorage.setItem('verifier', verifier); // Brukes senere når vi bytter code mot token

      const url = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${SCOPES.join('%20')}` +
        `&code_challenge_method=S256` +
        `&code_challenge=${challenge}`;

      setLoginUrl(url);
    });
  }, []);

  return (
    <div className="page-container">
      <h1>Logg inn med Spotify</h1>
      <a href={loginUrl} className="button">Logg inn</a>
    </div>
  );
}

export default Login;*/
