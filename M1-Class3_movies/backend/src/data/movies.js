export const GENRES = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi',
    'Romance', 'Thriller', 'Animation', 'Documentary', 'Adventure',
];

export const AGE_RATINGS = ['L', '10', '12', '14', '16', '18'];

const AGE_RATING_VALUE = { L: 0, '10': 0.2, '12': 0.4, '14': 0.6, '16': 0.8, '18': 1.0 };

export const LIKES_WEIGHT = 1.0;
export const AGE_WEIGHT = 1.0;
export const RATING_WEIGHT = 1.0;
export const YEAR_WEIGHT = 0.5;

const YEAR_MIN = 1990;
const YEAR_MAX = 2025;

export function normalizeAge(ageRating) {
    return AGE_RATING_VALUE[ageRating] ?? 0.5;
}

export function normalizeLikes(likes, maxLikes) {
    if (maxLikes === 0) return 0;
    return Math.log1p(likes) / Math.log1p(maxLikes);
}

export function normalizeYear(year) {
    return (year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN);
}

export function normalizeRating(rating) {
    return rating / 10;
}

export function buildEmbedding(movie, maxLikes) {
    const genreVec = GENRES.map(g => (g === movie.genre ? 1.0 : 0.0));
    const ageVal = normalizeAge(movie.ageRating) * AGE_WEIGHT;
    const likesVal = normalizeLikes(movie.likes, maxLikes) * LIKES_WEIGHT;
    const ratingVal = normalizeRating(movie.rating) * RATING_WEIGHT;
    const yearVal = normalizeYear(movie.year) * YEAR_WEIGHT;

    return [...genreVec, ageVal, likesVal, ratingVal, yearVal];
}

export function buildQueryEmbedding(userAge, preferredGenres = [], maxLikes) {
    const genreVec = GENRES.map(g => (preferredGenres.includes(g) ? 1.0 : 0.0));

    let preferredAgeRating;
    if (userAge <= 10) preferredAgeRating = 'L';
    else if (userAge <= 12) preferredAgeRating = '10';
    else if (userAge <= 14) preferredAgeRating = '12';
    else if (userAge <= 16) preferredAgeRating = '14';
    else if (userAge <= 18) preferredAgeRating = '16';
    else preferredAgeRating = '18';

    const ageVal = normalizeAge(preferredAgeRating) * AGE_WEIGHT;
    const likesVal = 1.0 * LIKES_WEIGHT;
    const ratingVal = 1.0 * RATING_WEIGHT;
    const yearVal = 0.6 * YEAR_WEIGHT;

    return [...genreVec, ageVal, likesVal, ratingVal, yearVal];
}

// --- Deterministic movie dataset generator ---

function seededRandom(seed) {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

const TITLE_PREFIXES = [
    'The', 'A', 'My', 'Our', 'Last', 'First', 'Dark', 'Bright', 'Silent',
    'Hidden', 'Eternal', 'Lost', 'Final', 'Secret', 'Broken', 'Frozen',
    'Golden', 'Iron', 'Crystal', 'Shadow',
];

const TITLE_NOUNS = [
    'Night', 'Dawn', 'Storm', 'Dream', 'World', 'Road', 'Star', 'Fire',
    'Ocean', 'Sky', 'Moon', 'Heart', 'City', 'Forest', 'River', 'Mountain',
    'Kingdom', 'Island', 'Garden', 'Temple', 'Bridge', 'Tower', 'Castle',
    'Valley', 'Desert', 'Planet', 'Galaxy', 'Horizon', 'Frontier', 'Legend',
    'Destiny', 'Journey', 'Promise', 'Memory', 'Echo', 'Phantom', 'Warrior',
    'Hunter', 'Guardian', 'Explorer', 'Voyager', 'Pioneer', 'Oracle',
    'Dragon', 'Phoenix', 'Wolf', 'Eagle', 'Serpent', 'Lion', 'Tiger',
];

const TITLE_SUFFIXES = [
    'Rising', 'Returns', 'Unleashed', 'Awakens', 'Reborn', 'Chronicles',
    'Legacy', 'Begins', 'Redemption', 'Revelation', 'Protocol', 'Effect',
    'Conspiracy', 'Paradox', 'Evolution', 'Genesis', 'Uprising', 'Requiem',
];

const GENRE_AGE_DISTRIBUTION = {
    Action:      { L: 0.05, '10': 0.10, '12': 0.25, '14': 0.30, '16': 0.20, '18': 0.10 },
    Comedy:      { L: 0.15, '10': 0.20, '12': 0.25, '14': 0.20, '16': 0.15, '18': 0.05 },
    Drama:       { L: 0.05, '10': 0.10, '12': 0.20, '14': 0.25, '16': 0.25, '18': 0.15 },
    Horror:      { L: 0.00, '10': 0.00, '12': 0.05, '14': 0.15, '16': 0.40, '18': 0.40 },
    'Sci-Fi':    { L: 0.05, '10': 0.10, '12': 0.25, '14': 0.30, '16': 0.20, '18': 0.10 },
    Romance:     { L: 0.05, '10': 0.10, '12': 0.30, '14': 0.30, '16': 0.20, '18': 0.05 },
    Thriller:    { L: 0.00, '10': 0.05, '12': 0.10, '14': 0.25, '16': 0.35, '18': 0.25 },
    Animation:   { L: 0.35, '10': 0.30, '12': 0.20, '14': 0.10, '16': 0.05, '18': 0.00 },
    Documentary: { L: 0.20, '10': 0.20, '12': 0.20, '14': 0.15, '16': 0.15, '18': 0.10 },
    Adventure:   { L: 0.10, '10': 0.20, '12': 0.30, '14': 0.25, '16': 0.10, '18': 0.05 },
};

function pickFromDistribution(dist, rand) {
    const r = rand();
    let cumulative = 0;
    for (const [key, prob] of Object.entries(dist)) {
        cumulative += prob;
        if (r <= cumulative) return key;
    }
    return Object.keys(dist).at(-1);
}

export function generateMovies(count = 500) {
    const rand = seededRandom(42);
    const movies = [];
    const usedTitles = new Set();

    for (let i = 0; i < count; i++) {
        const genre = GENRES[Math.floor(rand() * GENRES.length)];

        let title;
        let attempts = 0;
        do {
            const usePrefix = rand() > 0.3;
            const prefix = usePrefix ? TITLE_PREFIXES[Math.floor(rand() * TITLE_PREFIXES.length)] + ' ' : '';
            const noun = TITLE_NOUNS[Math.floor(rand() * TITLE_NOUNS.length)];
            const useSuffix = rand() > 0.5;
            const suffix = useSuffix ? ': ' + TITLE_SUFFIXES[Math.floor(rand() * TITLE_SUFFIXES.length)] : '';
            title = `${prefix}${noun}${suffix}`;
            attempts++;
            if (attempts > 20) title += ` ${i}`;
        } while (usedTitles.has(title));
        usedTitles.add(title);

        const ageRating = pickFromDistribution(GENRE_AGE_DISTRIBUTION[genre], rand);
        const year = YEAR_MIN + Math.floor(rand() * (YEAR_MAX - YEAR_MIN + 1));
        const rating = Math.round((2 + rand() * 8) * 10) / 10;
        const likes = Math.floor(Math.pow(rand(), 0.5) * 100000);
        const duration = 80 + Math.floor(rand() * 130);

        movies.push({
            id: `movie_${String(i).padStart(4, '0')}`,
            title,
            genre,
            ageRating,
            year,
            rating,
            likes,
            duration,
            poster: `https://picsum.photos/seed/movie${i}/300/450`,
        });
    }

    return movies;
}
