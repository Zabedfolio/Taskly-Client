'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useBookmarks } from '@/contexts/BookmarkContext';
import TaskDetailModal from '@/components/shared/TaskDetailModal';
import Link from 'next/link';
import { ArrowLeft } from '@gravity-ui/icons';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function fetchTask(taskId) {
    const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`);
    if (!res.ok) return null;
    return res.json();
}

export default function BookmarksPage() {
    const { data: session } = useSession();
    const { bookmarks, toggleBookmark } = useBookmarks();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        if (bookmarks.length === 0) {
            setTasks([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        Promise.all(bookmarks.map(id => fetchTask(id)))
            .then(results => setTasks(results.filter(Boolean)))
            .finally(() => setLoading(false));
    }, [bookmarks]);

    return (
        <div style={{ padding: '32px 24px 60px', maxWidth: 1100, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff' }}>

            {/* Breadcrumb */}
            <div style={{ marginBottom: 20 }}>
                <Link href="/dashboard/freelancer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13,
                    transition: 'color 0.2s'
                }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff4d00'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                    <ArrowLeft width={14} height={14} /> Back to Dashboard
                </Link>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                    Saved{' '}
                    <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Bookmarks
                    </span>
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    Tasks you've saved for later review. {tasks.length > 0 && `${tasks.length} saved job${tasks.length > 1 ? 's' : ''}.`}
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', flexDirection: 'column', gap: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00', animation: 'spin 0.75s linear infinite' }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>LOADING BOOKMARKS</span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* Empty state */}
            {!loading && tasks.length === 0 && (
                <div style={{
                    background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20, padding: '64px 32px', textAlign: 'center',
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 18, margin: '0 auto 20px',
                        background: 'rgba(255,179,0,0.07)', border: '1px solid rgba(255,179,0,0.18)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                    }}>🔖</div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No saved bookmarks yet</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', maxWidth: 380, margin: '0 auto 24px', lineHeight: 1.6 }}>
                        Browse open tasks and click the bookmark icon inside any task card to save it here for later.
                    </p>
                    <Link href="/browse" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px',
                        borderRadius: 12, background: 'linear-gradient(135deg,#ff4d00,#cc3d00)',
                        color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700,
                        boxShadow: '0 4px 18px rgba(255,77,0,0.25)',
                    }}>
                        Browse Tasks
                    </Link>
                </div>
            )}

            {/* Task grid */}
            {!loading && tasks.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
                    {tasks.map(task => (
                        <div
                            key={task._id}
                            style={{
                                background: 'rgba(255,255,255,0.015)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 18, padding: '22px',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                transition: 'all 0.2s', cursor: 'pointer',
                                position: 'relative',
                            }}
                            onClick={() => setSelectedTask(task)}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,77,0,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                        >
                            {/* Remove bookmark */}
                            <button
                                type="button"
                                onClick={e => { e.stopPropagation(); toggleBookmark(task._id); }}
                                title="Remove bookmark"
                                style={{
                                    position: 'absolute', top: 14, right: 14,
                                    width: 28, height: 28, borderRadius: 8,
                                    border: '1px solid rgba(255,160,0,0.3)',
                                    background: 'rgba(255,160,0,0.1)',
                                    color: '#ffb300',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.18s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#ef4444'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,160,0,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,160,0,0.3)'; e.currentTarget.style.color = '#ffb300'; }}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                                </svg>
                            </button>

                            <div style={{ paddingRight: 24 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: '#ff4d00', background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.2)', padding: '3px 8px', borderRadius: 6 }}>
                                    {task.category}
                                </span>
                                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '12px 0 8px', lineHeight: 1.3, color: '#fff' }}>
                                    {task.title}
                                </h3>
                                <p style={{
                                    fontSize: 12.5, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 0,
                                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                }}>
                                    {task.description}
                                </p>
                            </div>

                            <div>
                                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 16, fontWeight: 800, color: '#ff4d00' }}>
                                        ${Number(task.budget).toLocaleString()}
                                    </span>
                                    <span style={{
                                        fontSize: 11.5, fontWeight: 600, color: '#fff',
                                        background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.2)',
                                        padding: '4px 10px', borderRadius: 8,
                                    }}>
                                        View Details →
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Task detail modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    );
}
