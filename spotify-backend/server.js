import express from 'express';
import cors from 'cors';
import authRoute from './routes/auth.js';
import logRoute from './routes/log.js';
import tracksRoute from './routes/tracks.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRoute);
app.use(logRoute);
app.use(tracksRoute);

app.listen(5000, () => console.log('Server kjører på http://localhost:5000'));
