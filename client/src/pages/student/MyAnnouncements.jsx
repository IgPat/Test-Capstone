import { useEffect, useState } from 'react';
import api from '../../services/api';

const MyAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  useEffect(() => { api.get('/announcements').then(({ data }) => setAnnouncements(data)); }, []);

  return (
    <div>
      <h1>Announcements</h1>
      <div className="card">
        {announcements.map((a) => (
          <div key={a._id} className="announcement-item">
            <strong>{a.title}</strong>
            <p>{a.body}</p>
            <span className="muted">{new Date(a.createdAt).toLocaleString()}</span>
          </div>
        ))}
        {announcements.length === 0 && <p className="muted">No announcements yet.</p>}
      </div>
    </div>
  );
};

export default MyAnnouncements;
