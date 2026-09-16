import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { fmtDate } from '../../utils/formatters';
import { CalendarCheck } from 'lucide-react';

export default function StudentAttendance() {
  const [history, setHistory] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/my-history');
      setHistory(res.records || res.history || res || []);
      setPercentage(res.attendancePercentage || 0);
    } catch (err) {
      setError(err.message || 'Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1>My Attendance History</h1>
          <p className="muted">Track your daily class attendance records.</p>
        </div>

        <div className="card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CalendarCheck size={22} style={{ color: 'var(--primary)' }} />
          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--ink-soft)', fontWeight: 700, textTransform: 'uppercase' }}>Overall Attendance</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>{percentage}%</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading attendance records…</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : history.length === 0 ? (
        <div className="card empty-state">No attendance records found.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => {
                const statusClass =
                  r.status === 'present' ? 'pill-present' : r.status === 'absent' ? 'pill-absent' : r.status === 'late' ? 'pill-late' : 'pill-excused';
                return (
                  <tr key={r._id || i}>
                    <td><strong>{fmtDate(r.date)}</strong></td>
                    <td>{r.classId?.name || 'My Class'}</td>
                    <td>
                      <span className={`pill ${statusClass}`} style={{ textTransform: 'capitalize' }}>
                        {r.status}
                      </span>
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
