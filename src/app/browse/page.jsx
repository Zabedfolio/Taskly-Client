'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { getAllTasks } from '@/lib/api/home/getAllTasks';
import { submitProposal } from '@/lib/api/client/submitProposal';
import { getMyProposals } from '@/lib/api/freelancer/getMyProposals';
import toast, { Toaster } from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
    'All Categories', 'Web Development', 'Mobile Development', 'UI / UX Design',
    'Graphic Design', 'Copywriting & Content', 'Video & Animation', 'Data Entry',
    'Digital Marketing', 'SEO', 'Customer Support', 'Accounting & Finance', 'Other',
];

const CATEGORY_THEMES = {
    'Web Development':       { textColor: '#50d4ff', bg: 'rgba(0,170,255,0.08)',   border: 'rgba(0,170,255,0.22)',   icon: '⚡' },
    'Mobile Development':    { textColor: '#50d4ff', bg: 'rgba(0,170,255,0.08)',   border: 'rgba(0,170,255,0.22)',   icon: '📱' },
    'UI / UX Design':        { textColor: '#ff9a50', bg: 'rgba(255,100,0,0.08)',   border: 'rgba(255,100,0,0.22)',   icon: '🎨' },
    'Graphic Design':        { textColor: '#ff9a50', bg: 'rgba(255,100,0,0.08)',   border: 'rgba(255,100,0,0.22)',   icon: '📐' },
    'Copywriting & Content': { textColor: '#a78bfa', bg: 'rgba(120,80,255,0.08)', border: 'rgba(120,80,255,0.22)', icon: '✍️' },
    'Video & Animation':     { textColor: '#fb7185', bg: 'rgba(240,50,80,0.08)',  border: 'rgba(240,50,80,0.22)',  icon: '🎬' },
    'Digital Marketing':     { textColor: '#34d399', bg: 'rgba(0,200,120,0.08)',  border: 'rgba(0,200,120,0.22)',  icon: '📈' },
    'SEO':                   { textColor: '#34d399', bg: 'rgba(0,200,120,0.08)',  border: 'rgba(0,200,120,0.22)',  icon: '🔍' },
    'Customer Support':      { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', icon: '💬' },
    'Accounting & Finance':  { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', icon: '📊' },
    'Other':                 { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', icon: '💡' },
};

function getTheme(cat) {
    return CATEGORY_THEMES[cat] || { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', icon: '💼' };
}

const fmt    = (n) => `$${Number(n).toLocaleString()}`;
const fmtDt  = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const daysLeft = (iso) => {
    const d = Math.ceil((new Date(iso) - new Date()) / 864e5);
    return d > 0 ? `${d}d left` : 'Expired';
};

// ─── Inline field component ───────────────────────────────────────────────────
function Field({ label, icon, children, hint }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 9.5, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                color: 'rgba(255,255,255,0.38)', letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>
                {icon && <span style={{ fontSize: 11 }}>{icon}</span>}
                {label}
            </label>
            {children}
            {hint && <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.22)', marginTop: -2 }}>{hint}</span>}
        </div>
    );
}

// ─── Input style ─────────────────────────────────────────────────────────────
const inputStyle = (disabled) => ({
    padding: '10px 13px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.09)',
    background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
    color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border 0.18s, background 0.18s',
    fontFamily: 'inherit',
    cursor: disabled ? 'not-allowed' : 'text',
});

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BrowseTasksPage() {
    const { data: session } = useSession();
    const user = session?.user;

    const [tasks, setTasks]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted]   = useState(false);
    const [myProposals, setMyProposals] = useState([]);
    const formRef = useRef(null);

    // Filters
    const [search, setSearch]         = useState('');
    const [category, setCategory]     = useState('All Categories');
    const [sort, setSort]             = useState('newest');
    const [minBudget, setMinBudget]   = useState('');

    // ── Load tasks ────────────────────────────────────────────────────────────
    const loadTasks = async () => {
        setLoading(true); setError(null);
        try {
            const data = await getAllTasks();
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to fetch tasks.');
            toast.error('Failed to load tasks from database.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadTasks(); }, []);

    useEffect(() => {
        if (!session?.session?.token || user?.role !== 'freelancer') return;
        async function fetchMyProposals() {
            try {
                const data = await getMyProposals(session.session.token);
                setMyProposals(data || []);
            } catch (err) {
                console.error("Error loading freelancer proposals in browse page:", err);
            }
        }
        fetchMyProposals();
    }, [session, user]);

    // ── Filter / sort ─────────────────────────────────────────────────────────
    const filtered = tasks
        .filter(t => {
            const q = search.toLowerCase();
            return (
                (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) &&
                (category === 'All Categories' || t.category === category) &&
                (!minBudget || Number(t.budget) >= Number(minBudget))
            );
        })
        .sort((a, b) => {
            if (sort === 'newest')      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            if (sort === 'budget-high') return Number(b.budget) - Number(a.budget);
            if (sort === 'budget-low')  return Number(a.budget) - Number(b.budget);
            if (sort === 'deadline')    return new Date(a.deadline) - new Date(b.deadline);
            return 0;
        });

    // ── Proposal submit ───────────────────────────────────────────────────────
    const handleProposalSubmit = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('You must be logged in to apply.'); return; }

        const fd = new FormData(formRef.current);

        const budget = Number(fd.get('proposedBudget'));
        const days   = Number(fd.get('estimatedDays'));
        const note   = (fd.get('coverNote') || '').trim();

        if (budget <= 0)       { toast.error('Enter a valid budget.'); return; }
        if (days <= 0)         { toast.error('Enter estimated days.'); return; }
        if (note.length < 20)  { toast.error('Cover note must be at least 20 characters.'); return; }

        setSubmitting(true);
        try {
            await submitProposal(fd, { userId: user.id, taskTitle: activeTask.title });
            setSubmitted(true);
            toast.success('🎉 Proposal submitted!');
            // bump proposal count optimistically
            setTasks(prev => prev.map(t =>
                t._id === activeTask._id ? { ...t, proposals: (t.proposals || 0) + 1 } : t
            ));
            // Add to myProposals optimistically so they can't submit again
            setMyProposals(prev => [...prev, { taskId: activeTask._id }]);
        } catch (err) {
            toast.error(err.message || 'Submission failed. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const openTask = (task) => {
        setActiveTask(task);
        setSubmitted(false);
    };

    const closeModal = () => {
        setActiveTask(null);
        setSubmitted(false);
        formRef.current?.reset();
    };

    const hasFilters = search || category !== 'All Categories' || minBudget || sort !== 'newest';

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
            <Toaster position="top-center" toastOptions={{
                style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, borderRadius: 10 },
                success: { iconTheme: { primary: '#22c55e', secondary: '#1a1a1a' } },
                error:   { iconTheme: { primary: '#ff4d00', secondary: '#1a1a1a' } },
            }} />

            <style>{`
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes shimmer { to { background-position: -200% 0; } }
                @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
                @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
                .browse-input {
                    padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.09);
                    background: rgba(255,255,255,0.04); color: #fff; outline: none;
                    font-size: 13.5px; transition: border 0.2s; box-sizing: border-box;
                }
                .browse-input:focus { border-color: #ff4d00; background: rgba(255,77,0,0.04); }
                select.browse-input {
                    appearance: none; cursor: pointer;
                    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.35)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                    background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
                }
                select.browse-input option { background: #111; color: #fff; }
                .task-card {
                    background: #0f0604; border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 16px; padding: 22px; cursor: pointer;
                    display: flex; flex-direction: column; position: relative; overflow: hidden;
                    transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
                }
                .task-card::before {
                    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
                    background: linear-gradient(90deg,#ff4d00,#ff8c42,transparent);
                    transform: scaleX(0); transform-origin: left; transition: transform 0.28s;
                }
                .task-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(255,77,0,0.12), 0 0 0 1px rgba(255,77,0,0.22); border-color: rgba(255,77,0,0.3); }
                .task-card:hover::before { transform: scaleX(1); }
                .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 18px; }
                .modal-form-input {
                    padding: 10px 13px; border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.09);
                    background: rgba(255,255,255,0.04); color: #fff;
                    font-size: 13px; outline: none; width: 100%; box-sizing: border-box;
                    transition: border 0.18s, box-shadow 0.18s; font-family: inherit;
                }
                .modal-form-input:focus { border-color: rgba(255,77,0,0.55); box-shadow: 0 0 0 3px rgba(255,77,0,0.07); }
                .modal-form-input:disabled { opacity: 0.45; cursor: not-allowed; }
                .modal-form-input.readonly { background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.4); cursor: default; }
                .proposal-submit-btn {
                    width: 100%; padding: 12px; border-radius: 11px; border: none;
                    background: linear-gradient(135deg,#ff4d00,#cc3d00);
                    color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    box-shadow: 0 4px 20px rgba(255,77,0,0.25); transition: opacity 0.2s, transform 0.15s;
                }
                .proposal-submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(255,77,0,0.35); }
                .proposal-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                @media(max-width:900px) {
                    .modal-inner { flex-direction: column !important; }
                    .modal-right-panel { border-left: none !important; border-top: 1px solid rgba(255,255,255,0.07) !important; }
                }
                @media(max-width:640px) {
                    .filter-row { flex-direction: column !important; }
                    .browse-input { width: 100%; }
                }
            `}</style>

            {/* Ambient glow */}
            <div style={{
                pointerEvents: 'none', position: 'fixed', top: 0, left: '50%',
                transform: 'translateX(-50%)', width: '80vw', height: '40vh', zIndex: 0,
                background: 'radial-gradient(ellipse at 50% 0%,rgba(255,77,0,0.055) 0%,transparent 70%)',
                filter: 'blur(40px)',
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1160, margin: '0 auto', padding: '110px 24px 80px' }}>

                {/* ── Page Header ── */}
                <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: '3px 10px', borderRadius: 99, marginBottom: 12,
                            background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.2)',
                        }}>
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                                <rect x="1" y="1" width="14" height="14" rx="3" stroke="#ff4d00" strokeWidth="1.5"/>
                                <path d="M4 8h8M4 5h5M4 11h3" stroke="#ff4d00" strokeWidth="1.3" strokeLinecap="round"/>
                            </svg>
                            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#ff4d00', letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                                Freelancer Gigs
                            </span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 8px' }}>
                            Browse{' '}
                            <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Open Tasks
                            </span>
                        </h1>
                        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.38)', margin: 0 }}>
                            {loading ? 'Fetching gigs…' : `${filtered.length} open gig${filtered.length !== 1 ? 's' : ''} available`}
                        </p>
                    </div>
                </div>

                {/* ── Filter Panel ── */}
                <div className="filter-row" style={{
                    display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16, padding: 18, marginBottom: 28,
                }}>
                    <div style={{ flex: 2, minWidth: 220, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
                            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </span>
                        <input type="text" placeholder="Search tasks…" className="browse-input"
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: 38, width: '100%' }}
                        />
                    </div>
                    <select className="browse-input" value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1, minWidth: 160 }}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div style={{ position: 'relative', flex: 0.7, minWidth: 110 }}>
                        <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>$</span>
                        <input type="number" placeholder="Min Budget" className="browse-input"
                            value={minBudget} onChange={e => setMinBudget(e.target.value)}
                            style={{ paddingLeft: 22, width: '100%' }}
                        />
                    </div>
                    <select className="browse-input" value={sort} onChange={e => setSort(e.target.value)} style={{ flex: 1, minWidth: 150 }}>
                        <option value="newest">Latest Posted</option>
                        <option value="budget-high">Budget: High → Low</option>
                        <option value="budget-low">Budget: Low → High</option>
                        <option value="deadline">Soonest Deadline</option>
                    </select>
                    {hasFilters && (
                        <button onClick={() => { setSearch(''); setCategory('All Categories'); setMinBudget(''); setSort('newest'); }}
                            style={{ background: 'transparent', border: 'none', color: '#ff4d00', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: '6px 10px', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                            Clear
                        </button>
                    )}
                </div>

                {/* ── Task Grid ── */}
                {loading ? (
                    <div className="jobs-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} style={{ height: 180, borderRadius: 16, background: 'linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                        ))}
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                        <p style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#fff' }}>Error loading tasks</p>
                        <button onClick={loadTasks} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,77,0,0.35)', background: 'rgba(255,77,0,0.08)', color: '#ff4d00', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Retry</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>No tasks found</h3>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="jobs-grid">
                        {filtered.map(task => {
                            const theme = getTheme(task.category);
                            return (
                                <div key={task._id} className="task-card" onClick={() => openTask(task)}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                        <span style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: theme.textColor, background: theme.bg, border: `1px solid ${theme.border}`, padding: '3px 8px', borderRadius: 6 }}>
                                            {theme.icon} {task.category}
                                        </span>
                                        {Number(task.budget) >= 500 && (
                                            <span style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                                🔥 High Budget
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.35, margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {task.title}
                                    </h3>
                                    <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: '0 0 16px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {task.description}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', textTransform: 'uppercase' }}>Client:</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{task.clientName || 'Verified Client'}</span>
                                    </div>
                                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: 'auto 0 14px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 8.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 2 }}>Budget</div>
                                            <span style={{ fontSize: 15, fontWeight: 800, color: '#ff4d00', fontFamily: 'monospace' }}>{fmt(task.budget)}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 8.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 2 }}>Deadline</div>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                                                {daysLeft(task.deadline)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                TASK DETAIL MODAL — two-panel layout
            ══════════════════════════════════════════════════════════════════ */}
            {activeTask && (
                <div
                    onClick={closeModal}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 300,
                        background: 'rgba(0,0,0,0.82)',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '16px',
                        overflowY: 'auto',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="modal-inner"
                        style={{
                            display: 'flex', flexDirection: 'row',
                            width: '100%', maxWidth: 920,
                            background: '#0f0f0f',
                            border: '1px solid rgba(255,255,255,0.09)',
                            borderRadius: 22,
                            boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,77,0,0.08)',
                            overflow: 'hidden',
                            animation: 'scaleIn 0.22s ease',
                            maxHeight: '92vh',
                        }}
                    >
                        {/* ── LEFT PANEL — Task Details ── */}
                        <div style={{
                            flex: 1, minWidth: 0,
                            padding: '32px 28px',
                            overflowY: 'auto',
                            borderRight: '1px solid rgba(255,255,255,0.07)',
                            display: 'flex', flexDirection: 'column', gap: 0,
                        }}>
                            {/* Close + category */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                                    <span style={{
                                        fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace',
                                        color: getTheme(activeTask.category).textColor,
                                        background: getTheme(activeTask.category).bg,
                                        border: `1px solid ${getTheme(activeTask.category).border}`,
                                        padding: '3px 9px', borderRadius: 6,
                                    }}>
                                        {getTheme(activeTask.category).icon} {activeTask.category}
                                    </span>
                                    <span style={{
                                        fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace',
                                        color: 'rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.07)', padding: '3px 9px', borderRadius: 6,
                                    }}>
                                        {activeTask.proposals || 0} PROPOSALS
                                    </span>
                                </div>
                                <button onClick={closeModal} style={{
                                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Title */}
                            <h2 style={{ fontSize: 'clamp(1.1rem,2.5vw,1.55rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.25, margin: '0 0 22px' }}>
                                {activeTask.title}
                            </h2>

                            {/* Stats grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 22 }}>
                                {[
                                    { label: 'Client Budget', value: fmt(activeTask.budget), color: '#ff4d00', mono: true },
                                    { label: 'Deadline', value: fmtDt(activeTask.deadline), color: '#fff' },
                                    { label: 'Time Left', value: daysLeft(activeTask.deadline), color: 'rgba(255,255,255,0.7)' },
                                    { label: 'Posted By', value: activeTask.clientName || 'Verified Client', color: 'rgba(255,255,255,0.7)' },
                                ].map(({ label, value, color, mono }) => (
                                    <div key={label} style={{ padding: '12px 14px', borderRadius: 11, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>{label}</div>
                                        <div style={{ fontSize: mono ? 17 : 13, fontWeight: 700, color, fontFamily: mono ? "'JetBrains Mono',monospace" : 'inherit' }}>{value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Task description */}
                            <div style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                                    Task Brief
                                </div>
                                <div style={{
                                    padding: 16, borderRadius: 12,
                                    background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)',
                                    fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7,
                                    whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto',
                                }}>
                                    {activeTask.description}
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT PANEL — Proposal Form ── */}
                        <div
                            className="modal-right-panel"
                            style={{
                                width: 360, flexShrink: 0,
                                padding: '32px 26px',
                                overflowY: 'auto',
                                display: 'flex', flexDirection: 'column',
                                background: 'rgba(255,77,0,0.012)',
                            }}
                        >
                            {submitted ? (
                                /* ── Success State ── */
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16, animation: 'fadeUp 0.4s ease' }}>
                                    <div style={{
                                        width: 64, height: 64, borderRadius: '50%',
                                        background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.4)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                            <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Proposal Sent!</h3>
                                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', margin: '0 0 20px' }}>
                                            Your proposal has been submitted and is now <span style={{ color: '#f59e0b', fontWeight: 700 }}>pending</span> review.
                                        </p>
                                    </div>
                                    <button onClick={closeModal} style={{
                                        padding: '10px 22px', borderRadius: 10,
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        background: 'rgba(255,255,255,0.05)', color: '#fff',
                                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    }}>
                                        Close
                                    </button>
                                </div>

                            ) : !user ? (
                                /* ── Not logged in ── */
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: '50%',
                                        background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.25)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                            <rect x="5" y="11" width="14" height="11" rx="2" stroke="#ff4d00" strokeWidth="1.8"/>
                                            <path d="M8 11V7a4 4 0 018 0v4" stroke="#ff4d00" strokeWidth="1.8" strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Login to Apply</h3>
                                        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)', margin: '0 0 18px', lineHeight: 1.55 }}>
                                            Sign in with your freelancer account to submit a proposal for this gig.
                                        </p>
                                    </div>
                                    <a href="/auth/login" style={{
                                        display: 'block', width: '100%', padding: '11px', borderRadius: 11,
                                        background: 'linear-gradient(135deg,#ff4d00,#cc3d00)',
                                        color: '#fff', fontSize: 14, fontWeight: 700,
                                        textDecoration: 'none', textAlign: 'center',
                                        boxShadow: '0 4px 18px rgba(255,77,0,0.28)',
                                    }}>
                                        Sign In
                                    </a>
                                </div>

                            ) : user.role !== 'freelancer' ? (
                                /* ── Non-freelancer role locked out ── */
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: '50%',
                                        background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.25)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ff4d00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M12 9v4M12 17h.01" stroke="#ff4d00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Freelancer Account Required</h3>
                                        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)', margin: '0 0 18px', lineHeight: 1.55 }}>
                                            Only registered freelancers can submit proposal applications for tasks.
                                        </p>
                                    </div>
                                </div>

                            ) : myProposals.some(p => p.taskId === activeTask._id) ? (
                                /* ── Already applied state ── */
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: '50%',
                                        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M22 4L12 14.01l-3-3" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Already Applied</h3>
                                        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)', margin: '0 0 18px', lineHeight: 1.55 }}>
                                            You have already submitted a proposal for this task card.
                                        </p>
                                    </div>
                                </div>

                            ) : (
                                /* ── Proposal Form ── */
                                <>
                                    {/* Header */}
                                    <div style={{ marginBottom: 22 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 20h9" stroke="#ff4d00" strokeWidth="1.8" strokeLinecap="round"/>
                                                    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#ff4d00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1 }}>Submit Proposal</div>
                                                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Fill all fields carefully</div>
                                            </div>
                                        </div>
                                        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(255,77,0,0.22),transparent)', marginTop: 14 }} />
                                    </div>

                                    {/* The Form */}
                                    <form ref={formRef} onSubmit={handleProposalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                                        {/* Hidden: Task ID */}
                                        <input type="hidden" name="taskId" value={activeTask._id} />

                                        {/* Freelancer Email — auto-filled, readonly */}
                                        <Field label="Your Email" icon="📧">
                                            <input
                                                type="email"
                                                name="freelancerEmail"
                                                defaultValue={user.email}
                                                readOnly
                                                className="modal-form-input readonly"
                                            />
                                        </Field>

                                        {/* Task ID — visible read-only reference */}
                                        <Field label="Task Reference" icon="🆔" hint="Auto-filled from the selected task">
                                            <input
                                                type="text"
                                                value={`#${activeTask._id?.slice(-8).toUpperCase()}`}
                                                readOnly
                                                className="modal-form-input readonly"
                                            />
                                        </Field>

                                        {/* Two-column: Budget + Days */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <Field label="Proposed Budget" icon="💰">
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', fontFamily: 'monospace' }}>$</span>
                                                    <input
                                                        type="number"
                                                        name="proposedBudget"
                                                        required
                                                        min="1"
                                                        placeholder={activeTask.budget}
                                                        className="modal-form-input"
                                                        disabled={submitting}
                                                        style={{ paddingLeft: 22 }}
                                                    />
                                                </div>
                                            </Field>
                                            <Field label="Est. Days" icon="📅">
                                                <input
                                                    type="number"
                                                    name="estimatedDays"
                                                    required
                                                    min="1"
                                                    placeholder="7"
                                                    className="modal-form-input"
                                                    disabled={submitting}
                                                />
                                            </Field>
                                        </div>

                                        {/* Cover Note */}
                                        <Field label="Cover Note" icon="📝" hint="Min 20 characters — explain your approach">
                                            <textarea
                                                name="coverNote"
                                                required
                                                rows={5}
                                                placeholder={`Hi, I'm a ${(user.name || 'freelancer').split(' ')[0]} and I'd love to work on this project because…`}
                                                className="modal-form-input"
                                                disabled={submitting}
                                                style={{ resize: 'vertical', minHeight: 110, lineHeight: 1.6 }}
                                            />
                                        </Field>

                                        {/* Status pill */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 9, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', flexShrink: 0, boxShadow: '0 0 6px rgba(245,158,11,0.6)' }} />
                                            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', fontFamily: "'JetBrains Mono',monospace" }}>
                                                Status will be set to{' '}
                                                <span style={{ color: '#f59e0b', fontWeight: 700 }}>pending</span>
                                            </span>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="proposal-submit-btn"
                                        >
                                            {submitting ? (
                                                <>
                                                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.65s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                                                    Submitting…
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                                        <path d="M22 2L11 13" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    Send My Proposal
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
