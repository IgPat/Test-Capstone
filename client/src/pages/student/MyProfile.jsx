import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ contact: '', guardianContact: '', photoUrl: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?.studentProfile) return;
    api.get(`/students/${user.studentProfile}`).then(({ data }) => {
      setProfile(data);
      setForm({ contact: data.contact || '', guardianContact: data.guardianContact || '', photoUrl: data.photoUrl || '' });
    });
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    const { data } = await api.put(`/students/${user.studentProfile}`, form);
    setProfile(data);
    setSaved(true);
  };

  if (!profile) return <p>Loading profile…</p>;

  return (
    <div>
      <h1>My Profile</h1>
      <div className="card">
        <p><strong>Name:</strong> {profile.user?.name}</p>
        <p><strong>Admission #:</strong> {profile.admissionNumber}</p>
        <p><strong>Class:</strong> {profile.classId?.name || 'Not yet assigned'}</p>
        <p><strong>Status:</strong> <span className={`pill ${profile.status}`}>{profile.status}</span></p>
        <p><strong>Guardian:</strong> {profile.guardianName || '—'}</p>
      </div>

      <form className="card form-grid" onSubmit={handleSave}>
        <h3 className="full-width">Editable info</h3>
        <label>Contact number<input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></label>
        <label>Guardian contact<input value={form.guardianContact} onChange={(e) => setForm({ ...form, guardianContact: e.target.value })} /></label>
        <label>Profile photo URL<input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} /></label>
        <button className="btn-primary" type="submit">Save changes</button>
        {saved && <span className="success">Saved ✓</span>}
      </form>
    </div>
  );
};

export default MyProfile;
