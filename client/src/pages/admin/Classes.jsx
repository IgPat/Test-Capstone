import { useEffect, useState } from 'react';
import api from '../../services/api';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ name: '', subjects: '', capacity: 40, homeroom: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.get('/classes').then(({ data }) => setClasses(data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/classes', {
        ...form,
        subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setShowForm(false);
      setForm({ name: '', subjects: '', capacity: 40, homeroom: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create class');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this class?')) return;
    await api.delete(`/classes/${id}`);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Classes</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Class'}</button>
      </div>

      {showForm && (
        <form className="card form-grid" onSubmit={handleCreate}>
          {error && <p className="error">{error}</p>}
          <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="JSS1A" /></label>
          <label>Subjects (comma separated)<input value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} placeholder="Mathematics, English" /></label>
          <label>Capacity<input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></label>
          <label>Homeroom<input value={form.homeroom} onChange={(e) => setForm({ ...form, homeroom: e.target.value })} placeholder="Room 12" /></label>
          <button className="btn-primary" type="submit">Save class</button>
        </form>
      )}

      <table className="data-table">
        <thead><tr><th>Name</th><th>Subjects</th><th>Capacity</th><th>Enrolled</th><th>Homeroom</th><th></th></tr></thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.subjects?.join(', ') || '—'}</td>
              <td>{c.capacity}</td>
              <td>{c.students?.length || 0}</td>
              <td>{c.homeroom || '—'}</td>
              <td><button className="btn-danger-sm" onClick={() => handleDelete(c._id)}>Delete</button></td>
            </tr>
          ))}
          {classes.length === 0 && <tr><td colSpan={6} className="muted">No classes yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default Classes;
