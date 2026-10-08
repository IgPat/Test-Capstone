import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { GraduationCap, Plus, Trash2, X } from 'lucide-react';
import '../auth/RebuiltPages.css';

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
        fetchStudents(first._id, first);
      }
    } catch (e) {
      /* ignore */
    }
  };

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
        student: selectedStudent,
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
    <div className="rebuilt-page">
      <header className="rebuilt-page-header">
        <div>
          <p className="dash-eyebrow"><span /> ACADEMICS & ASSESSMENTS</p>
          <h1>Grade Entry</h1>
          <p>Enter and manage term subject scores for students.</p>
        </div>

        <button className="rebuilt-btn-primary" onClick={() => { setMsg({ error: '', success: '' }); setShowModal(true); }} disabled={!selectedStudent}>
          <Plus size={16} /> Record Grade
        </button>
      </header>

      <div className="rebuilt-filter-bar">
        <div className="rebuilt-filter-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            Class:
            <select
              value={selectedClass}
              onChange={(e) => {
                const cId = e.target.value;
                setSelectedClass(cId);
                const c = classes.find((cl) => cl._id === cId);
                fetchStudents(cId, c);
              }}
              style={{ minWidth: 150 }}
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            Student:
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={!students.length}
              style={{ minWidth: 220 }}
            >
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
        <div className="rebuilt-empty-state">Loading grades…</div>
      ) : !selectedStudent ? (
        <div className="rebuilt-empty-state">Select a class and student to view or add grades.</div>
      ) : grades.length === 0 ? (
        <div className="rebuilt-empty-state">No grades recorded for this student yet.</div>
      ) : (
        <div className="rebuilt-table-wrap">
          <table className="rebuilt-table">
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
                const badgeClass = pct >= 70 ? 'rebuilt-badge-active' : pct >= 50 ? 'rebuilt-badge-partial' : 'rebuilt-badge-inactive';
                return (
                  <tr key={g._id}>
                    <td><strong>{g.subject}</strong></td>
                    <td>{g.term}</td>
                    <td>{g.academicYear}</td>
                    <td>{g.score} / {g.maxScore}</td>
                    <td>
                      <span className={`rebuilt-badge ${badgeClass}`}>
                        {pct}%
                      </span>
                    </td>
                    <td>
                      <button className="rebuilt-btn-danger" style={{ padding: '6px 9px' }} onClick={() => handleDelete(g._id)} title="Delete grade">
                        <Trash2 size={14} />
                      </button>
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
        <div className="rebuilt-modal-overlay">
          <div className="rebuilt-modal">
            <div className="rebuilt-modal-head">
              <h2>Record Grade</h2>
              <button className="rebuilt-modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            {msg.error && <div className="rebuilt-alert-error">{msg.error}</div>}

            <form onSubmit={handleCreateGrade} className="portal-form" style={{ marginTop: 0 }}>
              <label>Subject</label>
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

              <div className="rebuilt-form-row">
                <div>
                  <label>Score</label>
                  <input type="number" required min={0} max={form.maxScore} value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
                </div>
                <div>
                  <label>Max Score</label>
                  <input type="number" required min={1} value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
                </div>
              </div>

              <div className="rebuilt-form-row">
                <div>
                  <label>Term</label>
                  <select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}>
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
                <div>
                  <label>Academic Year</label>
                  <input type="text" required value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="rebuilt-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="rebuilt-btn-primary">Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
