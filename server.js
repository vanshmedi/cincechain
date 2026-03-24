import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure we load env vars FIRST
dotenv.config({ path: path.resolve(__dirname, 'blockchain', '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', blockchain: 'connected' });
});

// Load routes and start worker dynamically
async function startServer() {
  const { default: filmRoutes } = await import('./blockchain/routes/films.js');
  const { startFilmWorker } = await import('./blockchain/workers/filmWorker.js');

  app.use('/api/films', filmRoutes);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] Backend running on http://localhost:${PORT}`);
    startFilmWorker();
  });
}

startServer().catch(console.error);
