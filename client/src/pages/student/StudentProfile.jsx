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

  if (loading) return <div className="rebuilt-loading-state">Loading your profile…</div>;

  return (
    <div className="rebuilt-page" style={{ maxWidth: '840px' }}>
      <div className="rebuilt-page-header">
        <div>
          <h1 className="rebuilt-page-title">My Profile</h1>
          <p className="rebuilt-page-subtitle">View your academic enrollment details and keep your contact information up to date.</p>
        </div>
      </div>

      {msg.success && <div className="rebuilt-alert rebuilt-alert-success">{msg.success}</div>}
      {msg.error && <div className="rebuilt-alert rebuilt-alert-error">{msg.error}</div>}

      {profile && (
        <div className="rebuilt-card" style={{ marginBottom: '24px' }}>
          <div className="rebuilt-flex-center" style={{ gap: '16px', marginBottom: '20px' }}>
            <div style={{
              background: 'rgba(33, 73, 61, 0.1)',
              color: 'var(--portal-primary)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              <UserCheck size={30} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--portal-font-serif)', fontSize: '1.4rem', color: 'var(--portal-text-dark)', margin: 0, fontWeight: 700 }}>
                {profile.user?.name}
              </h2>
              <p style={{ color: 'var(--portal-text-muted)', margin: '4px 0 0', fontSize: '.9rem' }}>
                Admission Number: <strong style={{ color: 'var(--portal-primary)' }}>{profile.admissionNumber}</strong>
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            background: '#f4f6f0',
            padding: '16px 20px',
            borderRadius: '12px',
            fontSize: '.9rem',
            border: '1px solid #e1e7df'
          }}>
            <div><span style={{ color: 'var(--portal-text-muted)' }}>Email:</span> <br /><strong style={{ color: 'var(--portal-text-dark)' }}>{profile.user?.email}</strong></div>
            <div><span style={{ color: 'var(--portal-text-muted)' }}>Class:</span> <br /><strong style={{ color: 'var(--portal-text-dark)' }}>{profile.classId?.name || 'Unassigned'}</strong></div>
            <div><span style={{ color: 'var(--portal-text-muted)' }}>Gender:</span> <br /><strong style={{ textTransform: 'capitalize', color: 'var(--portal-text-dark)' }}>{profile.gender}</strong></div>
            <div><span style={{ color: 'var(--portal-text-muted)' }}>Status:</span> <br /><span className="rebuilt-badge rebuilt-badge-active" style={{ textTransform: 'capitalize' }}>{profile.status}</span></div>
          </div>
        </div>
      )}

      <div className="rebuilt-card">
        <h3 style={{ fontFamily: 'var(--portal-font-serif)', fontSize: '1.25rem', color: 'var(--portal-text-dark)', marginTop: 0, marginBottom: '16px' }}>
          Update Contact Details
        </h3>
        <form onSubmit={handleSubmit} className="portal-form">
          <div className="portal-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="portal-form-group">
              <label>Phone Number</label>
              <input
                type="text"
                className="portal-input"
                placeholder="e.g. +234 801 234 5678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="portal-form-group">
              <label>Residential Address</label>
              <input
                type="text"
                className="portal-input"
                placeholder="e.g. 12 School Road, Lagos"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>

          <div className="portal-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="portal-form-group">
              <label>Parent/Guardian Name</label>
              <input
                type="text"
                className="portal-input"
                placeholder="e.g. Mrs. Mary Doe"
                value={form.guardianName}
                onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
              />
            </div>

            <div className="portal-form-group">
              <label>Guardian Phone Number</label>
              <input
                type="text"
                className="portal-input"
                placeholder="e.g. +234 809 876 5432"
                value={form.guardianPhone}
                onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button type="submit" className="rebuilt-btn rebuilt-btn-primary" disabled={saving}>
              <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
