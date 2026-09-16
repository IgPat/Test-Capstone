import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { fmtDate } from '../../utils/formatters';
import { Megaphone } from 'lucide-react';

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1>School Announcements</h1>
          <p className="muted">Official updates and news from the school administration.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading announcements…</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : announcements.length === 0 ? (
        <div className="card empty-state">No announcements posted.</div>
      ) : (
        <div className="grid">
          {announcements.map((a) => (
            <div key={a._id} className="card">
              <div className="flex" style={{ gap: '10px', marginBottom: '8px' }}>
                <Megaphone size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0 }}>{a.title}</h3>
              </div>

              <p style={{ color: 'var(--ink-soft)', lineHeight: '1.6', margin: '8px 0 12px' }}>{a.body}</p>

              <div style={{ fontSize: '.78rem', color: 'var(--ink-soft)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                Posted on <strong>{fmtDate(a.createdAt)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
