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
    <div className="rebuilt-page">
      <div className="rebuilt-page-header">
        <div>
          <h1 className="rebuilt-page-title">School Announcements</h1>
          <p className="rebuilt-page-subtitle">Official updates and news from the school administration.</p>
        </div>
      </div>

      {loading ? (
        <div className="rebuilt-loading-state">Loading announcements…</div>
      ) : error ? (
        <div className="rebuilt-alert rebuilt-alert-error">{error}</div>
      ) : announcements.length === 0 ? (
        <div className="rebuilt-card rebuilt-empty-state">No announcements posted.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.map((a) => (
            <div key={a._id} className="rebuilt-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div className="dash-notice-mark" style={{ marginTop: '2px', background: 'rgba(33, 73, 61, 0.1)', color: 'var(--portal-primary)', padding: '10px', borderRadius: '10px' }}>
                <Megaphone size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--portal-font-serif)', fontSize: '1.2rem', color: 'var(--portal-text-dark)', margin: '0 0 8px', fontWeight: 700 }}>
                  {a.title}
                </h3>

                <p style={{ color: 'var(--portal-text-dark)', opacity: 0.88, lineHeight: '1.6', margin: '0 0 14px', fontSize: '.92rem' }}>
                  {a.body}
                </p>

                <div style={{ fontSize: '.8rem', color: 'var(--portal-text-muted)', borderTop: '1px dashed #e1e7df', paddingTop: '10px' }}>
                  Posted on <strong>{fmtDate(a.createdAt)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
