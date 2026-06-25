'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getAllTasks, deleteTask } from '@/lib/api/admin/adminApi';
import { Briefcase, ArrowLeft, TrashBin } from '@gravity-ui/icons';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminTasksPage() {
    const { data: session, isPending } = useSession();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (isPending) return;
        if (!session?.session?.token) {
            setLoading(false);
            return;
        }
        async function load() {
            try {
                const data = await getAllTasks();
                setTasks(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [session, isPending]);

    const handleDelete = async (taskId) => {
        if (!session?.session?.token) return;
        if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;
        try {
            setDeletingId(taskId);
            await deleteTask(taskId, session.session.token);
            setTasks(prev => prev.filter(t => t._id !== taskId));
            toast.success('Task deleted successfully');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    if (isPending || loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00', animation: 'spin 0.75s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>LOADING TASKS</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const statusColors = {
        open: { color: '#22c55e', bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.2)' },
        'in-progress': { color: '#eab308', bg: 'rgba(234,179,8,0.06)', border: 'rgba(234,179,8,0.2)' },
        completed: { color: '#06b6d4', bg: 'rgba(6,182,212,0.06)', border: 'rgba(6,182,212,0.2)' },
        closed: { color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)' },
    };

    return (
        <div style={{ padding: '32px 24px 60px', maxWidth: 1100, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff' }}>
            <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, borderRadius: 10 } }} />

            <div style={{ marginBottom: 20 }}>
                <Link href="/dashboard/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff4d00'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                    <ArrowLeft width={14} height={14} /> Back to Dashboard
                </Link>
            </div>

            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                    Manage <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tasks</span>
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    Review all posted tasks. Remove any that violate platform guidelines.
                </p>
            </div>

            {tasks.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                    <Briefcase width={24} height={24} style={{ color: '#ff4d00', marginBottom: 12 }} />
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No tasks found</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)' }}>There are no tasks on the platform yet.</p>
                </div>
            ) : (
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Task Title</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Category</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Posted By</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Budget</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Status</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task, idx) => {
                                    const st = statusColors[task.status] || statusColors.open;
                                    return (
                                        <tr key={task._id} style={{
                                            borderBottom: idx < tasks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                            transition: 'background 0.2s',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '18px 24px' }}>
                                                <div style={{ fontSize: 13.5, fontWeight: 700, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {task.title}
                                                </div>
                                                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginTop: 2 }}>
                                                    {task._id}
                                                </div>
                                            </td>
                                            <td style={{ padding: '18px 24px', fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>{task.category || '—'}</td>
                                            <td style={{ padding: '18px 24px' }}>
                                                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>{task.clientName || '—'}</div>
                                                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)' }}>{task.clientEmail || ''}</div>
                                            </td>
                                            <td style={{ padding: '18px 24px', fontSize: 13, fontWeight: 800, color: '#ff4d00' }}>${task.budget || 0}</td>
                                            <td style={{ padding: '18px 24px' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99,
                                                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace',
                                                    color: st.color, background: st.bg, border: `1px solid ${st.border}`
                                                }}>
                                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.color }} />
                                                    {task.status || 'open'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                                <button
                                                    disabled={deletingId === task._id}
                                                    onClick={() => handleDelete(task._id)}
                                                    style={{
                                                        width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                                                        background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                                    }}
                                                    title="Delete Task"
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
                                                >
                                                    <TrashBin width={14} height={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
