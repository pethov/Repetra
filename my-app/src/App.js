
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Callback from './pages/Callback';
import Home from './pages/Home';
import TopTracks from './pages/TopTracks';
import TopArtists from './pages/TopArtists';
import TopAlbums from './pages/TopAlbums';
import RecentlyPlayed from './pages/RecentlyPlayed';
import ArtistInfo from './pages/ArtistInfo';
import SongInfo from './pages/SongInfo';
import AlbumInfo from './pages/AlbumInfo';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/toptracks" element={<TopTracks />} />
        <Route path="/topartists" element={<TopArtists />} />
        <Route path= "/topalbums" element= {<TopAlbums/>}/>
        <Route path= "/recentlyplayed" element= {<RecentlyPlayed/>}/>
        <Route path="/artist/:artistName" element={<ArtistInfo />} />
        <Route path="/song/:songName/:artistName" element={<SongInfo />} />
        <Route path="/album/:albumName/:artistName" element={<AlbumInfo />} />
      </Routes>
    </Router>
  );
}

export default App;
