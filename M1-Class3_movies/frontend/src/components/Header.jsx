export default function Header({ genreFilter, onGenreFilter, genres, users, selectedUser, onSelectUser, onLogoClick }) {
    return (
        <nav className="nav">
            <div className="nav-left">
                <span className="logo" onClick={onLogoClick}>AI Recommendations Movie</span>
            </div>
            <div className="nav-right">
                <select
                    className="genre-filter"
                    value={selectedUser?.id || ''}
                    onChange={e => {
                        const u = users?.find(u => u.id === e.target.value);
                        onSelectUser(u || null);
                    }}
                >
                    <option value="">Select User</option>
                    {users?.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.age}yo)</option>
                    ))}
                </select>
                <select
                    className="genre-filter"
                    value={genreFilter}
                    onChange={e => onGenreFilter(e.target.value)}
                >
                    <option value="">All Genres</option>
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>
        </nav>
    );
}
