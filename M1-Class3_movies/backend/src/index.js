import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getCollection } from './config/chromadb.js';
import { movieRoutes } from './routes/movieRoutes.js';
import { recommendRoutes } from './routes/recommendRoutes.js';
import { userRoutes } from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/movies', movieRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', async (_req, res) => {
    try {
        const col = await getCollection();
        const count = await col.count();
        res.json({ status: 'ok', movies: count });
    } catch (err) {
        res.status(503).json({ status: 'error', message: err.message });
    }
});

await getCollection();

app.listen(PORT, () => {
    console.log(`Server running    → http://localhost:${PORT}`);
    console.log(`Health check      → http://localhost:${PORT}/api/health`);
    console.log(`ChromaDB          → ${process.env.CHROMA_URL || 'http://localhost:8000'}`);
});
