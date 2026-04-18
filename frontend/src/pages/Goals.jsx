import { useEffect, useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import api from '../api/axios';

const CATEGORY_ICONS = {
    finance: { icon: 'account_balance_wallet', color: '#00d4aa' },
    health: { icon: 'favorite', color: '#00d4aa' },
    learning: { icon: 'menu_book', color: '#f59e0b' },
    language: { icon: 'translate', color: '#00d4aa' },
    lifestyle: { icon: 'self_improvement', color: '#00d4aa' },
    career: { icon: 'terminal', color: '#00d4aa' },
    other: { icon: 'auto_awesome', color: '#00d4aa' },
};

const getCatCfg = (cat) => CATEGORY_ICONS[cat] || CATEGORY_ICONS.other;

// ── Goal Create / Edit Modal ───────────────────────────────────────────────
function GoalModal({ goal, onClose, onSave }) {
    const [form, setForm] = useState({
        title: goal?.title || '',
        description: goal?.description || '',
        category: goal?.category || 'other',
        target: goal?.target || '',
        current: goal?.current || 0,
        unit: goal?.unit || '',
        deadline: goal?.deadline
            ? new Date(goal.deadline).toISOString().split('T')[0] : '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (goal?._id) {
                const res = await api.put(`/goals/${goal._id}`, form);
                onSave(res.data, 'edit');
            } else {
                const res = await api.post('/goals', form);
                onSave(res.data, 'create');
            }
            onClose();
        } catch (err) { setError(err.response?.data?.message || 'Failed.'); }
        finally { setSaving(false); }
    };

    const CATS = ['finance', 'health', 'learning', 'language', 'lifestyle', 'career', 'other'];
    const inp = {
        width: '100%', background: '#0a0f1e', border: '1px solid #2f3445',
        borderRadius: '0.625rem', padding: '0.7rem 1rem',
        color: '#dee1f7', fontSize: '0.9rem', outline: 'none',
        fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s, box-shadow 0.2s',
    };
    const focus = e => { e.currentTarget.style.borderColor = '#00d4aa'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,170,0.1)'; };
    const blur = e => { e.currentTarget.style.borderColor = '#2f3445'; e.currentTarget.style.boxShadow = 'none'; };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'gFadeIn 0.2s ease' }} onClick={onClose}>
            <div style={{ background: '#111827', border: '1px solid #2f3445', borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.5)', animation: 'gSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>
                        {goal?._id ? 'Edit Goal' : 'Create New Goal'}
                    </h2>
                    <button onClick={onClose} style={{ background: '#25293a', border: 'none', width: 30, height: 30, borderRadius: '50%', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                    </button>
                </div>

                {error && <div style={{ background: 'rgba(255,113,108,0.1)', border: '1px solid rgba(255,113,108,0.25)', color: '#ff716c', borderRadius: '0.625rem', padding: '0.625rem 0.875rem', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Category */}
                    <div>
                        <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Category</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {CATS.map(c => (
                                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, category: c }))} style={{
                                    padding: '0.3rem 0.75rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                                    background: form.category === c ? 'rgba(0,212,170,0.15)' : '#25293a',
                                    border: `1px solid ${form.category === c ? '#00d4aa' : 'transparent'}`,
                                    color: form.category === c ? '#00d4aa' : '#64748b',
                                    fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                                    fontFamily: "'Inter',sans-serif", transition: 'all 0.15s',
                                }}>{c}</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Goal Title *</label>
                        <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Run a marathon" style={inp} onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Description</label>
                        <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" style={inp} onFocus={focus} onBlur={blur} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Target *</label>
                            <input required type="number" min="1" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="100" style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Unit</label>
                            <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="km, books, ₹..." style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Current Progress</label>
                            <input type="number" min="0" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} placeholder="0" style={inp} onFocus={focus} onBlur={blur} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Deadline</label>
                            <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={{ ...inp, colorScheme: 'dark' }} onFocus={focus} onBlur={blur} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #2f3445', background: 'none', color: '#64748b', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>Cancel</button>
                        <button type="submit" disabled={saving} style={{ flex: 2, padding: '0.85rem', borderRadius: '0.75rem', border: 'none', background: '#00d4aa', color: '#00382b', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 0 20px rgba(0,212,170,0.25)' }}>
                            {saving && <div style={{ width: 16, height: 16, border: '2px solid rgba(0,56,43,0.3)', borderTopColor: '#00382b', borderRadius: '50%', animation: 'gSpin 0.7s linear infinite' }} />}
                            {goal?._id ? 'Update Goal' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Progress Update Modal ──────────────────────────────────────────────────
function ProgressModal({ goal, onClose, onSave }) {
    const [value, setValue] = useState(goal.current);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.patch(`/goals/${goal._id}/progress`, { current: Number(value) });
            onSave(res.data); onClose();
        } catch { /* silent */ }
        finally { setSaving(false); }
    };

    const pct = Math.min(100, Math.round((value / goal.target) * 100));

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
            <div style={{ background: '#111827', border: '1px solid #2f3445', borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.5)', animation: 'gSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#fff', marginBottom: '0.3rem' }}>Update Progress</h3>
                <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '1.5rem' }}>{goal.title}</p>

                <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Progress</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00d4aa' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: '#0a0f1e', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: '#00d4aa', width: `${pct}%`, boxShadow: '0 0 8px rgba(0,212,170,0.4)', transition: 'width 0.3s ease' }} />
                    </div>
                </div>

                <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>
                    Current ({goal.unit || 'units'})
                </label>
                <input type="number" min="0" max={goal.target} value={value}
                    onChange={e => setValue(e.target.value)}
                    style={{ width: '100%', background: '#0a0f1e', border: '1px solid #2f3445', borderRadius: '0.625rem', padding: '0.75rem 1rem', color: '#dee1f7', fontSize: '1rem', outline: 'none', fontFamily: "'Inter',sans-serif", marginBottom: '1.25rem', transition: 'border-color 0.2s' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#00d4aa'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#2f3445'; }}
                />

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #2f3445', background: 'none', color: '#64748b', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.75rem', borderRadius: '0.75rem', border: 'none', background: '#00d4aa', color: '#00382b', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}>
                        {saving && <div style={{ width: 14, height: 14, border: '2px solid rgba(0,56,43,0.3)', borderTopColor: '#00382b', borderRadius: '50%', animation: 'gSpin 0.7s linear infinite' }} />}
                        Save Progress
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Featured Goal Card (left 60%) ──────────────────────────────────────────
function FeaturedCard({ goal, onEdit, onDelete, onProgress }) {
    const pct = goal.progressPercent || 0;
    const deadline = goal.deadline
        ? new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

    return (
        <div style={{ background: '#111827', borderRadius: '1.5rem', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(59,74,68,0.15)', minHeight: 320, position: 'relative', overflow: 'hidden' }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ padding: '0.3rem 0.875rem', borderRadius: '9999px', border: '1px solid rgba(0,212,170,0.35)', color: '#00d4aa', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {goal.category || 'Personal'}
                    </span>
                    {deadline && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.78rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
                            {deadline}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={onProgress} style={{ width: 38, height: 38, borderRadius: '50%', background: '#161b2b', border: 'none', cursor: 'pointer', color: '#00d4aa', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,170,0.15)'} onMouseLeave={e => e.currentTarget.style.background = '#161b2b'}>
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>trending_up</span>
                    </button>
                    <button onClick={onEdit} style={{ width: 38, height: 38, borderRadius: '50%', background: '#161b2b', border: 'none', cursor: 'pointer', color: '#dee1f7', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#25293a'} onMouseLeave={e => e.currentTarget.style.background = '#161b2b'}>
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>edit</span>
                    </button>
                    <button onClick={onDelete} style={{ width: 38, height: 38, borderRadius: '50%', background: '#161b2b', border: 'none', cursor: 'pointer', color: '#ff716c', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ff716c'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = '#161b2b'; e.currentTarget.style.color = '#ff716c'; }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>delete</span>
                    </button>
                </div>
            </div>

            {/* Title */}
            <div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', letterSpacing: '-0.03em', color: '#f9fafb', marginBottom: '0.75rem', lineHeight: 1.1 }}>
                    {goal.title}
                </h3>
                {goal.description && (
                    <p style={{ color: '#9ca3af', fontSize: '0.95rem', maxWidth: '28rem', lineHeight: 1.6 }}>{goal.description}</p>
                )}
            </div>

            {/* Progress */}
            <div style={{ marginTop: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.875rem' }}>
                    <div>
                        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9ca3af', marginBottom: '0.25rem' }}>Current Progress</p>
                        <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.35rem', fontWeight: 700, color: '#f9fafb' }}>
                            {goal.current} {goal.unit}
                            <span style={{ color: '#334155', fontWeight: 400, fontSize: '1rem' }}> / {goal.target}{goal.unit ? ` ${goal.unit}` : ''}</span>
                        </p>
                    </div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '2rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>
                        {pct}%
                    </div>
                </div>
                <div style={{ height: 10, background: '#0a0f1e', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: '#00d4aa', width: `${pct}%`, boxShadow: '0 0 12px rgba(0,212,170,0.35)', transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
                </div>
            </div>
        </div>
    );
}

// ── Secondary Goal Card (right 40%) ───────────────────────────────────────
function SecondaryCard({ goal, onEdit, onDelete, onProgress }) {
    const cfg = getCatCfg(goal.category);
    const pct = goal.progressPercent || 0;

    return (
        <div style={{ background: '#111827', borderRadius: '1.5rem', padding: '2rem', display: 'flex', flexDirection: 'column', border: '1px solid transparent', transition: 'border-color 0.3s', cursor: 'default' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,170,0.2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: 'rgba(0,212,170,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: '#00d4aa', fontSize: 20, fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" }}>{cfg.icon}</span>
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', color: '#00d4aa', textTransform: 'uppercase' }}>
                    {goal.category || 'Personal'}
                </span>
            </div>

            <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.35rem', color: '#f9fafb', marginBottom: '0.5rem' }}>
                {goal.title}
            </h4>
            {goal.description && (
                <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '2rem', lineHeight: 1.6, flex: 1 }}>{goal.description}</p>
            )}

            {/* Progress */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f9fafb' }}>
                        {goal.current} / {goal.target} {goal.unit}
                    </span>
                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#00d4aa' }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: '#0a0f1e', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: '#00d4aa', width: `${pct}%`, transition: 'width 1s ease' }} />
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
                <button onClick={onProgress} style={{ width: '100%', padding: '0.85rem', background: '#00d4aa', color: '#00382b', border: 'none', borderRadius: '0.75rem', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    Update
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button onClick={onEdit} style={{ padding: '0.75rem', border: '1px solid rgba(0,212,170,0.3)', color: '#00d4aa', background: 'transparent', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,170,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        Edit
                    </button>
                    <button onClick={onDelete} style={{ padding: '0.75rem', border: 'none', color: '#ff716c', background: 'transparent', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,113,108,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Trajectory List Row ────────────────────────────────────────────────────
function TrajectoryRow({ goal, onProgress, onEdit, onDelete }) {
    const cfg = getCatCfg(goal.category);
    const pct = goal.progressPercent || 0;
    const pctColor = pct >= 70 ? '#00d4aa' : pct >= 30 ? '#f59e0b' : '#64748b';

    return (
        <div style={{ background: '#111827', borderRadius: '1rem', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'transform 0.3s ease, background 0.2s', cursor: 'default' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.background = '#161b2b'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#111827'; }}
            className="traj-row"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                {/* Icon */}
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1a1f2f', border: `1px solid ${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ color: cfg.color, fontSize: 22 }}>{cfg.icon}</span>
                </div>
                {/* Info */}
                <div style={{ minWidth: 0, maxWidth: '14rem' }}>
                    <h6 style={{ fontWeight: 700, fontSize: '1rem', color: '#f9fafb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{goal.title}</h6>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.15rem' }}>{goal.description || goal.category}</p>
                </div>
                {/* Progress bar */}
                <div style={{ flex: 1, padding: '0 2rem' }}>
                    <div style={{ height: 5, background: '#0a0f1e', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: pctColor, width: `${pct}%`, transition: 'width 1s ease', boxShadow: `0 0 6px ${pctColor}60` }} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: pctColor, minWidth: '3rem', textAlign: 'right' }}>
                    {pct}%
                </span>
                <div className="traj-actions" style={{ display: 'flex', gap: '0.25rem', opacity: 0, transition: 'opacity 0.2s' }}>
                    <button onClick={onProgress} style={{ padding: '0.4rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#00d4aa'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
                    </button>
                    <button onClick={onEdit} style={{ padding: '0.4rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_vert</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Goals Page ────────────────────────────────────────────────────────
export default function Goals() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editGoal, setEditGoal] = useState(null);
    const [progressGoal, setProgressGoal] = useState(null);
    const [error, setError] = useState('');

    const fetchGoals = useCallback(async () => {
        try { const res = await api.get('/goals'); setGoals(res.data); }
        catch { setError('Failed to load goals.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchGoals(); }, [fetchGoals]);

    const handleSave = (saved, type) => {
        if (type === 'edit') setGoals(p => p.map(g => g._id === saved._id ? saved : g));
        else setGoals(p => [saved, ...p]);
    };

    const handleProgressSave = (updated) => {
        setGoals(p => p.map(g => g._id === updated._id ? updated : g));
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this goal?')) return;
        try { await api.delete(`/goals/${id}`); setGoals(p => p.filter(g => g._id !== id)); }
        catch { setError('Failed.'); }
    };

    const avgProgress = goals.length
        ? Math.round(goals.reduce((s, g) => s + (g.progressPercent || 0), 0) / goals.length)
        : 0;

    const featured = goals[0] || null;
    const secondary = goals[1] || null;
    const trajectories = goals.slice(2);

    return (
        <DashboardShell>
            <style>{`
        @keyframes gFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes gSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gFadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gSpin    { to{transform:rotate(360deg)} }
        .traj-row:hover .traj-actions { opacity: 1 !important; }
      `}</style>

            <div style={{ padding: '2.5rem', maxWidth: 1300 }}>
                {error && <div style={{ background: 'rgba(255,113,108,0.1)', border: '1px solid rgba(255,113,108,0.25)', color: '#ff716c', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>{error}<button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ff716c', cursor: 'pointer' }}>×</button></div>}

                {/* ── Page Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', gap: '1.5rem', flexWrap: 'wrap', animation: 'gFadeUp 0.5s ease both' }}>
                    <div style={{ maxWidth: '42rem' }}>
                        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.03em', color: '#00d4aa', marginBottom: '0.75rem', lineHeight: 1.05, textShadow: '0 0 15px rgba(0,212,170,0.3)' }}>
                            Strategic Milestones
                        </h1>
                        <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.75 }}>
                            Define the trajectory of your professional and personal evolution. Monitor progress with surgical precision.
                        </p>
                    </div>
                    <button onClick={() => { setEditGoal(null); setShowModal(true); }} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.875rem 1.75rem', borderRadius: '9999px', border: 'none',
                        background: '#f59e0b', color: '#422006', cursor: 'pointer',
                        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '0.9rem',
                        boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                        transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" }}>flag</span>
                        Create New Goal
                    </button>
                </div>

                {/* ── Loading ── */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                        <div style={{ width: 36, height: 36, border: '3px solid rgba(0,212,170,0.2)', borderTopColor: '#00d4aa', borderRadius: '50%', animation: 'gSpin 0.7s linear infinite' }} />
                    </div>
                ) : goals.length === 0 ? (
                    <div style={{ background: '#111827', borderRadius: '1.5rem', padding: '5rem', textAlign: 'center', border: '1px solid rgba(59,74,68,0.1)', animation: 'gFadeUp 0.5s ease both' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#2f3445', display: 'block', marginBottom: '1rem' }}>flag</span>
                        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>No milestones yet</h3>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Set your first strategic goal and start tracking your progress.</p>
                        <button onClick={() => setShowModal(true)} style={{ background: '#00d4aa', color: '#00382b', border: 'none', padding: '0.75rem 2rem', borderRadius: '9999px', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 0 20px rgba(0,212,170,0.25)' }}>
                            Create First Goal
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ── Bento: Featured + Secondary ── */}
                        <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '1.5rem', marginBottom: '1.5rem', animation: 'gFadeUp 0.5s ease 0.05s both' }}>
                            {featured && (
                                <FeaturedCard goal={featured}
                                    onEdit={() => { setEditGoal(featured); setShowModal(true); }}
                                    onDelete={() => handleDelete(featured._id)}
                                    onProgress={() => setProgressGoal(featured)}
                                />
                            )}
                            {secondary ? (
                                <SecondaryCard goal={secondary}
                                    onEdit={() => { setEditGoal(secondary); setShowModal(true); }}
                                    onDelete={() => handleDelete(secondary._id)}
                                    onProgress={() => setProgressGoal(secondary)}
                                />
                            ) : (
                                <div style={{ background: '#111827', borderRadius: '1.5rem', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '1px dashed #2f3445', gap: '1rem' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#2f3445' }}>add_circle</span>
                                    <p style={{ color: '#475569', fontSize: '0.875rem' }}>Add another milestone</p>
                                    <button onClick={() => setShowModal(true)} style={{ background: 'rgba(0,212,170,0.1)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.2)', padding: '0.6rem 1.5rem', borderRadius: '9999px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                                        Create Goal
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Life Score / Momentum card ── */}
                        <div style={{
                            background: 'linear-gradient(135deg, #004d40, #002d26)',
                            borderRadius: '1.25rem', padding: '2rem', marginBottom: '3rem',
                            position: 'relative', overflow: 'hidden',
                            animation: 'gFadeUp 0.5s ease 0.1s both',
                        }}>
                            <div style={{ position: 'absolute', right: 0, top: 0, width: '16rem', height: '100%', background: 'rgba(0,212,170,0.04)', transform: 'skewX(-12deg) translateX(8rem)', transition: 'transform 0.7s ease', pointerEvents: 'none' }} />
                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#fff', fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" }}>rocket_launch</span>
                                    </div>
                                    <div>
                                        <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.35rem', color: '#fff', marginBottom: '0.35rem' }}>Keep going!</h4>
                                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>
                                            {avgProgress > 0
                                                ? `You're averaging ${avgProgress}% progress across all milestones.`
                                                : 'Your goals are set. Start logging progress to track your life score.'}
                                        </p>
                                    </div>
                                </div>
                                <button style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.75rem 2rem', borderRadius: '9999px', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '0.875rem', backdropFilter: 'blur(8px)', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                >
                                    View Trajectory Details
                                </button>
                            </div>
                        </div>

                        {/* ── Upcoming Trajectories ── */}
                        {trajectories.length > 0 && (
                            <div style={{ animation: 'gFadeUp 0.5s ease 0.15s both' }}>
                                <h5 style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '1.5rem' }}>
                                    Upcoming Trajectories
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                    {trajectories.map(goal => (
                                        <TrajectoryRow key={goal._id} goal={goal}
                                            onProgress={() => setProgressGoal(goal)}
                                            onEdit={() => { setEditGoal(goal); setShowModal(true); }}
                                            onDelete={() => handleDelete(goal._id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {showModal && (
                <GoalModal goal={editGoal}
                    onClose={() => { setShowModal(false); setEditGoal(null); }}
                    onSave={handleSave}
                />
            )}
            {progressGoal && (
                <ProgressModal goal={progressGoal}
                    onClose={() => setProgressGoal(null)}
                    onSave={handleProgressSave}
                />
            )}
        </DashboardShell>
    );
}