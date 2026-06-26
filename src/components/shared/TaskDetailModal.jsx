'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { submitProposal } from '@/lib/api/client/submitProposal';
import { getMyProposals } from '@/lib/api/freelancer/getMyProposals';
import toast from 'react-hot-toast';
import { useBookmarks } from '@/contexts/BookmarkContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt   = (n) => `$${Number(n).toLocaleString()}`;
const fmtDt = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const daysLeft = (iso) => {
    const d = Math.ceil((new Date(iso) - new Date()) / 864e5);
    return d > 0 ? `${d}d left` : 'Expired';
};

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
    // Mapped aliases from home page TaskCard
    'UI Design':             { textColor: '#ff9a50', bg: 'rgba(255,100,0,0.08)',   border: 'rgba(255,100,0,0.22)',   icon: '🎨' },
    'Development':           { textColor: '#50d4ff', bg: 'rgba(0,170,255,0.08)',   border: 'rgba(0,170,255,0.22)',   icon: '⚡' },
    'Copywriting':           { textColor: '#a78bfa', bg: 'rgba(120,80,255,0.08)', border: 'rgba(120,80,255,0.22)', icon: '✍️' },
    'Marketing':             { textColor: '#34d399', bg: 'rgba(0,200,120,0.08)',  border: 'rgba(0,200,120,0.22)',  icon: '📈' },
    'Video':                 { textColor: '#fb7185', bg: 'rgba(240,50,80,0.08)',  border: 'rgba(240,50,80,0.22)',  icon: '🎬' },
};

