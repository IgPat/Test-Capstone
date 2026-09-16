import { useEffect, useState } from 'react';
import api from '../../services/api';

const Grades = () => {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [form, setForm] = useState({ subject: '', term: 'Term 1', score: '', maxScore: 100, remark: '' });
  const [reportCard, setReportCard] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/classes').then(({ data }) => setClasses(data)); }, []);

  useEffect(() => {
    if (!classId) { setStudents([]); return; }
    api.get(`/classes/${classId}`).then(({ data }) => setStudents(data.students || []));
  }, [classId]);

  const loadReportCard = (id) => {
    api.get(`/grades/student/${id}`).then(({ data }) => setReportCard(data));
  };

  useEffect(() => { if (studentId) loadReportCard(studentId); else setReportCard([]); }, [studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/grades', { ...form, student: studentId, score: Number(form.score), maxScore: Number(form.maxScore) });
      setForm({ subject: '', term: form.term, score: '', maxScore: 100, remark: '' });
      loadReportCard(studentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save grade');
    }
  };

  return (
    <div>
      <h1>Grades & Report Cards</h1>
      <div className="filter-bar">
        <select value={classId} onChange={(e) => { setClassId(e.target.value); setStudentId(''); }}>
          <option value="">Select a class</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={!students.length}>
          <option value="">Select a student</option>
          {students.map((s) => <option key={s._id} value={s._id}>{s.user?.name} ({s.admissionNumber})</option>)}
        </select>
      </div>

      {studentId && (
        <>
          <form className="card form-grid" onSubmit={handleSubmit}>
            {error && <p className="error">{error}</p>}
            <label>Subject<input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
            <label>Term
              <select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}>
                <option>Term 1</option><option>Term 2</option><option>Term 3</option>
              </select>
            </label>
            <label>Score<input type="number" required value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} /></label>
            <label>Max score<input type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} /></label>
            <label>Remark<input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} /></label>
            <button className="btn-primary" type="submit">Save grade</button>
          </form>

          <div className="card">
            <h3>Report card</h3>
            {reportCard.length === 0 && <p className="muted">No grades recorded yet.</p>}
            {reportCard.map((t) => (
              <div key={t.term} className="report-term">
                <h4>{t.term} — Average {t.average}% ({t.grade})</h4>
                <table className="data-table">
                  <thead><tr><th>Subject</th><th>Score</th><th>%</th><th>Remark</th></tr></thead>
                  <tbody>
                    {t.subjects.map((s) => (
                      <tr key={s.subject}><td>{s.subject}</td><td>{s.score}/{s.maxScore}</td><td>{s.percentage}%</td><td>{s.remark || '—'}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Grades;
