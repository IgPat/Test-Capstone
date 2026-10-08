import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { fmtDate } from '../../utils/formatters';
import { Megaphone, Plus, Trash2, X } from 'lucide-react';
import '../auth/RebuiltPages.css';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all' });
  const [formErr, setFormErr] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr('');
    try {
      await api.post('/announcements', form);
      setShowModal(false);
      setForm({ title: '', body: '', audience: 'all' });
      fetchAnnouncements();
    } catch (err) {
      setFormErr(err.message || 'Failed to post announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.del(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="rebuilt-page">
      <header className="rebuilt-page-header">
        <div>
          <p className="dash-eyebrow"><span /> COMMUNICATION & NOTICES</p>
          <h1>Announcements</h1>
          <p>Broadcast school updates and notices to students and parents.</p>
        </div>

        <button className="rebuilt-btn-primary" onClick={() => { setFormErr(''); setShowModal(true); }}>
          <Plus size={16} /> Post Announcement
        </button>
      </header>

      {loading ? (
        <div className="rebuilt-empty-state">Loading announcements…</div>
      ) : error ? (
        <div className="rebuilt-alert-error">{error}</div>
      ) : announcements.length === 0 ? (
        <div className="rebuilt-empty-state">No announcements posted yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {announcements.map((a) => (
            <div key={a._id} className="rebuilt-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="dash-notice-mark" style={{ width: 32, height: 32 }}>
                    <Megaphone size={16} />
                  </div>
                  <h3 style={{ margin: 0, font: "400 20px/1.2 'DM Serif Display', serif" }}>{a.title}</h3>
                </div>
                <button className="rebuilt-btn-danger" style={{ padding: '6px 9px' }} onClick={() => handleDelete(a._id)} title="Delete notice">
                  <Trash2 size={14} />
                </button>
              </div>

              <p style={{ color: 'var(--portal-muted)', lineHeight: '1.6', fontSize: '13px', margin: '10px 0 16px' }}>{a.body}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderTop: '1px solid #edf0eb', paddingTop: '12px' }}>
                <span style={{ color: '#8fa095' }}>Posted: {fmtDate(a.createdAt)}</span>
                <span className="rebuilt-badge rebuilt-badge-excused" style={{ textTransform: 'capitalize' }}>Audience: {a.audience}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {showModal && (
        <div className="rebuilt-modal-overlay">
          <div className="rebuilt-modal">
            <div className="rebuilt-modal-head">
              <h2>New Announcement</h2>
              <button className="rebuilt-modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            {formErr && <div className="rebuilt-alert-error">{formErr}</div>}

            <form onSubmit={handleSubmit} className="portal-form" style={{ marginTop: 0 }}>
              <label>Title</label>
              <input type="text" required placeholder="e.g. End of Term Examination Schedule" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

              <label className="portal-spaced-label">Announcement Body</label>
              <textarea required rows={4} placeholder="Write your notice content here..." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} style={{ padding: '10px 13px', minHeight: '90px' }} />

              <label className="portal-spaced-label">Target Audience</label>
              <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="all">Everyone (All Students & Staff)</option>
                <option value="students">Students Only</option>
              </select>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="rebuilt-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="rebuilt-btn-primary">Post Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
