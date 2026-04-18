import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');

        .lt-root {
          display: flex;
          min-height: 100vh;
          background: #0e1322;
          color: #dee1f7;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        /* ── Left panel ─────────────────────────────────────────── */
        .lt-left {
          position: relative;
          width: 45%;
          display: none;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
        }
        @media (min-width: 768px) { .lt-left { display: flex; } }

        .lt-left-img {
          position: absolute; inset: 0; z-index: 0;
        }
        .lt-left-img img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .lt-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(14,19,34,0.92) 0%, rgba(14,19,34,0.45) 60%, transparent 100%);
        }
        .lt-left > * { position: relative; z-index: 10; }

        .lt-brand {
          display: flex; align-items: center; gap: 0.75rem;
        }
        .lt-brand-icon {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #00d4aa, #46f1c5);
          display: flex; align-items: center; justify-content: center;
        }
        .lt-brand-icon .material-symbols-outlined {
          font-size: 16px; color: #00382b;
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .lt-brand-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: 0.65rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #55fcd0;
        }

        .lt-headline {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.4rem, 4vw, 3.5rem);
          font-weight: 300; font-style: italic;
          line-height: 1.12; letter-spacing: -0.02em;
          color: #dee1f7; max-width: 26rem;
          margin-bottom: 1.5rem;
        }
        .lt-headline span {
          color: #00d4aa; font-weight: 500; font-style: normal;
        }
        .lt-subtext {
          font-size: 1rem; font-weight: 300;
          letter-spacing: 0.03em; color: #bacac2;
          max-width: 22rem; line-height: 1.7;
        }

        .lt-stats { display: flex; gap: 2.5rem; }
        .lt-stat-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem; font-weight: 700; color: #55fcd0;
          display: block;
        }
        .lt-stat-label {
          font-size: 0.6rem; text-transform: uppercase;
          letter-spacing: 0.2em; color: rgba(222,225,247,0.35);
          display: block; margin-top: 0.2rem;
        }

        /* ── Right panel ─────────────────────────────────────────── */
        .lt-right {
          flex: 1;
          background: #0a0f1e;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          overflow-y: auto;
        }
        @media (min-width: 768px) { .lt-right { padding: 6rem; } }

        /* Dot grid texture */
        .lt-right::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, #3b4a44 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.1; pointer-events: none; z-index: 0;
        }

        .lt-form-wrap {
          width: 100%; max-width: 26rem;
          position: relative; z-index: 1;
          animation: ltFadeIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes ltFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lt-form-header { margin-bottom: 3rem; }
        .lt-form-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.5rem; font-weight: 700;
          color: #f9fafb; line-height: 1.1; letter-spacing: -0.02em;
        }
        .lt-form-sub {
          color: #9ca3af; font-weight: 300;
          font-size: 0.95rem; margin-top: 0.5rem; line-height: 1.6;
        }

        /* Error */
        .lt-error {
          background: rgba(255,180,171,0.1);
          border: 1px solid rgba(255,180,171,0.25);
          color: #ffb4ab;
          border-radius: 0.75rem; padding: 0.75rem 1rem;
          font-size: 0.82rem; margin-bottom: 1.5rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .lt-error .material-symbols-outlined { font-size: 16px; }

        /* Input group */
        .lt-field { margin-bottom: 2.5rem; }
        .lt-label-row {
          display: flex; justify-content: space-between;
          align-items: flex-end; margin-bottom: 0.35rem;
        }
        .lt-label {
          font-size: 0.62rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.18em;
          color: rgba(186,202,194,0.7);
        }
        .lt-forgot {
          font-size: 0.75rem; font-weight: 500;
          color: #00d4aa; text-decoration: none;
          transition: filter 0.2s;
        }
        .lt-forgot:hover { filter: brightness(1.2); }

        .lt-input {
          width: 100%; background: transparent;
          border: none; border-bottom: 1px solid rgba(59,74,68,0.4);
          padding: 0.75rem 0;
          color: #dee1f7; font-size: 0.95rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .lt-input::placeholder { color: rgba(222,225,247,0.18); }
        .lt-input:focus {
          border-bottom-color: #00d4aa;
          box-shadow: 0 4px 12px -4px rgba(0,212,170,0.4);
        }

        /* Remember row */
        .lt-remember {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 2.5rem;
        }
        .lt-remember input[type="checkbox"] {
          width: 16px; height: 16px; border-radius: 4px;
          accent-color: #00d4aa; cursor: pointer;
          border: 1px solid rgba(59,74,68,0.5);
          background: #1a1f2f;
        }
        .lt-remember label {
          font-size: 0.875rem; color: #9ca3af;
          font-weight: 300; cursor: pointer;
        }

        /* Submit button */
        .lt-submit {
          width: 100%; height: 56px;
          background: #00d4aa; color: #0a0f1e;
          border: none; border-radius: 9999px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: 1.05rem;
          cursor: pointer; letter-spacing: 0.01em;
          transition: box-shadow 0.3s, transform 0.15s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .lt-submit:hover:not(:disabled) {
          box-shadow: 0 0 24px rgba(0,212,170,0.45);
        }
        .lt-submit:active:not(:disabled) { transform: scale(0.98); }
        .lt-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Spinner */
        .lt-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(10,15,30,0.3);
          border-top-color: #0a0f1e;
          border-radius: 50%;
          animation: ltSpin 0.7s linear infinite;
        }
        @keyframes ltSpin { to { transform: rotate(360deg); } }

        /* Tip card */
        .lt-tip {
          margin-top: 3rem;
          background: rgba(22,27,43,0.6);
          border-left: 2px solid rgba(255,185,95,0.6);
          border-radius: 0 0.75rem 0.75rem 0;
          padding: 1.1rem 1.25rem;
          display: flex; gap: 1rem; align-items: flex-start;
        }
        .lt-tip .material-symbols-outlined {
          color: #ffb95f; font-size: 20px; flex-shrink: 0;
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          margin-top: 1px;
        }
        .lt-tip-label {
          display: block; font-size: 0.62rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.2em;
          color: #ffb95f; margin-bottom: 0.35rem;
        }
        .lt-tip-text {
          font-size: 0.78rem; color: #9ca3af;
          font-weight: 300; line-height: 1.6;
        }

        /* Footer link */
        .lt-footer-link {
          margin-top: 3rem; text-align: center;
          font-size: 0.875rem; color: #bacac2; font-weight: 300;
        }
        .lt-footer-link a {
          color: #00d4aa; font-weight: 700;
          text-decoration: none; margin-left: 0.25rem;
        }
        .lt-footer-link a:hover { text-decoration: underline; text-underline-offset: 4px; }

        /* Global footer */
        .lt-global-footer {
          position: absolute; bottom: 2rem; left: 0; right: 0;
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 3rem;
          pointer-events: none;
        }
        @media (max-width: 767px) { .lt-global-footer { display: none; } }
        .lt-global-footer p,
        .lt-global-footer a {
          font-size: 0.6rem; text-transform: uppercase;
          letter-spacing: 0.08em; color: rgba(222,225,247,0.3);
          pointer-events: all;
        }
        .lt-global-footer a { text-decoration: none; margin-left: 1.25rem; transition: color 0.2s; }
        .lt-global-footer a:hover { color: #55fcd0; }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />

      <div className="lt-root">

        {/* ── LEFT PANEL ── */}
        <section className="lt-left">
          <div className="lt-left-img">
            <img
              src="https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&q=80&fit=crop"
              alt="Editorial notebook with fountain pen, cinematic lighting"
            />
            <div className="lt-left-overlay" />
          </div>

          {/* Brand */}
          <div className="lt-brand">
            <div className="lt-brand-icon">
              <span className="material-symbols-outlined">adjust</span>
            </div>
            <span className="lt-brand-name">Life Tracker</span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="lt-headline">
              Atmospheric Precision for your{' '}
              <span>Finances.</span>
            </h1>
            <p className="lt-subtext">
              Measure the intangible. Track every movement with the precision of a celestial chronometer.
            </p>
          </div>

          {/* Stats */}
          <div className="lt-stats">
            <div>
              <span className="lt-stat-num">2.4k+</span>
              <span className="lt-stat-label">Active nodes</span>
            </div>
            <div>
              <span className="lt-stat-num">99.9%</span>
              <span className="lt-stat-label">Precision Rate</span>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANEL ── */}
        <section className="lt-right">

          <div className="lt-form-wrap">

            {/* Header */}
            <div className="lt-form-header">
              <h2 className="lt-form-title">Welcome Back</h2>
              <p className="lt-form-sub">Access your premium dashboard to continue tracking.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="lt-error">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="lt-field">
                <div className="lt-label-row">
                  <label className="lt-label" htmlFor="email">Email Address</label>
                </div>
                <input
                  className="lt-input"
                  id="email"
                  type="email"
                  placeholder="name@precision.io"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="lt-field">
                <div className="lt-label-row">
                  <label className="lt-label" htmlFor="password">Password</label>
                  <a href="#" className="lt-forgot">Forgot?</a>
                </div>
                <input
                  className="lt-input"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Remember me */}
              <div className="lt-remember">
                <input
                  type="checkbox"
                  id="remember"
                  checked={form.remember}
                  onChange={e => setForm({ ...form, remember: e.target.checked })}
                />
                <label htmlFor="remember">Remember me for 30 days</label>
              </div>

              {/* Submit */}
              <button className="lt-submit" type="submit" disabled={loading}>
                {loading
                  ? <><div className="lt-spinner" /> Signing in…</>
                  : 'Sign In'
                }
              </button>
            </form>

            {/* Tip card */}
            <div className="lt-tip">
              <span className="material-symbols-outlined">lightbulb</span>
              <div>
                <span className="lt-tip-label">Precision Tip</span>
                <p className="lt-tip-text">
                  Users who log expenses daily save an average of 23% more within the first 3 months.
                </p>
              </div>
            </div>

            {/* Sign up link */}
            <div className="lt-footer-link">
              Don't have an account?
              <Link to="/register">Create one</Link>
            </div>
          </div>

          {/* Global footer */}
          <div className="lt-global-footer">
            <p>© 2025 Life Tracker. Precision living through data.</p>
            <div>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
            </div>
          </div>

        </section>
      </div>
    </>
  );
}