const BASE_URL = '/api';

async function request(url, options = {}) {
    const res = await fetch(`${BASE_URL}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Request failed');
    }
    return res.json();
}

export const getStats = () => request('/movies/stats');
export const getCatalog = () => request('/movies/catalog');
export const getMovies = (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/movies${qs ? `?${qs}` : ''}`);
};

export const recommend = ({ age, genres = [], nResults = 100 }) =>
    request('/recommend', {
        method: 'POST',
        body: JSON.stringify({ age, genres, nResults }),
    });

export const getSimilarMovies = (movieId, limit = 20) =>
    request(`/movies/${movieId}/similar?limit=${limit}`);

export const getUsers = () => request('/users');
export const getUserLikes = (userId) => request(`/users/${userId}/likes`);
export const getUserRecommendations = (userId, nResults = 100) =>
    request(`/users/${userId}/recommend?nResults=${nResults}`);
export const getWhoLiked = (movieId) => request(`/users/by-movie/${movieId}`);

export const createUser = ({ name, age, genres }) =>
    request('/users', {
        method: 'POST',
        body: JSON.stringify({ name, age, genres }),
    });

export const toggleLike = (userId, movieId) =>
    request(`/users/${userId}/like/${movieId}`, { method: 'POST' });
