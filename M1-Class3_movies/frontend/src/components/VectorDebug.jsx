export default function VectorDebug({ data, label }) {
    if (!data) return null;

    const { queryEmbedding, dimensions, query, results } = data;

    return (
        <div className="panel vector-debug">
            <div className="panel-header">
                {label || 'Vector Search Debug'}
                <span className="status-badge ready">{results?.length || 0} results</span>
            </div>

            <div className="debug-section">
                <div className="debug-label">Query Input</div>
                <pre className="debug-pre">{JSON.stringify(query, null, 2)}</pre>
            </div>

            {queryEmbedding && (
                <div className="debug-section">
                    <div className="debug-label">Query Embedding ({queryEmbedding.length}D vector)</div>
                    <div className="embedding-grid">
                        {dimensions?.map(d => (
                            <div key={d.index} className="embedding-dim">
                                <span className="dim-label">{d.label}</span>
                                <div className="dim-bar-track">
                                    <div
                                        className="dim-bar-fill"
                                        style={{ width: `${Math.min(d.value * 100, 100)}%` }}
                                    />
                                </div>
                                <span className="dim-value">{d.value.toFixed(3)}</span>
                            </div>
                        ))}
                    </div>
                    <details className="debug-details">
                        <summary>Raw vector</summary>
                        <pre className="debug-pre">[{queryEmbedding.map(v => v.toFixed(4)).join(', ')}]</pre>
                    </details>
                </div>
            )}

            {results?.length > 0 && (
                <div className="debug-section">
                    <div className="debug-label">Top 5 Nearest Neighbors (cosine)</div>
                    <table className="debug-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Distance</th>
                                <th>Similarity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.slice(0, 5).map((r, i) => (
                                <tr key={r.id}>
                                    <td>{i + 1}</td>
                                    <td className="mono">{r.id}</td>
                                    <td>{r.title}</td>
                                    <td className="mono">{r.distance?.toFixed(6)}</td>
                                    <td className="mono match-cell">{(r.similarity * 100).toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
