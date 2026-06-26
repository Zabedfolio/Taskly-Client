'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllTasks } from '@/lib/api/home/getAllTasks';
import toast from 'react-hot-toast';
import TaskDetailModal from '@/components/shared/TaskDetailModal';
import ClientRatingBadge from '@/components/shared/ClientRatingBadge';
import { useSession } from '@/lib/auth-client';
import { useBookmarks } from '@/contexts/BookmarkContext';
import {
    Thunderbolt, Smartphone, Palette, Paintbrush, PencilToLine,
    Video, Megaphone, Magnifier, Comment, ChartBar, Bulb, Briefcase, Flame,
} from '@gravity-ui/icons';

const CATEGORY_ICON_MAP = {
    thunderbolt:  Thunderbolt,
    smartphone:   Smartphone,
    palette:      Palette,
    paintbrush:   Paintbrush,
    pencilToLine: PencilToLine,
    video:        Video,
    megaphone:    Megaphone,
    magnifier:    Magnifier,
    comment:      Comment,
    chartBar:     ChartBar,
    bulb:         Bulb,
    briefcase:    Briefcase,
};

function CategoryIcon({ iconKey, color, size = 10 }) {
    const Icon = CATEGORY_ICON_MAP[iconKey] || Briefcase;
    return <Icon width={size} height={size} style={{ color, flexShrink: 0 }} />;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
    'All Categories', 'Web Development', 'Mobile Development', 'UI / UX Design',
    'Graphic Design', 'Copywriting & Content', 'Video & Animation', 'Data Entry',
    'Digital Marketing', 'SEO', 'Customer Support', 'Accounting & Finance', 'Other',
];

