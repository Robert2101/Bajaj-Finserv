import React, { useState } from 'react';

export default function App() {
  const [inputData, setInputData] = useState('["A->B", "A->C", "B->D", "hello"]');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => { 
    setError(null);
    setResponse(null);
    setLoading(true);

    let parsedData;
    try {
      parsedData = JSON.parse(inputData);
      if (!Array.isArray(parsedData)) throw new Error();
    } catch (err) {
      setError("Invalid JSON format. Please provide a valid string array."); 
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/bfhl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsedData })
      });

      if (!res.ok) throw new Error("API responded with an error.");

      const result = await res.json();
      setResponse(result);
    } catch (err) {
      setError("Failed to fetch from API. Ensure the backend is running and CORS is enabled.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>SRM Full Stack Challenge</h1>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Enter Node List (JSON Array):
        </label>
        <textarea
          rows={6}
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: '15px', padding: '10px 20px', cursor: 'pointer', background: '#007BFF', color: '#FFF', border: 'none', borderRadius: '4px' }}
      >
        {loading ? 'Processing...' : 'Submit'}
      </button>

      {error && (
        <div style={{ marginTop: '20px', color: 'red', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: '30px', background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h2>Analysis Results</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: '#fff', padding: '15px', border: '1px solid #ddd', borderRadius: '6px' }}>
              <h3>Identity</h3>
              <p><strong>User:</strong> {response.user_id}</p>
              <p><strong>Email:</strong> {response.email_id}</p>
              <p><strong>Roll:</strong> {response.college_roll_number}</p>
            </div>

            <div style={{ background: '#fff', padding: '15px', border: '1px solid #ddd', borderRadius: '6px' }}>
              <h3>Summary</h3>
              <p><strong>Total Trees:</strong> {response.summary.total_trees}</p>
              <p><strong>Total Cycles:</strong> {response.summary.total_cycles}</p>
              <p><strong>Largest Tree Root:</strong> {response.summary.largest_tree_root || 'N/A'}</p>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '15px', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '20px' }}>
            <h3>Hierarchies</h3>
            <pre style={{ overflowX: 'auto' }}>
              {JSON.stringify(response.hierarchies, null, 2)}
            </pre>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', padding: '15px', border: '1px solid #ffcccc', borderRadius: '6px' }}>
              <h3 style={{ color: '#d9534f' }}>Invalid Entries</h3>
              <ul>
                {response.invalid_entries.length > 0
                  ? response.invalid_entries.map((entry, idx) => <li key={idx}>"{entry}"</li>)
                  : <li>None</li>}
              </ul>
            </div>

            <div style={{ background: '#fff', padding: '15px', border: '1px solid #ffeeba', borderRadius: '6px' }}>
              <h3 style={{ color: '#f0ad4e' }}>Duplicate Edges</h3>
              <ul>
                {response.duplicate_edges.length > 0
                  ? response.duplicate_edges.map((edge, idx) => <li key={idx}>"{edge}"</li>)
                  : <li>None</li>}
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}