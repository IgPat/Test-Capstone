import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { fmtMoney, fmtDate } from '../../utils/formatters';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Calendar, CreditCard, GraduationCap, Megaphone } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      setLoading(true);
      const data = await api.get('/dashboard/student');
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load student dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading your dashboard…</div>;
  if (error) return <div className="error">{error}</div>;

  const presentRate = stats.attendancePercentage || 0;
  const absentRate = Math.max(0, 100 - presentRate);

  const attendanceChartData = {
    labels: ['Present (%)', 'Absent / Unmarked (%)'],
    datasets: [
      {
        data: [presentRate, absentRate],
        backgroundColor: ['#1a9c5f', '#e2e8f0'],
      },
    ],
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  return (
    <div>
      <h1>Welcome back, {firstName} 👋</h1>
      <p className="muted">Here's how things are looking right now.</p>

      <div className="grid grid-4" style={{ marginTop: '16px' }}>
        <div className="card stat-card">
          <div className="flex-between">
            <span className="stat-label">Attendance</span>
            <Calendar size={20} className="muted" />
          </div>
          <span className="stat-value">{stats.attendancePercentage}%</span>
          <div className="progress-bar" style={{ marginTop: '6px' }}>
            <div style={{ width: `${stats.attendancePercentage}%` }}></div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="flex-between">
            <span className="stat-label">Fee balance</span>
            <CreditCard size={20} className="muted" />
          </div>
          <span className="stat-value">{fmtMoney(stats.feeBalance)}</span>
          <span className="stat-sub">{stats.feeBalance > 0 ? 'Outstanding' : 'All settled'}</span>
        </div>

        <div className="card stat-card">
          <div className="flex-between">
            <span className="stat-label">Grades recorded</span>
            <GraduationCap size={20} className="muted" />
          </div>
          <span className="stat-value">{stats.latestGrades?.length || 0}</span>
          <span className="stat-sub">Most recent entries</span>
        </div>

        <div className="card stat-card">
          <div className="flex-between">
            <span className="stat-label">Announcements</span>
            <Megaphone size={20} className="muted" />
          </div>
          <span className="stat-value">{stats.announcements?.length || 0}</span>
          <span className="stat-sub">Latest school-wide posts</span>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '20px' }}>
        <div className="card">
          <h3>Attendance breakdown</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut data={attendanceChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        <div className="card">
          <h3>Latest grades</h3>
          {!stats.latestGrades?.length ? (
            <div className="empty-state">No grades recorded yet.</div>
          ) : (
            stats.latestGrades.map((g) => (
              <div key={g._id} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span><strong>{g.subject}</strong> <span className="muted">({g.term})</span></span>
                <strong>{g.score} / {g.maxScore}</strong>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Recent announcements</h3>
        {!stats.announcements?.length ? (
          <div className="empty-state">No announcements yet.</div>
        ) : (
          stats.announcements.map((a) => (
            <div key={a._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <strong>{a.title}</strong>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: '.88rem' }}>{a.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
