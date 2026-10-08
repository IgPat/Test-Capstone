import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck2, CircleDollarSign, GraduationCap, Megaphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { fmtMoney, fmtDate } from '../../utils/formatters';
import '../auth/RebuiltPages.css';

export default function StudentDash() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get('/dashboard/student')
      .then((data) => { if (active) setStats(data); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Your dashboard could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="loading" role="status">Loading your school overview…</div>;
  if (error) return <div className="error" role="alert">{error}</div>;

  const name = user?.name?.trim().split(/\s+/)[0] || 'there';
  const attendance = Math.min(100, Math.max(0, stats.attendancePercentage ?? 0));
  const metrics = [
    { label: 'Attendance', value: `${attendance}%`, detail: 'This school year', icon: CalendarCheck2, tone: 'green', to: '/student/attendance' },
    { label: 'Fee balance', value: fmtMoney(stats.feeBalance ?? 0), detail: stats.feeBalance > 0 ? 'Outstanding balance' : 'No balance due', icon: CircleDollarSign, tone: 'coral', to: '/student/invoices' },
    { label: 'Recent grades', value: stats.latestGrades?.length ?? 0, detail: 'Latest entries', icon: GraduationCap, tone: 'blue', to: '/student/grades' },
    { label: 'Announcements', value: stats.announcements?.length ?? 0, detail: 'School updates', icon: Megaphone, tone: 'gold', to: '/student/announcements' },
  ];

  return (
    <div className="rebuilt-page dashboard-v2 student-dashboard-v2">
      <header className="dash-heading">
        <div>
          <p className="dash-eyebrow"><span /> YOUR SCHOOL OVERVIEW</p>
          <h1>Welcome back, {name}.</h1>
          <p>Your progress, school notices, and account details at a glance.</p>
        </div>
        <Link to="/student/profile" className="dash-action"><GraduationCap size={16} /> View profile</Link>
      </header>
      <section className="dash-metrics" aria-label="Your school summary">
        {metrics.map(({ label, value, detail, icon: Icon, tone, to }) => (
          <Link className="dash-metric" key={label} to={to}>
            <div className={`dash-metric-icon tone-${tone}`}><Icon size={19} /></div>
            <p>{label}</p><strong>{value}</strong><span>{detail}</span>
          </Link>
        ))}
      </section>
      <div className="dash-content-grid">
        <section className="dash-panel dash-attendance-panel">
          <div className="dash-panel-title"><div><p className="dash-eyebrow">ATTENDANCE</p><h2>Your presence, over time</h2></div><CalendarCheck2 size={19} /></div>
          <div className="dash-attendance-number">{attendance}<span>%</span></div>
          <div className="dash-meter" aria-label={`Attendance ${attendance}%`}><span style={{ width: `${attendance}%` }} /></div>
          <p className="dash-muted">Attendance information recorded by your school.</p>
          <Link to="/student/attendance" className="dash-inline-link">Open attendance record <ArrowRight size={15} /></Link>
        </section>
        <section className="dash-panel dash-announcements" id="student-updates">
          <div className="dash-panel-title"><div><p className="dash-eyebrow">ACADEMICS</p><h2>Latest grades</h2></div><Link to="/student/grades" aria-label="View all grades"><ArrowRight size={18} /></Link></div>
          {!stats.latestGrades?.length ? <p className="dash-empty">Your school has not recorded any grades yet.</p> : (
            <div className="dash-grade-list">
              {stats.latestGrades.map((grade) => (
                <div className="dash-grade-row" key={grade._id}><div><strong>{grade.subject}</strong><span>{grade.term}</span></div><b>{grade.score} <small>/ {grade.maxScore}</small></b></div>
              ))}
            </div>
          )}
          <div className="dash-mini-heading"><Megaphone size={15} /> School announcements</div>
          {!stats.announcements?.length ? <p className="dash-empty dash-empty-small">No recent notices.</p> : stats.announcements.slice(0, 2).map((announcement) => (
            <article className="dash-student-notice" key={announcement._id}><strong>{announcement.title}</strong><p>{announcement.body}</p><time>{fmtDate(announcement.createdAt)}</time></article>
          ))}
        </section>
      </div>
    </div>
  );
}