import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const strength = (() => {
    const pw = form.password;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  })();
  const strengthColors = ['', '#ef4444', '#f59e0b', '#46f1c5', '#00d4aa'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong', 'Optimal'];
  const strengthColor = strengthColors[strength];
  const strengthLabel = strengthLabels[strength];

  const passwordsMatch = form.confirm.length > 0 && form.confirm === form.password;
  const passwordsMismatch = form.confirm.length > 0 && form.confirm !== form.password;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />

      <style>{`
        /* ── Reset ── */
        .rg * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Root ── */
        .rg {
          display: flex;
          min-height: 100vh;
          background: #0e1322;
          color: #dee1f7;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        /* ─────────────────────────────────────────────
           LEFT PANEL
        ───────────────────────────────────────────── */
        .rg-left {
          position: relative;
          width: 45%;
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        @media (min-width: 768px) { .rg-left { display: flex; } }

        .rg-left-img {
          position: absolute; inset: 0; z-index: 0;
        }
        .rg-left-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          filter: grayscale(100%);
          opacity: 0.4;
          mix-blend-mode: luminosity;
        }
        .rg-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top right,
            #0e1322 0%,
            rgba(14,19,34,0.82) 45%,
            transparent 100%
          );
        }

        .rg-left-content {
          position: relative; z-index: 10;
          padding: 3rem 3rem 3rem 4rem;
          display: flex; flex-direction: column; gap: 3rem;
          max-width: 540px;
        }

        .rg-brand {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem; font-weight: 700;
          letter-spacing: -0.02em; color: #dee1f7;
        }

        .rg-headline {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2rem, 3.8vw, 3.25rem);
          font-weight: 300; font-style: italic;
          line-height: 1.12; letter-spacing: -0.02em;
          color: #dee1f7;
        }
        .rg-headline span {
          color: #00d4aa;
          font-weight: 700; font-style: normal;
        }

        .rg-features { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 0.5rem; }
        .rg-feature  { display: flex; align-items: flex-start; gap: 1rem; }
        .rg-feature-dot {
          width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
          background: rgba(0,212,170,0.1);
          border: 1px solid rgba(0,212,170,0.25);
          display: flex; align-items: center; justify-content: center;
          margin-top: 2px;
        }
        .rg-feature-dot .material-symbols-outlined {
          font-size: 13px; color: #00d4aa;
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .rg-feature-text {
          font-size: 1.05rem; font-weight: 500;
          color: #bacac2; line-height: 1.4;
        }

        /* ─────────────────────────────────────────────
           RIGHT PANEL
        ───────────────────────────────────────────── */
        .rg-right {
          flex: 1;
          background: #0a0f1e;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 1.5rem;
          overflow-y: auto;
        }
        @media (min-width: 768px) { .rg-right { padding: 3rem 4rem; } }
        @media (min-width: 1024px) { .rg-right { padding: 3rem 6rem; } }

        /* Dot grid */
        .rg-right::before {
          content: '';
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(circle, #3b4a44 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.12;
        }

        .rg-form-wrap {
          position: relative; z-index: 1;
          max-width: 32rem; width: 100%; margin: 0 auto;
          display: flex; flex-direction: column; gap: 3rem;
          animation: rgFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes rgFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Step indicator + header */
        .rg-header { display: flex; flex-direction: column; gap: 1.5rem; }

        .rg-steps { display: flex; align-items: center; gap: 1rem; }
        .rg-step-dots { display: flex; gap: 6px; }
        .rg-step-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: #00d4aa;
        }
        .rg-step-label {
          font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.2em; color: #00d4aa;
          font-family: 'Inter', sans-serif;
        }

        .rg-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.75rem, 3vw, 2.25rem);
          font-weight: 700; color: #dee1f7;
          letter-spacing: -0.02em; line-height: 1.1;
        }
        .rg-subtitle {
          font-size: 0.95rem; color: #9ca3af; font-weight: 500; margin-top: 0.35rem;
        }

        /* Error */
        .rg-error {
          background: rgba(255,180,171,0.1);
          border: 1px solid rgba(255,180,171,0.25);
          color: #ffb4ab; border-radius: 0.75rem;
          padding: 0.75rem 1rem; font-size: 0.82rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .rg-error .material-symbols-outlined { font-size: 16px; }

        /* Form fields */
        .rg-form { display: flex; flex-direction: column; gap: 2.5rem; }

        .rg-field { display: flex; flex-direction: column; }
        .rg-label {
          font-size: 0.62rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.2em;
          color: #bacac2; margin-bottom: 0.5rem;
          transition: color 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .rg-field:focus-within .rg-label { color: #00d4aa; }

        .rg-input {
          width: 100%; background: transparent;
          border: none; border-bottom: 1px solid #3b4a44;
          padding: 0.75rem 0;
          color: #dee1f7; font-size: 1.05rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .rg-input::placeholder { color: rgba(222,225,247,0.18); }
        .rg-input:focus {
          border-bottom-color: #00d4aa;
          box-shadow: 0 4px 12px -4px rgba(0,212,170,0.35);
        }
        /* Autofill override */
        .rg-input:-webkit-autofill,
        .rg-input:-webkit-autofill:hover,
        .rg-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #dee1f7;
          -webkit-box-shadow: 0 0 0 1000px transparent inset;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* Strength meter */
        .strength-bars { display: flex; gap: 6px; width: 100%; margin-top: 1rem; }
        .strength-bar  {
          height: 4px; flex: 1; border-radius: 99px;
          background: rgba(59,74,68,0.5);
          transition: background 0.3s;
        }
        .strength-text {
          font-size: 0.62rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-top: 0.4rem; transition: color 0.3s;
        }

        /* Confirm password wrapper */
        .rg-confirm-wrap { position: relative; }
        .rg-confirm-icon {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
        }
        .rg-confirm-icon .material-symbols-outlined {
          font-size: 22px;
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        /* Submit */
        .rg-submit {
          width: 100%; height: 56px;
          background: #00d4aa; color: #00382b;
          border: none; border-radius: 9999px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: 1.05rem;
          cursor: pointer; letter-spacing: 0.01em;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          box-shadow: 0 4px 24px rgba(0,212,170,0.2);
          transition: background 0.3s, box-shadow 0.3s, transform 0.15s, opacity 0.2s;
        }
        .rg-submit:hover:not(:disabled) {
          background: #55fcd0;
          box-shadow: 0 4px 32px rgba(0,212,170,0.35);
        }
        .rg-submit:active:not(:disabled) { transform: scale(0.98); }
        .rg-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .rg-submit .material-symbols-outlined {
          font-size: 20px;
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .rg-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(0,56,43,0.3); border-top-color: #00382b;
          border-radius: 50%; animation: rgSpin 0.7s linear infinite;
        }
        @keyframes rgSpin { to { transform: rotate(360deg); } }

        /* Benefits card */
        .rg-benefits {
          background: #161b2b;
          border: 1px solid rgba(59,74,68,0.12);
          border-radius: 0.75rem; padding: 1.5rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .rg-benefits-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
        }
        .rg-benefit {
          display: flex; align-items: center; gap: 0.5rem;
        }
        .rg-benefit .material-symbols-outlined {
          font-size: 16px; color: #00d4aa;
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          flex-shrink: 0;
        }
        .rg-benefit-label {
          font-size: 0.65rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.06em; color: #bacac2;
        }

        /* Sign in link */
        .rg-signin {
          text-align: center; font-size: 0.9rem;
          color: #bacac2; font-weight: 500;
        }
        .rg-signin a {
          color: #00d4aa; font-weight: 700; margin-left: 0.25rem;
          text-decoration: underline; text-underline-offset: 4px;
          text-decoration-color: rgba(0,212,170,0.35);
          transition: color 0.2s;
        }
        .rg-signin a:hover { color: #55fcd0; }

        /* Global footer */
        .rg-global-footer {
          position: fixed; bottom: 0; right: 0;
          width: 55%; padding: 1.5rem 2rem;
          display: flex; justify-content: flex-end;
          align-items: center; gap: 1.5rem;
          pointer-events: none; z-index: 50;
        }
        @media (max-width: 767px) { .rg-global-footer { display: none; } }
        .rg-global-footer span,
        .rg-global-footer a {
          font-size: 0.6rem; text-transform: uppercase;
          letter-spacing: 0.1em; color: rgba(222,225,247,0.3);
          pointer-events: all; text-decoration: none; transition: color 0.2s;
        }
        .rg-global-footer a:hover { color: #dee1f7; }
      `}</style>

      <div className="rg">

        {/* ─── LEFT PANEL ─────────────────────────────────────────── */}
        <section className="rg-left">
          <div className="rg-left-img">
            <img
              src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80&fit=crop"
              alt="Clean desk with notebook — editorial mood"
            />
            <div className="rg-left-overlay" />
          </div>

          <div className="rg-left-content">
            <span className="rg-brand">Life Tracker</span>

            <div>
              <h1 className="rg-headline">
                Start your journey to financial{' '}
                <span>clarity.</span>
              </h1>

              <div className="rg-features" style={{ marginTop: '2rem' }}>
                {[
                  'Unlimited habit & expense tracking',
                  'AI-powered monthly summaries',
                  'Goal progress visualizations',
                  'Secure encrypted data storage',
                ].map((feat, i) => (
                  <div className="rg-feature" key={i}>
                    <div className="rg-feature-dot">
                      <span className="material-symbols-outlined">check</span>
                    </div>
                    <span className="rg-feature-text">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── RIGHT PANEL ────────────────────────────────────────── */}
        <section className="rg-right">
          <div className="rg-form-wrap">

            {/* Header */}
            <div className="rg-header">
              <div className="rg-steps">
                <div className="rg-step-dots">
                  <div className="rg-step-dot" />
                  <div className="rg-step-dot" />
                </div>
                <span className="rg-step-label">Account setup</span>
              </div>
              <div>
                <h2 className="rg-title">Create your account</h2>
                <p className="rg-subtitle">Free forever. No credit card required.</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rg-error">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            {/* Form */}
            <form className="rg-form" onSubmit={handleSubmit}>

              {/* Full Name */}
              <div className="rg-field">
                <label className="rg-label" htmlFor="rg-name">Full Name</label>
                <input
                  className="rg-input" id="rg-name" type="text"
                  placeholder="Johnathan Doe" required autoComplete="name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Email */}
              <div className="rg-field">
                <label className="rg-label" htmlFor="rg-email">Email Address</label>
                <input
                  className="rg-input" id="rg-email" type="email"
                  placeholder="name@company.com" required autoComplete="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {/* Password + strength */}
              <div className="rg-field">
                <label className="rg-label" htmlFor="rg-password">Password</label>
                <input
                  className="rg-input" id="rg-password" type="password"
                  placeholder="••••••••••••" required minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                {form.password.length > 0 && (
                  <>
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="strength-bar"
                          style={{ background: i <= strength ? strengthColor : undefined }}
                        />
                      ))}
                    </div>
                    <div className="strength-text" style={{ color: strengthColor }}>
                      {strengthLabel}
                    </div>
                  </>
                )}
              </div>

              {/* Confirm password */}
              <div className="rg-field">
                <label className="rg-label" htmlFor="rg-confirm">Confirm Password</label>
                <div className="rg-confirm-wrap">
                  <input
                    className="rg-input" id="rg-confirm" type="password"
                    placeholder="••••••••••••" required autoComplete="new-password"
                    style={{
                      paddingRight: '2rem',
                      borderBottomColor: passwordsMatch
                        ? '#00d4aa'
                        : passwordsMismatch
                          ? '#ef4444'
                          : undefined,
                    }}
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                  />
                  {(passwordsMatch || passwordsMismatch) && (
                    <div className="rg-confirm-icon">
                      <span
                        className="material-symbols-outlined"
                        style={{ color: passwordsMatch ? '#00d4aa' : '#ef4444' }}
                      >
                        {passwordsMatch ? 'check_circle' : 'cancel'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div>
                <button className="rg-submit" type="submit" disabled={loading}>
                  {loading ? (
                    <><div className="rg-spinner" /> Creating account…</>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">bolt</span>
                      Create Account
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Benefits card */}
            <div className="rg-benefits">
              <div className="rg-benefits-grid">
                {[
                  'No Fees', 'Cloud Sync', 'End-to-End', 'Priority Support',
                ].map(b => (
                  <div className="rg-benefit" key={b}>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="rg-benefit-label">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sign in link */}
            <div className="rg-signin">
              Already have an account?
              <Link to="/login">Sign in</Link>
            </div>

          </div>
        </section>
      </div>

      {/* Global footer */}
      <div className="rg-global-footer">
        <span>© 2025 Life Tracker — Precision Living Instruments</span>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Security</a>
      </div>
    </>
  );
}