const CATEGORY_THEMES = {
    'Web Development':       { textColor: '#50d4ff', bg: 'rgba(0,170,255,0.08)',   border: 'rgba(0,170,255,0.22)',   iconKey: 'thunderbolt' },
    'Mobile Development':    { textColor: '#50d4ff', bg: 'rgba(0,170,255,0.08)',   border: 'rgba(0,170,255,0.22)',   iconKey: 'smartphone'   },
    'UI / UX Design':        { textColor: '#ff9a50', bg: 'rgba(255,100,0,0.08)',   border: 'rgba(255,100,0,0.22)',   iconKey: 'palette'      },
    'Graphic Design':        { textColor: '#ff9a50', bg: 'rgba(255,100,0,0.08)',   border: 'rgba(255,100,0,0.22)',   iconKey: 'paintbrush'   },
    'Copywriting & Content': { textColor: '#a78bfa', bg: 'rgba(120,80,255,0.08)', border: 'rgba(120,80,255,0.22)', iconKey: 'pencilToLine'  },
    'Video & Animation':     { textColor: '#fb7185', bg: 'rgba(240,50,80,0.08)',  border: 'rgba(240,50,80,0.22)',  iconKey: 'video'        },
    'Digital Marketing':     { textColor: '#34d399', bg: 'rgba(0,200,120,0.08)',  border: 'rgba(0,200,120,0.22)',  iconKey: 'megaphone'    },
    'SEO':                   { textColor: '#34d399', bg: 'rgba(0,200,120,0.08)',  border: 'rgba(0,200,120,0.22)',  iconKey: 'magnifier'    },
    'Customer Support':      { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', iconKey: 'comment'     },
    'Accounting & Finance':  { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', iconKey: 'chartBar'    },
    'Other':                 { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', iconKey: 'bulb'        },
};

function getTheme(cat) {
    return CATEGORY_THEMES[cat] || { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', iconKey: 'briefcase' };
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
    const [rawTasks, setRawTasks]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const { data: session } = useSession();
    const { toggleBookmark, isBookmarked } = useBookmarks();
    const user = session?.user;

    // Filters
    const [search, setSearch]         = useState('');
    const [category, setCategory]     = useState('All Categories');
    const [sort, setSort]             = useState('newest');
    const [minBudget, setMinBudget]   = useState('');

    // Pagination (client-side limit = 9)
    const [page, setPage]             = useState(1);
    const limit = 9;

    // ── Load tasks ────────────────────────────────────────────────────────────
    const loadTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
            const [tasksData, proposalsRes, freelancersRes] = await Promise.all([
                getAllTasks(),
                fetch(`${baseUrl}/api/proposals`),
                fetch(`${baseUrl}/api/freelancers`)
            ]);
            
            const tasksList = Array.isArray(tasksData) ? tasksData : (tasksData?.tasks || []);
            const proposalsList = proposalsRes.ok ? await proposalsRes.json() : [];
            const freelancersList = freelancersRes.ok ? await freelancersRes.json() : [];

            // Client-side mapping
            const enriched = tasksList.map(t => {
                const count = proposalsList.filter(p => p.taskId === t._id).length;
                const acceptedProp = proposalsList.find(p => p.taskId === t._id && p.status?.toLowerCase() === 'accepted');
                
                let freelancerEmail = null;
                let freelancerName = null;
                let freelancerImage = null;
                
                if (acceptedProp) {
                    freelancerEmail = acceptedProp.freelancerEmail;
                    const fUser = freelancersList.find(u => u.email?.toLowerCase() === acceptedProp.freelancerEmail?.toLowerCase());
                    if (fUser) {
                        freelancerName = fUser.name || 'Freelancer';
                        freelancerImage = fUser.image || null;
                    }
                }
                
                return {
                    ...t,
                    proposals: count,
                    freelancerEmail,
                    freelancerName,
                    freelancerImage
                };
            });

            setRawTasks(enriched);
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

    // Reset page to 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [search, category, minBudget, sort]);

    // Client-side filtering & sorting
    const processedTasks = [...rawTasks]
        .filter(t => {
            // Category filter
            if (category && category !== 'All Categories' && t.category !== category) {
                return false;
            }
            // Min Budget filter
            if (minBudget && Number(t.budget) < Number(minBudget)) {
                return false;
            }
            // Search filter (title or description contains query)
            if (search) {
                const q = search.toLowerCase().trim();
                const titleMatch = (t.title || '').toLowerCase().includes(q);
                const descMatch = (t.description || '').toLowerCase().includes(q);
                if (!titleMatch && !descMatch) {
                    return false;
                }
            }
            return true;
        })
        .sort((a, b) => {
            if (sort === 'budget-high') {
                return Number(b.budget) - Number(a.budget);
            }
            if (sort === 'budget-low') {
                return Number(a.budget) - Number(b.budget);
            }
            if (sort === 'deadline') {
                return new Date(a.deadline) - new Date(b.deadline);
            }
            // Default newest
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const totalPages = Math.ceil(processedTasks.length / limit) || 1;
    const filtered = processedTasks.slice((page - 1) * limit, page * limit);

    const openTask = (task) => setActiveTask(task);
    const closeModal = () => {
        setActiveTask(null);
    };
    
    // callback fired by modal after a successful proposal submit
    const handleProposalSubmit = (taskId) => {
        setRawTasks(prev => prev.map(t =>
            t._id === taskId ? { ...t, proposals: (t.proposals || 0) + 1 } : t
        ));
    };

    const hasFilters = search || category !== 'All Categories' || minBudget || sort !== 'newest';

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'system-ui,-apple-system,sans-serif' }}>


            <style>{`
                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes shimmer { to { background-position: -200% 0; } }
                @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
                @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
                .browse-input {
                    padding: 11px 14px; border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.09);
                    background: rgba(255,255,255,0.03); color: #fff; outline: none;
                    font-size: 13.5px; transition: border 0.2s, box-shadow 0.2s, background 0.2s;
                    box-sizing: border-box; font-family: inherit; width: 100%;
                }
                .browse-input:focus {
                    border-color: rgba(255,77,0,0.6);
                    background: rgba(255,77,0,0.04);
                    box-shadow: 0 0 0 3px rgba(255,77,0,0.08);
                }
                .browse-input::placeholder { color: rgba(255,255,255,0.28); }
                .browse-input-search {
                    padding: 13px 14px 13px 44px;
                    font-size: 14.5px;
                    border-radius: 12px;
                }
                select.browse-input {
                    appearance: none; cursor: pointer;
                    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.35)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                    background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;
                }
                select.browse-input option { background: #1a0e06; color: #fff; }
                input[type='number'].browse-input::-webkit-inner-spin-button,
                input[type='number'].browse-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                .filter-label {
                    font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
                    text-transform: uppercase; color: rgba(255,255,255,0.32);
                    margin-bottom: 6px; display: block;
                }
                .filter-panel {
                    background: rgba(255,255,255,0.025);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 18px; padding: 20px;
                    margin-bottom: 28px;
                    display: flex; flex-direction: column; gap: 14px;
                }
                .filter-bottom-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 12px;
                    align-items: end;
                }
                @media (max-width: 640px) {
                    .filter-bottom-row { grid-template-columns: 1fr; }
                    .filter-panel { padding: 16px; gap: 12px; }
                }
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
                .jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 18px; }
                .browse-container {
                    position: relative;
                    z-index: 1;
                    max-width: 1160px;
                    margin: 0 auto;
                    padding: 110px 24px 80px;
                    box-sizing: border-box;
                }
                @media (max-width: 640px) {
                    .browse-container {
                        padding: 95px 16px 60px;
                    }
                }
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
                }
            `}</style>

            {/* Ambient glow */}
            <div style={{
                pointerEvents: 'none', position: 'fixed', top: 0, left: '50%',
                transform: 'translateX(-50%)', width: '80vw', height: '40vh', zIndex: 0,
                background: 'radial-gradient(ellipse at 50% 0%,rgba(255,77,0,0.055) 0%,transparent 70%)',
                filter: 'blur(40px)',
            }} />

            <div className="browse-container">

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
                <div className="filter-panel">
                    {/* Row 1: Search */}
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                            color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', display: 'flex',
                        }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </span>
                        <input
                            id="browse-search"
                            type="text"
                            placeholder="Search tasks by title, description, or skill…"
                            className="browse-input browse-input-search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Row 2: Category + Budget + Sort + Clear */}
                    <div className="filter-bottom-row">
                        <div>
                            <label className="filter-label" htmlFor="browse-category">Category</label>
                            <select
                                id="browse-category"
                                className="browse-input"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="filter-label" htmlFor="browse-budget">Min Budget ($)</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                    fontSize: 13, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
                                }}>$</span>
                                <input
                                    id="browse-budget"
                                    type="number"
                                    placeholder="0"
                                    className="browse-input"
                                    value={minBudget}
                                    onChange={e => setMinBudget(e.target.value)}
                                    style={{ paddingLeft: 24 }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <label className="filter-label" style={{ margin: 0 }} htmlFor="browse-sort">Sort By</label>
                                {hasFilters && (
                                    <button
                                        onClick={() => { setSearch(''); setCategory('All Categories'); setMinBudget(''); setSort('newest'); }}
                                        style={{
                                            background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.2)',
                                            color: '#ff6b30', fontSize: 10.5, fontWeight: 700, cursor: 'pointer',
                                            padding: '2px 9px', borderRadius: 6, letterSpacing: '0.06em',
                                            textTransform: 'uppercase', transition: 'background 0.15s',
                                        }}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <select
                                id="browse-sort"
                                className="browse-input"
                                value={sort}
                                onChange={e => setSort(e.target.value)}
                            >
                                <option value="newest">Latest Posted</option>
                                <option value="budget-high">Budget: High → Low</option>
                                <option value="budget-low">Budget: Low → High</option>
                                <option value="deadline">Soonest Deadline</option>
                            </select>
                        </div>
                    </div>
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
                        {filtered.map((task, index) => {
                            const theme = getTheme(task.category);
                            return (
                                <motion.div
                                    key={task._id}
                                    className="task-card"
                                    onClick={() => openTask(task)}
                                    style={{ position: 'relative' }}
                                    initial={{ opacity: 0, y: 28 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(255,77,0,0.12), 0 0 0 1px rgba(255,77,0,0.22)' }}
                                >
                                    {user && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleBookmark(task._id);
                                                toast(isBookmarked(task._id) ? '🔖 Bookmark removed' : '🔖 Task bookmarked!', {
                                                    duration: 2000,
                                                    style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,180,0,0.25)', fontSize: 12, borderRadius: 10 },
                                                });
                                            }}
                                            title={isBookmarked(task._id) ? 'Remove bookmark' : 'Bookmark this task'}
                                            style={{
                                                position: 'absolute', top: 12, right: 12, zIndex: 2,
                                                width: 28, height: 28, borderRadius: 8,
                                                border: isBookmarked(task._id) ? '1px solid rgba(255,160,0,0.45)' : '1px solid rgba(255,255,255,0.03)',
                                                background: isBookmarked(task._id) ? 'rgba(255,160,0,0.12)' : 'rgba(255,255,255,0.03)',
                                                color: isBookmarked(task._id) ? '#ffb300' : 'rgba(255,255,255,0.4)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24"
                                                fill={isBookmarked(task._id) ? 'currentColor' : 'none'}
                                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                            </svg>
                                        </button>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingRight: user ? 32 : 0 }}>
                                        <span style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: theme.textColor, background: theme.bg, border: `1px solid ${theme.border}`, padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            <CategoryIcon iconKey={theme.iconKey} color={theme.textColor} size={10} />
                                            {task.category}
                                        </span>
                                        {Number(task.budget) >= 500 && (
                                            <span style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)', padding: '2px 6px', borderRadius: 4, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                                <Flame width={9} height={9} style={{ color: '#22c55e' }} /> High Budget
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.35, margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {task.title}
                                    </h3>
                                    <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: '0 0 16px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {task.description}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', textTransform: 'uppercase' }}>Client:</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{task.clientName || 'Verified Client'}</span>
                                        <ClientRatingBadge
                                            clientId={task.clientId}
                                            clientEmail={task.clientEmail}
                                            clientName={task.clientName}
                                            size="sm"
                                        />
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
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* ── Pagination controls ── */}
                {!loading && !error && totalPages > 1 && (
                    <div style={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40,
                        position: 'relative', zIndex: 1
                    }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            style={{
                                padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                                background: page === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                                color: page === 1 ? 'rgba(255,255,255,0.2)' : '#fff',
                                fontSize: 13, fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            &larr; Prev
                        </button>

                        {Array.from({ length: totalPages }).map((_, idx) => {
                            const pNum = idx + 1;
                            const isCurrent = page === pNum;
                            return (
                                <button
                                    key={pNum}
                                    onClick={() => setPage(pNum)}
                                    style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        border: isCurrent ? '1px solid #ff4d00' : '1px solid rgba(255,255,255,0.08)',
                                        background: isCurrent ? 'rgba(255,77,0,0.12)' : 'rgba(255,255,255,0.04)',
                                        color: isCurrent ? '#ff4d00' : 'rgba(255,255,255,0.6)',
                                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {pNum}
                                </button>
                            );
                        })}

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                            style={{
                                padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                                background: page === totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                                color: page === totalPages ? 'rgba(255,255,255,0.2)' : '#fff',
                                fontSize: 13, fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            Next &rarr;
                        </button>
                    </div>
                )}
            </div>

            {/* ── Task Detail Modal ── */}
            {activeTask && (
                <TaskDetailModal
                    task={activeTask}
                    onClose={closeModal}
                    onProposalSubmit={handleProposalSubmit}
                />
            )}
        </div>
    );
}

