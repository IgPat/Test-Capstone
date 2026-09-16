import React from 'react';
import { Link } from 'react-router-dom';
import { School, KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <School size={28} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--ink)' }}>SMS Portal</span>
        </div>

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '54px', height: '54px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 14px' }}>
            <KeyRound size={26} style={{ margin: 'auto' }} />
          </div>
          <h2>Reset password</h2>
          <p className="muted" style={{ fontSize: '.9rem', lineHeight: '1.5' }}>
            Password resets are managed by your school administrator.
          </p>
        </div>

        <div className="card" style={{ background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '.88rem' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Need help?</p>
          <p style={{ margin: '4px 0 0', color: 'var(--ink-soft)' }}>
            Please contact your school administrator to reset your password. An admin can generate a new temporary password for your account from the Admin Students panel.
          </p>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/login" className="btn-secondary" style={{ width: '100%' }}>
            <ArrowLeft size={16} /> Back to Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
