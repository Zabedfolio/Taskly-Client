'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Briefcase, Pencil, TrashBin, Ellipsis, Eye, Xmark } from '@gravity-ui/icons';
import toast, { Toaster } from 'react-hot-toast';
import { getTasksById } from '@/lib/api/client/getTasksById';
import { deleteTask }    from '@/lib/api/client/deleteTask';
import { updateTask }    from '@/lib/api/client/updateTask';
import FreelancerRatingModal from '@/components/shared/FreelancerRatingModal';
import { fetchMyFreelancerRatings } from '@/lib/api/client/rateFreelancer';
import { getFreelancerRatingsMapByTaskId, mergeRatingsMaps, normalizeId } from '@/lib/freelancerRatings';

const CATEGORIES = [
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

// ─── Status tabs ──────────────────────────────────────────────────────────────
const STATUS_TABS = [
    { key: 'all',         label: 'All'         },
    { key: 'open',        label: 'Open'        },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed',   label: 'Completed'   },
    { key: 'cancelled',   label: 'Cancelled'   },
];

const STATUS_CONFIG = {
    open:        { label: 'Open',        color: '#22c55e',               bg: 'rgba(34,197,94,0.08)',    border: 'rgba(34,197,94,0.22)'  },
    in_progress: { label: 'In Progress', color: '#ff8040',               bg: 'rgba(255,128,64,0.08)',   border: 'rgba(255,128,64,0.22)' },
    completed:   { label: 'Completed',   color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)' },
    cancelled:   { label: 'Cancelled',   color: '#ef4444',               bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.2)'   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate   = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatBudget = (n)   => `$${Number(n).toLocaleString()}`;
const deadlineSoon = (iso) => { const d = new Date(iso) - new Date(); return d > 0 && d < 864e5 * 2; };

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
    const s = {
        background: 'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
        borderRadius: 6, display: 'inline-block',
    };
    return (
        <tr>
            <td><div style={{ ...s, height: 14, width: 180 }} /></td>
            <td className="col-desc"><div style={{ ...s, height: 12, width: 110 }} /></td>
            <td><div style={{ ...s, height: 14, width: 60 }} /></td>
            <td><div style={{ ...s, height: 12, width: 90 }} /></td>
            <td><div style={{ ...s, height: 20, width: 80, borderRadius: 99 }} /></td>
            <td><div style={{ ...s, height: 12, width: 30 }} /></td>
            <td className="col-client"><div style={{ ...s, height: 12, width: 80 }} /></td>
            <td />
        </tr>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace',
            color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
            {cfg.label}
        </span>
    );
}

// ─── Status filter tabs ───────────────────────────────────────────────────────
function StatusTabs({ active, onChange, counts }) {
    return (
        <div style={{
            display: 'flex', gap: 4, flexWrap: 'wrap',
            padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.01)',
        }}>
            {STATUS_TABS.map(({ key, label }) => {
                const isActive = active === key;
                return (
                    <button key={key} onClick={() => onChange(key)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '5px 12px', borderRadius: 8, border: 'none',
                        background: isActive ? 'rgba(255,77,0,0.12)' : 'transparent',
                        color: isActive ? '#ff4d00' : 'rgba(255,255,255,0.4)',
                        fontSize: 12, fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer', transition: 'all 0.15s',
                        fontFamily: 'system-ui, sans-serif',
                        outline: isActive ? '1px solid rgba(255,77,0,0.3)' : '1px solid transparent',
                    }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                    >
                        {label}
                        <span style={{
                            fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace',
                            padding: '1px 5px', borderRadius: 99, minWidth: 18, textAlign: 'center',
                            background: isActive ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.07)',
                            color: isActive ? '#ff6a2a' : 'rgba(255,255,255,0.35)',
                        }}>
                            {counts[key] ?? 0}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// ─── 3-dot action menu ────────────────────────────────────────────────────────
function ActionMenu({ taskId, onAction, onDelete, isLast }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative', zIndex: open ? 50 : 1 }}>
            <button onClick={() => setOpen(v => !v)} aria-label="Task actions" style={{
                width: 32, height: 32, borderRadius: 8, cursor: 'pointer', flexShrink: 0,
                border: `1px solid ${open ? 'rgba(255,77,0,0.35)' : 'rgba(255,255,255,0.08)'}`,
                background: open ? 'rgba(255,77,0,0.08)' : 'rgba(255,255,255,0.03)',
                color: open ? '#ff4d00' : 'rgba(255,255,255,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
            }}
                onMouseEnter={e => { if (!open) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; } }}
                onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
            >
                <Ellipsis width={15} height={15} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', right: 0, zIndex: 100,
                    background: '#141414', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '4px', minWidth: 148,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    ...(isLast ? { bottom: 36 } : { top: 36 }),
                }}>
                    <MenuItem icon={<Eye width={13} height={13} />} label="View details"
                        onClick={() => { setOpen(false); onAction('view', taskId); }} color="rgba(255,255,255,0.7)" />
                    <MenuItem icon={<Pencil width={13} height={13} />} label="Edit task"
                        onClick={() => { setOpen(false); onAction('edit', taskId); }} color="rgba(255,255,255,0.7)" />
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '3px 4px' }} />
                    <MenuItem icon={<TrashBin width={13} height={13} />} label="Delete task"
                        onClick={() => { setOpen(false); onDelete(taskId); }} color="#ef4444" danger />
                </div>
            )}
        </div>
    );
}

