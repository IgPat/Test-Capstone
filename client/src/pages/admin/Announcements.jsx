import { useEffect, useState } from 'react';
import api from '../../services/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all' });
  const [error, setError] = useState('');

  const load = () => api.get('/announcements').then(({ data }) => setAnnouncements(data));
  useEffect(() => { load(); api.get('/classes').then(({ data }) => setClasses(data)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/announcements', form);
      setForm({ title: '', body: '', audience: 'all' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  return (
    <div>
      <h1>Announcements</h1>
      <form className="card form-grid" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label>Audience
          <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
            <option value="all">All students</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </label>
        <label className="full-width">Body
          <textarea required rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </label>
        <button className="btn-primary" type="submit">Post announcement</button>
      </form>

      <div className="card">
        {announcements.map((a) => (
          <div key={a._id} className="announcement-item">
            <div className="announcement-header">
              <strong>{a.title}</strong>
              <button className="btn-danger-sm" onClick={() => handleDelete(a._id)}>Delete</button>
            </div>
            <p>{a.body}</p>
            <span className="muted">{new Date(a.createdAt).toLocaleString()}</span>
          </div>
        ))}
        {announcements.length === 0 && <p className="muted">No announcements yet.</p>}
      </div>
    </div>
  );
};

export default Announcements;
