import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Save } from 'lucide-react';

export default function StudentProfile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ phone: '', address: '', guardianName: '', guardianPhone: '' });
  const [msg, setMsg] = useState({ error: '', success: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/students/me');
      setProfile(res);
      setForm({
        phone: res.phone || '',
        address: res.address || '',
        guardianName: res.guardianName || '',
        guardianPhone: res.guardianPhone || '',
      });
    } catch (err) {
      setMsg({ error: err.message || 'Failed to load profile', success: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ error: '', success: '' });
    try {
      setSaving(true);
      const updated = await api.put('/students/me', form);
      setProfile(updated);
      updateUser({ phone: form.phone });
      setMsg({ error: '', success: 'Profile contact details updated successfully!' });
    } catch (err) {
      setMsg({ error: err.message || 'Failed to update profile', success: '' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading your profile…</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1>My Profile</h1>
      <p className="muted">View your academic enrollment details and keep your contact information up to date.</p>

      {msg.success && <div className="success-msg">{msg.success}</div>}
      {msg.error && <div className="error">{msg.error}</div>}

      {profile && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="flex" style={{ gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={28} />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{profile.user?.name}</h2>
              <p className="muted" style={{ margin: '2px 0 0' }}>Admission Number: <strong>{profile.admissionNumber}</strong></p>
            </div>
          </div>

          <div className="grid grid-2" style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px', fontSize: '.9rem' }}>
            <div>Email: <strong>{profile.user?.email}</strong></div>
            <div>Class: <strong>{profile.classId?.name || 'Unassigned'}</strong></div>
            <div>Gender: <strong style={{ textTransform: 'capitalize' }}>{profile.gender}</strong></div>
            <div>Status: <strong style={{ textTransform: 'capitalize', color: 'var(--success)' }}>{profile.status}</strong></div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Update Contact Details</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Phone Number
              <input type="text" placeholder="e.g. +234 801 234 5678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>

            <label>Residential Address
              <input type="text" placeholder="e.g. 12 School Road, Lagos" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
          </div>

          <div className="form-row" style={{ marginTop: '12px' }}>
            <label>Parent/Guardian Name
              <input type="text" placeholder="e.g. Mrs. Mary Doe" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
            </label>

            <label>Guardian Phone Number
              <input type="text" placeholder="e.g. +234 809 876 5432" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} />
            </label>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
