import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './RebuiltPages.css';

export default function Login1() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.post('/auth/login', { email, password });
      login(result.token, result.user);
      navigate(result.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <main className="portal-auth">
      <header className="portal-auth-header">
        <Link className="portal-brand" to="/" aria-label="EduCore home">
          <span className="portal-brand-mark"><GraduationCap size={21} /></span>
          EduCore<span>.</span>
        </Link>
        <Link className="portal-back-link" to="/">Back to home</Link>
      </header>
      <div className="portal-auth-grid">
        <section className="portal-auth-story">
          <p className="portal-kicker"><span /> YOUR SCHOOL, IN ONE PLACE</p>
          <h1>Make room for the work that matters.</h1>
          <p>Sign in to follow the school day, keep records close, and stay connected to what comes next.</p>
          <div className="portal-story-note"><ShieldCheck size={18} /> Role-based access for students and administrators</div>
        </section>
        <section className="portal-auth-form-wrap" aria-labelledby="login-title">
          <div className="portal-auth-form-head">
            <span className="portal-form-icon"><GraduationCap size={21} /></span>
            <p className="portal-kicker">WELCOME BACK</p>
            <h2 id="login-title">Sign in to EduCore</h2>
            <p>Use the email address connected to your school account.</p>
          </div>
          {error && <div className="portal-form-error" role="alert">{error}</div>}
          <form className="portal-form" onSubmit={submit}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              placeholder="e.g. admin@school.test"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <div className="portal-label-row">
              <label htmlFor="login-password">Password</label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <div className="portal-password-field">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="portal-icon-button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button className="portal-submit" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Sign in'} <ArrowRight size={17} />
            </button>
          </form>

          <div className="portal-demo-section">
            <p className="portal-demo-title">Demo quick fill (Seeded data):</p>
            <div className="portal-demo-buttons">
              <button
                type="button"
                className="portal-demo-btn"
                onClick={() => handleQuickLogin('admin@school.test', 'Admin123!')}
              >
                Admin Demo
              </button>
              <button
                type="button"
                className="portal-demo-btn"
                onClick={() => handleQuickLogin('student@school.test', 'Student123!')}
              >
                Student Demo
              </button>
            </div>
          </div>

          <div className="portal-auth-bottom">New student? <Link to="/register">Create an account</Link></div>
          <p className="portal-auth-foot"><ShieldCheck size={14} /> Your account role determines which workspace opens.</p>
        </section>
      </div>
    </main>
  );
}