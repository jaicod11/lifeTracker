import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, ArcElement, Title, Tooltip, Filler,
} from 'chart.js';
import DashboardShell from '../components/DashboardShell';
import api from '../api/axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Filler);

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ── Animated number counter ────────────────────────────────────────────────
function AnimCounter({ value, prefix = '', suffix = '', decimals = 0 }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });

    useEffect(() => {
        if (!inView) return;
        const target = parseFloat(value) || 0;
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / 1200, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setDisplay(e * target);
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [inView, value]);

    return <span ref={ref}>{prefix}{display.toFixed(decimals)}{suffix}</span>;
}

// ── Animated progress bar ──────────────────────────────────────────────────
function AnimBar({ pct, delay = 0 }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    return (
        <div ref={ref} style={{ height: 5, background: '#1f2937', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
                initial={{ width: 0 }}
                animate={inView ? { width: `${pct}%` } : { width: 0 }}
                transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: '100%', borderRadius: 99, background: '#46f1c5', boxShadow: '0 0 8px rgba(70,241,197,0.5)' }}
            />
        </div>
    );
}

// ── Consistency Heatmap ────────────────────────────────────────────────────
function ConsistencyMatrix({ habits, reportMonth, reportYear }) {
    const days = new Date(reportYear, reportMonth + 1, 0).getDate();

    const getCellColor = (day) => {
        const date = new Date(reportYear, reportMonth, day);
        if (habits.length === 0) return '#1e293b';
        const done = habits.filter(h =>
            h.completedDates?.some(d => new Date(d).toDateString() === date.toDateString())
        ).length;
        const pct = done / habits.length;
        if (pct === 0) return '#1e293b';
        if (pct < 0.33) return 'rgba(13,148,136,0.4)';
        if (pct < 0.66) return '#0d9488';
        return '#46f1c5';
    };

    const avgConsistency = habits.length > 0 ? (() => {
        let total = 0;
        for (let d = 1; d <= days; d++) {
            const date = new Date(reportYear, reportMonth, d);
            const done = habits.filter(h =>
                h.completedDates?.some(cd => new Date(cd).toDateString() === date.toDateString())
            ).length;
            total += (done / habits.length) * 100;
        }
        return Math.round(total / days);
    })() : 0;

    const longestStreak = habits.length
        ? Math.max(...habits.map(h => h.longestStreak || 0), 0)
        : 0;

    return (
        <div>
            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days},1fr)`, gap: 6, marginBottom: '2.5rem' }}>
                {Array.from({ length: days }, (_, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, delay: i * 0.018, ease: 'backOut' }}
                        style={{ aspectRatio: '1', borderRadius: 3, background: getCellColor(i + 1), cursor: 'default' }}
                        whileHover={{ scale: 1.35 }}
                        title={`${reportMonth + 1}/${i + 1}`}
                    />
                ))}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569' }}>Less</span>
                {['#1e293b', 'rgba(13,148,136,0.4)', '#0d9488', '#46f1c5'].map((c, i) => (
                    <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
                ))}
                <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569' }}>More</span>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '3rem' }}>
                <div>
                    <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '2.5rem', color: '#fff', lineHeight: 1 }}>
                        <AnimCounter value={avgConsistency} suffix="%" />
                    </p>
                    <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#475569', marginTop: '0.35rem' }}>
                        Avg Monthly Consistency
                    </p>
                </div>
                <div>
                    <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '2.5rem', color: '#fff', lineHeight: 1 }}>
                        <AnimCounter value={longestStreak} suffix=" DAY" />
                    </p>
                    <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#475569', marginTop: '0.35rem' }}>
                        Longest Active Streak
                    </p>
                </div>
            </div>
        </div>
    );
}

// ── Financial Velocity Chart ───────────────────────────────────────────────
function VelocityChart({ expenses, reportMonth, reportYear }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const daysInMonth = new Date(reportYear, reportMonth + 1, 0).getDate();

    const dailyTotals = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return expenses.filter(e => new Date(e.date).getDate() === day).reduce((s, e) => s + e.amount, 0);
    });

    const maxSpend = Math.max(...dailyTotals, 1);
    const labels = Array.from({ length: daysInMonth }, (_, i) =>
        i % 5 === 0 ? `${reportMonth + 1}/${i + 1}` : ''
    );

    const data = {
        labels,
        datasets: [
            {
                label: 'Savings Pace',
                data: dailyTotals.map((v, i) => {
                    const cum = dailyTotals.slice(0, i + 1).reduce((s, n) => s + n, 0);
                    return Math.max(0, maxSpend - cum / (i + 1));
                }),
                borderColor: '#46f1c5', borderWidth: 3,
                backgroundColor: (ctx) => {
                    const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
                    g.addColorStop(0, 'rgba(70,241,197,0.25)');
                    g.addColorStop(1, 'rgba(70,241,197,0)');
                    return g;
                },
                fill: true, tension: 0.4, pointRadius: 0,
            },
            {
                label: 'Spending',
                data: dailyTotals,
                borderColor: '#64748b', borderWidth: 2, borderDash: [6, 5],
                backgroundColor: 'transparent',
                fill: false, tension: 0.4, pointRadius: 0,
            },
        ],
    };

    const options = {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: inView ? 1600 : 0, easing: 'easeOutQuart' },
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#1a1f2f', titleColor: '#64748b', bodyColor: '#f9fafb', borderColor: '#2f3445', borderWidth: 1 },
        },
        scales: {
            x: { grid: { color: 'rgba(37,41,58,0.8)' }, ticks: { color: '#475569', font: { size: 10 } } },
            y: { grid: { color: 'rgba(37,41,58,0.8)' }, ticks: { color: '#475569', font: { size: 10 } } },
        },
    };

    return (
        <div ref={ref} style={{ height: 256 }}>
            <Line data={data} options={options} />
        </div>
    );
}

// ── Spend Doughnut ─────────────────────────────────────────────────────────
function SpendDoughnut({ byCategory, total }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });

    const labels = Object.keys(byCategory);
    const values = Object.values(byCategory);
    const COLORS = ['#46f1c5', '#00d4aa', '#1e293b', '#0d9488', '#134e4a'];

    const data = {
        labels,
        datasets: [{ data: values, backgroundColor: COLORS.slice(0, labels.length), borderWidth: 0, hoverOffset: 4 }],
    };
    const options = {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: inView ? 1200 : 0, easing: 'easeOutQuart' },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1f2f', bodyColor: '#f9fafb', borderColor: '#2f3445', borderWidth: 1, callbacks: { label: (ctx) => ` ₹${ctx.parsed.toFixed(0)}` } } },
        cutout: '70%',
    };

    const topCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return (
        <div ref={ref}>
            <div style={{ position: 'relative', width: 192, height: 192, margin: '0 auto' }}>
                {labels.length > 0 ? <Doughnut data={data} options={options} /> : (
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '12px solid #1f2937', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</span>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>₹0</span>
                    </div>
                )}
                {labels.length > 0 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', pointerEvents: 'none' }}>
                        <span style={{ fontSize: '0.62rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</span>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>₹{(total / 1000).toFixed(1)}k</span>
                    </div>
                )}
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {topCats.map(([cat, amt], i) => (
                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                            <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{cat}</span>
                        </div>
                        <span style={{ color: '#fff' }}>{total > 0 ? `${Math.round((amt / total) * 100)}%` : '0%'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main Reports Page ──────────────────────────────────────────────────────
export default function Reports() {
    const nowDate = new Date();
    const [month, setMonth] = useState(nowDate.getMonth() === 0 ? 11 : nowDate.getMonth() - 1);
    const [year, setYear] = useState(nowDate.getMonth() === 0 ? nowDate.getFullYear() - 1 : nowDate.getFullYear());
    const [report, setReport] = useState(null);
    const [habits, setHabits] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const fetchAll = useCallback(async (m, y) => {
        setLoading(true); setError('');
        try {
            const [rRes, hRes, gRes, eRes] = await Promise.all([
                api.get(`/reports/${y}/${m}`).catch(() => ({ data: null })),
                api.get('/habits'),
                api.get('/goals'),
                api.get(`/expenses?month=${m + 1}&year=${y}`),
            ]);
            setReport(rRes.data); setHabits(hRes.data);
            setGoals(gRes.data); setExpenses(eRes.data);
        } catch { setError('Failed to load report.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(month, year); }, [month, year, fetchAll]);

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await api.post('/reports/generate', { month, year });
            setReport(res.data);
        } catch (err) { setError(err.response?.data?.message || 'Failed to generate.'); }
        finally { setGenerating(false); }
    };

    const handleRegenerateAI = async () => {
        if (!report?._id) { handleGenerate(); return; }
        setAiLoading(true);
        try {
            const res = await api.post('/reports/regenerate-ai', { month, year });
            setReport(p => ({ ...p, aiSummary: res.data.aiSummary }));
        } catch { setError('AI regeneration failed.'); }
        finally { setAiLoading(false); }
    };

    const totalSpend = report?.expenses?.total || expenses.reduce((s, e) => s + e.amount, 0);
    const pctChange = report?.expenses?.percentChange || 0;
    const byCategory = report?.expenses?.byCategory || expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});
    const longestStreak = habits.length ? Math.max(...habits.map(h => h.longestStreak || 0), 0) : 0;
    const completedGoals = goals.filter(g => g.completed).length;
    const avgGoalPct = goals.length ? Math.round(goals.reduce((s, g) => s + (g.progressPercent || 0), 0) / goals.length) : 0;
    const habitCompletions = report?.habits?.totalCompletions
        || habits.reduce((s, h) => s + (h.completedDates?.filter(d => new Date(d).getMonth() === month && new Date(d).getFullYear() === year).length || 0), 0);

    const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

    return (
        <DashboardShell>
            <style>{`
        @keyframes rSpin { to{transform:rotate(360deg)} }
        @keyframes rFadeUp{ from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .bento-card { background:#111827; border-radius:1rem; }
        .bento-card:hover { border-color:rgba(70,241,197,0.2) !important; }
      `}</style>

            <div style={{ padding: '2rem 2rem 5rem', minHeight: '100vh', background: '#0a0f1e' }}>

                {error && (
                    <div style={{ background: 'rgba(255,113,108,0.1)', border: '1px solid rgba(255,113,108,0.25)', color: '#ff716c', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                        {error}<button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ff716c', cursor: 'pointer' }}>×</button>
                    </div>
                )}

                {/* ── Header ── */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem', animation: 'rFadeUp 0.5s ease both' }}>
                    <div>
                        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(1.75rem,4vw,2.5rem)', letterSpacing: '-0.03em', color: '#fff', marginBottom: '0.5rem' }}>
                            Monthly Perspective
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#46f1c5' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_month</span>
                            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#46f1c5', padding: '0.25rem 0.5rem', borderRadius: '50%', fontSize: '1.1rem', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(70,241,197,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >‹</button>
                            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '1.05rem', minWidth: '7rem', textAlign: 'center' }}>
                                {MONTHS_SHORT[month]} {year}
                            </span>
                            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#46f1c5', padding: '0.25rem 0.5rem', borderRadius: '50%', fontSize: '1.1rem', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(70,241,197,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >›</button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={handleGenerate} disabled={generating} style={{
                            padding: '0.6rem 1.25rem', borderRadius: '0.625rem', border: '1px solid rgba(133,148,141,0.15)',
                            background: 'transparent', color: '#dee1f7', cursor: generating ? 'not-allowed' : 'pointer',
                            fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: '0.875rem',
                            display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: generating ? 0.7 : 1,
                            transition: 'background 0.2s',
                        }}
                            onMouseEnter={e => !generating && (e.currentTarget.style.background = '#25293a')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16, animation: generating ? 'rSpin 1s linear infinite' : 'none' }}>refresh</span>
                            {generating ? 'Generating…' : 'Regenerate'}
                        </button>
                        <button style={{
                            padding: '0.6rem 1.25rem', borderRadius: '0.625rem', border: 'none',
                            background: '#46f1c5', color: '#002118', cursor: 'pointer',
                            fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '0.875rem',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            boxShadow: '0 0 20px rgba(70,241,197,0.15)',
                            transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>picture_as_pdf</span>
                            Export PDF
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
                        <div style={{ width: 36, height: 36, border: '3px solid rgba(70,241,197,0.2)', borderTopColor: '#46f1c5', borderRadius: '50%', animation: 'rSpin 0.8s linear infinite' }} />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div key={`${month}-${year}`} variants={containerVariants} initial="hidden" animate="show">

                            {/* ── Stat Chips ── */}
                            <motion.section variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                {[
                                    { label: 'Expenses', value: `₹${totalSpend.toFixed(2)}`, sub: pctChange !== 0 ? `${pctChange > 0 ? '↑' : '↓'} ${Math.abs(pctChange).toFixed(1)}% vs last month` : 'No prior data', subColor: pctChange > 0 ? '#ff716c' : '#46f1c5', icon: 'payments' },
                                    { label: 'Habits', value: habitCompletions, sub: `${longestStreak} day best streak`, subColor: '#46f1c5', icon: 'event_repeat' },
                                    { label: 'Goals', value: `${completedGoals} Completed`, sub: `${goals.length} total goals`, subColor: '#46f1c5', icon: 'emoji_events' },
                                    { label: 'Progress', value: `${avgGoalPct}%`, bar: true, sub: 'Avg goal progress', icon: 'trending_up' },
                                ].map((s, i) => (
                                    <div key={i} className="bento-card" style={{ padding: '1.5rem', border: '1px solid transparent', transition: 'all 0.3s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(70,241,197,0.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(70,241,197,0.08)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <p style={{ fontSize: '0.62rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.35rem' }}>{s.label}</p>
                                        <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                                            <AnimCounter value={typeof s.value === 'number' ? s.value : 0} />
                                            {typeof s.value === 'string' ? s.value : ''}
                                        </h4>
                                        {s.bar && (
                                            <div style={{ height: 3, background: '#2f3445', borderRadius: 99, overflow: 'hidden', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                                                <AnimBar pct={avgGoalPct} delay={0.2} />
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem', fontSize: '0.7rem', color: s.subColor }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{pctChange > 0 && s.label === 'Expenses' ? 'arrow_upward' : 'trending_up'}</span>
                                            {s.sub}
                                        </div>
                                    </div>
                                ))}
                            </motion.section>

                            {/* ── Bento Grid: Chart + Victories ── */}
                            <motion.section variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                {/* Financial Velocity */}
                                <div className="bento-card" style={{ padding: '2rem', border: '1px solid rgba(59,74,68,0.08)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                                        <div>
                                            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', marginBottom: '0.25rem' }}>Financial Velocity</h3>
                                            <p style={{ fontSize: '0.75rem', color: '#475569' }}>Savings momentum vs. discretionary burn</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem', fontWeight: 500 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: 12, height: 12, borderRadius: 2, background: '#46f1c5' }} />
                                                <span style={{ color: '#94a3b8' }}>Savings</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: 14, height: 2, background: '#64748b', borderTop: '2px dashed #64748b' }} />
                                                <span style={{ color: '#94a3b8' }}>Spending</span>
                                            </div>
                                        </div>
                                    </div>
                                    <VelocityChart expenses={expenses} reportMonth={month} reportYear={year} />
                                </div>

                                {/* Strategic Victories */}
                                <div className="bento-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(59,74,68,0.08)' }}>
                                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', marginBottom: '1.5rem' }}>
                                        Strategic Victories
                                    </h3>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1.5rem', border: '1px dashed #1f2937', borderRadius: '0.75rem' }}>
                                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1a1f2f', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#334155' }}>lock</span>
                                        </div>
                                        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, maxWidth: 200 }}>
                                            Complete goals &amp; build streaks to unlock victories.
                                        </p>
                                    </div>
                                </div>
                            </motion.section>

                            {/* ── Consistency Matrix ── */}
                            <motion.section variants={itemVariants} className="bento-card" style={{ padding: '2rem', marginBottom: '1.25rem', border: '1px solid rgba(59,74,68,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff' }}>
                                        Consistency Matrix
                                    </h3>
                                </div>
                                <ConsistencyMatrix habits={habits} reportMonth={month} reportYear={year} />
                            </motion.section>

                            {/* ── 3 Bottom Cards ── */}
                            <motion.section variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>

                                {/* Spend by Category */}
                                <div className="bento-card" style={{ padding: '2rem', border: '1px solid rgba(59,74,68,0.08)' }}>
                                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', marginBottom: '2rem' }}>
                                        Spend by Category
                                    </h3>
                                    <SpendDoughnut byCategory={byCategory} total={totalSpend} />
                                </div>

                                {/* Goal Progress */}
                                <div className="bento-card" style={{ padding: '2rem', border: '1px solid rgba(59,74,68,0.08)' }}>
                                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', marginBottom: '2rem' }}>
                                        Goal Progress
                                    </h3>
                                    {goals.length === 0 ? (
                                        <p style={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>No goals yet.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                            {goals.slice(0, 5).map((g, i) => (
                                                <div key={g._id}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                                                        <span style={{ color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>{g.title}</span>
                                                        <span style={{ color: '#46f1c5' }}>{g.progressPercent || 0}%</span>
                                                    </div>
                                                    <AnimBar pct={g.progressPercent || 0} delay={i * 0.1} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Gemini AI Analysis */}
                                <div className="bento-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(59,74,68,0.08)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(70,241,197,0.08),transparent)', pointerEvents: 'none' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                                        <span className="material-symbols-outlined" style={{ color: '#46f1c5', fontSize: 20 }}>auto_awesome</span>
                                        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff' }}>
                                            Gemini AI Analysis
                                        </h3>
                                    </div>
                                    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                                        {aiLoading || generating ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {[100, 85, 92, 78].map((w, i) => (
                                                    <div key={i} style={{ height: 12, borderRadius: 99, background: 'rgba(255,255,255,0.06)', width: `${w}%`, animation: `shimmer 1.5s ease-in-out ${i * 0.15}s infinite` }} />
                                                ))}
                                                <style>{`@keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:0.9}}`}</style>
                                            </div>
                                        ) : report?.aiSummary ? (
                                            <>
                                                <p style={{ fontSize: '0.82rem', fontStyle: 'italic', color: '#9ca3af', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                                                    "{report.aiSummary.slice(0, 280)}{report.aiSummary.length > 280 ? '…' : ''}"
                                                </p>
                                                <div style={{ padding: '0.875rem', background: '#161b2b', borderRadius: '0.75rem', border: '1px solid rgba(70,241,197,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(70,241,197,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <span className="material-symbols-outlined" style={{ color: '#46f1c5', fontSize: 18, fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" }}>lightbulb</span>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: '0.62rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.15rem' }}>Top Recommendation</p>
                                                        <p style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.4 }}>Review your top spending category to optimize savings.</p>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p style={{ color: '#475569', fontSize: '0.82rem', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                                "Generate a report to get AI-powered monthly insights and recommendations."
                                            </p>
                                        )}
                                        <button onClick={handleRegenerateAI} disabled={aiLoading || generating} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#46f1c5', textTransform: 'uppercase', letterSpacing: '0.15em', background: 'none', border: 'none', cursor: aiLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: aiLoading ? 0.6 : 1, transition: 'gap 0.2s' }}
                                            onMouseEnter={e => { if (!aiLoading) e.currentTarget.style.gap = '0.6rem'; }}
                                            onMouseLeave={e => { e.currentTarget.style.gap = '0.4rem'; }}
                                        >
                                            {aiLoading ? 'Analysing…' : 'Ask Follow-up Questions'}
                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.section>

                            {/* No report state */}
                            {!report && !loading && (
                                <motion.div variants={itemVariants} style={{ marginTop: '1.25rem', background: '#111827', border: '1px dashed #2f3445', borderRadius: '1rem', padding: '3rem', textAlign: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#2f3445', display: 'block', marginBottom: '0.75rem' }}>article</span>
                                    <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>No report for {MONTHS_FULL[month]} {year}</h3>
                                    <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Generate a report to get AI-powered insights.</p>
                                    <button onClick={handleGenerate} disabled={generating} style={{ background: '#46f1c5', color: '#002118', border: 'none', padding: '0.75rem 2rem', borderRadius: '9999px', cursor: generating ? 'not-allowed' : 'pointer', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '0.875rem', opacity: generating ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {generating && <div style={{ width: 14, height: 14, border: '2px solid rgba(0,33,24,0.3)', borderTopColor: '#002118', borderRadius: '50%', animation: 'rSpin 0.7s linear infinite' }} />}
                                        Generate Report
                                    </button>
                                </motion.div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </DashboardShell>
    );
}