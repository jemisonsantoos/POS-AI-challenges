import { Router } from 'express';
import { RecommendationService } from '../services/recommendationService.js';

const router = Router();
const service = new RecommendationService();

router.post('/', async (req, res) => {
    try {
        const { age, genres = [], nResults = 100 } = req.body;

        if (!age || typeof age !== 'number' || age < 1 || age > 120) {
            return res.status(400).json({ error: 'Invalid age (must be 1-120)' });
        }

        const { movies, queryEmbedding, dimensions } = await service.recommend({
            age,
            genres,
            nResults: Math.min(Number(nResults), 100),
        });

        res.json({
            query: { age, genres, nResults: movies.length },
            queryEmbedding,
            dimensions,
            results: movies,
        });
    } catch (err) {
        console.error('POST /api/recommend error:', err);
        res.status(500).json({ error: err.message });
    }
});

export { router as recommendRoutes };
