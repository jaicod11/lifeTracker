import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', icon: 'dashboard', label: 'Dashboard' },
  { to: '/habits', icon: 'event_repeat', label: 'Habits' },
  { to: '/expenses', icon: 'payments', label: 'Expenses' },
  { to: '/goals', icon: 'emoji_events', label: 'Goals' },
  { to: '/reports', icon: 'bar_chart', label: 'Reports' },
];

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'LT';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />

      <style>{`
        /* ── Shell reset ── */
        .sh * { box-sizing: border-box; }
        .sh {
          display: flex; min-height: 100vh;
          background: #0e1322; color: #dee1f7;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        /* ─────────────────────────────────────────────
           SIDEBAR
        ───────────────────────────────────────────── */
        .sh-sidebar {
          position: fixed; left: 0; top: 0;
          height: 100vh; width: 240px;
          background: #0d1117;
          display: flex; flex-direction: column;
          padding: 2rem 1rem;
          z-index: 50;
        }

        /* Brand */
        .sh-brand { margin-bottom: 3rem; padding: 0 0.5rem; }
        .sh-brand-row {
          display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;
        }
        .sh-brand-dot {
          width: 16px; height: 16px; border-radius: 50%;
          background: #00d4aa;
          box-shadow: 0 0 10px rgba(0,212,170,0.6);
          flex-shrink: 0;
        }
        .sh-brand-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.05rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #00d4aa;
        }
        .sh-brand-sub {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.58rem; letter-spacing: 0.22em;
          text-transform: uppercase; color: #475569;
          padding-left: 1.625rem;
        }

        /* Nav */
        .sh-nav { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
        .sh-nav-link {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-left: 4px solid transparent;
          color: #64748b; text-decoration: none;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.9rem; font-weight: 500; letter-spacing: -0.01em;
          transition: color 0.2s, background 0.2s,
                      transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .sh-nav-link:hover {
          color: #cbd5e1;
          transform: scale(1.03);
        }
        .sh-nav-link.active {
          border-left-color: #00d4aa;
          color: #00d4aa; font-weight: 700;
          background: rgba(0,212,170,0.05);
        }
        .sh-nav-link .material-symbols-outlined { font-size: 20px; }

        /* User card */
        .sh-user {
          margin-top: auto;
          display: flex; align-items: center; gap: 0.75rem;
          background: #161b2b; border-radius: 0.75rem;
          padding: 0.875rem 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .sh-user:hover { background: #1e2535; }
        .sh-user-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #00d4aa, #46f1c5);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.72rem; font-weight: 700; color: #00382b;
          flex-shrink: 0;
        }
        .sh-user-name {
          font-size: 0.82rem; font-weight: 600; color: #dee1f7;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sh-user-tier {
          font-size: 0.58rem; color: #475569;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-top: 0.1rem;
        }
        .sh-sign-out-btn {
          background: none; border: none; cursor: pointer;
          color: #475569; margin-left: auto; flex-shrink: 0;
          transition: color 0.2s;
          display: flex; align-items: center;
        }
        .sh-sign-out-btn:hover { color: #ef4444; }
        .sh-sign-out-btn .material-symbols-outlined { font-size: 17px; }

        /* ─────────────────────────────────────────────
           TOP BAR
        ───────────────────────────────────────────── */
        .sh-topbar {
          position: sticky; top: 0; z-index: 40;
          background: rgba(9,14,28,0.85);
          backdrop-filter: blur(20px);
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 2rem;
          box-shadow: 0 20px 25px -5px rgba(0,212,170,0.04);
        }
        .sh-topbar-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.35rem; font-weight: 900;
          color: #fff; letter-spacing: -0.03em;
          white-space: nowrap;
        }
        .sh-search-wrap {
          flex: 1; max-width: 360px; margin: 0 2rem; position: relative;
        }
        .sh-search-icon {
          position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
          color: #475569; font-size: 18px; pointer-events: none;
          transition: color 0.2s;
        }
        .sh-search-wrap:focus-within .sh-search-icon { color: #00d4aa; }
        .sh-search {
          width: 100%; background: #2f3445; border: none;
          border-radius: 9999px; padding: 0.6rem 1rem 0.6rem 2.75rem;
          color: #dee1f7; font-size: 0.82rem; outline: none;
          transition: box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .sh-search::placeholder { color: #475569; }
        .sh-search:focus { box-shadow: 0 0 0 1px rgba(0,212,170,0.4); }
        .sh-topbar-right { display: flex; align-items: center; gap: 0.5rem; }
        .sh-icon-btn {
          padding: 0.5rem; color: #64748b; background: none; border: none;
          cursor: pointer; border-radius: 0.5rem;
          transition: color 0.2s, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex; align-items: center;
        }
        .sh-icon-btn:hover { color: #00d4aa; transform: scale(1.1); }
        .sh-icon-btn .material-symbols-outlined { font-size: 22px; }
        .sh-avatar-btn {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #00d4aa, #46f1c5);
          border: 1px solid rgba(59,74,68,0.35);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.7rem; font-weight: 700; color: #00382b;
          cursor: pointer; overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .sh-avatar-btn:hover { transform: scale(1.1); }

        /* ─────────────────────────────────────────────
           MAIN CONTENT
        ───────────────────────────────────────────── */
        .sh-main {
          margin-left: 240px;
          display: flex; flex-direction: column;
          min-height: 100vh; flex: 1;
          background: #0e1322;
        }
        .sh-content { flex: 1; }

        @media (max-width: 1024px) {
          .sh-sidebar { display: none; }
          .sh-main   { margin-left: 0; }
        }
      `}</style>

      <div className="sh">
        {/* ── Sidebar ── */}
        <aside className="sh-sidebar">
          <div className="sh-brand">
            <div className="sh-brand-row">
              <div className="sh-brand-dot" />
              <span className="sh-brand-name">Life Tracker</span>
            </div>
            <p className="sh-brand-sub">Atmospheric Precision</p>
          </div>

          <nav className="sh-nav">
            {NAV_ITEMS.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `sh-nav-link${isActive ? ' active' : ''}`
                }
              >
                <span className="material-symbols-outlined">{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="sh-user">
            <div className="sh-user-avatar">{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p className="sh-user-name">{user?.name || 'User'}</p>
              <p className="sh-user-tier">Pro Tier Account</p>
            </div>
            <button className="sh-sign-out-btn" onClick={handleLogout} title="Sign out">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="sh-main">
          {/* Top bar */}
          <header className="sh-topbar">
            <span className="sh-topbar-title">The Editorial Ledger</span>
            <div className="sh-search-wrap">
              <span className="material-symbols-outlined sh-search-icon">search</span>
              <input className="sh-search" placeholder="Scan ledger for metrics..." />
            </div>
            <div className="sh-topbar-right">
              <button className="sh-icon-btn">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="sh-icon-btn">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="sh-avatar-btn">{initials}</div>
            </div>
          </header>

          <div className="sh-content">{children}</div>
        </div>
      </div>
    </>
  );
}