import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header.jsx';
import MovieTable from './components/MovieTable.jsx';
import TrainingPanel from './components/TrainingPanel.jsx';
import QueryBox from './components/QueryBox.jsx';
import NewUserBox from './components/NewUserBox.jsx';
import VectorDebug from './components/VectorDebug.jsx';
import {
    getUsers, getCatalog, getUserLikes, getUserRecommendations,
    recommend, getStats, createUser, toggleLike,
} from './services/api.js';

const ALL_GENRES = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi',
    'Romance', 'Thriller', 'Animation', 'Documentary', 'Adventure',
];

export default function App() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [catalog, setCatalog] = useState(null);
    const [stats, setStats] = useState(null);
    const [userLikes, setUserLikes] = useState([]);
    const [userRecs, setUserRecs] = useState([]);
    const [queryRecs, setQueryRecs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [queryLoading, setQueryLoading] = useState(false);
    const [genreFilter, setGenreFilter] = useState('');
    const [userDebug, setUserDebug] = useState(null);
    const [queryDebug, setQueryDebug] = useState(null);

    const likedIds = useMemo(() => new Set(userLikes.map(m => m.id)), [userLikes]);

    const initialQueryRan = useRef(false);

    useEffect(() => {
        Promise.all([getUsers(), getCatalog(), getStats()])
            .then(([u, c, s]) => {
                setUsers(u);
                setCatalog(c);
                setStats(s);
                if (u.length > 0) setSelectedUser(u[0]);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading && !initialQueryRan.current) {
            initialQueryRan.current = true;
            handleQuery({ age: 25, genres: ['Action', 'Sci-Fi'], nResults: 100 });
        }
    }, [loading]);

    useEffect(() => {
        if (!selectedUser) { setUserLikes([]); setUserRecs([]); setUserDebug(null); return; }
        Promise.all([
            getUserLikes(selectedUser.id),
            getUserRecommendations(selectedUser.id, 100),
        ]).then(([likes, recs]) => {
            setUserLikes(likes.movies);
            setUserRecs(recs.results);
            setUserDebug({
                query: { age: recs.user.age, genres: selectedUser.genres },
                queryEmbedding: recs.queryEmbedding,
                dimensions: recs.dimensions,
                results: recs.results,
            });
        }).catch(console.error);
    }, [selectedUser?.id]);

    function handleSelectUser(user) {
        if (!user) { setSelectedUser(null); return; }
        setSelectedUser(prev => prev?.id === user.id ? null : user);
    }

    const handleLike = useCallback(async (movieId) => {
        if (!selectedUser) return;
        try {
            const res = await toggleLike(selectedUser.id, movieId);
            setSelectedUser(prev => ({ ...prev, totalLikes: res.totalLikes }));
            setUsers(prev => prev.map(u =>
                u.id === selectedUser.id ? { ...u, totalLikes: res.totalLikes } : u
            ));
            const likes = await getUserLikes(selectedUser.id);
            setUserLikes(likes.movies);
        } catch (err) { console.error(err); }
    }, [selectedUser]);

    async function handleCreateUser(data) {
        const user = await createUser(data);
        setUsers(prev => [...prev, user]);
        setSelectedUser(user);
        return user;
    }

    async function handleQuery(params) {
        setQueryLoading(true);
        try {
            const data = await recommend(params);
            setQueryRecs(data.results);
            setQueryDebug({
                query: data.query,
                queryEmbedding: data.queryEmbedding,
                dimensions: data.dimensions,
                results: data.results,
            });
        } catch (err) { console.error(err); }
        finally { setQueryLoading(false); }
    }

    const filteredRecs = useMemo(() =>
        genreFilter ? userRecs.filter(m => m.genre === genreFilter) : userRecs
    , [userRecs, genreFilter]);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p style={{ color: '#718096' }}>Loading catalog from ChromaDB...</p>
            </div>
        );
    }

    return (
        <>
            <Header
                genreFilter={genreFilter}
                onGenreFilter={setGenreFilter}
                genres={ALL_GENRES}
                users={users}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
                onLogoClick={() => { setSelectedUser(null); setQueryRecs([]); setQueryDebug(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />

            <div className="page">
                <div className="top-grid">
                    <NewUserBox onCreateUser={handleCreateUser} />
                    <QueryBox onQuery={handleQuery} loading={queryLoading} />
                    <TrainingPanel stats={stats} />
                </div>

                {(userDebug || queryDebug) && (
                    <div className="debug-row">
                        {userDebug && <VectorDebug data={userDebug} label={`User Recommendation — ${selectedUser?.name}`} />}
                        {queryDebug && <VectorDebug data={queryDebug} label="Custom Query" />}
                    </div>
                )}

                {!selectedUser && !userDebug && !queryDebug && (
                    <div className="empty-state">
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🎬</div>
                        <p>Select a <strong>user</strong> in the header, or use <strong>New User (JSON)</strong> to create a profile.</p>
                        <p>Use <strong>Custom Query (JSON)</strong> for a vector search against ChromaDB.</p>
                        <p>Click <strong>Re-train Model</strong> to visualize the AI training process.</p>
                    </div>
                )}
            </div>
        </>
    );
}
