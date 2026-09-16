import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { fmtMoney, fmtDate } from '../../utils/formatters';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Users, BookOpen, Calendar, CreditCard, Megaphone } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.get('/dashboard/admin');
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard data…</div>;
  if (error) return <div className="error">{error}</div>;

  const feesChartData = {
    labels: ['Collected', 'Outstanding'],
    datasets: [
      {
        data: [stats.feesCollected || 0, stats.feesOutstanding || 0],
        backgroundColor: ['#1a9c5f', '#d64545'],
      },
    ],
  };

  const attendanceChartData = {
    labels: ['Present today'],
    datasets: [
      {
        label: '%',
        data: [stats.attendanceRateToday || 0],
        backgroundColor: '#2b59ff',
      },
    ],
  };

  const barOptions = {
    scales: { y: { min: 0, max: 100 } },
    plugins: { legend: { display: false } },
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p className="muted">A school-wide snapshot, updated live from the database.</p>

      <div className="grid grid-4" style={{ marginTop: '16px' }}>
        <div className="card stat-card">
          <div className="flex-between">
            <span className="stat-label">Total students</span>
            <Users size={20} className="muted" />
          </div>
          <span className="stat-value">{stats.totalStudents}</span>
          <span className="stat-sub">Active enrolments</span>
        </div>

        <div className="card stat-card">
          <div className="flex-between">
            <span className="stat-label">Total classes</span>
            <BookOpen size={20} className="muted" />
          </div>
          <span className="stat-value">{stats.totalClasses}</span>
          <span className="stat-sub">Across the school</span>
        </div>

        <div className="card stat-card">
          <div className="flex-between">
            <span className="stat-label">Attendance today</span>
            <Calendar size={20} className="muted" />
          </div>
          <span className="stat-value">{stats.attendanceRateToday}%</span>
          <span className="stat-sub">Of students marked so far</span>
        </div>

        <div className="card stat-card">
          <div className="flex-between">
            <span className="stat-label">Fees outstanding</span>
            <CreditCard size={20} className="muted" />
          </div>
          <span className="stat-value">{fmtMoney(stats.feesOutstanding)}</span>
          <span className="stat-sub">{fmtMoney(stats.feesCollected)} collected</span>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '20px' }}>
        <div className="card">
          <h3>Fees collected vs outstanding</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut data={feesChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>

        <div className="card">
          <h3>Attendance rate today</h3>
          <div style={{ height: '200px' }}>
            <Bar data={attendanceChartData} options={{ ...barOptions, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="flex-between" style={{ marginBottom: '12px' }}>
          <h3>Recent announcements</h3>
          <Megaphone size={18} className="muted" />
        </div>

        {!stats.recentAnnouncements?.length ? (
          <div className="empty-state">No announcements yet.</div>
        ) : (
          stats.recentAnnouncements.map((a) => (
            <div key={a._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <strong>{a.title}</strong>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: '.88rem' }}>{a.body}</p>
              <span className="muted" style={{ fontSize: '.76rem' }}>{fmtDate(a.createdAt)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
