import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, BookOpen, Edit3, Trash2, X } from 'lucide-react';
import '../auth/RebuiltPages.css';

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
    <div className="rebuilt-page">
      <header className="rebuilt-page-header">
        <div>
          <p className="dash-eyebrow"><span /> ACADEMICS & ROSTERS</p>
          <h1>Classes & Subjects</h1>
          <p>Manage school classes, student capacity, homerooms, and subject offerings.</p>
        </div>

        <button className="rebuilt-btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Add Class
        </button>
      </header>

      {loading ? (
        <div className="rebuilt-empty-state">Loading classes…</div>
      ) : error ? (
        <div className="rebuilt-alert-error">{error}</div>
      ) : classes.length === 0 ? (
        <div className="rebuilt-empty-state">No classes created yet. Click "Add Class" to start.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {classes.map((c) => (
            <div key={c._id} className="rebuilt-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="dash-metric-icon tone-green" style={{ width: 32, height: 32, margin: 0 }}>
                    <BookOpen size={17} />
                  </div>
                  <h3 style={{ margin: 0, font: "400 22px/1.2 'DM Serif Display', serif" }}>{c.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="rebuilt-btn-secondary" style={{ padding: '6px 10px' }} onClick={() => openEditModal(c)} title="Edit class">
                    <Edit3 size={14} />
                  </button>
                  <button className="rebuilt-btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDelete(c._id)} title="Delete class">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--portal-muted)', marginBottom: '14px' }}>
                Homeroom: <strong style={{ color: 'var(--portal-ink)' }}>{c.homeroom || 'N/A'}</strong> · Enrolled: <strong style={{ color: 'var(--portal-ink)' }}>{c.students?.length || 0} / {c.capacity}</strong>
              </div>

              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: 'var(--portal-muted)', textTransform: 'uppercase' }}>Subjects:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {c.subjects?.map((sub, i) => (
                    <span key={i} className="rebuilt-badge rebuilt-badge-excused">{sub}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="rebuilt-modal-overlay">
          <div className="rebuilt-modal">
            <div className="rebuilt-modal-head">
              <h2>{editingId ? 'Edit Class' : 'Create New Class'}</h2>
              <button className="rebuilt-modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            {formErr && <div className="rebuilt-alert-error">{formErr}</div>}

            <form onSubmit={handleSubmit} className="portal-form" style={{ marginTop: 0 }}>
              <label>Class Name</label>
              <input type="text" required placeholder="e.g. JSS1A" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

              <div className="rebuilt-form-row">
                <div>
                  <label>Capacity</label>
                  <input type="number" required min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                </div>
                <div>
                  <label>Homeroom</label>
                  <input type="text" placeholder="e.g. Room 12" value={form.homeroom} onChange={(e) => setForm({ ...form, homeroom: e.target.value })} />
                </div>
              </div>

              <label className="portal-spaced-label">Subjects (comma separated)</label>
              <input type="text" required placeholder="Mathematics, English, Basic Science" value={form.subjectsStr} onChange={(e) => setForm({ ...form, subjectsStr: e.target.value })} />

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="rebuilt-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="rebuilt-btn-primary">{editingId ? 'Update Class' : 'Create Class'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
