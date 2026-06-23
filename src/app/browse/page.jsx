'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getAllTasks } from '@/lib/api/home/getAllTasks';
import { Magnifier, Briefcase, Calendar, Star, Xmark, Check } from '@gravity-ui/icons';
import toast, { Toaster } from 'react-hot-toast';

const CATEGORIES = [
    'All Categories',
    'Web Development',
    'Mobile Development',
    'UI / UX Design',
    'Graphic Design',
    'Copywriting & Content',
    'Video & Animation',
    'Data Entry',
    'Digital Marketing',
    'SEO',
    'Customer Support',
    'Accounting & Finance',
    'Other',
];

const CATEGORY_THEMES = {
    'Web Development':     { textColor: '#50d4ff', bg: 'rgba(0,170,255,0.08)', border: 'rgba(0,170,255,0.22)', icon: '⚡' },
    'Mobile Development':  { textColor: '#50d4ff', bg: 'rgba(0,170,255,0.08)', border: 'rgba(0,170,255,0.22)', icon: '📱' },
    'UI / UX Design':      { textColor: '#ff9a50', bg: 'rgba(255,100,0,0.08)', border: 'rgba(255,100,0,0.22)', icon: '🎨' },
    'Graphic Design':      { textColor: '#ff9a50', bg: 'rgba(255,100,0,0.08)', border: 'rgba(255,100,0,0.22)', icon: '📐' },
    'Copywriting & Content': { textColor: '#a78bfa', bg: 'rgba(120,80,255,0.08)', border: 'rgba(120,80,255,0.22)', icon: '✍️' },
    'Video & Animation':   { textColor: '#fb7185', bg: 'rgba(240,50,80,0.08)', border: 'rgba(240,50,80,0.22)', icon: '🎬' },
    'Digital Marketing':   { textColor: '#34d399', bg: 'rgba(0,200,120,0.08)', border: 'rgba(0,200,120,0.22)', icon: '📈' },
    'SEO':                 { textColor: '#34d399', bg: 'rgba(0,200,120,0.08)', border: 'rgba(0,200,120,0.22)', icon: '🔍' },
    'Customer Support':    { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', icon: '💬' },
    'Accounting & Finance': { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', icon: '📊' },
    'Other':               { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', icon: '💡' },
};

function getTheme(category) {
    return CATEGORY_THEMES[category] || { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', icon: '💼' };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate   = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatBudget = (n)   => `$${Number(n).toLocaleString()}`;
const getDaysLeft  = (iso) => {
    const diff = new Date(iso) - new Date();
    const days = Math.ceil(diff / 864e5);
    return days > 0 ? `${days} day${days !== 1 ? 's' : ''} left` : 'Expired';
};

export default function BrowseTasksPage() {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [sortBy, setSortBy] = useState('newest'); // newest, budget-high, budget-low, deadline
    const [budgetMin, setBudgetMin] = useState('');

    // Detail Modal / Proposals
    const [activeTask, setActiveTask] = useState(null);
    const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
    const [proposalForm, setProposalForm] = useState({ rate: '', days: '', pitch: '' });

    const loadTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllTasks();
            // Filter only "open" status tasks for freelancers to browse
            const openTasks = (Array.isArray(data) ? data : []).filter(t => t.status === 'open');
            setTasks(openTasks);
        } catch (err) {
            setError(err.message || 'Failed to fetch tasks.');
            toast.error('Failed to load tasks from database.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    // Filter and Sort implementation
    const filteredTasks = tasks
        .filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 t.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All Categories' || t.category === selectedCategory;
            const matchesBudget = !budgetMin || Number(t.budget) >= Number(budgetMin);
            return matchesSearch && matchesCategory && matchesBudget;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            if (sortBy === 'budget-high') return Number(b.budget) - Number(a.budget);
            if (sortBy === 'budget-low') return Number(a.budget) - Number(b.budget);
            if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
            return 0;
        });

    const handleTaskClick = (task) => {
        setActiveTask(task);
        setProposalForm({ rate: task.budget, days: '7', pitch: '' });
    };

    const handleProposalSubmit = (e) => {
        e.preventDefault();
        if (!session?.user) {
            toast.error('You must be logged in to apply.');
            return;
        }

        if (Number(proposalForm.rate) <= 0) {
            toast.error('Please enter a valid rate.');
            return;
        }
        if (Number(proposalForm.days) <= 0) {
            toast.error('Please enter delivery time.');
            return;
        }
        if (proposalForm.pitch.trim().length < 15) {
            toast.error('Your proposal pitch must be at least 15 characters.');
            return;
        }

        setIsSubmittingProposal(true);

        // Mock proposal submitting process
        setTimeout(() => {
            setIsSubmittingProposal(false);
            toast.success('Your proposal has been submitted successfully!');
            
            // Optimistically update proposal count locally
            setTasks(prev => prev.map(t => t._id === activeTask._id ? { ...t, proposals: (t.proposals || 0) + 1 } : t));
            setActiveTask(null);
        }, 1200);
    };

    return (
        <div style={{ padding: '110px 24px 80px', maxWidth: 1100, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <Toaster position="top-center" toastOptions={{
                style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, borderRadius: 10 },
                success: { iconTheme: { primary: '#22c55e', secondary: '#1a1a1a' } },
                error: { iconTheme: { primary: '#ff4d00', secondary: '#1a1a1a' } }
            }} />

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shimmer { to { background-position: -200% 0; } }
                .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
                .filter-panel {
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 16px; padding: 20px; margin-bottom: 28px;
                    display: flex; gap: 16px; flex-wrap: wrap; align-items: center;
                }
                .filter-input {
                    padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.09);
                    background: rgba(255,255,255,0.04); color: #fff; outline: none; font-size: 13.5px;
                    transition: border 0.2s; min-width: 140px; box-sizing: border-box;
                }
                .filter-input:focus { border-color: #ff4d00; background: rgba(255,77,0,0.04); }
                .job-card {
                    background: #0f0604; border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 16px; padding: 22px; transition: all 0.22s ease-in-out;
                    display: flex; flex-direction: column; cursor: pointer; position: relative;
                }
                .job-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 16px 40px rgba(255,77,0,0.12), 0 0 0 1px rgba(255,77,0,0.22);
                    border-color: rgba(255,77,0,0.3);
                }
                .job-card::before {
                    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
                    background: linear-gradient(90deg,#ff4d00,#ff8c42,transparent);
                    transform: scaleX(0); transform-origin: left; transition: transform 0.3s;
                }
                .job-card:hover::before { transform: scaleX(1); }
                select.filter-input {
                    appearance: none;
                    backgroundImage: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.35)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                    background-repeat: no-repeat; background-position: right 12px center;
                    padding-right: 32px; cursor: pointer;
                }
                select.filter-input option { background: #111; color: #fff; }
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
                
                @media(max-width: 767px) {
                    .filter-panel { flex-direction: column; align-items: stretch; gap: 12px; }
                    .filter-input { width: 100%; }
                }
            `}</style>

            {/* Header */}
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '3px 10px', borderRadius: 99, marginBottom: 12, background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.2)' }}>
                        <Briefcase width={11} height={11} style={{ color: '#ff4d00' }} />
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#ff4d00', letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'monospace' }}>Freelancer Gigs</span>
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 6px' }}>Browse Tasks</h1>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        {loading ? 'Fetching gigs…' : `${filteredTasks.length} open gig${filteredTasks.length !== 1 ? 's' : ''} matching your interests`}
                    </p>
                </div>
            </div>

            {/* Unique Search & Filter Panel */}
            <div className="filter-panel">
                {/* Text search */}
                <div style={{ flex: 2, minWidth: '220px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
                        <Magnifier width={15} height={15} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search keyword (e.g. landing page, React)..."
                        className="filter-input"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: 38, width: '100%' }}
                    />
                </div>

                {/* Category Dropdown */}
                <select
                    className="filter-input"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    style={{ flex: 1, minWidth: '160px' }}
                >
                    {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                {/* Budget filter */}
                <div style={{ position: 'relative', flex: 0.8, minWidth: '120px' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>$</span>
                    <input
                        type="number"
                        placeholder="Min Budget"
                        className="filter-input"
                        value={budgetMin}
                        onChange={e => setBudgetMin(e.target.value)}
                        style={{ paddingLeft: 22, width: '100%' }}
                    />
                </div>

                {/* Sort dropdown */}
                <select
                    className="filter-input"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{ flex: 1, minWidth: '140px' }}
                >
                    <option value="newest">Latest Posted</option>
                    <option value="budget-high">Budget: High to Low</option>
                    <option value="budget-low">Budget: Low to High</option>
                    <option value="deadline">Soonest Deadline</option>
                </select>

                {/* Reset button */}
                {(searchQuery || selectedCategory !== 'All Categories' || budgetMin || sortBy !== 'newest') && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('All Categories');
                            setBudgetMin('');
                            setSortBy('newest');
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#ff4d00', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: '6px 12px', textDecoration: 'underline' }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Content Display */}
            {loading ? (
                <div className="jobs-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ height: 180, background: 'linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', borderRadius: 16 }} />
                    ))}
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#fff' }}>Error fetching open tasks</p>
                    <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{error}</p>
                    <button onClick={loadTasks} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,77,0,0.35)', background: 'rgba(255,77,0,0.08)', color: '#ff4d00', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Retry</button>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px', background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase width={22} height={22} style={{ color: '#ff4d00' }} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>No matches found</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                        Try adjustments in your search words or choose another category filter.
                    </p>
                </div>
            ) : (
                <div className="jobs-grid">
                    {filteredTasks.map((task) => {
                        const theme = getTheme(task.category);
                        return (
                            <div key={task._id} className="job-card" onClick={() => handleTaskClick(task)}>
                                {/* Category and budget line */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <span style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: theme.textColor, background: theme.bg, border: `1px solid ${theme.border}`, padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        {theme.icon} {task.category}
                                    </span>
                                    {Number(task.budget) >= 500 && (
                                        <span style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                            🔥 High Budget
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.35, margin: '0 0 10px', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {task.title}
                                </h3>

                                {/* Description excerpt */}
                                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: '0 0 16px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {task.description}
                                </p>

                                {/* Divider */}
                                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: 'auto 0 14px 0' }} />

                                {/* Footer details */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: 8.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Budget</div>
                                        <span style={{ fontSize: 15, fontWeight: 800, color: '#ff4d00', fontFamily: 'monospace' }}>{formatBudget(task.budget)}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 8.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Deadline</div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Calendar width={11} height={11} style={{ opacity: 0.5 }} />
                                            {getDaysLeft(task.deadline)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* High-Fidelity Details / proposal Modal */}
            {activeTask && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                    onClick={() => setActiveTask(null)}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: '#111', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 20, padding: '32px', maxWidth: 640, width: '100%',
                        maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '90%' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: getTheme(activeTask.category).textColor, background: getTheme(activeTask.category).bg, border: `1px solid ${getTheme(activeTask.category).border}`, padding: '3px 8px', borderRadius: 6 }}>
                                        {getTheme(activeTask.category).icon} {activeTask.category}
                                    </span>
                                    <span style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 8px', borderRadius: 6 }}>
                                        {activeTask.proposals || 0} PROPOSALS
                                    </span>
                                </div>
                                <h2 style={{ margin: '6px 0 0 0', fontSize: 19, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                                    {activeTask.title}
                                </h2>
                            </div>
                            <button onClick={() => setActiveTask(null)} style={{
                                width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                                background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.45)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                            >
                                <Xmark width={14} height={14} />
                            </button>
                        </div>

                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

                        {/* Info details box */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 24 }}>
                            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>Client Budget</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: '#ff4d00', fontFamily: 'monospace' }}>{formatBudget(activeTask.budget)}</div>
                            </div>
                            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>Submission Deadline</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{formatDate(activeTask.deadline)}</div>
                            </div>
                            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>Days Remaining</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{getDaysLeft(activeTask.deadline)}</div>
                            </div>
                            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>Client Name</div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{activeTask.clientName || 'Verified'}</div>
                            </div>
                        </div>

                        {/* Task description */}
                        <div style={{ marginBottom: 28 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Task Specifications</div>
                            <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, whiteSpace: 'pre-wrap', maxHeight: 180, overflowY: 'auto' }}>
                                {activeTask.description}
                            </div>
                        </div>

                        {/* Proposal Form Section */}
                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 24 }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Star width={14} height={14} style={{ color: '#ff4d00' }} /> Submit Your Proposal
                            </h4>

                            <form onSubmit={handleProposalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Your Rate (USD) *</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>$</span>
                                            <input
                                                type="number"
                                                required
                                                className="filter-input"
                                                value={proposalForm.rate}
                                                onChange={e => setProposalForm(prev => ({ ...prev, rate: e.target.value }))}
                                                disabled={isSubmittingProposal}
                                                style={{ paddingLeft: 22, width: '100%', fontSize: 13 }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Estimated Days *</label>
                                        <input
                                            type="number"
                                            required
                                            className="filter-input"
                                            value={proposalForm.days}
                                            onChange={e => setProposalForm(prev => ({ ...prev, days: e.target.value }))}
                                            disabled={isSubmittingProposal}
                                            style={{ width: '100%', fontSize: 13 }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Cover Letter / Why you? *</label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Pitch yourself in a few sentences — what is your approach, relevant experience, tools you'll use..."
                                        className="filter-input"
                                        value={proposalForm.pitch}
                                        onChange={e => setProposalForm(prev => ({ ...prev, pitch: e.target.value }))}
                                        disabled={isSubmittingProposal}
                                        style={{ resize: 'vertical', width: '100%', minHeight: 70, fontSize: 13, lineHeight: 1.5 }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                                    <button type="button" onClick={() => setActiveTask(null)} disabled={isSubmittingProposal} style={{
                                        flex: 1, padding: '10px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)',
                                        fontSize: 13, fontWeight: 600, cursor: isSubmittingProposal ? 'not-allowed' : 'pointer',
                                        opacity: isSubmittingProposal ? 0.5 : 1
                                    }}>Cancel</button>
                                    <button type="submit" disabled={isSubmittingProposal} style={{
                                        flex: 1.5, padding: '10px 16px', borderRadius: 9, border: 'none',
                                        background: 'linear-gradient(135deg,#ff4d00,#cc3d00)', color: '#fff',
                                        fontSize: 13, fontWeight: 700, cursor: isSubmittingProposal ? 'not-allowed' : 'pointer',
                                        opacity: isSubmittingProposal ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        boxShadow: isSubmittingProposal ? 'none' : '0 0 16px rgba(255,77,0,0.22)'
                                    }}>
                                        {isSubmittingProposal ? (
                                            <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />Submitting…</>
                                        ) : (
                                            <><Check width={14} height={14} /> Submit Application</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
