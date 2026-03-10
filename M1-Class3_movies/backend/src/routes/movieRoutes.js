import { Router } from 'express';
import { RecommendationService } from '../services/recommendationService.js';

const router = Router();
const service = new RecommendationService();

router.get('/', async (req, res) => {
    try {
        const { genre, ageRating, limit = 50, offset = 0 } = req.query;
        const movies = await service.listAll({
            genre,
            ageRating,
            limit: Number(limit),
            offset: Number(offset),
        });
        res.json(movies);
    } catch (err) {
        console.error('GET /api/movies error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/catalog', async (_req, res) => {
    try {
        const catalog = await service.getCatalog();
        res.json(catalog);
    } catch (err) {
        console.error('GET /api/movies/catalog error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/stats', async (_req, res) => {
    try {
        const stats = await service.stats();
        res.json(stats);
    } catch (err) {
        console.error('GET /api/movies/stats error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const movie = await service.getMovieById(req.params.id);
        if (!movie) return res.status(404).json({ error: 'Movie not found' });
        res.json(movie);
    } catch (err) {
        console.error(`GET /api/movies/${req.params.id} error:`, err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id/similar', async (req, res) => {
    try {
        const { limit = 100 } = req.query;
        const movies = await service.getSimilarMovies(req.params.id, Number(limit));
        res.json(movies);
    } catch (err) {
        console.error(`GET /api/movies/${req.params.id}/similar error:`, err);
        res.status(500).json({ error: err.message });
    }
});

export { router as movieRoutes };
