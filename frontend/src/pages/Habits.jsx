import { useEffect, useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import DashboardShell from '../components/DashboardShell';
import api from '../api/axios';

const ICON_MAP = {
    fitness_center: '💪', water_drop: '💧', menu_book: '📖',
    self_improvement: '🧘', directions_run: '🏃', restaurant: '🍽',
    bedtime: '😴', payments: '💰', mindfulness: '🌿',
    favorite: '❤️', school: '📚', check_circle: '✅',
};

const HABIT_ICONS = [
    'fitness_center', 'water_drop', 'menu_book', 'self_improvement',
    'directions_run', 'restaurant', 'bedtime', 'payments',
    'mindfulness', 'favorite', 'school', 'check_circle',
];

// ── Week Day Circle ────────────────────────────────────────────────────────
function DayCircle({ label, date, isToday, status }) {
    // status: 'done' | 'missed' | 'today' | 'future'
    const bg = status === 'done' ? '#00d4aa'
        : status === 'missed' ? '#f59e0b'
            : status === 'today' ? '#00d4aa'
                : 'transparent';
    const textColor = (status === 'done' || status === 'missed' || status === 'today')
        ? '#00382b' : '#64748b';
    const border = status === 'future' ? '1px solid #2f3445' : 'none';
    const size = status === 'today' ? 68 : 48;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
                fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.12em', color: status === 'today' ? '#00d4aa' : '#64748b',
            }}>{label}</span>
            <div style={{
                width: size, height: size, borderRadius: '50%',
                background: bg, border,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: status === 'today' ? '0 0 20px rgba(0,212,170,0.4)' : 'none',
                transition: 'all 0.3s',
            }}>
                {status === 'done' && (
                    <span className="material-symbols-outlined" style={{
                        fontSize: 22, color: '#00382b',
                        fontVariationSettings: "'FILL' 1,'wght' 700,'GRAD' 0,'opsz' 24",
                    }}>check</span>
                )}
                {status === 'missed' && (
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#00382b' }}>close</span>
                )}
                {(status === 'today' || status === 'future') && (
                    <span style={{
                        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                        fontSize: status === 'today' ? '1.5rem' : '1rem',
                        color: status === 'today' ? '#00382b' : '#475569',
                    }}>{date.getDate()}</span>
                )}
            </div>
        </div>
    );
}

