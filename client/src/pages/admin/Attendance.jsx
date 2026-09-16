import { useEffect, useState } from 'react';
import api from '../../services/api';

const statuses = ['present', 'absent', 'late', 'excused'];

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.get('/classes').then(({ data }) => setClasses(data)); }, []);

  useEffect(() => {
    if (!classId) { setStudents([]); return; }
    api.get(`/classes/${classId}`).then(({ data }) => {
      setStudents(data.students || []);
      const initial = {};
      (data.students || []).forEach((s) => { initial[s._id] = 'present'; });
      setMarks(initial);
    });
    api.get(`/attendance/class/${classId}`, { params: { date } }).then(({ data }) => setHistory(data));
  }, [classId, date]);

  const handleSave = async () => {
    setSaved(false);
    const records = Object.entries(marks).map(([student, status]) => ({ student, status }));
    await api.post('/attendance', { classId, date, records });
    setSaved(true);
    api.get(`/attendance/class/${classId}`, { params: { date } }).then(({ data }) => setHistory(data));
  };

  return (
    <div>
      <h1>Attendance</h1>
      <div className="filter-bar">
        <select value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Select a class</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {classId && students.length > 0 && (
        <div className="card">
          <table className="data-table">
            <thead><tr><th>Student</th><th>Status</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.user?.name} <span className="muted">({s.admissionNumber})</span></td>
                  <td>
                    <select value={marks[s._id] || 'present'} onChange={(e) => setMarks({ ...marks, [s._id]: e.target.value })}>
                      {statuses.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn-primary" onClick={handleSave}>Save attendance</button>
          {saved && <span className="success"> Saved ✓</span>}
        </div>
      )}

      {classId && (
        <div className="card">
          <h3>Records for {date}</h3>
          {history.length === 0 && <p className="muted">No records saved for this date yet.</p>}
          <ul className="activity-list">
            {history.map((h) => (
              <li key={h._id}>{h.student?.user?.name || 'Student'} — <span className={`pill ${h.status}`}>{h.status}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Attendance;
