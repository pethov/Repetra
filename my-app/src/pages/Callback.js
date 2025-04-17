// src/pages/Callback.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CLIENT_ID = '873284576ca1424ca93ef122637519bb';
const REDIRECT_URI = 'http://127.0.0.1:3000/callback';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const verifier = localStorage.getItem('verifier');

    if (!code || !verifier) {
      console.error('Mangler code eller verifier');
      return;
    }

    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    });

    fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Token response:', data);

        if (data.access_token) {
          localStorage.setItem('spotifyToken', data.access_token);
          navigate('/home');
        } else {
          console.error('Token ikke mottatt:', data);
        }
      })
      .catch(error => {
        console.error('Token exchange error:', error);
      });
  }, [navigate]);

  return <p>Logger inn via Spotify...</p>;
}

export default Callback;
/*import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CLIENT_ID = '873284576ca1424ca93ef122637519bb';
const REDIRECT_URI = 'http://127.0.0.1:3000/callback';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const verifier = localStorage.getItem('verifier');

    if (!code || !verifier) {
      console.error('Mangler code eller verifier');
      return;
    }

    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    });

    fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(), // 👈 viktig!
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Token response:', data);

        if (data.access_token) {
          localStorage.setItem('spotifyToken', data.access_token);
          navigate('/home');
        } else {
          console.error('Token ikke mottatt:', data);
        }
      })
      .catch((error) => {
        console.error('Token exchange error:', error);
      });
  }, [navigate]);

  return <p>Logger inn via Spotify...</p>;
}

export default Callback;*/
