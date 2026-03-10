export default function UserList({ users, selectedUser, onSelectUser }) {
    return (
        <div className="panel user-list-panel">
            <div className="panel-header">Profiles</div>
            <div className="user-list">
                {users.map(user => (
                    <div
                        key={user.id}
                        className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                        onClick={() => onSelectUser(user)}
                    >
                        <img className="user-avatar" src={user.avatar} alt={user.name} />
                        <div className="user-item-info">
                            <span className="user-item-name">{user.name}</span>
                            <span className="user-item-detail">{user.age} yo · {user.totalLikes} likes</span>
                            <div className="user-item-genres">
                                {user.genres.map(g => <span key={g} className="genre-tag-sm">{g}</span>)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
