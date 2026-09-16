import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MyAttendance = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user?.studentProfile) return;
    api.get(`/attendance/student/${user.studentProfile}`).then(({ data }) => setData(data));
  }, [user]);

  if (!data) return <p>Loading attendance…</p>;

  return (
    <div>
      <h1>My Attendance</h1>
      <div className="stat-grid">
        <div className="stat-card"><span className="stat-label">Attendance Rate</span><span className="stat-value">{data.summary.percentage}%</span></div>
        <div className="stat-card"><span className="stat-label">Days Present</span><span className="stat-value">{data.summary.present}</span></div>
        <div className="stat-card"><span className="stat-label">Total Records</span><span className="stat-value">{data.summary.total}</span></div>
      </div>

      <div className="card">
        <h3>History</h3>
        {data.records.length === 0 && <p className="muted">No attendance records yet.</p>}
        <table className="data-table">
          <thead><tr><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {data.records.map((r) => (
              <tr key={r._id}><td>{new Date(r.date).toLocaleDateString()}</td><td><span className={`pill ${r.status}`}>{r.status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyAttendance;
