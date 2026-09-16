import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, BookOpen, Edit3, Trash2, X } from 'lucide-react';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', capacity: 35, homeroom: '', subjectsStr: '' });
  const [formErr, setFormErr] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/classes');
      setClasses(res || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: '', capacity: 35, homeroom: '', subjectsStr: 'Mathematics, English, Basic Science' });
    setFormErr('');
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingId(c._id);
    setForm({
      name: c.name,
      capacity: c.capacity || 35,
      homeroom: c.homeroom || '',
      subjectsStr: (c.subjects || []).join(', '),
    });
    setFormErr('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr('');

    const subjects = form.subjectsStr.split(',').map((s) => s.trim()).filter(Boolean);
    const payload = {
      name: form.name,
      capacity: Number(form.capacity),
      homeroom: form.homeroom,
      subjects,
    };

    try {
      if (editingId) {
        await api.put(`/classes/${editingId}`, payload);
      } else {
        await api.post('/classes', payload);
      }
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      setFormErr(err.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    try {
      await api.del(`/classes/${id}`);
      fetchClasses();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1>Classes & Subjects</h1>
          <p className="muted">Manage school classes, student capacity, homerooms, and subject offerings.</p>
        </div>

        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Add Class
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading classes...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : classes.length === 0 ? (
        <div className="card empty-state">No classes created yet.</div>
      ) : (
        <div className="grid grid-2">
          {classes.map((c) => (
            <div key={c._id} className="card">
              <div className="flex-between" style={{ marginBottom: '10px' }}>
                <div className="flex">
                  <BookOpen size={20} className="text-primary" style={{ color: 'var(--primary)' }} />
                  <h3 style={{ margin: 0 }}>{c.name}</h3>
                </div>
                <div className="flex">
                  <button className="btn-secondary btn-small" onClick={() => openEditModal(c)}><Edit3 size={14} /></button>
                  <button className="btn-danger btn-small" onClick={() => handleDelete(c._id)}><Trash2 size={14} /></button>
                </div>
              </div>

              <div style={{ fontSize: '.88rem', color: 'var(--ink-soft)', marginBottom: '12px' }}>
                Homeroom: <strong>{c.homeroom || 'N/A'}</strong> · Enrolled: <strong>{c.students?.length || 0} / {c.capacity}</strong>
              </div>

              <div>
                <span className="muted" style={{ fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Subjects:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {c.subjects?.map((sub, i) => (
                    <span key={i} className="pill pill-excused">{sub}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Class' : 'Create New Class'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            {formErr && <div className="error">{formErr}</div>}

            <form onSubmit={handleSubmit}>
              <label>Class Name
                <input type="text" required placeholder="e.g. JSS1A" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>

              <div className="form-row" style={{ marginTop: '10px' }}>
                <label>Capacity
                  <input type="number" required min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                </label>

                <label>Homeroom
                  <input type="text" placeholder="e.g. Room 12" value={form.homeroom} onChange={(e) => setForm({ ...form, homeroom: e.target.value })} />
                </label>
              </div>

              <label style={{ marginTop: '10px' }}>Subjects (comma separated)
                <input type="text" required placeholder="Mathematics, English, Basic Science" value={form.subjectsStr} onChange={(e) => setForm({ ...form, subjectsStr: e.target.value })} />
              </label>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? 'Update Class' : 'Create Class'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
