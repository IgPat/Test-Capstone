import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { GraduationCap, Plus, Trash2, X } from 'lucide-react';

export default function AdminGrades() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: '', score: 85, maxScore: 100, term: 'Term 1', academicYear: '2025/2026' });
  const [subjects, setSubjects] = useState([]);
  const [msg, setMsg] = useState({ error: '', success: '' });

  useEffect(() => {
    fetchClasses();
  }, []);



  useEffect(() => {
    if (selectedStudent) {
      fetchStudentGrades(selectedStudent);
    }
  }, [selectedStudent]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      const classList = res || [];
      setClasses(classList);
      if (classList.length) {
        const first = classList[0];
        setSelectedClass(first._id);
        const subs = first.subjects || [];
        setSubjects(subs);
        setForm((f) => ({ ...f, subject: subs[0] || 'Mathematics' }));
        fetchStudents(first._id, first); // pass class object directly
      }
    } catch (e) {
      /* ignore */
    }
  };

  // classObj can be passed directly to avoid reading stale `classes` state
  const fetchStudents = async (cId, classObj) => {
    try {
      const res = await api.get(`/students?classId=${cId}&limit=100`);
      const list = res.data || res.students || (Array.isArray(res) ? res : []);
      setStudents(list);
      if (list.length) setSelectedStudent(list[0]._id);
      else {
        setSelectedStudent('');
        setGrades([]);
      }
      // Use the passed classObj first, fall back to searching classes state
      const c = classObj || classes.find((cl) => cl._id === cId);
      if (c) {
        const subs = c.subjects || [];
        setSubjects(subs);
        setForm((f) => ({ ...f, subject: subs[0] || f.subject || 'Mathematics' }));
      }
    } catch (e) {
      /* ignore */
    }
  };

  const fetchStudentGrades = async (sProfileId) => {
    try {
      setLoading(true);
      // ?flat=1 returns a plain array; without it the endpoint returns grouped report-card data
      const res = await api.get(`/grades/student/${sProfileId}`, { flat: '1' });
      setGrades(Array.isArray(res) ? res : []);
    } catch (err) {
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGrade = async (e) => {
    e.preventDefault();
    setMsg({ error: '', success: '' });
    try {
      await api.post('/grades', {
        student: selectedStudent,   // backend expects 'student', not 'studentId'
        subject: form.subject,
        term: form.term,
        academicYear: form.academicYear,
        score: Number(form.score),
        maxScore: Number(form.maxScore),
      });
      setShowModal(false);
      fetchStudentGrades(selectedStudent);
    } catch (err) {
      setMsg({ error: err.message, success: '' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grade record?')) return;
    try {
      await api.del(`/grades/${id}`);
      fetchStudentGrades(selectedStudent);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1>Grade Entry</h1>
          <p className="muted">Enter and manage term subject scores for students.</p>
        </div>

        <button className="btn-primary" onClick={() => { setMsg({ error: '', success: '' }); setShowModal(true); }} disabled={!selectedStudent}>
          <Plus size={18} /> Record Grade
        </button>
      </div>

      <div className="card toolbar" style={{ background: '#fff', marginBottom: '16px' }}>
        <div className="filters">
          <label style={{ margin: 0 }}>Class:
            <select value={selectedClass} onChange={(e) => {
              const cId = e.target.value;
              setSelectedClass(cId);
              const c = classes.find((cl) => cl._id === cId);
              fetchStudents(cId, c);
            }}>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label style={{ margin: 0 }}>Student:
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} disabled={!students.length}>
              {students.length === 0 ? (
                <option value="">No students in class</option>
              ) : (
                students.map((s) => (
                  <option key={s._id} value={s._id}>{s.user?.name} ({s.admissionNumber})</option>
                ))
              )}
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading grades...</div>
      ) : !selectedStudent ? (
        <div className="card empty-state">Select a class and student to view or add grades.</div>
      ) : grades.length === 0 ? (
        <div className="card empty-state">No grades recorded for this student yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Term</th>
                <th>Academic Year</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => {
                const pct = Math.round((g.score / g.maxScore) * 100);
                return (
                  <tr key={g._id}>
                    <td><strong>{g.subject}</strong></td>
                    <td>{g.term}</td>
                    <td>{g.academicYear}</td>
                    <td>{g.score} / {g.maxScore}</td>
                    <td>
                      <span className={`pill ${pct >= 70 ? 'pill-active' : pct >= 50 ? 'pill-late' : 'pill-inactive'}`}>
                        {pct}%
                      </span>
                    </td>
                    <td>
                      <button className="btn-danger btn-small" onClick={() => handleDelete(g._id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Record Grade</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            {msg.error && <div className="error">{msg.error}</div>}

            <form onSubmit={handleCreateGrade}>
              <label>Subject
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                  {subjects.length > 0 ? (
                    subjects.map((sub, i) => (
                      <option key={i} value={sub}>{sub}</option>
                    ))
                  ) : (
                    <>
                      <option value="Mathematics">Mathematics</option>
                      <option value="English">English</option>
                      <option value="Basic Science">Basic Science</option>
                    </>
                  )}
                </select>
              </label>

              <div className="form-row" style={{ marginTop: '10px' }}>
                <label>Score
                  <input type="number" required min={0} max={form.maxScore} value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
                </label>

                <label>Max Score
                  <input type="number" required min={1} value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
                </label>
              </div>

              <div className="form-row" style={{ marginTop: '10px' }}>
                <label>Term
                  <select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}>
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </label>

                <label>Academic Year
                  <input type="text" required value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
                </label>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
