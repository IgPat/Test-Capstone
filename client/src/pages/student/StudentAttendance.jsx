import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { fmtDate } from '../../utils/formatters';
import { CalendarCheck } from 'lucide-react';
import '../auth/RebuiltPages.css';

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
    <div className="rebuilt-page">
      <header className="rebuilt-page-header">
        <div>
          <p className="dash-eyebrow"><span /> ACADEMIC PRESENCE</p>
          <h1>My Attendance History</h1>
          <p>Track your daily class attendance records.</p>
        </div>

        <div className="rebuilt-card" style={{ marginBottom: 0, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="dash-metric-icon tone-green" style={{ width: 34, height: 34, margin: 0 }}>
            <CalendarCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: 'var(--portal-muted)', textTransform: 'uppercase' }}>Overall Attendance</div>
            <div style={{ font: "400 24px/1 'DM Serif Display', serif", color: 'var(--portal-green)' }}>{percentage}%</div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="rebuilt-empty-state">Loading attendance records…</div>
      ) : error ? (
        <div className="rebuilt-alert-error">{error}</div>
      ) : history.length === 0 ? (
        <div className="rebuilt-empty-state">No attendance records found for your account.</div>
      ) : (
        <div className="rebuilt-table-wrap">
          <table className="rebuilt-table">
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
                  r.status === 'present' ? 'rebuilt-badge-present' : r.status === 'absent' ? 'rebuilt-badge-absent' : r.status === 'late' ? 'rebuilt-badge-late' : 'rebuilt-badge-excused';
                return (
                  <tr key={r._id || i}>
                    <td><strong>{fmtDate(r.date)}</strong></td>
                    <td>{r.classId?.name || 'My Class'}</td>
                    <td>
                      <span className={`rebuilt-badge ${statusClass}`}>
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
