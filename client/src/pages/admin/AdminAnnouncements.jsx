import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { fmtDate } from '../../utils/formatters';
import { Megaphone, Plus, Trash2, X } from 'lucide-react';

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
    <div>
      <div className="toolbar">
        <div>
          <h1>Announcements</h1>
          <p className="muted">Broadcast school updates and notices to students and parents.</p>
        </div>

        <button className="btn-primary" onClick={() => { setFormErr(''); setShowModal(true); }}>
          <Plus size={18} /> Post Announcement
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading announcements...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : announcements.length === 0 ? (
        <div className="card empty-state">No announcements posted yet.</div>
      ) : (
        <div className="grid">
          {announcements.map((a) => (
            <div key={a._id} className="card">
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <div className="flex">
                  <Megaphone size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ margin: 0 }}>{a.title}</h3>
                </div>
                <button className="btn-danger btn-small" onClick={() => handleDelete(a._id)}><Trash2 size={14} /></button>
              </div>

              <p style={{ color: 'var(--ink-soft)', lineHeight: '1.6', margin: '8px 0 12px' }}>{a.body}</p>

              <div className="flex-between" style={{ fontSize: '.78rem', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <span className="muted">Posted: {fmtDate(a.createdAt)}</span>
                <span className="pill pill-excused" style={{ textTransform: 'capitalize' }}>Audience: {a.audience}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>New Announcement</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            {formErr && <div className="error">{formErr}</div>}

            <form onSubmit={handleSubmit}>
              <label>Title
                <input type="text" required placeholder="e.g. End of Term Examination Schedule" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>

              <label style={{ marginTop: '10px' }}>Announcement Body
                <textarea required placeholder="Write your notice content here..." value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
              </label>

              <label style={{ marginTop: '10px' }}>Target Audience
                <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                  <option value="all">Everyone (All Students & Staff)</option>
                  <option value="students">Students Only</option>
                </select>
              </label>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Post Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
