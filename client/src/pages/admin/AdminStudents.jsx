import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserPlus, Search, Edit3, Key, Trash2, X } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Form states
  const [addForm, setAddForm] = useState({ name: '', email: '', gender: 'female', classId: '', password: '' });
  const [editForm, setEditForm] = useState({ id: '', name: '', email: '', gender: 'female', classId: '', status: 'active' });
  const [resetData, setResetData] = useState({ id: '', studentName: '', newPassword: '' });
  const [formMsg, setFormMsg] = useState({ error: '', success: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, search, classFilter]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res || []);
    } catch (err) {
      /* ignore */
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        limit,
        search,
        classId: classFilter,
      }).toString();
      const res = await api.get(`/students?${query}`);
      setStudents(res.data || res.students || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormMsg({ error: '', success: '' });
    try {
      await api.post('/students', addForm);
      setFormMsg({ error: '', success: 'Student created successfully!' });
      setShowAddModal(false);
      setAddForm({ name: '', email: '', gender: 'female', classId: '', password: '' });
      fetchStudents();
    } catch (err) {
      setFormMsg({ error: err.message, success: '' });
    }
  };

  const openEditModal = (s) => {
    setEditForm({
      id: s._id,
      name: s.user?.name || '',
      email: s.user?.email || '',
      gender: s.gender || 'female',
      classId: s.classId?._id || s.classId || '',
      status: s.status || 'active',
    });
    setFormMsg({ error: '', success: '' });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormMsg({ error: '', success: '' });
    try {
      await api.put(`/students/${editForm.id}`, {
        name: editForm.name,
        email: editForm.email,
        gender: editForm.gender,
        classId: editForm.classId,
        status: editForm.status,
      });
      setShowEditModal(false);
      fetchStudents();
    } catch (err) {
      setFormMsg({ error: err.message, success: '' });
    }
  };

  const openResetModal = (s) => {
    setResetData({ id: s._id, studentName: s.user?.name || 'Student', newPassword: '' });
    setFormMsg({ error: '', success: '' });
    setShowResetModal(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setFormMsg({ error: '', success: '' });
    try {
      const res = await api.put(`/students/${resetData.id}/reset-password`);
      setResetData((prev) => ({ ...prev, newPassword: res.temporaryPassword || 'Reset successful' }));
    } catch (err) {
      setFormMsg({ error: err.message, success: '' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student profile?')) return;
    try {
      await api.del(`/students/${id}`);
      fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1>Student Management</h1>
          <p className="muted">View, create, edit, and reset passwords for students.</p>
        </div>

        <button className="btn-primary" onClick={() => { setFormMsg({ error: '', success: '' }); setShowAddModal(true); }}>
          <UserPlus size={18} /> Add Student
        </button>
      </div>

      <div className="card toolbar" style={{ marginBottom: '16px', background: '#fff' }}>
        <div className="filters">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name or admission..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: '34px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '13px', color: 'var(--ink-soft)' }} />
          </div>

          <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}>
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <span className="muted" style={{ fontSize: '.88rem' }}>Total: <strong>{total}</strong> students</span>
      </div>

      {loading ? (
        <div className="loading">Loading students...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : students.length === 0 ? (
        <div className="card empty-state">No students found.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Adm. No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td><strong>{s.admissionNumber}</strong></td>
                  <td>{s.user?.name}</td>
                  <td>{s.user?.email}</td>
                  <td>{s.classId?.name || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{s.gender}</td>
                  <td>
                    <span className={`pill ${s.status === 'active' ? 'pill-active' : 'pill-inactive'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-secondary btn-small" onClick={() => openEditModal(s)} title="Edit">
                        <Edit3 size={14} />
                      </button>
                      <button className="btn-secondary btn-small" onClick={() => openResetModal(s)} title="Reset Password">
                        <Key size={14} />
                      </button>
                      <button className="btn-danger btn-small" onClick={() => handleDelete(s._id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Student</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>

            {formMsg.error && <div className="error">{formMsg.error}</div>}

            <form onSubmit={handleAddSubmit}>
              <label>Full Name
                <input type="text" required placeholder="e.g. John Smith" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              </label>

              <label style={{ marginTop: '10px' }}>Email Address
                <input type="email" required placeholder="e.g. john@school.test" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
              </label>

              <div className="form-row" style={{ marginTop: '10px' }}>
                <label>Gender
                  <select value={addForm.gender} onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </label>

                <label>Class
                  <select value={addForm.classId} onChange={(e) => setAddForm({ ...addForm, classId: e.target.value })}>
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label style={{ marginTop: '10px' }}>Initial Password
                <input type="password" required placeholder="At least 6 characters" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} />
              </label>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Student</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>

            {formMsg.error && <div className="error">{formMsg.error}</div>}

            <form onSubmit={handleEditSubmit}>
              <label>Full Name
                <input type="text" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </label>

              <label style={{ marginTop: '10px' }}>Email Address
                <input type="email" required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </label>

              <div className="form-row" style={{ marginTop: '10px' }}>
                <label>Gender
                  <select value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </label>

                <label>Class
                  <select value={editForm.classId} onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })}>
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label style={{ marginTop: '10px' }}>Status
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button className="modal-close" onClick={() => setShowResetModal(false)}><X size={20} /></button>
            </div>

            <p className="muted">Generate a new temporary password for <strong>{resetData.studentName}</strong>.</p>

            {formMsg.error && <div className="error">{formMsg.error}</div>}

            {resetData.newPassword ? (
              <div className="success-msg" style={{ margin: '16px 0' }}>
                <strong>New Password Generated:</strong>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '6px' }}>{resetData.newPassword}</div>
              </div>
            ) : null}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowResetModal(false)}>Close</button>
              {!resetData.newPassword && (
                <button type="button" className="btn-primary" onClick={handleResetSubmit}>Generate Password</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
