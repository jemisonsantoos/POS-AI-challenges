import MovieCard from './MovieCard.jsx';

export default function MovieRow({ title, badge, movies, likedIds, onLike }) {
    if (!movies?.length) return null;

    return (
        <section className="row-section">
            <h2 className="row-title">
                {title}
                {badge && <span className="badge">{badge}</span>}
            </h2>
            <div className="row-carousel">
                {movies.map(movie => (
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                        isLiked={likedIds?.has(movie.id)}
                        onLike={onLike}
                    />
                ))}
            </div>
        </section>
    );
}
