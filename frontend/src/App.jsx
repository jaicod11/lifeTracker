import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Reports from './pages/Reports';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    return user ? <Navigate to="/" replace /> : children;
}

function LoadingScreen() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: '#0e1322',
        }}>
            <div style={{
                width: 40, height: 40,
                border: '3px solid rgba(0,212,170,0.2)',
                borderTopColor: '#00d4aa',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes — redirect to dashboard if already logged in */}
                <Route path="/login" element={
                    <PublicRoute><Login /></PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute><Register /></PublicRoute>
                } />

                {/* Private routes — redirect to login if not logged in */}
                <Route path="/" element={
                    <PrivateRoute><Dashboard /></PrivateRoute>
                } />
                <Route path="/habits" element={
                    <PrivateRoute><Habits /></PrivateRoute>
                } />
                <Route path="/expenses" element={
                    <PrivateRoute><Expenses /></PrivateRoute>
                } />
                <Route path="/goals" element={
                    <PrivateRoute><Goals /></PrivateRoute>
                } />
                <Route path="/reports" element={
                    <PrivateRoute><Reports /></PrivateRoute>
                } />

                {/* Catch-all — redirect unknown paths to dashboard (or login if unauth) */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}