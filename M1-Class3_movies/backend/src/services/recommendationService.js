import { getCollection } from '../config/chromadb.js';
import { buildQueryEmbedding, buildEmbedding, GENRES, AGE_RATINGS } from '../data/movies.js';

export class RecommendationService {

    async getMaxLikes() {
        const collection = await getCollection();
        const sample = await collection.get({ limit: 1, include: ['metadatas'] });
        return sample.metadatas?.[0]?.maxLikes || 100000;
    }

    async recommend({ age, genres = [], nResults = 100 }) {
        const collection = await getCollection();
        const maxLikes = await this.getMaxLikes();
        const queryEmbedding = buildQueryEmbedding(age, genres, maxLikes);

        const results = await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults,
            include: ['metadatas', 'distances', 'documents'],
        });

        const movies = results.ids[0].map((id, i) => ({
            id,
            ...results.metadatas[0][i],
            distance: results.distances[0][i],
            similarity: 1 - results.distances[0][i],
        }));

        return {
            movies,
            queryEmbedding,
            dimensions: GENRES.map((g, i) => ({ index: i, label: `genre:${g}`, value: queryEmbedding[i] }))
                .concat([
                    { index: 10, label: 'ageRating', value: queryEmbedding[10] },
                    { index: 11, label: 'likes', value: queryEmbedding[11] },
                    { index: 12, label: 'rating', value: queryEmbedding[12] },
                    { index: 13, label: 'year', value: queryEmbedding[13] },
                ]),
        };
    }

    async getMovieById(movieId) {
        const collection = await getCollection();
        const result = await collection.get({
            ids: [movieId],
            include: ['metadatas', 'embeddings', 'documents'],
        });

        if (!result.ids.length) return null;

        return {
            id: result.ids[0],
            ...result.metadatas[0],
            document: result.documents[0],
        };
    }

    async getSimilarMovies(movieId, nResults = 100) {
        const collection = await getCollection();

        const movie = await collection.get({
            ids: [movieId],
            include: ['metadatas', 'embeddings'],
        });

        if (!movie.ids.length) return [];

        const maxLikes = movie.metadatas[0]?.maxLikes || 100000;
        const movieData = movie.metadatas[0];
        const movieEmbedding = buildEmbedding({
            genre: movieData.genre,
            ageRating: movieData.ageRating,
            year: movieData.year,
            rating: movieData.rating,
            likes: movieData.likes,
        }, maxLikes);

        const results = await collection.query({
            queryEmbeddings: [movieEmbedding],
            nResults: nResults + 1,
            include: ['metadatas', 'distances'],
        });

        return results.ids[0]
            .map((id, i) => ({
                id,
                ...results.metadatas[0][i],
                distance: results.distances[0][i],
                similarity: 1 - results.distances[0][i],
            }))
            .filter(m => m.id !== movieId);
    }

    async listAll({ genre, ageRating, limit = 50, offset = 0 } = {}) {
        const collection = await getCollection();

        const where = {};
        if (genre) where.genre = genre;
        if (ageRating) where.ageRating = ageRating;

        const hasFilter = Object.keys(where).length > 0;

        const result = await collection.get({
            ...(hasFilter ? { where } : {}),
            limit,
            offset,
            include: ['metadatas'],
        });

        return result.ids.map((id, i) => ({
            id,
            ...result.metadatas[i],
        }));
    }

    async getMoviesByIds(ids) {
        if (!ids.length) return [];
        const collection = await getCollection();
        const result = await collection.get({
            ids,
            include: ['metadatas'],
        });
        return result.ids.map((id, i) => ({ id, ...result.metadatas[i] }));
    }

    async getByGenre(genre, limit = 20) {
        const collection = await getCollection();
        const result = await collection.get({
            where: { genre },
            limit,
            include: ['metadatas'],
        });
        return result.ids.map((id, i) => ({ id, ...result.metadatas[i] }));
    }

    async getTopLiked(limit = 20) {
        const collection = await getCollection();
        const result = await collection.get({
            limit: 200,
            include: ['metadatas'],
        });
        const movies = result.ids.map((id, i) => ({ id, ...result.metadatas[i] }));
        movies.sort((a, b) => b.likes - a.likes);
        return movies.slice(0, limit);
    }

    async getCatalog() {
        const collection = await getCollection();
        const all = await collection.get({ limit: 100, include: ['metadatas'] });
        const movies = all.ids.map((id, i) => ({ id, ...all.metadatas[i] }));

        const byGenre = {};
        for (const g of GENRES) byGenre[g] = [];
        for (const m of movies) {
            if (byGenre[m.genre]) byGenre[m.genre].push(m);
        }
        for (const g of GENRES) {
            byGenre[g].sort((a, b) => b.likes - a.likes);
            byGenre[g] = byGenre[g].slice(0, 20);
        }

        const trending = [...movies].sort((a, b) => b.likes - a.likes).slice(0, 20);
        const topRated = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 20);

        return { trending, topRated, byGenre };
    }

    async stats() {
        const collection = await getCollection();
        const count = await collection.count();
        return { totalMovies: count, genres: GENRES, ageRatings: AGE_RATINGS };
    }
}
