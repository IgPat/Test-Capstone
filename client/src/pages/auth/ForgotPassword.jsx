import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, KeyRound, ShieldCheck } from 'lucide-react';
import './RebuiltPages.css';

export default function ForgotPassword() {
  return (
    <main className="portal-auth">
      <header className="portal-auth-header">
        <Link className="portal-brand" to="/" aria-label="EduCore home">
          <span className="portal-brand-mark">
            <GraduationCap size={21} />
          </span>
          EduCore<span>.</span>
        </Link>
        <Link className="portal-back-link" to="/login">
          Back to Sign in
        </Link>
      </header>
      <div className="portal-auth-grid" style={{ gridTemplateColumns: '1fr 480px' }}>
        <section className="portal-auth-story">
          <p className="portal-kicker">
            <span /> ACCOUNT ACCESS
          </p>
          <h1>Reset your school password.</h1>
          <p>
            For security reasons, password resets are issued directly by your school administrator to keep student profiles protected.
          </p>
          <div className="portal-story-note">
            <ShieldCheck size={18} /> Administrative verification required
          </div>
        </section>

        <section className="portal-auth-form-wrap" aria-labelledby="reset-title">
          <div className="portal-auth-form-head">
            <span className="portal-form-icon">
              <KeyRound size={21} />
            </span>
            <p className="portal-kicker">PASSWORD ASSISTANCE</p>
            <h2 id="reset-title">Reset Password</h2>
            <p>Password resets are managed by your school administrator.</p>
          </div>

          <div
            className="rebuilt-card"
            style={{ marginTop: '24px', padding: '18px', background: '#fbfcf9', borderColor: '#dfe5df' }}
          >
            <strong style={{ fontSize: '13px', color: 'var(--portal-ink)' }}>
              How to get a new password:
            </strong>
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--portal-muted)', lineHeight: '1.6' }}>
              Please reach out to your school administrator or teacher. An admin can issue a new temporary password for your account directly from the Admin Students dashboard.
            </p>
          </div>

          <div style={{ marginTop: '24px' }}>
            <Link to="/login" className="rebuilt-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <ArrowLeft size={16} /> Return to Sign in
            </Link>
          </div>

          <div className="portal-auth-bottom">
            Need public support? <Link to="/contact">Contact Support</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
