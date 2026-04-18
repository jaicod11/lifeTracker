import { useEffect, useState, useCallback } from 'react';
import DashboardShell from '../components/DashboardShell';
import api from '../api/axios';

const CAT_CONFIG = {
    food: { emoji: '🍔', label: 'Food & Dining', color: '#00d4aa' },
    transport: { emoji: '🚕', label: 'Transport', color: '#46f1c5' },
    entertainment: { emoji: '🎬', label: 'Entertainment', color: '#818cf8' },
    health: { emoji: '💊', label: 'Health', color: '#34d399' },
    shopping: { emoji: '🛒', label: 'Shopping', color: '#a78bfa' },
    utilities: { emoji: '⚡', label: 'Rent & Utilities', color: '#fb923c' },
    other: { emoji: '📦', label: 'Other', color: '#64748b' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ── Add / Edit Expense Modal ───────────────────────────────────────────────
function ExpenseModal({ expense, onClose, onSave }) {
    const [form, setForm] = useState({
        amount: expense?.amount || '',
        category: expense?.category || 'food',
        note: expense?.note || '',
        date: expense?.date
            ? new Date(expense.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (expense?._id) {
                const res = await api.put(`/expenses/${expense._id}`, form);
                onSave(res.data, 'edit');
            } else {
                const res = await api.post('/expenses', form);
                onSave(res.data, 'create');
            }
            onClose();
        } catch (err) { setError(err.response?.data?.message || 'Failed.'); }
        finally { setSaving(false); }
    };

    const inputSt = {
        width: '100%', background: '#0a0f1e', border: '1px solid #2f3445',
        borderRadius: '0.625rem', padding: '0.75rem 1rem',
        color: '#dee1f7', fontSize: '0.9rem', outline: 'none',
        fontFamily: "'Inter', sans-serif", transition: 'border-color 0.2s, box-shadow 0.2s',
    };
    const focusFn = e => { e.currentTarget.style.borderColor = '#00d4aa'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,170,0.1)'; };
    const blurFn = e => { e.currentTarget.style.borderColor = '#2f3445'; e.currentTarget.style.boxShadow = 'none'; };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={onClose}>
            <div style={{
                background: '#111827', border: '1px solid #2f3445',
                borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: 440,
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                animation: 'eFadeUp 0.3s cubic-bezier(0.22,1,0.36,1)',
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>
                        {expense?._id ? 'Edit Expense' : '+ Add Expense'}
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

                    <div>
                        <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Amount (₹) *</label>
                        <input type="number" min="0" step="0.01" required value={form.amount}
                            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                            placeholder="0.00" style={inputSt} onFocus={focusFn} onBlur={blurFn} />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Category</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                            {Object.entries(CAT_CONFIG).map(([key, cfg]) => (
                                <button key={key} type="button" onClick={() => setForm(f => ({ ...f, category: key }))} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                    padding: '0.35rem 0.75rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                                    background: form.category === key ? 'rgba(0,212,170,0.15)' : '#25293a',
                                    border: `1px solid ${form.category === key ? '#00d4aa' : 'transparent'}`,
                                    color: form.category === key ? '#00d4aa' : '#64748b',
                                    fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.15s',
                                }}>
                                    <span>{cfg.emoji}</span> {cfg.label.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Note</label>
                        <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                            placeholder="Optional description" style={inputSt} onFocus={focusFn} onBlur={blurFn} />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Date</label>
                        <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                            style={{ ...inputSt, colorScheme: 'dark' }} onFocus={focusFn} onBlur={blurFn} />
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
                            boxShadow: '0 0 20px rgba(0,212,170,0.25)',
                        }}>
                            {saving && <div style={{ width: 16, height: 16, border: '2px solid rgba(0,56,43,0.3)', borderTopColor: '#00382b', borderRadius: '50%', animation: 'eSpin 0.7s linear infinite' }} />}
                            {expense?._id ? 'Update' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Transaction Row ────────────────────────────────────────────────────────
function TransactionRow({ expense, onEdit, onDelete }) {
    const cfg = CAT_CONFIG[expense.category] || CAT_CONFIG.other;
    const dateStr = new Date(expense.date).toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric', year: 'numeric',
    });

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            transition: 'background 0.15s', cursor: 'default', position: 'relative',
        }}
            className="tx-row"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flex: 1, minWidth: 0 }}>
                {/* Emoji icon */}
                <div style={{
                    width: 48, height: 48, borderRadius: '0.75rem',
                    background: '#161b2b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', flexShrink: 0,
                }}>{cfg.emoji}</div>
                <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f9fafb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cfg.label}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                        {expense.note || cfg.label}
                    </p>
                </div>
            </div>

            {/* Date */}
            <div style={{ flex: 1, textAlign: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{dateStr}</span>
            </div>

            {/* Amount + actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                    fontSize: '1rem', color: '#f9fafb',
                }}>-₹{expense.amount.toFixed(2)}</span>

                <div className="tx-actions" style={{ display: 'flex', gap: '0.25rem', opacity: 0, transition: 'opacity 0.2s' }}>
                    <button onClick={() => onEdit(expense)} style={{ padding: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', borderRadius: '0.5rem', transition: 'background 0.15s, color 0.15s', display: 'flex' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280'; }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                    </button>
                    <button onClick={() => onDelete(expense._id)} style={{ padding: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', borderRadius: '0.5rem', transition: 'background 0.15s, color 0.15s', display: 'flex' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280'; }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Expenses Page ─────────────────────────────────────────────────────
export default function Expenses() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editExp, setEditExp] = useState(null);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/expenses?month=${month}&year=${year}`);
            setExpenses(res.data);
        } catch { setError('Failed to load.'); }
        finally { setLoading(false); }
    }, [month, year]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const handleSave = (saved, type) => {
        if (type === 'edit') setExpenses(p => p.map(e => e._id === saved._id ? saved : e));
        else setExpenses(p => [saved, ...p]);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this expense?')) return;
        try { await api.delete(`/expenses/${id}`); setExpenses(p => p.filter(e => e._id !== id)); }
        catch { setError('Failed to delete.'); }
    };

    // Aggregations
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const avg = expenses.length ? total / expenses.length : 0;
    const byCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount; return acc;
    }, {});
    const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const topCatCfg = topCat ? CAT_CONFIG[topCat[0]] : null;

    // Breakdown bars
    const breakdownItems = Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([cat, amt]) => ({
            ...CAT_CONFIG[cat],
            amount: amt,
            pct: total > 0 ? Math.round((amt / total) * 100) : 0,
        }));

    // AI insight quote — use top category
    const insightQuote = topCat
        ? `"You've spent ₹${topCat[1].toFixed(0)} on ${CAT_CONFIG[topCat[0]]?.label || topCat[0]} this month. ${topCat[1] / total > 0.5 ? 'Consider reviewing this category.' : 'Keep it up!'}"`
        : '"Track daily to unlock deeper financial insights."';

    return (
        <DashboardShell>
            <style>{`
        @keyframes eFadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes eSpin    { to{transform:rotate(360deg)} }
        .tx-row:hover .tx-actions { opacity: 1 !important; }
      `}</style>

            <div style={{ padding: '2.5rem', maxWidth: 1300 }}>

                {error && (
                    <div style={{ background: 'rgba(255,113,108,0.1)', border: '1px solid rgba(255,113,108,0.25)', color: '#ff716c', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                        {error}<button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ff716c', cursor: 'pointer' }}>×</button>
                    </div>
                )}

                {/* ── Page Header ── */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                    marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
                    animation: 'eFadeUp 0.5s ease both',
                }}>
                    <div>
                        <h1 style={{
                            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
                            fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.03em',
                            color: '#00d4aa', marginBottom: '0.35rem',
                        }}>Expenses</h1>
                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Track every rupee, own your finances.</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Add button */}
                        <button onClick={() => { setEditExp(null); setShowModal(true); }} style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.65rem 1.35rem', borderRadius: '9999px', border: 'none',
                            background: '#00d4aa', color: '#00382b', cursor: 'pointer',
                            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.875rem',
                            boxShadow: '0 0 20px rgba(0,212,170,0.25)',
                            transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                            + Add Expense
                        </button>

                        {/* Month nav */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: '#111827', border: '1px solid #2f3445',
                            borderRadius: '9999px', padding: '0.35rem 0.75rem',
                        }}>
                            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '0.2rem', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#00d4aa'}
                                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                            </button>
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.82rem', color: '#dee1f7', minWidth: '5.5rem', textAlign: 'center' }}>
                                {MONTHS[month - 1]} {year}
                            </span>
                            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '0.2rem', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#00d4aa'}
                                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem', marginBottom: '2rem',
                    animation: 'eFadeUp 0.5s ease 0.05s both',
                }}>
                    {[
                        { value: `₹${total.toFixed(2)}`, label: '/ TOTAL THIS MONTH', big: true },
                        { value: expenses.length, label: '/ TRANSACTIONS' },
                        { value: `₹${avg.toFixed(0)}`, label: '/ AVG PER TRANSACTION' },
                        { value: topCatCfg ? `${topCatCfg.emoji} ${topCatCfg.label.split(' ')[0]}` : '—', label: '/ TOP CATEGORY' },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: '#111827', borderRadius: '0.875rem', padding: '1.5rem',
                            border: '1px solid rgba(59,74,68,0.15)',
                            transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{
                                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900,
                                fontSize: stat.big ? '2rem' : '1.75rem', color: stat.big ? '#00d4aa' : '#f9fafb',
                                letterSpacing: '-0.04em', marginBottom: '0.4rem', lineHeight: 1,
                            }}>{stat.value}</div>
                            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.5rem', marginBottom: '2rem', animation: 'eFadeUp 0.5s ease 0.1s both' }}>

                    {/* Spending Breakdown */}
                    <div style={{ background: '#111827', borderRadius: '1rem', padding: '1.75rem', border: '1px solid rgba(59,74,68,0.1)' }}>
                        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: '1.5rem' }}>
                            Spending breakdown
                        </h3>

                        {breakdownItems.length === 0 ? (
                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No expenses this month.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {breakdownItems.map((item, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '1rem' }}>{item.emoji}</span>
                                                <span style={{ fontSize: '0.875rem', color: '#dee1f7', fontWeight: 500 }}>{item.label}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#f9fafb' }}>₹{item.amount.toFixed(0)}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b', minWidth: '2.5rem', textAlign: 'right' }}>{item.pct}%</span>
                                            </div>
                                        </div>
                                        <div style={{ height: 5, background: '#25293a', borderRadius: 99, overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', borderRadius: 99,
                                                background: `linear-gradient(90deg, ${item.color}, ${item.color}bb)`,
                                                width: `${item.pct}%`,
                                                transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
                                                boxShadow: `0 0 8px ${item.color}60`,
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Insight quote */}
                        <div style={{
                            marginTop: '1.75rem', paddingTop: '1.25rem',
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            <p style={{ fontSize: '0.82rem', color: '#9ca3af', fontStyle: 'italic', lineHeight: 1.7 }}>
                                {insightQuote}
                            </p>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div style={{ background: '#111827', borderRadius: '1rem', border: '1px solid rgba(59,74,68,0.1)', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.5rem 1.25rem' }}>
                            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                                Recent Transactions
                            </h3>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00d4aa', fontSize: '0.82rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                                View All
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                <div style={{ width: 32, height: 32, border: '3px solid rgba(0,212,170,0.2)', borderTopColor: '#00d4aa', borderRadius: '50%', animation: 'eSpin 0.7s linear infinite' }} />
                            </div>
                        ) : expenses.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#2f3445', display: 'block', marginBottom: '0.5rem' }}>receipt_long</span>
                                No transactions for {MONTHS_FULL[month - 1]}.
                            </div>
                        ) : (
                            <div>
                                {expenses.slice(0, 6).map(exp => (
                                    <TransactionRow
                                        key={exp._id}
                                        expense={exp}
                                        onEdit={(e) => { setEditExp(e); setShowModal(true); }}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Bottom: Celestial Forecast + Efficiency ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', animation: 'eFadeUp 0.5s ease 0.15s both' }}>

                    {/* Forecast */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1a1f2f, #111827)',
                        borderRadius: '1.5rem', padding: '2.5rem',
                        border: '1px solid rgba(0,212,170,0.1)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Ambient glow */}
                        <div style={{
                            position: 'absolute', right: -80, top: -80,
                            width: 256, height: 256,
                            background: 'rgba(0,212,170,0.05)', borderRadius: '50%', filter: 'blur(48px)',
                            pointerEvents: 'none',
                        }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <span style={{ color: '#00d4aa', fontWeight: 700, letterSpacing: '0.2em', fontSize: '0.6rem', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>
                                Celestial Forecast
                            </span>
                            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.75rem', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                                {total > 0
                                    ? `You're on track. ₹${total.toFixed(0)} spent this month.`
                                    : 'Start tracking to unlock your celestial forecast.'}
                            </h3>
                            <p style={{ color: '#9ca3af', maxWidth: '36rem', marginBottom: '2rem', lineHeight: 1.7, fontSize: '0.9rem' }}>
                                {topCat
                                    ? `Based on your spending, "${CAT_CONFIG[topCat[0]]?.label}" is your top category at ${Math.round((topCat[1] / total) * 100)}% of total spend.`
                                    : 'Log expenses to see AI-powered spending trajectory insights.'}
                            </p>
                            <button style={{
                                padding: '0.75rem 1.5rem', border: '1px solid #00d4aa',
                                color: '#00d4aa', background: 'transparent', borderRadius: '9999px',
                                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.875rem',
                                cursor: 'pointer', transition: 'background 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,170,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                View Forecast Model
                            </button>
                        </div>
                    </div>

                    {/* Efficiency Rating */}
                    <div style={{
                        background: '#111827', borderRadius: '1.5rem', padding: '2.5rem',
                        border: '1px solid rgba(59,74,68,0.1)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: 'rgba(238,152,0,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '1.25rem',
                            boxShadow: '0 0 24px rgba(238,152,0,0.2)',
                        }}>
                            <span className="material-symbols-outlined" style={{
                                fontSize: 40, color: '#ee9800',
                                fontVariationSettings: "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24",
                            }}>stars</span>
                        </div>
                        <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>
                            Efficiency Rating
                        </h4>
                        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: '3rem', letterSpacing: '-0.04em', color: '#ee9800', lineHeight: 1, marginBottom: '0.75rem' }}>
                            A+
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                            Top 5% of all users in financial management this week.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── FAB ── */}
            <button onClick={() => { setEditExp(null); setShowModal(true); }} style={{
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
                <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1,'wght' 700,'GRAD' 0,'opsz' 24" }}>add</span>
            </button>

            {/* ── Modal ── */}
            {showModal && (
                <ExpenseModal
                    expense={editExp}
                    onClose={() => { setShowModal(false); setEditExp(null); }}
                    onSave={handleSave}
                />
            )}
        </DashboardShell>
    );
}