import { useState } from 'react';

const DEFAULT_JSON = JSON.stringify({
    age: 25,
    genres: ['Action', 'Sci-Fi'],
    nResults: 100
}, null, 2);

export default function QueryBox({ onQuery, loading }) {
    const [json, setJson] = useState(DEFAULT_JSON);
    const [error, setError] = useState(null);

    function handleSubmit() {
        setError(null);
        try {
            const parsed = JSON.parse(json);
            if (!parsed.age || typeof parsed.age !== 'number') {
                setError('"age" (number) is required');
                return;
            }
            onQuery(parsed);
        } catch {
            setError('Invalid JSON');
        }
    }

    return (
        <div className="panel">
            <div className="panel-header">
                <span>Custom Query (JSON)</span>
                <button className="query-reset" onClick={() => { setJson(DEFAULT_JSON); setError(null); }}>Reset</button>
            </div>
            <textarea
                className="query-textarea"
                value={json}
                onChange={e => setJson(e.target.value)}
                spellCheck={false}
                rows={10}
            />
            {error && <div className="query-error">{error}</div>}
            <button className="btn-panel btn-green" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Searching...' : 'Run Vector Search'}
            </button>
        </div>
    );
}
