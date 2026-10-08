import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './RebuiltPages.css';

export default function Register1() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    admissionNumber: '',
    gender: 'female',
    classId: '',
  });
  const [classes, setClasses] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes/public').catch(() => []);
      if (Array.isArray(res)) {
        setClasses(res);
        if (res.length && !form.classId) {
          setForm((current) => ({ ...current, classId: res[0]._id }));
        }
      }
    } catch (e) {
      setClasses([]);
    }
  };

  const update = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        gender: form.gender,
        classId: form.classId || undefined,
        admissionNumber: form.admissionNumber.trim() || undefined,
      };

      const result = await api.post('/auth/register', payload);
      login(result.token, result.user);
      navigate('/student/dashboard');
    } catch (requestError) {
      setError(
        requestError.message ||
          'We could not create your account. Check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="portal-auth portal-register">
      <header className="portal-auth-header">
        <Link className="portal-brand" to="/" aria-label="EduCore home">
          <span className="portal-brand-mark">
            <GraduationCap size={21} />
          </span>
          EduCore<span>.</span>
        </Link>
        <Link className="portal-back-link" to="/">
          Back to home
        </Link>
      </header>
      <div className="portal-register-grid">
        <section className="portal-register-intro">
          <p className="portal-kicker">
            <span /> STUDENT ACCOUNT
          </p>
          <h1>Start with your school record.</h1>
          <p>
            Create a student login using the details issued by your school. Your profile will be linked to that record.
          </p>
          <div className="portal-register-note">
            <ShieldCheck size={18} /> Admin accounts are provisioned by the school.
          </div>
        </section>
        <section
          className="portal-auth-form-wrap portal-register-form"
          aria-labelledby="register-title"
        >
          <div className="portal-auth-form-head">
            <span className="portal-form-icon">
              <GraduationCap size={21} />
            </span>
            <p className="portal-kicker">STUDENT SELF-SERVICE</p>
            <h2 id="register-title">Create your account</h2>
            <p>Fill in your details to register your student account.</p>
          </div>
          {error && (
            <div className="portal-form-error" role="alert">
              {error}
            </div>
          )}
          <form className="portal-form" onSubmit={submit}>
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              name="name"
              autoComplete="name"
              placeholder="Your name as recorded by school"
              value={form.name}
              onChange={update}
              required
            />

            <label htmlFor="register-email" className="portal-spaced-label">
              Email address
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update}
              required
            />

            <label htmlFor="register-gender" className="portal-spaced-label">
              Gender
            </label>
            <select
              id="register-gender"
              name="gender"
              value={form.gender}
              onChange={update}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>

            {classes.length > 0 && (
              <>
                <label htmlFor="register-class" className="portal-spaced-label">
                  Class
                </label>
                <select
                  id="register-class"
                  name="classId"
                  value={form.classId}
                  onChange={update}
                >
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            <label htmlFor="register-admission" className="portal-spaced-label">
              Admission number
            </label>
            <input
              id="register-admission"
              name="admissionNumber"
              autoComplete="off"
              placeholder="Optional — auto-generated if blank"
              value={form.admissionNumber}
              onChange={update}
            />

            <label htmlFor="register-password" className="portal-spaced-label">
              Create password
            </label>
            <div className="portal-password-field">
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={6}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={update}
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
              {loading ? 'Creating account…' : 'Create student account'}{' '}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="portal-auth-bottom">
            Already registered? <Link to="/login">Sign in</Link>
          </div>
        </section>
      </div>
    </main>
  );
}