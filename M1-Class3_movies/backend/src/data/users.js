import { generateMovies } from './movies.js';

const USER_PROFILES = [
    { id: 'user_01', name: 'Ana Silva',       age: 12, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ana',       genres: ['Animation', 'Adventure'],      likeCount: 15 },
    { id: 'user_02', name: 'Bruno Costa',      age: 16, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bruno',     genres: ['Action', 'Sci-Fi'],            likeCount: 18 },
    { id: 'user_03', name: 'Carla Mendes',     age: 25, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Carla',     genres: ['Drama', 'Romance'],            likeCount: 12 },
    { id: 'user_04', name: 'Diego Oliveira',   age: 30, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Diego',     genres: ['Thriller', 'Horror'],          likeCount: 16 },
    { id: 'user_05', name: 'Elena Santos',     age: 22, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Elena',     genres: ['Comedy', 'Romance'],           likeCount: 14 },
];

function seededRandom(seed) {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function ageAppropriate(userAge, movieAgeRating) {
    const map = { L: 0, '10': 10, '12': 12, '14': 14, '16': 16, '18': 18 };
    return userAge >= (map[movieAgeRating] ?? 0);
}

export function generateUsers() {
    const movies = generateMovies(100);
    const rand = seededRandom(123);

    return USER_PROFILES.map(profile => {
        const eligible = movies.filter(m => ageAppropriate(profile.age, m.ageRating));

        const preferred = eligible.filter(m => profile.genres.includes(m.genre));
        const other = eligible.filter(m => !profile.genres.includes(m.genre));

        preferred.sort((a, b) => b.likes - a.likes + (rand() - 0.5) * 20000);
        other.sort((a, b) => b.rating - a.rating + (rand() - 0.5) * 3);

        const mainCount = Math.round(profile.likeCount * 0.7);
        const otherCount = profile.likeCount - mainCount;

        const likedMovies = [
            ...preferred.slice(0, mainCount),
            ...other.slice(0, otherCount),
        ];

        return {
            ...profile,
            likedMovieIds: likedMovies.map(m => m.id),
        };
    });
}
