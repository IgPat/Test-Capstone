import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MyGrades = () => {
  const { user } = useAuth();
  const [reportCard, setReportCard] = useState([]);

  useEffect(() => {
    if (!user?.studentProfile) return;
    api.get(`/grades/student/${user.studentProfile}`).then(({ data }) => setReportCard(data));
  }, [user]);

  return (
    <div>
      <h1>My Grades & Report Card</h1>
      {reportCard.length === 0 && <p className="muted">No grades recorded yet.</p>}
      {reportCard.map((t) => (
        <div key={t.term} className="card">
          <h3>{t.term} — Average {t.average}% ({t.grade})</h3>
          <table className="data-table">
            <thead><tr><th>Subject</th><th>Score</th><th>%</th><th>Remark</th></tr></thead>
            <tbody>
              {t.subjects.map((s) => (
                <tr key={s.subject}><td>{s.subject}</td><td>{s.score}/{s.maxScore}</td><td>{s.percentage}%</td><td>{s.remark || '—'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default MyGrades;
