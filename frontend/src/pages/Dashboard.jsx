import { useEffect, useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardShell from '../components/DashboardShell';
import api from '../api/axios';

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon, badge, value, label, delay = 0 }) {
    return (
        <div style={{
            background: '#111827', padding: '1.5rem', borderRadius: '0.75rem',
            border: '1px solid rgba(59,74,68,0.08)',
            animation: `dbFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
            transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.3s',
            cursor: 'default',
        }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,170,0.15)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#00d4aa', fontSize: 22 }}>{icon}</span>
                <span style={{
                    fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.15em', color: '#475569',
                }}>{badge}</span>
            </div>
            <div style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem',
                fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.25rem',
            }}>{value}</div>
            <div style={{
                fontSize: '0.62rem', color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>{label}</div>
        </div>
    );
}

// ── Habit Matrix ──────────────────────────────────────────────────────────
function HabitMatrix({ habits }) {
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - dayOfWeek + i);
        d.setHours(0, 0, 0, 0);
        return d;
    });

    const isTodayDate = d => d.toDateString() === now.toDateString();

    const isCompleted = (habit, date) =>
        habit.completedDates?.some(d =>
            new Date(d).toDateString() === date.toDateString()
        );

    const onComplete = async (id) => {
        try { await api.patch(`/habits/${id}/complete`); } catch { /* silent */ }
    };

    return (
        <div style={{
            background: '#1a1f2f', borderRadius: '0.75rem', padding: '2rem',
            border: '1px solid rgba(59,74,68,0.06)',
            animation: 'dbFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s both',
            display: 'flex', flexDirection: 'column',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{
                        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900,
                        fontSize: '1.35rem', letterSpacing: '-0.03em', color: '#fff', marginBottom: '0.25rem',
                    }}>Weekly Habit Matrix</h3>
                    <p style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        Visualizing consistency strings
                    </p>
                </div>
                <button style={{
                    background: '#2f3445', padding: '0.5rem', borderRadius: '0.5rem',
                    border: 'none', cursor: 'pointer', color: '#46f1c5', display: 'flex', alignItems: 'center',
                    transition: 'background 0.2s',
                }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,170,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#2f3445'}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>calendar_today</span>
                </button>
            </div>

            {habits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#475569', fontSize: '0.875rem' }}>
                    No habits yet.{' '}
                    <NavLink to="/habits" style={{ color: '#00d4aa', fontWeight: 600 }}>Add your first →</NavLink>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
                    {habits.slice(0, 4).map(habit => (
                        <div key={habit._id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            {/* Label */}
                            <div style={{ width: '8rem', flexShrink: 0 }}>
                                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                                    {habit.name}
                                </p>
                                <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00d4aa', marginTop: '0.15rem' }}>
                                    Streak: {habit.currentStreak || 0}d
                                </p>
                            </div>

                            {/* 7-day cells */}
                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '0.4rem' }}>
                                {weekDates.map((date, i) => {
                                    const done = isCompleted(habit, date);
                                    const today = isTodayDate(date);
                                    const future = date > now && !today;

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => today && !done && onComplete(habit._id)}
                                            title={DAY_LABELS[i]}
                                            style={{
                                                aspectRatio: '1',
                                                borderRadius: '0.375rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: today && !done ? 'pointer' : 'default',
                                                background: done
                                                    ? '#00d4aa'
                                                    : future
                                                        ? 'rgba(30,35,55,0.4)'
                                                        : '#1e2437',
                                                border: today && !done ? '2px solid #00d4aa' : 'none',
                                                animation: today ? 'dbPulse 2s ease-in-out infinite' : 'none',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                            }}
                                            onMouseEnter={e => {
                                                if (today && !done) {
                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                    e.currentTarget.style.boxShadow = '0 0 12px rgba(0,212,170,0.3)';
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {done && (
                                                <span className="material-symbols-outlined" style={{
                                                    fontSize: 14, color: '#00382b',
                                                    fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24",
                                                }}>check</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Day labels footer */}
            <div style={{
                marginTop: '1.25rem', paddingLeft: '9.5rem',
                display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '0.4rem',
            }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} style={{
                        textAlign: 'center', fontSize: '0.58rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569',
                    }}>{d}</div>
                ))}
            </div>
        </div>
    );
}

// ── Daily Focus ────────────────────────────────────────────────────────────
function DailyFocus({ goals }) {
    const displayed = goals.slice(0, 3);

    return (
        <div style={{
            background: '#1a1f2f', borderRadius: '0.75rem', padding: '2rem',
            border: '1px solid rgba(59,74,68,0.06)',
            animation: 'dbFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.2s both',
        }}>
            <h3 style={{
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900,
                fontSize: '1.15rem', letterSpacing: '-0.03em', color: '#fff', marginBottom: '1.5rem',
            }}>Daily Focus</h3>

            {displayed.length === 0 ? (
                <div style={{ color: '#475569', fontSize: '0.82rem', textAlign: 'center', padding: '1.5rem 0' }}>
                    <NavLink to="/goals" style={{ color: '#00d4aa', fontWeight: 600 }}>Add goals →</NavLink>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {displayed.map(goal => {
                        const pct = goal.progressPercent || 0;
                        const r = 18;
                        const circ = 2 * Math.PI * r; // 113.1
                        const offset = circ - (pct / 100) * circ;

                        return (
                            <div key={goal._id} style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                {/* SVG ring */}
                                <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                                    <svg width={40} height={40} style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx={20} cy={20} r={r} fill="transparent" stroke="#2f3445" strokeWidth={3} />
                                        <circle
                                            cx={20} cy={20} r={r} fill="transparent"
                                            stroke="#00d4aa" strokeWidth={3}
                                            strokeDasharray={circ}
                                            strokeDashoffset={offset}
                                            strokeLinecap="round"
                                            style={{ transition: 'stroke-dashoffset 1s ease' }}
                                        />
                                    </svg>
                                    <span className="material-symbols-outlined" style={{
                                        position: 'absolute', inset: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, color: '#00d4aa',
                                        fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                                    }}>auto_awesome</span>
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        fontSize: '0.82rem', fontWeight: 600, color: '#fff',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        transition: 'color 0.2s',
                                    }}>{goal.title}</p>
                                    <p style={{
                                        fontSize: '0.6rem', color: '#475569',
                                        textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.15rem',
                                    }}>{pct}% synchronized</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Overall Pace Card ──────────────────────────────────────────────────────
function PaceCard({ goals }) {
    const avg = goals.length
        ? Math.round(goals.reduce((s, g) => s + (g.progressPercent || 0), 0) / goals.length)
        : 0;
    const status = avg >= 80 ? 'Excellent' : avg >= 50 ? 'On Track' : avg > 0 ? 'Building' : 'Start Now';

    const r = 35;
    const circ = 2 * Math.PI * r;
    const offset = circ - (avg / 100) * circ;

    return (
        <div style={{
            background: '#00d4aa', borderRadius: '0.75rem', padding: '2rem',
            boxShadow: '0 0 40px -10px rgba(0,212,170,0.45)',
            animation: 'dbFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.25s both',
            transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{
                    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900,
                    fontSize: '1.25rem', letterSpacing: '-0.03em', textTransform: 'uppercase', color: '#00382b',
                }}>Overall Pace</h4>
                <span style={{
                    fontSize: '0.6rem', fontWeight: 900, color: '#005643',
                    background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem',
                    borderRadius: '9999px', letterSpacing: '0.05em',
                }}>OPTIMAL</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                    <svg width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={40} cy={40} r={r} fill="transparent" stroke="rgba(0,86,67,0.25)" strokeWidth={6} />
                        <circle
                            cx={40} cy={40} r={r} fill="transparent"
                            stroke="#00382b" strokeWidth={6}
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '1.1rem', fontWeight: 900, color: '#00382b',
                    }}>{avg}%</div>
                </div>

                <div>
                    <p style={{
                        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900,
                        fontSize: '1.25rem', color: '#00382b', lineHeight: 1,
                    }}>{status}</p>
                    <p style={{ fontSize: '0.72rem', color: '#005643', marginTop: '0.35rem', lineHeight: 1.5 }}>
                        {avg >= 50
                            ? 'Maintaining velocity above monthly average.'
                            : 'Log progress to build momentum.'}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Project Momentum ───────────────────────────────────────────────────────
function ProjectMomentum({ goals, expenses }) {
    const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
    const maxSpend = 50000;
    const spendPct = Math.min(100, Math.round((totalSpend / maxSpend) * 100));

    const TIPS = [
        '"True precision isn\'t about doing everything — it\'s about doing the right things consistently."',
        '"Small daily improvements lead to staggering long-term results. Stay the course."',
        '"Every habit logged is a vote for the person you\'re becoming."',
    ];
    const tip = TIPS[new Date().getDay() % TIPS.length];

    const items = [
        ...goals.slice(0, 2).map(g => ({
            label: g.title,
            value: `${g.current} ${g.unit} / ${g.target} ${g.unit}`,
            pct: g.progressPercent || 0,
        })),
        { label: 'Monthly Spend', value: `₹${totalSpend.toFixed(0)} / ₹${maxSpend.toLocaleString()}`, pct: spendPct },
    ];

    return (
        <div style={{
            background: '#161b2b', borderRadius: '0.75rem', padding: '2rem',
            border: '1px solid rgba(59,74,68,0.06)',
            animation: 'dbFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.3s both',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#00d4aa', fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>analytics</span>
                <h3 style={{
                    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900,
                    fontSize: '1.35rem', letterSpacing: '-0.03em', color: '#fff',
                }}>Project Momentum</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                {/* Progress bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                    {items.map((item, i) => (
                        <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dee1f7' }}>{item.label}</span>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 900, color: '#46f1c5',
                                    fontFamily: "'Space Grotesk', sans-serif",
                                }}>{item.value}</span>
                            </div>
                            <div style={{ height: 6, background: '#2f3445', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: '99px',
                                    background: '#00d4aa',
                                    width: `${item.pct}%`,
                                    boxShadow: '0 0 10px #00d4aa',
                                    transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Editor's note */}
                <div style={{
                    background: 'rgba(47,52,69,0.35)', borderRadius: '0.75rem',
                    padding: '1.5rem', position: 'relative', overflow: 'hidden',
                    border: '1px solid rgba(59,74,68,0.06)',
                }}>
                    <div style={{ position: 'absolute', right: -16, bottom: -16, opacity: 0.04, pointerEvents: 'none' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 120 }}>edit_square</span>
                    </div>
                    <p style={{
                        fontSize: '0.6rem', fontWeight: 700, color: '#475569',
                        textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem',
                    }}>Editor's Note</p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.7 }}>
                        {tip}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
    const { user } = useAuth();
    const [habits, setHabits] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        const now = new Date();
        try {
            const [h, e, g] = await Promise.all([
                api.get('/habits'),
                api.get(`/expenses?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
                api.get('/goals'),
            ]);
            setHabits(h.data);
            setExpenses(e.data);
            setGoals(g.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleComplete = async (id) => {
        try {
            const res = await api.patch(`/habits/${id}/complete`);
            setHabits(p => p.map(h => h._id === id ? res.data : h));
        } catch { /* silent */ }
    };

    const now = new Date();
    const todayDone = habits.filter(h =>
        h.completedDates?.some(d => new Date(d).toDateString() === now.toDateString())
    ).length;
    const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
    const completedGoals = goals.filter(g => g.completed).length;
    const avgProgress = goals.length
        ? Math.round(goals.reduce((s, g) => s + (g.progressPercent || 0), 0) / goals.length)
        : 0;

    const greeting = (() => {
        const h = now.getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    })();

    const firstName = user?.name?.split(' ')[0] || 'there';

    return (
        <DashboardShell>
            <style>{`
        @keyframes dbFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dbPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,212,170,0.4); }
          50%      { box-shadow: 0 0 0 6px rgba(0,212,170,0); }
        }
        @keyframes dbSpin { to { transform: rotate(360deg); } }
      `}</style>

            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                {/* ── Hero ── */}
                <section style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                    flexWrap: 'wrap', gap: '1rem',
                    animation: 'dbFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
                }}>
                    <div style={{ maxWidth: '48rem' }}>
                        <span style={{
                            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3em',
                            textTransform: 'uppercase', color: '#00d4aa',
                            display: 'block', marginBottom: '0.75rem',
                        }}>Current Overview</span>
                        <h2 style={{
                            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900,
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.04em',
                            color: '#f9fafb', lineHeight: 1.0, marginBottom: '0.6rem',
                        }}>
                            {greeting}, {firstName}.
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: '#bacac2', fontWeight: 300, letterSpacing: '0.02em' }}>
                            {habits.length > 0
                                ? `You've completed ${todayDone} of ${habits.length} habits today. Keep the momentum going.`
                                : 'Your celestial alignment awaits. Start tracking to see your data.'}
                        </p>
                    </div>

                    {/* Goal progress pill */}
                    <div style={{
                        background: 'rgba(238,152,0,0.1)', border: '1px solid rgba(255,185,95,0.25)',
                        borderRadius: '9999px', padding: '0.6rem 1.25rem',
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <span className="material-symbols-outlined" style={{ color: '#ffb95f', fontSize: 18 }}>trending_up</span>
                        <span style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
                            textTransform: 'uppercase', color: '#ffb95f',
                        }}>Goal Progress / {avgProgress}%</span>
                    </div>
                </section>

                {/* ── Stat Cards ── */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    <StatCard icon="sync_alt" badge="Active" value={`${habits.length} HABITS`} label="Tracked Periodically" delay={0.05} />
                    <StatCard icon="checklist" badge="Today" value={`${todayDone}/${habits.length} DONE`} label="Task Completion Rate" delay={0.10} />
                    <StatCard icon="payments" badge="Finance" value={`₹${totalSpend.toFixed(0)} SPENT`} label="Monthly Ledger Total" delay={0.15} />
                    <StatCard icon="flag" badge="Milestones" value={`${completedGoals}/${goals.length} GOALS`} label="Completed This Cycle" delay={0.20} />
                </section>

                {/* ── Bento Grid ── */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <div style={{ width: 36, height: 36, border: '3px solid rgba(0,212,170,0.2)', borderTopColor: '#00d4aa', borderRadius: '50%', animation: 'dbSpin 0.7s linear infinite' }} />
                    </div>
                ) : (
                    <section style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: '2rem' }}>
                        {/* Habit Matrix */}
                        <HabitMatrix habits={habits} />

                        {/* Right column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <DailyFocus goals={goals} />
                            <PaceCard goals={goals} />
                        </div>
                    </section>
                )}

                {/* ── Project Momentum ── */}
                {!loading && (
                    <ProjectMomentum goals={goals} expenses={expenses} />
                )}
            </div>

            {/* ── FAB ── */}
            <button style={{
                position: 'fixed', bottom: '2.5rem', right: '2.5rem', zIndex: 50,
                width: 64, height: 64, borderRadius: '50%', border: 'none',
                background: '#00d4aa', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 40px -10px rgba(0,212,170,0.6)',
                transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
            }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}
                title="Quick Add"
                onClick={() => window.location.href = '/habits'}
            >
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#00382b', fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 24" }}>add</span>
            </button>
        </DashboardShell>
    );
}