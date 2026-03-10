function formatLikes(n) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}

export default function HeroBanner({ movie }) {
    if (!movie) return null;

    return (
        <div
            className="hero"
            style={{ backgroundImage: `url(https://picsum.photos/seed/hero${movie.id}/1400/700)` }}
        >
            <div className="hero-content">
                <h1 className="hero-title">{movie.title}</h1>
                <div className="hero-meta">
                    <span className="hero-match">{movie.rating * 10}% match</span>
                    <span>{movie.year}</span>
                    <span className="hero-badge">{movie.ageRating}+</span>
                    <span>{movie.duration}min</span>
                    <span>{movie.genre}</span>
                    <span style={{ color: '#e50914' }}>♥ {formatLikes(movie.likes)}</span>
                </div>
            </div>
        </div>
    );
}