function getTheme(cat) {
    return CATEGORY_THEMES[cat] || { textColor: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', icon: '💼' };
}

// ─── Inline label component ───────────────────────────────────────────────────
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

// ─── Main Modal Component ─────────────────────────────────────────────────────
/**
 * TaskDetailModal — shared modal for browsing task details and submitting proposals.
 *
 * Props:
 *   task        — the task object (must have _id, title, category, budget, deadline, description, clientName, proposals)
 *   onClose     — called when the modal is dismissed
 *   onProposalSubmit — optional callback after a successful submission (receives updated task)
 */
export default function TaskDetailModal({ task, onClose, onProposalSubmit }) {
    const { data: session } = useSession();
    const user = session?.user;
    const { toggleBookmark, isBookmarked } = useBookmarks();

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [checkingProposals, setCheckingProposals] = useState(false);
    const formRef = useRef(null);

    // ── Check if this freelancer already applied ──────────────────────────────
    useEffect(() => {
        if (!session?.session?.token || user?.role !== 'freelancer' || !task?._id) return;
        setCheckingProposals(true);
        getMyProposals(session.session.token)
            .then(proposals => {
                const applied = (proposals || []).some(p => p.taskId === task._id);
                setAlreadyApplied(applied);
            })
            .catch(() => {})
            .finally(() => setCheckingProposals(false));
    }, [session, user, task?._id]);

    // ── Close on Escape ───────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    // ── Submit proposal ───────────────────────────────────────────────────────
    const handleProposalSubmit = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('You must be logged in to apply.'); return; }

        const fd = new FormData(formRef.current);
        const budget = Number(fd.get('proposedBudget'));
        const days   = Number(fd.get('estimatedDays'));
        const note   = (fd.get('coverNote') || '').trim();

        if (budget <= 0)      { toast.error('Enter a valid budget.'); return; }
        if (days <= 0)        { toast.error('Enter estimated days.'); return; }
        if (note.length < 20) { toast.error('Cover note must be at least 20 characters.'); return; }

        setSubmitting(true);
        try {
            await submitProposal(fd, { userId: user.id, taskTitle: task.title });
            setSubmitted(true);
            setAlreadyApplied(true);
            toast.success('🎉 Proposal submitted!');
            if (onProposalSubmit) onProposalSubmit(task._id);
        } catch (err) {
            toast.error(err.message || 'Submission failed. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!task) return null;

    const theme = getTheme(task.category);
    // Support both deadline (browse) and dueDate (home card) field names
    const deadline = task.deadline || task.dueDate;

    return (
        <>
            <style>{`
                @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
                @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
                @keyframes spin    { to { transform: rotate(360deg); } }
                .tdm-form-input {
                    padding: 10px 13px; border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.09);
                    background: rgba(255,255,255,0.04); color: #fff;
                    font-size: 13px; outline: none; width: 100%; box-sizing: border-box;
                    transition: border 0.18s, box-shadow 0.18s; font-family: inherit;
                }
                .tdm-form-input:focus { border-color: rgba(255,77,0,0.55); box-shadow: 0 0 0 3px rgba(255,77,0,0.07); }
                .tdm-form-input:disabled { opacity: 0.45; cursor: not-allowed; }
                .tdm-form-input.readonly { background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.4); cursor: default; }
                .tdm-submit-btn {
                    width: 100%; padding: 12px; border-radius: 11px; border: none;
                    background: linear-gradient(135deg,#ff4d00,#cc3d00);
                    color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    box-shadow: 0 4px 20px rgba(255,77,0,0.25); transition: opacity 0.2s, transform 0.15s;
                }
                .tdm-submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(255,77,0,0.35); }
                .tdm-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                @media(max-width:900px) {
                    .tdm-inner { flex-direction: column !important; }
                    .tdm-right { border-left: none !important; border-top: 1px solid rgba(255,255,255,0.07) !important; width: auto !important; }
                }
            `}</style>

            {/* Backdrop */}
            <div
                onClick={onClose}
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
                {/* Modal box */}
                <div
                    onClick={e => e.stopPropagation()}
                    className="tdm-inner"
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
                    {/* ── LEFT: Task Details ── */}
                    <div style={{
                        flex: 1, minWidth: 0,
                        padding: '32px 28px',
                        overflowY: 'auto',
                        borderRight: '1px solid rgba(255,255,255,0.07)',
                        display: 'flex', flexDirection: 'column', gap: 0,
                    }}>
                        {/* Category + proposal count row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                                <span style={{
                                    fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace',
                                    color: theme.textColor, background: theme.bg, border: `1px solid ${theme.border}`,
                                    padding: '3px 9px', borderRadius: 6,
                                }}>
                                    {theme.icon} {task.category}
                                </span>
                                <span style={{
                                    fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace',
                                    color: 'rgba(255,255,255,0.28)', background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.07)', padding: '3px 9px', borderRadius: 6,
                                }}>
                                    {task.proposals ?? 0} PROPOSALS
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {/* Bookmark button */}
                                {user && (
                                    <button
                                        id={`bookmark-btn-${task._id}`}
                                        type="button"
                                        onClick={() => {
                                            toggleBookmark(task._id);
                                            toast(isBookmarked(task._id) ? '🔖 Bookmark removed' : '🔖 Task bookmarked!', {
                                                duration: 2000,
                                                style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,180,0,0.25)', fontSize: 12, borderRadius: 10 }
                                            });
                                        }}
                                        title={isBookmarked(task._id) ? 'Remove bookmark' : 'Bookmark this task'}
                                        style={{
                                            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                            border: isBookmarked(task._id)
                                                ? '1px solid rgba(255,160,0,0.45)'
                                                : '1px solid rgba(255,255,255,0.08)',
                                            background: isBookmarked(task._id)
                                                ? 'rgba(255,160,0,0.12)'
                                                : 'rgba(255,255,255,0.03)',
                                            color: isBookmarked(task._id) ? '#ffb300' : 'rgba(255,255,255,0.4)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', transition: 'all 0.18s',
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24"
                                            fill={isBookmarked(task._id) ? 'currentColor' : 'none'}
                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                        </svg>
                                    </button>
                                )}

                                {/* Close button */}
                                <button onClick={onClose} style={{
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
                        </div>

                        {/* Title */}
                        <h2 style={{ fontSize: 'clamp(1.1rem,2.5vw,1.55rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.25, margin: '0 0 22px' }}>
                            {task.title}
                        </h2>

                        {/* Stats grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 22 }}>
                            {[
                                { label: 'Client Budget', value: fmt(task.budget), color: '#ff4d00', mono: true },
                                { label: 'Deadline',      value: deadline ? fmtDt(deadline) : '—', color: '#fff' },
                                { label: 'Time Left',     value: deadline ? daysLeft(deadline) : '—', color: 'rgba(255,255,255,0.7)' },
                                { label: 'Posted By',     value: task.clientName || 'Verified Client', color: 'rgba(255,255,255,0.7)' },
                            ].map(({ label, value, color, mono }) => (
                                <div key={label} style={{ padding: '12px 14px', borderRadius: 11, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>{label}</div>
                                    <div style={{ fontSize: mono ? 17 : 13, fontWeight: 700, color, fontFamily: mono ? "'JetBrains Mono',monospace" : 'inherit' }}>{value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
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
                                {task.description || 'No description provided.'}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Proposal Form ── */}
                    <div
                        className="tdm-right"
                        style={{
                            width: 360, flexShrink: 0,
                            padding: '32px 26px',
                            overflowY: 'auto',
                            display: 'flex', flexDirection: 'column',
                            background: 'rgba(255,77,0,0.012)',
                        }}
                    >
                        {submitted ? (
                            /* ── Success ── */
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16, animation: 'fadeUp 0.4s ease' }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: '50%',
                                    background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Proposal Sent!</h3>
                                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', margin: '0 0 20px' }}>
                                        Your proposal is now <span style={{ color: '#f59e0b', fontWeight: 700 }}>pending</span> review.
                                    </p>
                                </div>
                                <button onClick={onClose} style={{
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
                                        <rect x="5" y="11" width="14" height="11" rx="2" stroke="#ff4d00" strokeWidth="1.8" />
                                        <path d="M8 11V7a4 4 0 018 0v4" stroke="#ff4d00" strokeWidth="1.8" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Login to Apply</h3>
                                    <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)', margin: '0 0 18px', lineHeight: 1.55 }}>
                                        Sign in with your freelancer account to submit a proposal.
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
                            /* ── Non-freelancer ── */
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14 }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: '50%',
                                    background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ff4d00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 9v4M12 17h.01" stroke="#ff4d00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Freelancer Account Required</h3>
                                    <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.55 }}>
                                        Only registered freelancers can submit proposals for tasks.
                                    </p>
                                </div>
                            </div>

                        ) : checkingProposals ? (
                            /* ── Loading proposal check ── */
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.12)', borderTopColor: '#ff4d00', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                            </div>

                        ) : alreadyApplied ? (
                            /* ── Already applied ── */
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14 }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: '50%',
                                    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M22 4L12 14.01l-3-3" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Already Applied</h3>
                                    <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)', lineHeight: 1.55, margin: 0 }}>
                                        You have already submitted a proposal for this task.
                                    </p>
                                </div>
                            </div>

                        ) : (
                            /* ── Proposal Form ── */
                            <>
                                {/* Form header */}
                                <div style={{ marginBottom: 22 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 20h9" stroke="#ff4d00" strokeWidth="1.8" strokeLinecap="round" />
                                                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#ff4d00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1 }}>Submit Proposal</div>
                                            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Fill all fields carefully</div>
                                        </div>
                                    </div>
                                    <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(255,77,0,0.22),transparent)', marginTop: 14 }} />
                                </div>

                                <form ref={formRef} onSubmit={handleProposalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* Hidden task ID */}
                                    <input type="hidden" name="taskId" value={task._id} />

                                    {/* Freelancer email — readonly */}
                                    <Field label="Your Email" icon="📧">
                                        <input
                                            type="email"
                                            name="freelancerEmail"
                                            defaultValue={user.email}
                                            readOnly
                                            className="tdm-form-input readonly"
                                        />
                                    </Field>

                                    {/* Task ID — visible readonly */}
                                    <Field label="Task ID" icon="🔖" hint="Auto-filled from selected task">
                                        <input
                                            type="text"
                                            name="taskIdDisplay"
                                            defaultValue={task._id}
                                            readOnly
                                            className="tdm-form-input readonly"
                                            style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.04em' }}
                                        />
                                    </Field>

                                    {/* Budget + Days in a grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <Field label="Proposed Budget" icon="💰">
                                            <div style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: 13, pointerEvents: 'none' }}>$</span>
                                                <input
                                                    type="number" name="proposedBudget" min="1" step="1"
                                                    placeholder="500"
                                                    className="tdm-form-input"
                                                    style={{ paddingLeft: 22 }}
                                                    disabled={submitting}
                                                />
                                            </div>
                                        </Field>
                                        <Field label="Est. Days" icon="📅">
                                            <input
                                                type="number" name="estimatedDays" min="1" step="1"
                                                placeholder="7"
                                                className="tdm-form-input"
                                                disabled={submitting}
                                            />
                                        </Field>
                                    </div>

                                    {/* Cover note */}
                                    <Field label="Cover Note" icon="📝" hint="Min. 20 characters">
                                        <textarea
                                            name="coverNote" rows={5}
                                            placeholder="Describe your approach and why you're the best fit for this task…"
                                            className="tdm-form-input"
                                            style={{ resize: 'vertical', lineHeight: 1.6, minHeight: 100 }}
                                            disabled={submitting}
                                        />
                                    </Field>

                                    {/* Submit */}
                                    <button type="submit" className="tdm-submit-btn" disabled={submitting}>
                                        {submitting ? (
                                            <>
                                                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                                                Submitting…
                                            </>
                                        ) : (
                                            <>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Send Proposal
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
