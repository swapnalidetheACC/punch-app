import React, { useEffect, useState } from 'react';

function formatLocal(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function App() {
  const [punches, setPunches] = useState([]);
  const [manualMode, setManualMode] = useState(false);
  const [manualTime, setManualTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadPunches() {
    const res = await fetch('/api/punches');
    const data = await res.json();
    setPunches(data);
  }

  async function handlePunch() {
    setError('');
    let timestamp;
    let source;
    if (manualMode) {
      if (!manualTime) {
        setError('Enter time first');
        return;
      }
      timestamp = new Date(manualTime).toISOString();
      source = 'manual';
    } else {
      timestamp = new Date().toISOString();
      source = 'local';
    }
    setLoading(true);
    await fetch('/api/punch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp, source })
    });
    setLoading(false);
    setManualTime('');
    loadPunches();
  }

  useEffect(() => { loadPunches(); }, []);

  return (
    <div className="container">
      <h1>Punch In</h1>
      <div className="card">
        <label>
          <input
            type="checkbox"
            checked={manualMode}
            onChange={e => setManualMode(e.target.checked)}
          />
          Enter manually
        </label>
        {manualMode && (
          <input
            type="datetime-local"
            value={manualTime}
            onChange={e => setManualTime(e.target.value)}
          />
        )}
        <button onClick={handlePunch} disabled={loading}>
          {loading ? 'Saving…' : 'Punch In'}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      <h2>My Punches</h2>
      {punches.map(p => (
        <div key={p.id} className="list-item">
          <strong>{formatLocal(p.timestamp)}</strong>
          <div className="meta">
            {p.source} | recorded {formatLocal(p.recordedAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
