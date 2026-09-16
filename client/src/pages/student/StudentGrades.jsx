import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { GraduationCap, Award } from 'lucide-react';

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
    if (avg >= 75) return { letter: 'A', color: 'var(--success)' };
    if (avg >= 65) return { letter: 'B', color: 'var(--primary)' };
    if (avg >= 50) return { letter: 'C', color: 'var(--warning)' };
    if (avg >= 40) return { letter: 'D', color: 'orange' };
    return { letter: 'F', color: 'var(--danger)' };
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1>My Report Card</h1>
          <p className="muted">Review academic performance records grouped by term.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading report card…</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : reportCards.length === 0 ? (
        <div className="card empty-state">No grade records found on your report card.</div>
      ) : (
        reportCards.map((rc, idx) => {
          const { letter, color } = getLetter(rc.averageScore);
          return (
            <div key={idx} className="card term-block" style={{ marginBottom: '20px' }}>
              <div className="flex-between" style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h2 style={{ margin: 0 }}>{rc.term} ({rc.academicYear})</h2>
                  <span className="muted" style={{ fontSize: '.88rem' }}>Total Subjects: <strong>{rc.grades?.length || 0}</strong></span>
                </div>

                <div className="flex" style={{ gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '.75rem', color: 'var(--ink-soft)', fontWeight: 700, textTransform: 'uppercase' }}>Term Average</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--ink)' }}>{rc.averageScore}%</div>
                  </div>

                  <div style={{ background: 'var(--bg)', border: `2px solid ${color}`, borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color }}>{letter}</span>
                  </div>
                </div>
              </div>

              <div className="table-wrap">
                <table>
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
                      return (
                        <tr key={g._id}>
                          <td><strong>{g.subject}</strong></td>
                          <td>{g.score}</td>
                          <td>{g.maxScore}</td>
                          <td>
                            <span className={`pill ${pct >= 70 ? 'pill-active' : pct >= 50 ? 'pill-late' : 'pill-inactive'}`}>
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
