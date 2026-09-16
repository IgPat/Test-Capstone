import { useEffect, useState } from 'react';
import api from '../../services/api';

const emptyForm = {
  name: '', email: '', password: '', admissionNumber: '', dob: '', gender: '',
  contact: '', guardianName: '', guardianContact: '', classId: '',
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const loadClasses = () => api.get('/classes').then(({ data }) => setClasses(data));

  const loadStudents = () => {
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (classFilter) params.classId = classFilter;
    api.get('/students', { params }).then(({ data }) => {
      setStudents(data.data);
      setPages(data.pages || 1);
    });
  };

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { loadStudents(); }, [page, search, statusFilter, classFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/students', form);
      setShowForm(false);
      setForm(emptyForm);
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student');
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this student?')) return;
    await api.delete(`/students/${id}`);
    loadStudents();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Students</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {showForm && (
        <form className="card form-grid" onSubmit={handleCreate}>
          {error && <p className="error">{error}</p>}
          <label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Temp. password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <label>Admission number<input required value={form.admissionNumber} onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })} /></label>
          <label>Date of birth<input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></label>
          <label>Gender
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">—</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </label>
          <label>Contact<input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></label>
          <label>Guardian name<input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} /></label>
          <label>Guardian contact<input value={form.guardianContact} onChange={(e) => setForm({ ...form, guardianContact: e.target.value })} /></label>
          <label>Class
            <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
              <option value="">—</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </label>
          <button className="btn-primary" type="submit">Save student</button>
        </form>
      )}

      <div className="filter-bar">
        <input placeholder="Search by name or admission no." value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
        <select value={classFilter} onChange={(e) => { setPage(1); setClassFilter(e.target.value); }}>
          <option value="">All classes</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Admission #</th><th>Class</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.user?.name}</td>
              <td>{s.admissionNumber}</td>
              <td>{s.classId?.name || '—'}</td>
              <td><span className={`pill ${s.status}`}>{s.status}</span></td>
              <td>
                {s.status === 'active' && <button className="btn-danger-sm" onClick={() => handleDeactivate(s._id)}>Deactivate</button>}
              </td>
            </tr>
          ))}
          {students.length === 0 && <tr><td colSpan={5} className="muted">No students found.</td></tr>}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Students;
