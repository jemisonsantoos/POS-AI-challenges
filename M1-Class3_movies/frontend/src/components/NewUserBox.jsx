import { useState } from 'react';

const DEFAULT_JSON = JSON.stringify({
    name: 'New User',
    age: 22,
    genres: ['Action', 'Comedy']
}, null, 2);

export default function NewUserBox({ onCreateUser, loading }) {
    const [json, setJson] = useState(DEFAULT_JSON);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    function handleSubmit() {
        setError(null);
        setSuccess(null);
        try {
            const parsed = JSON.parse(json);
            if (!parsed.name || !parsed.age) {
                setError('"name" and "age" are required');
                return;
            }
            onCreateUser(parsed).then(user => {
                setSuccess(`Created: ${user.name} (${user.id})`);
            }).catch(err => setError(err.message));
        } catch {
            setError('Invalid JSON');
        }
    }

    return (
        <div className="panel">
            <div className="panel-header">New User (JSON)</div>
            <textarea
                className="query-textarea"
                value={json}
                onChange={e => { setJson(e.target.value); setError(null); setSuccess(null); }}
                spellCheck={false}
                rows={10}
            />
            {error && <div className="query-error">{error}</div>}
            {success && <div className="query-success">{success}</div>}
            <button className="btn-panel" onClick={handleSubmit} disabled={loading}>
                + Create User
            </button>
        </div>
    );
}
