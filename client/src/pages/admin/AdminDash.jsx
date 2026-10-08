import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BookOpen, CalendarDays, CircleDollarSign, Megaphone, UsersRound } from 'lucide-react';
import api from '../../services/api';
import { fmtDate, fmtMoney } from '../../utils/formatters';
import '../auth/RebuiltPages.css';

export default function AdminDash() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get('/dashboard/admin')
      .then((data) => { if (active) setStats(data); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Dashboard data could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="loading" role="status">Loading school overview…</div>;
  if (error) return <div className="error" role="alert">{error}</div>;

  const metrics = [
    { label: 'Active students', value: stats.totalStudents ?? 0, detail: 'Current enrolments', icon: UsersRound, tone: 'green' },
    { label: 'Classes', value: stats.totalClasses ?? 0, detail: 'Across the school', icon: BookOpen, tone: 'coral' },
    { label: 'Attendance today', value: `${stats.attendanceRateToday ?? 0}%`, detail: 'Present marks recorded', icon: CalendarDays, tone: 'blue' },
    { label: 'Fees outstanding', value: fmtMoney(stats.feesOutstanding ?? 0), detail: `${fmtMoney(stats.feesCollected ?? 0)} collected`, icon: CircleDollarSign, tone: 'gold' },
  ];

  return (
    <div className="rebuilt-page dashboard-v2">
      <header className="dash-heading">
        <div>
          <p className="dash-eyebrow"><span /> SCHOOL OVERVIEW</p>
          <h1>Good morning, admin.</h1>
          <p>Here is the latest view of your school operations.</p>
        </div>
        <Link to="/admin/announcements" className="dash-action"><Megaphone size={16} /> New announcement</Link>
      </header>
      <section className="dash-metrics" aria-label="School metrics">
        {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
          <article className="dash-metric" key={label}>
            <div className={`dash-metric-icon tone-${tone}`}><Icon size={19} /></div>
            <p>{label}</p><strong>{value}</strong><span>{detail}</span>
          </article>
        ))}
      </section>
      <div className="dash-content-grid">
        <section className="dash-panel dash-attendance-panel">
          <div className="dash-panel-title"><div><p className="dash-eyebrow">TODAY</p><h2>Attendance pulse</h2></div><Activity size={19} /></div>
          <div className="dash-attendance-number">{stats.attendanceRateToday ?? 0}<span>%</span></div>
          <div className="dash-meter" aria-label={`Attendance rate ${stats.attendanceRateToday ?? 0}%`}><span style={{ width: `${Math.min(100, Math.max(0, stats.attendanceRateToday ?? 0))}%` }} /></div>
          <p className="dash-muted">Based on attendance records entered today.</p>
          <div className="dash-finance-line"><span>Fees collected</span><strong>{fmtMoney(stats.feesCollected ?? 0)}</strong></div>
          <div className="dash-finance-line"><span>Fees outstanding</span><strong>{fmtMoney(stats.feesOutstanding ?? 0)}</strong></div>
        </section>
        <section className="dash-panel dash-announcements">
          <div className="dash-panel-title"><div><p className="dash-eyebrow">SCHOOL-WIDE</p><h2>Recent announcements</h2></div><Link to="/admin/announcements" aria-label="View all announcements"><ArrowRight size={18} /></Link></div>
          {!stats.recentAnnouncements?.length ? <p className="dash-empty">No announcements have been posted yet.</p> : (
            <div className="dash-notice-list">
              {stats.recentAnnouncements.map((announcement) => (
                <article className="dash-notice" key={announcement._id}>
                  <span className="dash-notice-mark"><Megaphone size={15} /></span>
                  <div><h3>{announcement.title}</h3><p>{announcement.body}</p><time>{fmtDate(announcement.createdAt)}</time></div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}