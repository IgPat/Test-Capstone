import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { School, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.token, res.user);
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <School size={28} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--ink)' }}>SMS Portal</span>
        </div>

        <h2>Log in</h2>
        <p className="subtitle">Enter your credentials to access your account</p>

        {error && (
          <div className="error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              required
              placeholder="e.g. admin@school.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label style={{ marginTop: '14px' }}>
            Password
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <div className="flex-between" style={{ margin: '16px 0 20px' }}>
            <Link to="/forgot-password" className="btn-link" style={{ fontSize: '.84rem' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            <LogIn size={18} /> {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border)' }}>
          <p className="muted" style={{ fontSize: '.82rem', marginBottom: '8px' }}>Demo quick fill:</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={() => handleQuickLogin('admin@school.test', 'Admin123!')}
            >
              Admin Demo
            </button>
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={() => handleQuickLogin('student@school.test', 'Student123!')}
            >
              Student Demo
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '.88rem' }}>
          <span className="muted">New student? </span>
          <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
        </div>
      </div>
    </div>
  );
}