function MenuItem({ icon, label, onClick, color, danger }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button onClick={onClick}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 10px', borderRadius: 7, border: 'none',
                background: hovered ? (danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)') : 'transparent',
                color: hovered ? (danger ? '#ef4444' : '#fff') : color,
                fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif', transition: 'all 0.12s', textAlign: 'left',
            }}>
            {icon}{label}
        </button>
    );
}

// ─── Delete modal ─────────────────────────────────────────────────────────────
function DeleteModal({ taskTitle, onConfirm, onCancel, isDeleting }) {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={!isDeleting ? onCancel : undefined}>
            <div onClick={e => e.stopPropagation()} style={{
                background: '#111', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '28px 28px 24px', maxWidth: 400, width: '100%',
            }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrashBin width={20} height={20} style={{ color: '#ef4444' }} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Delete task?</h3>
                <p style={{ margin: '0 0 22px', fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>"{taskTitle}"</span> will be permanently removed. This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onCancel} disabled={isDeleting} style={{
                        flex: 1, padding: '9px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)',
                        fontSize: 13, fontWeight: 600, cursor: isDeleting ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', opacity: isDeleting ? 0.5 : 1,
                    }}>Cancel</button>
                    <button onClick={onConfirm} disabled={isDeleting} style={{
                        flex: 1, padding: '9px 16px', borderRadius: 9, border: 'none',
                        background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700,
                        cursor: isDeleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                        opacity: isDeleting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                        {isDeleting
                            ? <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />Deleting…</>
                            : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── View modal ──────────────────────────────────────────────────────────────
function ViewModal({ task, onCancel }) {
    if (!task) return null;
    const soon = deadlineSoon(task.deadline);
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={onCancel}>
            <div onClick={e => e.stopPropagation()} style={{
                background: '#111', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '28px', maxWidth: 600, width: '100%',
                maxHeight: '85vh', overflowY: 'auto',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '90%' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.12em', color: '#ff4d00', background: 'rgba(255,77,0,0.08)', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,77,0,0.22)' }}>
                                {task.category}
                            </span>
                            <StatusBadge status={task.status} />
                        </div>
                        <h2 style={{ margin: '6px 0 0 0', fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                            {task.title}
                        </h2>
                    </div>
                    <button onClick={onCancel} style={{
                        width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                    >
                        <Xmark width={15} height={15} />
                    </button>
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 20 }} />

                {/* Info row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Budget</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#ff4d00', fontFamily: 'monospace' }}>{formatBudget(task.budget)}</div>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Deadline</div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: soon ? '#fbbf24' : '#fff', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 5 }}>
                            {soon && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} />}
                            {formatDate(task.deadline)}
                        </div>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Proposals</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{task.proposals ?? 0}</div>
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Posted On</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{formatDate(task.createdAt)}</div>
                    </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Task Description</div>
                    <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 220, overflowY: 'auto' }}>
                        {task.description}
                    </div>
                </div>

                {/* Footer action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={onCancel} style={{
                        padding: '9px 20px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}>Close</button>
                </div>
            </div>
        </div>
    );
}

// ─── Edit modal ──────────────────────────────────────────────────────────────
function EditModal({ task, onConfirm, onCancel, isSaving }) {
    const [focusedField, setFocusedField] = useState(null);
    const [formData, setFormData] = useState({
        title: task.title || '',
        category: task.category || '',
        description: task.description || '',
        budget: task.budget || '',
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        status: task.status || 'open',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFocus = (fieldName) => setFocusedField(fieldName);
    const handleBlur = () => setFocusedField(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        // ── Validation ──
        if (!formData.title.trim() || formData.title.length < 5) {
            toast.error('Task title must be at least 5 characters.');
            return;
        }
        if (!formData.category) {
            toast.error('Please select a category.');
            return;
        }
        if (!formData.description.trim() || formData.description.length < 20) {
            toast.error('Description must be at least 20 characters.');
            return;
        }
        if (!formData.budget || Number(formData.budget) <= 0) {
            toast.error('Enter a valid budget greater than $0.');
            return;
        }
        if (!formData.deadline) {
            toast.error('Please set a deadline.');
            return;
        }
        if (new Date(formData.deadline) <= new Date() && formData.deadline !== task.deadline.split('T')[0]) {
            toast.error('Deadline must be a future date.');
            return;
        }

        onConfirm(task._id, {
            ...formData,
            budget: Number(formData.budget),
        });
    };

    const todayISO = new Date().toISOString().split('T')[0];

    const inputStyleFactory = (name) => {
        const isFocused = focusedField === name;
        return {
            width: '100%',
            padding: '10px 13px',
            borderRadius: 9,
            border: `1px solid ${isFocused ? '#ff4d00' : 'rgba(255,255,255,0.09)'}`,
            backgroundColor: isFocused ? 'rgba(255,77,0,0.05)' : 'rgba(255,255,255,0.04)',
            color: '#fff',
            fontSize: 13.5,
            outline: 'none',
            transition: 'all 0.2s',
            boxShadow: isFocused ? '0 0 0 3px rgba(255,77,0,0.10)' : 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
        };
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={!isSaving ? onCancel : undefined}>
            <div onClick={e => e.stopPropagation()} style={{
                background: '#111', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '28px', maxWidth: 600, width: '100%',
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Pencil width={16} height={16} style={{ color: '#ff4d00' }} />
                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                            Edit Task
                        </h2>
                    </div>
                    <button onClick={onCancel} disabled={isSaving} style={{
                        width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isSaving ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                        opacity: isSaving ? 0.5 : 1,
                    }}
                        onMouseEnter={e => { if (!isSaving) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = '#fff'; } }}
                        onMouseLeave={e => { if (!isSaving) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
                    >
                        <Xmark width={14} height={14} />
                    </button>
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 20 }} />

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>Task Title *</label>
                        <input
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            onFocus={() => handleFocus('title')}
                            onBlur={handleBlur}
                            style={inputStyleFactory('title')}
                            required
                            disabled={isSaving}
                        />
                    </div>

                    {/* Category & Status */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                onFocus={() => handleFocus('category')}
                                onBlur={handleBlur}
                                style={{
                                    ...inputStyleFactory('category'),
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba%28255,255,255,0.35%29' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                    paddingRight: 32,
                                    cursor: 'pointer',
                                }}
                                required
                                disabled={isSaving}
                            >
                                <option value="">Select category…</option>
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>Status *</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                onFocus={() => handleFocus('status')}
                                onBlur={handleBlur}
                                style={{
                                    ...inputStyleFactory('status'),
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba%28255,255,255,0.35%29' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                    paddingRight: 32,
                                    cursor: 'pointer',
                                }}
                                required
                                disabled={isSaving}
                            >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            onFocus={() => handleFocus('description')}
                            onBlur={handleBlur}
                            rows={4}
                            style={{
                                ...inputStyleFactory('description'),
                                resize: 'vertical',
                                minHeight: 90,
                                lineHeight: 1.6,
                            }}
                            required
                            disabled={isSaving}
                        />
                    </div>

                    {/* Budget & Deadline */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>Budget (USD) *</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13.5, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', userSelect: 'none' }}>$</span>
                                <input
                                    name="budget"
                                    type="number"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    onFocus={() => handleFocus('budget')}
                                    onBlur={handleBlur}
                                    style={{ ...inputStyleFactory('budget'), paddingLeft: 24 }}
                                    required
                                    min="1"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>Deadline *</label>
                            <input
                                name="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={handleChange}
                                onFocus={() => handleFocus('deadline')}
                                onBlur={handleBlur}
                                style={inputStyleFactory('deadline')}
                                required
                                min={todayISO}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <button type="button" onClick={onCancel} disabled={isSaving} style={{
                            flex: 1, padding: '10px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)',
                            fontSize: 13, fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', opacity: isSaving ? 0.5 : 1,
                        }}>Cancel</button>
                        <button type="submit" disabled={isSaving} style={{
                            flex: 1, padding: '10px 16px', borderRadius: 9, border: 'none',
                            background: 'linear-gradient(135deg,#ff4d00,#cc3d00)', color: '#fff',
                            fontSize: 13, fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', opacity: isSaving ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: isSaving ? 'none' : '0 0 16px rgba(255,77,0,0.22)',
                        }}>
                            {isSaving
                                ? <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />Saving…</>
                                : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ filtered }) {
    return (
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px', background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase width={22} height={22} style={{ color: '#ff4d00' }} />
            </div>
            {filtered ? (
                <>
                    <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#fff' }}>No tasks with this status</p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Try a different filter above.</p>
                </>
            ) : (
                <>
                    <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#fff' }}>No tasks yet</p>
                    <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Post your first task and start receiving proposals.</p>
                    <Link href="/dashboard/client/post-task" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#ff4d00,#cc3d00)', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                        <Plus width={14} height={14} /> Post a task
                    </Link>
                </>
            )}
        </div>
    );
}

// ─── Error state ──────────────────────────────────────────────────────────────
function ErrorState({ onRetry }) {
    return (
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#fff' }}>Failed to load tasks</p>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Something went wrong. Please try again.</p>
            <button onClick={onRetry} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,77,0,0.35)', background: 'rgba(255,77,0,0.08)', color: '#ff4d00', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Retry</button>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MyTasksPage() {
    const { data: session }               = useSession();
    const [allTasks, setAllTasks]         = useState([]);   // full list from API
    const [activeStatus, setActiveStatus] = useState('all');
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting]     = useState(false);
    const [viewTarget, setViewTarget]     = useState(null);
    const [editTarget, setEditTarget]     = useState(null);
    const [isSaving, setIsSaving]         = useState(false);
    const [ratingTask, setRatingTask]     = useState(null);
    const [ratingsByTask, setRatingsByTask] = useState({});
    const router = useRouter();

    useEffect(() => {
        async function loadRatings() {
            const localMap = getFreelancerRatingsMapByTaskId();
            const email = session?.user?.email;
            if (!email) {
                setRatingsByTask(localMap);
                return;
            }

            try {
                const apiRatings = await fetchMyFreelancerRatings(email);
                const apiMap = {};
                apiRatings.forEach(r => {
                    const tid = normalizeId(r.taskId);
                    if (tid) {
                        apiMap[tid] = { stars: r.stars, review: r.review };
                    }
                });
                setRatingsByTask(mergeRatingsMaps(localMap, apiMap));
            } catch {
                setRatingsByTask(localMap);
            }
        }

        loadRatings();
    }, [session?.user?.email]);

    // ── Load this client's tasks once session is ready ────────────────────────
    const loadTasks = useCallback(async () => {
        if (!session?.user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getTasksById(session.user.id);
            console.log (data)
            setAllTasks(Array.isArray(data) ? data : (data.tasks ?? []));
        } catch (err) {
            setError(err.message);
            toast.error('Could not load tasks.');
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id]);

    useEffect(() => { loadTasks(); }, [loadTasks]);

    // ── Client-side status filter ─────────────────────────────────────────────
    const visibleTasks = activeStatus === 'all'
        ? allTasks
        : allTasks.filter(t => t.status === activeStatus);

    // ── Tab counts ────────────────────────────────────────────────────────────
    const counts = {
        all:         allTasks.length,
        open:        allTasks.filter(t => t.status === 'open').length,
        in_progress: allTasks.filter(t => t.status === 'in_progress').length,
        completed:   allTasks.filter(t => t.status === 'completed').length,
        cancelled:   allTasks.filter(t => t.status === 'cancelled').length,
    };

    // ── Stats (always from full list) ─────────────────────────────────────────
    const totalBudget    = allTasks.reduce((s, t) => s + (t.budget    ?? 0), 0);
    const totalProposals = allTasks.reduce((s, t) => s + (t.proposals ?? 0), 0);

    // ── Navigation ────────────────────────────────────────────────────────────
    function handleAction(type, id) {
        const task = allTasks.find(t => t._id === id);
        if (type === 'view') setViewTarget(task);
        if (type === 'edit') setEditTarget(task);
    }

    // ── Edit Confirm ──────────────────────────────────────────────────────────
    async function handleEditConfirm(id, updatedData) {
        setIsSaving(true);
        try {
            const res = await updateTask(id, updatedData);
            if (res?.error || res?.success === false) throw new Error(res.error ?? 'Update failed');
            setAllTasks(prev => prev.map(t => t._id === id ? { ...t, ...updatedData } : t));
            toast.success('Task updated successfully.');
            setEditTarget(null);
        } catch (err) {
            toast.error(err.message || 'Failed to update task.');
        } finally {
            setIsSaving(false);
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    function handleDeleteRequest(id) {
        const task = allTasks.find(t => t._id === id);
        setDeleteTarget({ id, title: task?.title });
    }

    async function handleDeleteConfirm() {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await deleteTask(deleteTarget.id);
            if (res?.error || res?.success === false) throw new Error(res.error ?? 'Delete failed');
            setAllTasks(prev => prev.filter(t => t._id !== deleteTarget.id));
            toast.success('Task deleted.');
            setDeleteTarget(null);
        } catch (err) {
            toast.error(err.message || 'Failed to delete task.');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <Toaster position="top-center" toastOptions={{
                style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, borderRadius: 10 },
                success: { iconTheme: { primary: '#22c55e', secondary: '#1a1a1a' } },
                error:   { iconTheme: { primary: '#ff4d00', secondary: '#1a1a1a' } },
            }} />

            {deleteTarget && (
                <DeleteModal
                    taskTitle={deleteTarget.title}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => !isDeleting && setDeleteTarget(null)}
                    isDeleting={isDeleting}
                />
            )}

            {viewTarget && (
                <ViewModal
                    task={viewTarget}
                    onCancel={() => setViewTarget(null)}
                />
            )}

            {editTarget && (
                <EditModal
                    task={editTarget}
                    onConfirm={handleEditConfirm}
                    onCancel={() => !isSaving && setEditTarget(null)}
                    isSaving={isSaving}
                />
            )}

            <style>{`
                @keyframes shimmer { to { background-position: -200% 0; } }
                @keyframes spin    { to { transform: rotate(360deg); } }
                .tasks-table { width: 100%; border-collapse: collapse; }
                .tasks-table th {
                    padding: 10px 16px; text-align: left; font-size: 10px; font-weight: 700;
                    letter-spacing: 0.13em; text-transform: uppercase; font-family: monospace;
                    color: rgba(255,255,255,0.3); border-bottom: 1px solid rgba(255,255,255,0.07);
                    white-space: nowrap; background: rgba(255,255,255,0.015);
                }
                .tasks-table td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
                .task-row { transition: background 0.15s; }
                .task-row:hover { background: rgba(255,255,255,0.02); }
                .task-row:last-child td { border-bottom: none; }
                @media (max-width: 767px) {
                    .tasks-table thead { display: none; }
                    .tasks-table, .tasks-table tbody, .tasks-table tr, .tasks-table td { display: block; width: 100%; }
                    .tasks-table tr { border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; margin-bottom: 10px; padding: 14px 16px; background: rgba(255,255,255,0.02); position: relative; }
                    .tasks-table tr:hover { background: rgba(255,255,255,0.035); }
                    .tasks-table td { padding: 4px 0; border: none; display: flex; align-items: flex-start; gap: 8px; }
                    .tasks-table td::before { content: attr(data-label); flex-shrink: 0; width: 90px; font-size: 9.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; font-family: monospace; color: rgba(255,255,255,0.25); padding-top: 1px; }
                    .td-title::before { content: none !important; }
                    .td-title { margin-bottom: 8px; }
                    .td-actions { position: absolute !important; top: 14px; right: 14px; width: auto !important; padding: 0 !important; }
                    .td-actions::before { content: none !important; }
                }
                @media (min-width: 768px) and (max-width: 1023px) { .col-desc, .col-client { display: none; } }
            `}</style>

            <div style={{ padding: '32px 24px 60px', maxWidth: 1100, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '3px 10px', borderRadius: 99, marginBottom: 12, background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.2)' }}>
                            <Briefcase width={11} height={11} style={{ color: '#ff4d00' }} />
                            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#ff4d00', letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'monospace' }}>My Tasks</span>
                        </div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 6px' }}>Task Manager</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                            {loading ? 'Loading…' : `${allTasks.length} task${allTasks.length !== 1 ? 's' : ''} posted`}
                        </p>
                    </div>
                    <Link href="/dashboard/client/post-task" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 11, border: 'none',
                        background: 'linear-gradient(135deg,#ff4d00 0%,#cc3d00 100%)', boxShadow: '0 0 18px rgba(255,77,0,0.25)',
                        color: '#fff', fontSize: 13.5, fontWeight: 700, textDecoration: 'none', flexShrink: 0, transition: 'all 0.18s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(255,77,0,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(255,77,0,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <Plus width={15} height={15} /> Post a Task
                    </Link>
                </div>

                {/* ── Stats ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
                    {[
                        { label: 'Total Budget',    value: loading ? '—' : formatBudget(totalBudget), accent: false },
                        { label: 'Open Tasks',      value: loading ? '—' : counts.open,               accent: true  },
                        { label: 'Total Proposals', value: loading ? '—' : totalProposals,            accent: false },
                    ].map(({ label, value, accent }) => (
                        <div key={label} style={{ padding: '14px 18px', borderRadius: 12, background: accent ? 'rgba(255,77,0,0.06)' : 'rgba(255,255,255,0.025)', border: `1px solid ${accent ? 'rgba(255,77,0,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace', color: accent ? 'rgba(255,77,0,0.7)' : 'rgba(255,255,255,0.3)', marginBottom: 5 }}>{label}</div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: accent ? '#ff4d00' : '#fff', letterSpacing: '-0.03em' }}>{value}</div>
                        </div>
                    ))}
                </div>

                {/* ── Table card ── */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                    <StatusTabs active={activeStatus} onChange={setActiveStatus} counts={counts} />

                    {error ? <ErrorState onRetry={loadTasks} /> : (
                        <div style={{ overflowX: 'auto', minHeight: 220 }}>
                            <table className="tasks-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th className="col-desc">Category</th>
                                        <th>Budget</th>
                                        <th>Deadline</th>
                                        <th>Status</th>
                                        <th>Proposals</th>
                                        <th className="col-client">Posted</th>
                                        <th style={{ width: 52, textAlign: 'center' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                                    ) : visibleTasks.length === 0 ? (
                                        <tr><td colSpan={8} style={{ padding: 0 }}><EmptyState filtered={activeStatus !== 'all'} /></td></tr>
                                    ) : (
                                        visibleTasks.map((task, index) => {
                                            const soon = deadlineSoon(task.deadline);
                                            const isLast = index === visibleTasks.length - 1;
                                            return (
                                                <tr key={task._id} className="task-row">
                                                    <td className="td-title" data-label="Task">
                                                        <div>
                                                            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 3, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {task.title}
                                                            </div>
                                                            <div style={{ fontSize: 11, color: 'rgba(255,77,0,0.7)', fontFamily: 'monospace', letterSpacing: '0.06em' }}>{task.category}</div>
                                                        </div>
                                                    </td>
                                                    <td className="col-desc" data-label="Category" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{task.category}</td>
                                                    <td data-label="Budget">
                                                        <span style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', fontFamily: 'monospace' }}>{formatBudget(task.budget)}</span>
                                                    </td>
                                                    <td data-label="Deadline">
                                                        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: soon ? '#fbbf24' : 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            {soon && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fbbf24', display: 'inline-block', flexShrink: 0 }} />}
                                                            {formatDate(task.deadline)}
                                                        </span>
                                                    </td>
                                                    <td data-label="Status">
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                                                            <StatusBadge status={task.status} />
                                                            {task.status?.toLowerCase() === 'completed' && task.freelancerEmail && (
                                                                <>
                                                                    {ratingsByTask[normalizeId(task._id)] ? (
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#ff8040' }}>
                                                                            <span>⭐ {ratingsByTask[normalizeId(task._id)].stars} Rated</span>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => setRatingTask(task)}
                                                                            style={{
                                                                                padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,128,0,0.3)',
                                                                                background: 'rgba(255,128,0,0.08)', color: '#ff8040',
                                                                                fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                                                                transition: 'all 0.15s'
                                                                            }}
                                                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,128,0,0.15)'; e.currentTarget.style.borderColor = '#ff8040'; }}
                                                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,128,0,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,128,0,0.3)'; }}
                                                                        >
                                                                            Rate Freelancer
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td data-label="Proposals">
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: (task.proposals ?? 0) > 0 ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                                                            {(task.proposals ?? 0) > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d00', display: 'inline-block' }} />}
                                                            {task.proposals ?? 0}
                                                        </span>
                                                    </td>
                                                    <td className="col-client" data-label="Posted" style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                                                        {formatDate(task.createdAt)}
                                                    </td>
                                                    <td className="td-actions" data-label="" style={{ width: 52, textAlign: 'center' }}>
                                                        <ActionMenu taskId={task._id} onAction={handleAction} onDelete={handleDeleteRequest} isLast={isLast} />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {!loading && !error && visibleTasks.length > 0 && (
                    <p style={{ marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: '0.05em', textAlign: 'right' }}>
                        {visibleTasks.length} RECORD{visibleTasks.length !== 1 ? 'S' : ''}
                        {activeStatus !== 'all' && ` · FILTERED BY ${activeStatus.toUpperCase()}`}
                    </p>
                )}
            </div>

            <FreelancerRatingModal
                open={!!ratingTask}
                onClose={() => setRatingTask(null)}
                task={ratingTask}
                token={session?.session?.token}
                onSubmitted={({ taskId, stars, review }) => {
                    const tid = normalizeId(taskId);
                    setRatingsByTask(prev => ({
                        ...prev,
                        [tid]: { stars, review },
                    }));
                }}
            />
        </>
    );
}