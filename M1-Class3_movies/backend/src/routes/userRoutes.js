import { Router } from 'express';
import { generateUsers } from '../data/users.js';
import { RecommendationService } from '../services/recommendationService.js';

const router = Router();
const users = generateUsers();
let nextId = users.length + 1;
const service = new RecommendationService();

function userSummary(u) {
    return {
        id: u.id,
        name: u.name,
        age: u.age,
        avatar: u.avatar,
        totalLikes: u.likedMovieIds.length,
        genres: u.genres,
    };
}

router.get('/', (_req, res) => {
    res.json(users.map(userSummary));
});

router.post('/', (req, res) => {
    const { name, age, genres = [] } = req.body;
    if (!name || !age) return res.status(400).json({ error: 'name and age are required' });

    const id = `user_${String(nextId++).padStart(2, '0')}`;
    const user = {
        id,
        name,
        age: Number(age),
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        genres: Array.isArray(genres) ? genres : [],
        likedMovieIds: [],
        likeCount: 0,
    };
    users.push(user);
    res.status(201).json(userSummary(user));
});

router.get('/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

router.get('/:id/likes', async (req, res) => {
    try {
        const user = users.find(u => u.id === req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const movies = user.likedMovieIds.length
            ? await service.getMoviesByIds(user.likedMovieIds)
            : [];
        res.json({ user: { id: user.id, name: user.name, age: user.age, avatar: user.avatar }, movies });
    } catch (err) {
        console.error(`GET /api/users/${req.params.id}/likes error:`, err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/like/:movieId', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const movieId = req.params.movieId;
    const idx = user.likedMovieIds.indexOf(movieId);
    let liked;

    if (idx >= 0) {
        user.likedMovieIds.splice(idx, 1);
        liked = false;
    } else {
        user.likedMovieIds.push(movieId);
        liked = true;
    }

    res.json({ liked, totalLikes: user.likedMovieIds.length });
});

router.get('/:id/recommend', async (req, res) => {
    try {
        const user = users.find(u => u.id === req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { nResults = 100 } = req.query;
        const { movies, queryEmbedding, dimensions } = await service.recommend({
            age: user.age,
            genres: user.genres,
            nResults: Number(nResults),
        });

        res.json({
            user: { id: user.id, name: user.name, age: user.age },
            queryEmbedding,
            dimensions,
            results: movies,
        });
    } catch (err) {
        console.error(`GET /api/users/${req.params.id}/recommend error:`, err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/by-movie/:movieId', (req, res) => {
    const movieId = req.params.movieId;
    const whoLiked = users
        .filter(u => u.likedMovieIds.includes(movieId))
        .map(u => ({ id: u.id, name: u.name, age: u.age, avatar: u.avatar }));
    res.json(whoLiked);
});

export { router as userRoutes };