// ── Habit Card ─────────────────────────────────────────────────────────────
function HabitCard({ habit, onComplete, onUncomplete, onEdit, onDelete, animating }) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const done = habit.completedDates?.some(
        d => new Date(d).toDateString() === today.toDateString()
    );
    const streak = habit.currentStreak || 0;

    // 3 dot indicators based on streak
    const dots = [
        streak >= 1 ? '#40d399' : '#334155',
        streak >= 3 ? '#40d399' : '#334155',
        streak >= 7 ? '#40d399' : '#334155',
    ];

    const isPulsing = animating === habit._id;

    return (
        <div
            className={isPulsing ? 'h-complete-anim' : ''}
            style={{
                background: '#111827',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                border: '1px solid rgba(133,148,141,0.1)',
                cursor: 'pointer', position: 'relative',
                opacity: done ? 0.65 : 1,
                transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275), border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
                if (!done) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)';
                }
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'rgba(133,148,141,0.1)';
            }}
        >
            {/* Icon circle */}
            <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: done ? '#00d4aa' : '#25293a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: done ? '0 0 12px rgba(0,212,170,0.4)' : 'none',
                transition: 'all 0.3s',
            }}>
                <span className="material-symbols-outlined" style={{
                    fontSize: 26, color: done ? '#00382b' : '#64748b',
                    fontVariationSettings: done ? "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" : "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24",
                    transition: 'color 0.3s',
                }}>check_circle</span>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
                    <h4 style={{
                        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                        fontSize: '1.05rem', color: '#fff',
                        textDecoration: done ? 'line-through' : 'none',
                        textDecorationColor: '#64748b',
                        transition: 'color 0.2s',
                    }}>{habit.name}</h4>
                    {!done && (
                        <span style={{
                            background: 'rgba(238,152,0,0.2)', color: '#ee9800',
                            fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.06em',
                            padding: '0.15rem 0.5rem', borderRadius: '0.25rem',
                        }}>DUE TODAY</span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
                        {habit.frequency === 'daily' ? 'Daily' : 'Weekly'} · {streak}d streak
                    </p>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {dots.map((c, i) => (
                            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit / Delete — appear on hover */}
            <div className="habit-actions" style={{
                display: 'flex', gap: '0.25rem', opacity: 0, marginRight: '1rem',
                transition: 'opacity 0.2s',
            }}>
                <button onClick={e => { e.stopPropagation(); onEdit(habit); }} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.35rem',
                    transition: 'color 0.2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                </button>
                <button onClick={e => { e.stopPropagation(); onDelete(habit._id); }} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.35rem',
                    transition: 'color 0.2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff716c'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                </button>
            </div>

            {/* Complete button */}
            <button
                onClick={e => { e.stopPropagation(); done ? onUncomplete(habit._id) : onComplete(habit._id); }}
                style={{
                    width: 48, height: 48, borderRadius: '50%', border: 'none', flexShrink: 0,
                    background: done ? '#00d4aa' : 'transparent',
                    border: done ? 'none' : '2px solid rgba(0,212,170,0.3)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
                    boxShadow: done ? '0 0 12px rgba(0,212,170,0.4)' : 'none',
                }}
                onMouseEnter={e => {
                    if (!done) {
                        e.currentTarget.style.borderColor = '#00d4aa';
                        e.currentTarget.style.background = 'rgba(0,212,170,0.1)';
                    } else {
                        e.currentTarget.style.transform = 'scale(0.95)';
                    }
                }}
                onMouseLeave={e => {
                    if (!done) {
                        e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)';
                        e.currentTarget.style.background = 'transparent';
                    }
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                {done && (
                    <span className="material-symbols-outlined" style={{
                        fontSize: 22, color: '#00382b',
                        fontVariationSettings: "'FILL' 1,'wght' 700,'GRAD' 0,'opsz' 24",
                    }}>done</span>
                )}
            </button>
        </div>
    );
}

// ── Goal Milestones ────────────────────────────────────────────────────────
function GoalMilestones({ goals }) {
    const sorted = [...goals].sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
        return 0;
    });
    const displayed = sorted.slice(0, 3);

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span className="material-symbols-outlined" style={{
                    color: '#00d4aa', fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24",
                }}>emoji_events</span>
                <h3 style={{
                    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                    fontSize: '1.15rem', color: '#fff',
                }}>Goal Milestones</h3>
            </div>

            <div style={{ position: 'relative', paddingLeft: '1.5rem', paddingBottom: '2rem' }}>
                {/* Vertical line */}
                <div style={{
                    position: 'absolute', left: 7, top: 8, bottom: 0,
                    width: 2,
                    background: 'linear-gradient(to bottom, #00d4aa, #1e2535)',
                }} />

                {displayed.length === 0 ? (
                    <div style={{ color: '#475569', fontSize: '0.82rem', paddingLeft: '1rem' }}>
                        No goals yet. <NavLink to="/goals" style={{ color: '#00d4aa' }}>Create one →</NavLink>
                    </div>
                ) : displayed.map((goal, i) => {
                    const pct = goal.progressPercent || 0;
                    const daysLeft = goal.deadline
                        ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                        : null;
                    const isActive = i === 0 && !goal.completed;
                    const dotColor = isActive ? '#ffb95f' : '#334155';
                    const labelColor = isActive ? '#ffb95f' : '#475569';
                    const titleColor = isActive ? '#fff' : '#94a3b8';
                    const barColor = isActive ? '#00d4aa' : '#334155';

                    return (
                        <div key={goal._id} style={{ position: 'relative', marginBottom: '2.5rem' }}>
                            {/* Dot */}
                            <div style={{
                                position: 'absolute', left: -23, top: 4,
                                width: 14, height: 14, borderRadius: '50%',
                                background: dotColor,
                                boxShadow: isActive ? '0 0 0 4px rgba(255,185,95,0.2)' : 'none',
                            }} />

                            <span style={{
                                fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.2em',
                                textTransform: 'uppercase', color: labelColor, display: 'block', marginBottom: '0.35rem',
                            }}>
                                {daysLeft !== null ? `${daysLeft}D LEFT` : goal.completed ? 'COMPLETE' : 'ONGOING'}
                            </span>
                            <h4 style={{ fontWeight: 700, color: titleColor, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                                {goal.title}
                            </h4>

                            <div style={{ height: 5, background: '#25293a', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: 99, background: barColor,
                                    width: `${pct}%`,
                                    boxShadow: isActive ? '0 0 8px rgba(0,212,170,0.5)' : 'none',
                                    transition: 'width 1s ease',
                                }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                                <span style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Progress
                                </span>
                                <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isActive ? '#00d4aa' : '#475569' }}>
                                    {pct}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Achievement Looming card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(238,152,0,0.15), transparent)',
                border: '1px solid rgba(255,185,95,0.15)',
                borderRadius: '0.75rem', padding: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
                <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: '#ee9800',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(238,152,0,0.3)',
                    flexShrink: 0,
                }}>
                    <span className="material-symbols-outlined" style={{
                        color: '#472a00', fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24",
                    }}>military_tech</span>
                </div>
                <div>
                    <p style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ffb95f', marginBottom: '0.2rem', lineHeight: 1 }}>
                        Achievement Looming
                    </p>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}>
                        The Visionary Tier
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Create / Edit Modal ────────────────────────────────────────────────────
function HabitModal({ habit, onClose, onSave }) {
    const [form, setForm] = useState({
        name: habit?.name || '',
        description: habit?.description || '',
        frequency: habit?.frequency || 'daily',
        icon: habit?.icon || 'check_circle',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); if (!form.name) return;
        setSaving(true);
        try {
            if (habit?._id) {
                const res = await api.put(`/habits/${habit._id}`, form);
                onSave(res.data, 'edit');
            } else {
                const res = await api.post('/habits', form);
                onSave(res.data, 'create');
            }
            onClose();
        } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
        finally { setSaving(false); }
    };

    const inputSt = {
        width: '100%', background: '#0a0f1e', border: '1px solid #2f3445',
        borderRadius: '0.625rem', padding: '0.75rem 1rem',
        color: '#dee1f7', fontSize: '0.9rem', outline: 'none',
        fontFamily: "'Inter', sans-serif",
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            animation: 'hFadeIn 0.2s ease',
        }} onClick={onClose}>
            <div style={{
                background: '#111827', border: '1px solid #2f3445',
                borderRadius: '1.25rem', padding: '2rem',
                width: '100%', maxWidth: 440,
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                animation: 'hSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)',
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>
                        {habit?._id ? 'Edit Habit' : 'New Habit'}
                    </h2>
                    <button onClick={onClose} style={{ background: '#25293a', border: 'none', width: 30, height: 30, borderRadius: '50%', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                    </button>
                </div>

                {error && (
                    <div style={{ background: 'rgba(255,113,108,0.1)', border: '1px solid rgba(255,113,108,0.25)', color: '#ff716c', borderRadius: '0.625rem', padding: '0.625rem 0.875rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Icon picker */}
                    <div>
                        <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Icon</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {HABIT_ICONS.map(ic => (
                                <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{
                                    width: 36, height: 36, borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                                    background: form.icon === ic ? 'rgba(0,212,170,0.15)' : '#25293a',
                                    border: `1px solid ${form.icon === ic ? '#00d4aa' : 'transparent'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.15s', fontSize: '1rem',
                                }}>
                                    {ICON_MAP[ic] || '✅'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Habit Name *</label>
                        <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Morning Run" style={inputSt}
                            onFocus={e => { e.currentTarget.style.borderColor = '#00d4aa'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,170,0.1)'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = '#2f3445'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Description</label>
                        <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Optional details" style={inputSt}
                            onFocus={e => { e.currentTarget.style.borderColor = '#00d4aa'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,170,0.1)'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = '#2f3445'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Frequency</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['daily', 'weekly'].map(f => (
                                <button key={f} type="button" onClick={() => setForm(ff => ({ ...ff, frequency: f }))} style={{
                                    padding: '0.5rem 1.25rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                                    background: form.frequency === f ? '#00d4aa' : '#25293a',
                                    color: form.frequency === f ? '#00382b' : '#64748b',
                                    fontWeight: 600, fontSize: '0.82rem', fontFamily: "'Inter', sans-serif",
                                    transition: 'all 0.15s',
                                }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #2f3445', background: 'none', color: '#64748b', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} style={{
                            flex: 2, padding: '0.85rem', borderRadius: '0.75rem', border: 'none',
                            background: '#00d4aa', color: '#00382b', cursor: saving ? 'not-allowed' : 'pointer',
                            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem',
                            opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            boxShadow: '0 0 20px rgba(0,212,170,0.3)',
                            transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
                        }}
                            onMouseEnter={e => !saving && (e.currentTarget.style.transform = 'scale(1.02)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            {saving && <div style={{ width: 16, height: 16, border: '2px solid rgba(0,56,43,0.3)', borderTopColor: '#00382b', borderRadius: '50%', animation: 'hSpin 0.7s linear infinite' }} />}
                            {habit?._id ? 'Update' : 'Create Habit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Habits Page ───────────────────────────────────────────────────────
export default function Habits() {
    const [habits, setHabits] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animating, setAnimating] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editHabit, setEditHabit] = useState(null);
    const [view, setView] = useState('weekly');
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const [h, g] = await Promise.all([api.get('/habits'), api.get('/goals')]);
            setHabits(h.data); setGoals(g.data);
        } catch { setError('Failed to load.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleComplete = async (id) => {
        setAnimating(id);
        setTimeout(() => setAnimating(null), 800);
        try {
            const res = await api.patch(`/habits/${id}/complete`);
            setHabits(p => p.map(h => h._id === id ? res.data : h));
        } catch { setError('Failed.'); }
    };

    const handleUncomplete = async (id) => {
        try {
            const res = await api.patch(`/habits/${id}/uncomplete`);
            setHabits(p => p.map(h => h._id === id ? res.data : h));
        } catch { setError('Failed.'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this habit?')) return;
        try { await api.delete(`/habits/${id}`); setHabits(p => p.filter(h => h._id !== id)); }
        catch { setError('Failed.'); }
    };

    const handleSave = (saved, type) => {
        if (type === 'edit') setHabits(p => p.map(h => h._id === saved._id ? saved : h));
        else setHabits(p => [saved, ...p]);
    };

    // Build week Mon–Sun
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now); d.setDate(now.getDate() - dayOfWeek + i); d.setHours(0, 0, 0, 0); return d;
    });

    const getDayStatus = (date) => {
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) return 'today';
        if (date > now) return 'future';
        const allDone = habits.length > 0 && habits.every(h =>
            h.completedDates?.some(d => new Date(d).toDateString() === date.toDateString())
        );
        return allDone ? 'done' : 'missed';
    };

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayDone = habits.filter(h =>
        h.completedDates?.some(d => new Date(d).toDateString() === today.toDateString())
    ).length;
    const maxStreak = habits.length ? Math.max(...habits.map(h => h.currentStreak || 0)) : 0;
    const completionRate = habits.length
        ? Math.round((habits.reduce((s, h) => s + Math.min(100, (h.currentStreak || 0) * 10), 0) / habits.length))
        : 0;
    const remaining = habits.filter(h =>
        !h.completedDates?.some(d => new Date(d).toDateString() === today.toDateString())
    ).length;

    // Sort: incomplete first
    const sorted = [...habits].sort((a, b) => {
        const aDone = a.completedDates?.some(d => new Date(d).toDateString() === today.toDateString());
        const bDone = b.completedDates?.some(d => new Date(d).toDateString() === today.toDateString());
        return aDone - bDone;
    });

    return (
        <DashboardShell>
            <style>{`
        @keyframes hFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes hSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hSpin    { to{transform:rotate(360deg)} }
        @keyframes hFadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hGlow {
          0%,100%{box-shadow:0 0 0 0 rgba(0,212,170,0)}
          40%    {box-shadow:0 0 0 12px rgba(0,212,170,0.18),0 0 32px rgba(0,212,170,0.12)}
        }
        .h-complete-anim { animation: hGlow 0.8s ease-out forwards !important; }
        .habit-card-wrap:hover .habit-actions { opacity: 1 !important; }
      `}</style>

            <div style={{ padding: '2.5rem', maxWidth: 1300 }}>

                {/* ── Error ── */}
                {error && (
                    <div style={{ background: 'rgba(255,113,108,0.1)', border: '1px solid rgba(255,113,108,0.25)', color: '#ff716c', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                        {error}<button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ff716c', cursor: 'pointer' }}>×</button>
                    </div>
                )}

                {/* ── Page Header ── */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                    marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
                    animation: 'hFadeUp 0.5s ease both',
                }}>
                    <div>
                        <h1 style={{
                            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', letterSpacing: '-0.03em',
                            color: '#00d4aa', marginBottom: '0.35rem', lineHeight: 1.1,
                        }}>Today's Ledger</h1>
                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Precision tracking for atmospheric growth.</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* View toggle */}
                        <div style={{ display: 'flex', background: '#1a1f2f', borderRadius: '9999px', padding: '0.25rem', border: '1px solid #2f3445' }}>
                            {['Weekly', 'Monthly'].map(v => (
                                <button key={v} onClick={() => setView(v.toLowerCase())} style={{
                                    padding: '0.45rem 1.1rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                                    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.82rem',
                                    background: view === v.toLowerCase() ? '#00d4aa' : 'transparent',
                                    color: view === v.toLowerCase() ? '#00382b' : '#64748b',
                                    transition: 'all 0.2s',
                                }}>{v}</button>
                            ))}
                        </div>

                        {/* New Habit button */}
                        <button onClick={() => { setEditHabit(null); setShowModal(true); }} style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.55rem 1.25rem', borderRadius: '9999px', border: 'none',
                            background: '#00d4aa', color: '#00382b', cursor: 'pointer',
                            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.875rem',
                            boxShadow: '0 0 20px rgba(0,212,170,0.25)',
                            transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0,212,170,0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,170,0.25)'; }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                            New Habit
                        </button>
                    </div>
                </div>

                {/* ── Week Strip ── */}
                <div style={{
                    background: '#111827', borderRadius: '0.75rem', padding: '1.75rem 2rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    marginBottom: '2.5rem', border: '1px solid rgba(133,148,141,0.08)',
                    animation: 'hFadeUp 0.5s ease 0.05s both',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'space-around' }}>
                        {weekDates.map((date, i) => (
                            <DayCircle
                                key={i}
                                label={DAY_LABELS[i]}
                                date={date}
                                status={getDayStatus(date)}
                            />
                        ))}
                    </div>

                    {/* Streak stats */}
                    <div style={{ display: 'flex', gap: '2.5rem', paddingLeft: '2rem', borderLeft: '1px solid #2f3445', flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                                {maxStreak}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.3rem' }}>
                                Day Streak
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 900, color: '#00d4aa', lineHeight: 1 }}>
                                {completionRate}%
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.3rem' }}>
                                Completion
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Two Column ── */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <div style={{ width: 36, height: 36, border: '3px solid rgba(0,212,170,0.2)', borderTopColor: '#00d4aa', borderRadius: '50%', animation: 'hSpin 0.7s linear infinite' }} />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem', alignItems: 'start' }}>

                        {/* ── Active Habits ── */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.25rem' }}>
                                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.5rem', color: '#00d4aa' }}>
                                    Active Habits
                                </h2>
                                <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>{remaining} remaining</span>
                            </div>

                            {sorted.length === 0 ? (
                                <div style={{
                                    background: '#111827', borderRadius: '0.75rem', padding: '4rem',
                                    textAlign: 'center', border: '1px solid rgba(133,148,141,0.08)',
                                }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#2f3445', display: 'block', marginBottom: '0.75rem' }}>event_repeat</span>
                                    <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.875rem' }}>No habits tracked yet.</p>
                                    <button onClick={() => setShowModal(true)} style={{
                                        background: '#00d4aa', color: '#00382b', border: 'none',
                                        padding: '0.65rem 1.5rem', borderRadius: '9999px', cursor: 'pointer',
                                        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.82rem',
                                    }}>Create First Habit</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                    {sorted.map((h, i) => (
                                        <div key={h._id} className="habit-card-wrap" style={{ animation: `hFadeUp 0.4s ease ${0.05 * i}s both` }}>
                                            <HabitCard
                                                habit={h}
                                                animating={animating}
                                                onComplete={handleComplete}
                                                onUncomplete={handleUncomplete}
                                                onEdit={(habit) => { setEditHabit(habit); setShowModal(true); }}
                                                onDelete={handleDelete}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Goal Milestones ── */}
                        <div style={{ animation: 'hFadeUp 0.5s ease 0.1s both' }}>
                            <GoalMilestones goals={goals} />
                        </div>
                    </div>
                )}
            </div>

            {/* ── FAB ── */}
            <button onClick={() => { setEditHabit(null); setShowModal(true); }} style={{
                position: 'fixed', bottom: '3rem', right: '3rem', zIndex: 100,
                width: 64, height: 64, borderRadius: '50%', border: 'none',
                background: 'linear-gradient(135deg, #00d4aa, #46f1c5)',
                color: '#00382b', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0,212,170,0.5)',
                transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
            }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <span className="material-symbols-outlined" style={{ fontSize: 30, fontVariationSettings: "'FILL' 1,'wght' 700,'GRAD' 0,'opsz' 24" }}>add</span>
            </button>

            {/* ── Modal ── */}
            {showModal && (
                <HabitModal
                    habit={editHabit}
                    onClose={() => { setShowModal(false); setEditHabit(null); }}
                    onSave={handleSave}
                />
            )}

            {/* hover CSS for habit action buttons */}
            <style>{`.habit-card-wrap:hover .habit-actions { opacity: 1 !important; }`}</style>
        </DashboardShell>
    );
}