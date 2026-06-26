'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { AnimatePresence, motion } from 'framer-motion';

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell() {
    const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handle(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Bell button */}
            <button
                id="notification-bell-btn"
                type="button"
                onClick={() => {
                    setOpen(o => !o);
                    if (!open && unreadCount > 0) markAllRead();
                }}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                style={{
                    position: 'relative',
                    width: 36, height: 36,
                    borderRadius: 10,
                    border: '1px solid rgba(255,77,0,0.2)',
                    background: open ? 'rgba(255,77,0,0.1)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    color: '#fff',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,0,0.1)'}
                onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
            >
                {/* Bell SVG */}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        minWidth: 17, height: 17,
                        borderRadius: 9,
                        background: '#ff4d00',
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px',
                        border: '2px solid var(--background)',
                        animation: 'notif-pulse 2s ease-in-out infinite',
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                            width: 340,
                            background: 'linear-gradient(180deg, #141414 0%, #0f0f0f 100%)',
                            border: '1px solid rgba(255,77,0,0.15)',
                            borderRadius: 18,
                            boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                            overflow: 'hidden',
                            zIndex: 200,
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 16px 12px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Notifications</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* List */}
                        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                                    <div style={{ fontSize: 28, marginBottom: 10 }}>🔔</div>
                                    <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                                        No notifications yet.<br />Status changes on your proposals will appear here.
                                    </div>
                                </div>
                            ) : (
                                notifications.slice(0, 15).map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => markRead(n.id)}
                                        style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            display: 'flex', alignItems: 'flex-start', gap: 10,
                                            cursor: 'default',
                                            background: n.read ? 'transparent' : 'rgba(255,77,0,0.025)',
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        <span style={{
                                            flexShrink: 0, width: 32, height: 32, borderRadius: 10,
                                            background: `${n.color}18`, border: `1px solid ${n.color}30`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 14,
                                        }}>
                                            {n.emoji}
                                        </span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                                                {n.message}
                                            </div>
                                            <div style={{
                                                fontSize: 11, color: 'rgba(255,255,255,0.4)',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {n.taskTitle}
                                            </div>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 3, fontFamily: 'monospace' }}>
                                                {timeAgo(n.createdAt)}
                                            </div>
                                        </div>
                                        {!n.read && (
                                            <span style={{
                                                width: 7, height: 7, borderRadius: '50%',
                                                background: '#ff4d00', flexShrink: 0, marginTop: 5,
                                            }} />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes notif-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(255,77,0,0.5); }
                    50% { box-shadow: 0 0 0 4px rgba(255,77,0,0); }
                }
            `}</style>
        </div>
    );
}
