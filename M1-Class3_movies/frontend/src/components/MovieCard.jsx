function formatLikes(n) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}

export default function MovieCard({ movie, isLiked, onLike }) {
    const similarity = movie.similarity;

    function handleLike(e) {
        e.stopPropagation();
        onLike?.(movie.id);
    }

    return (
        <div className="movie-card">
            <img className="poster" src={movie.poster} alt={movie.title} loading="lazy" />
            <span className="age-badge">{movie.ageRating}+</span>

            <div className="card-info">
                <div className="card-title" title={movie.title}>{movie.title}</div>
                <div className="card-meta">
                    {similarity != null && (
                        <span className="match">{(similarity * 100).toFixed(0)}%</span>
                    )}
                    <span className="star">★ {movie.rating}</span>
                    <span>{movie.year}</span>
                </div>
                <div className="card-meta">
                    <span>{movie.genre}</span>
                    <span>·</span>
                    <span>{movie.duration}min</span>
                </div>
                <div className="card-bottom">
                    <span className="likes">♥ {formatLikes(movie.likes)}</span>
                    {onLike && (
                        <button
                            className={`like-btn ${isLiked ? 'liked' : ''}`}
                            onClick={handleLike}
                            title={isLiked ? 'Unlike' : 'Like'}
                        >
                            {isLiked ? '♥' : '♡'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
