import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return null;

    const linkClass = ({ isActive }) => isActive ? 'active' : '';

    return (
        <nav className="navbar">
            <NavLink to="/" className="nav-brand">LifeTracker</NavLink>
            <div className="nav-links">
                <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
                <NavLink to="/habits" className={linkClass}>Habits</NavLink>
                <NavLink to="/expenses" className={linkClass}>Expenses</NavLink>
                <NavLink to="/goals" className={linkClass}>Goals</NavLink>
                <NavLink to="/reports" className={linkClass}>Reports</NavLink>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--c-text2)' }}>👤 {user.name}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
        </nav>
    );
}