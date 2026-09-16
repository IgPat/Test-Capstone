import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CalendarCheck, Save, Check, X, Clock, HelpCircle } from 'lucide-react';

export default function AdminAttendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({}); // { [studentId]: 'present' | 'absent' | 'late' | 'excused' }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ error: '', success: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAttendance();
    }
  }, [selectedClass, date]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res || []);
      if (res.length) setSelectedClass(res[0]._id);
    } catch (err) {
      /* ignore */
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setMsg({ error: '', success: '' });

      // 1. Fetch all students belonging to the selected class
      const studentRes = await api.get(`/students?classId=${selectedClass}&limit=100`);
      const studentList = studentRes.data || studentRes.students || (Array.isArray(studentRes) ? studentRes : []);

      // 2. Fetch any existing attendance records for this class & date
      const attRes = await api.get(`/attendance/class/${selectedClass}?date=${date}`);
      const existingRecords = Array.isArray(attRes) ? attRes : [];

      const attMap = {};
      existingRecords.forEach((att) => {
        const sId = att.student?._id || att.student;
        if (sId) attMap[sId.toString()] = att.status;
      });

      const list = studentList.map((s) => ({
        _id: s._id,
        admissionNumber: s.admissionNumber,
        name: s.user?.name || 'Student',
      }));

      const initialMap = {};
      list.forEach((s) => {
        initialMap[s._id] = attMap[s._id.toString()] || 'present';
      });

      setStudents(list);
      setRecords(initialMap);
    } catch (err) {
      setMsg({ error: err.message || 'Failed to load attendance roster', success: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setRecords(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMsg({ error: '', success: '' });

      const payload = {
        classId: selectedClass,
        date,
        records: Object.keys(records).map((sId) => ({
          student: sId,
          status: records[sId],
        })),
      };

      await api.post('/attendance', payload);
      setMsg({ error: '', success: 'Attendance saved successfully!' });
    } catch (err) {
      setMsg({ error: err.message || 'Failed to save attendance', success: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1>Attendance Tracking</h1>
          <p className="muted">Mark and review daily attendance for each class.</p>
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={saving || !students.length}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      {msg.success && <div className="success-msg">{msg.success}</div>}
      {msg.error && <div className="error">{msg.error}</div>}

      <div className="card toolbar" style={{ background: '#fff', marginBottom: '16px' }}>
        <div className="filters">
          <label style={{ margin: 0 }}>Class:
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label style={{ margin: 0 }}>Date:
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        {students.length > 0 && (
          <div className="flex">
            <span className="muted" style={{ fontSize: '.84rem', fontWeight: 600 }}>Quick Mark:</span>
            <button className="btn-secondary btn-small" onClick={() => handleMarkAll('present')}>All Present</button>
            <button className="btn-secondary btn-small" onClick={() => handleMarkAll('absent')}>All Absent</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading class roster...</div>
      ) : students.length === 0 ? (
        <div className="card empty-state">No students enrolled in this class.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Adm. No</th>
                <th>Student Name</th>
                <th>Attendance Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const currentStatus = records[s._id] || 'present';
                return (
                  <tr key={s._id}>
                    <td><strong>{s.admissionNumber}</strong></td>
                    <td>{s.name}</td>
                    <td>
                      <div className="flex" style={{ gap: '8px' }}>
                        <button
                          className={`btn ${currentStatus === 'present' ? 'btn-primary' : 'btn-secondary'} btn-small`}
                          onClick={() => handleStatusChange(s._id, 'present')}
                        >
                          <Check size={14} /> Present
                        </button>

                        <button
                          className={`btn ${currentStatus === 'absent' ? 'btn-danger' : 'btn-secondary'} btn-small`}
                          onClick={() => handleStatusChange(s._id, 'absent')}
                        >
                          <X size={14} /> Absent
                        </button>

                        <button
                          className={`btn ${currentStatus === 'late' ? 'btn-primary' : 'btn-secondary'} btn-small`}
                          style={currentStatus === 'late' ? { background: 'var(--warning)', borderColor: 'var(--warning)' } : {}}
                          onClick={() => handleStatusChange(s._id, 'late')}
                        >
                          <Clock size={14} /> Late
                        </button>

                        <button
                          className={`btn ${currentStatus === 'excused' ? 'btn-primary' : 'btn-secondary'} btn-small`}
                          style={currentStatus === 'excused' ? { background: 'var(--ink-soft)', borderColor: 'var(--ink-soft)' } : {}}
                          onClick={() => handleStatusChange(s._id, 'excused')}
                        >
                          <HelpCircle size={14} /> Excused
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
