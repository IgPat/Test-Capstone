import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { GraduationCap, Award } from 'lucide-react';
import '../auth/RebuiltPages.css';

export default function StudentGrades() {
  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyGrades();
  }, []);

  const fetchMyGrades = async () => {
    try {
      setLoading(true);
      const res = await api.get('/grades/my-grades');
      setReportCards(res || []);
    } catch (err) {
      setError(err.message || 'Failed to load report card');
    } finally {
      setLoading(false);
    }
  };

  const getLetter = (avg) => {
    if (avg >= 75) return { letter: 'A', color: '#245744', bg: '#e1eee3' };
    if (avg >= 65) return { letter: 'B', color: '#21493d', bg: '#e4eee5' };
    if (avg >= 50) return { letter: 'C', color: '#74672c', bg: '#f4efd8' };
    if (avg >= 40) return { letter: 'D', color: '#a9543f', bg: '#f9e8e0' };
    return { letter: 'F', color: '#bd5142', bg: '#fbefec' };
  };

  return (
    <div className="rebuilt-page">
      <header className="rebuilt-page-header">
        <div>
          <p className="dash-eyebrow"><span /> ACADEMIC PERFORMANCE</p>
          <h1>My Report Card</h1>
          <p>Review academic performance records grouped by term.</p>
        </div>
      </header>

      {loading ? (
        <div className="rebuilt-empty-state">Loading report card…</div>
      ) : error ? (
        <div className="rebuilt-alert-error">{error}</div>
      ) : reportCards.length === 0 ? (
        <div className="rebuilt-empty-state">No grade records found on your report card.</div>
      ) : (
        reportCards.map((rc, idx) => {
          const { letter, color, bg } = getLetter(rc.averageScore);
          return (
            <div key={idx} className="rebuilt-card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #edf0eb' }}>
                <div>
                  <h2 style={{ margin: 0, font: "400 24px/1.2 'DM Serif Display', serif" }}>{rc.term} ({rc.academicYear})</h2>
                  <span style={{ fontSize: '12px', color: 'var(--portal-muted)' }}>Total Subjects: <strong>{rc.grades?.length || 0}</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: 'var(--portal-muted)', textTransform: 'uppercase' }}>Term Average</div>
                    <div style={{ font: "400 26px/1 'DM Serif Display', serif", color: 'var(--portal-ink)' }}>{rc.averageScore}%</div>
                  </div>

                  <div style={{ background: bg, border: `1px solid ${color}`, borderRadius: '8px', width: '44px', height: '44px', display: 'grid', placeItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color }}>{letter}</span>
                  </div>
                </div>
              </div>

              <div className="rebuilt-table-wrap">
                <table className="rebuilt-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Score</th>
                      <th>Max Score</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rc.grades?.map((g) => {
                      const pct = Math.round((g.score / g.maxScore) * 100);
                      const badgeClass = pct >= 70 ? 'rebuilt-badge-active' : pct >= 50 ? 'rebuilt-badge-partial' : 'rebuilt-badge-inactive';
                      return (
                        <tr key={g._id}>
                          <td><strong>{g.subject}</strong></td>
                          <td>{g.score}</td>
                          <td>{g.maxScore}</td>
                          <td>
                            <span className={`rebuilt-badge ${badgeClass}`}>
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
