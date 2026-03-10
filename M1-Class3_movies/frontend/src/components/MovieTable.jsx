function formatLikes(n) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}

export default function MovieTable({ title, badge, movies, likedIds, onLike }) {
    if (!movies?.length) return null;

    return (
        <section>
            <h2 className="section-title">
                {title}
                {badge && <span className="badge">{badge}</span>}
            </h2>
            <div className="movie-table-wrap">
                <table className="movie-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Title</th>
                            <th>Genre</th>
                            <th>Year</th>
                            <th>Rating</th>
                            <th>Age</th>
                            <th>Likes</th>
                            <th>Match</th>
                            {onLike && <th></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {movies.map(movie => (
                            <tr key={movie.id}>
                                <td className="poster-cell">
                                    <img
                                        className="poster-thumb"
                                        src={movie.poster}
                                        alt={movie.title}
                                        loading="lazy"
                                    />
                                </td>
                                <td className="title-cell">{movie.title}</td>
                                <td>{movie.genre}</td>
                                <td>{movie.year}</td>
                                <td className="rating-cell">★ {movie.rating}</td>
                                <td>{movie.ageRating}+</td>
                                <td className="likes-cell">♥ {formatLikes(movie.likes)}</td>
                                <td className="match-cell">
                                    {movie.similarity != null
                                        ? `${(movie.similarity * 100).toFixed(0)}%`
                                        : '—'}
                                </td>
                                {onLike && (
                                    <td>
                                        <button
                                            className={`like-btn ${likedIds?.has(movie.id) ? 'liked' : ''}`}
                                            onClick={() => onLike(movie.id)}
                                            title={likedIds?.has(movie.id) ? 'Unlike' : 'Like'}
                                        >
                                            {likedIds?.has(movie.id) ? '♥' : '♡'}
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
