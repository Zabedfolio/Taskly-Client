'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getTasksById } from '@/lib/api/client/getTasksById';
import { getClientProposals } from '@/lib/api/client/getClientProposals';
import { Briefcase, FileText, CircleDollar, Plus, ArrowRight, ChartBar } from '@gravity-ui/icons';
import Link from 'next/link';
import { motion } from 'framer-motion';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ClientDashboardHomePage() {
    const { data: session, isPending: sessionPending } = useSession();
    const [tasks, setTasks] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (sessionPending) return;
        if (!session?.user?.id || !session?.session?.token) {
            setLoading(false);
            return;
        }

        async function fetchDashboardData() {
            try {
                setLoading(true);
                const [tasksData, proposalsData] = await Promise.all([
                    getTasksById(session.user.id),
                    getClientProposals(session.user.id),
                ]);
                setTasks(tasksData || []);
                setProposals(proposalsData || []);

                // Fetch total spent for this client
                if (session.user.email) {
                    try {
                        const paymentsRes = await fetch(`${BASE_URL}/api/payments`);
                        if (paymentsRes.ok) {
                            const payments = await paymentsRes.json();
                            const clientEmail = session.user.email.toLowerCase().trim();
                            const clientPayments = payments.filter(p => 
                                p.clientEmail?.toLowerCase() === clientEmail &&
                                p.paymentStatus === 'succeeded'
                            );
                            const total = clientPayments.reduce((sum, p) => sum + (Number(p.payoutSize) || 0), 0);
                            setTotalSpent(total);
                        }
                    } catch (_) { /* non-critical */ }
                }

                setError('');
            } catch (err) {
                console.error('Error loading dashboard data:', err);
                setError('Failed to fetch dashboard metrics.');
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [session, sessionPending]);

    if (sessionPending || loading) {
        return (
            <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00', animation: 'spin 0.75s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>LOADING DASHBOARD</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!session) {
        return (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#fff' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Access Denied</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Please sign in to view the dashboard.</p>
                <Link href="/auth/login" style={{ padding: '10px 20px', borderRadius: 8, background: '#ff4d00', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
            </div>
        );
    }

    // ── Stats ──────────────────────────────────────────────────────────────────
    const totalTasks       = tasks.length;
    const openTasks        = tasks.filter(t => t.status === 'open').length;
    const inProgressTasks  = tasks.filter(t => t.status === 'in-progress' || t.status === 'in_progress').length;

    // ── Area chart: budget by month (last 6 months) ────────────────────────────
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        monthlyData[monthNames[d.getMonth()]] = 0;
    }
    tasks.forEach(task => {
        if (!task.createdAt) return;
        const lbl = monthNames[new Date(task.createdAt).getMonth()];
        if (monthlyData[lbl] !== undefined) monthlyData[lbl] += (task.budget || 0);
    });
    const chartLabels = Object.keys(monthlyData);
    const chartValues = Object.values(monthlyData);
    const maxVal = Math.max(...chartValues, 500);

    const cW = 500, cH = 150, pL = 40, pR = 20, pT = 20, pB = 20;
    const gW = cW - pL - pR, gH = cH - pT - pB;
    const pts = chartValues.map((v, i) => ({
        x: pL + (i / (chartValues.length - 1)) * gW,
        y: pT + gH - (v / maxVal) * gH,
    }));
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = pts.length > 0
        ? `${linePath} L ${pts[pts.length - 1].x} ${pT + gH} L ${pts[0].x} ${pT + gH} Z`
        : '';

    // ── Category breakdown ─────────────────────────────────────────────────────
    const catCounts = {};
    tasks.forEach(t => { if (t.category) catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
    const catList = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const catColors = ['#ff4d00', '#a855f7', '#06b6d4', '#10b981'];

    return (
        <div style={{ padding: '32px 24px 60px', maxWidth: 1100, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff' }}>

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}
            >
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                        Client <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
                    </h1>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        Welcome back, <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{session.user.name || session.user.email}</strong>. Here's your overview.
                    </p>
                </div>
                <Link href="/dashboard/client/post-task" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12,
                    background: 'linear-gradient(135deg, #ff4d00, #cc3d00)', color: '#fff', fontSize: 13.5, fontWeight: 700,
                    textDecoration: 'none', boxShadow: '0 0 20px rgba(255,77,0,0.3)', transition: 'all 0.2s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 32px rgba(255,77,0,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(255,77,0,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    <Plus width={16} height={16} /> Post a New Task
                </Link>
            </motion.div>

            {error && (
                <div style={{ padding: '14px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13.5, marginBottom: 24 }}>
                    {error}
                </div>
            )}

            {/* ── Stats Grid: exactly 4 metrics ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 36 }}>
                {[
                    { label: 'Total Tasks',       value: totalTasks,       desc: 'All posted tasks',          icon: Briefcase,    color: '#ff4d00', bg: 'rgba(255,77,0,0.07)',    href: '/dashboard/client/my-tasks' },
                    { label: 'Open Tasks',         value: openTasks,        desc: 'Accepting new proposals',   icon: FileText,     color: '#06b6d4', bg: 'rgba(6,182,212,0.07)',   href: '/dashboard/client/my-tasks' },
                    { label: 'Tasks In Progress',  value: inProgressTasks,  desc: 'Currently being worked on', icon: ChartBar,     color: '#eab308', bg: 'rgba(234,179,8,0.07)',   href: '/dashboard/client/my-tasks' },
                    {
                        label: 'Total Spent',
                        value: `$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        desc: 'Paid via Stripe (USD)',
                        icon: CircleDollar,
                        color: '#22c55e',
                        bg: 'rgba(34,197,94,0.07)',
                        href: null,
                    },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    const Card = (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.08 }}
                            whileHover={{ y: -3, borderColor: 'rgba(255,255,255,0.18)', boxShadow: '0 8px 30px rgba(255,77,0,0.04)' }}
                            style={{
                                padding: '22px 24px', borderRadius: 16,
                                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', flexDirection: 'column', gap: 14,
                                cursor: stat.href ? 'pointer' : 'default',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', fontFamily: 'monospace' }}>
                                    {stat.label}
                                </span>
                                <div style={{ width: 34, height: 34, borderRadius: 9, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon width={15} height={15} style={{ color: stat.color }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 3, letterSpacing: '-0.02em' }}>{stat.value}</div>
                                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)' }}>{stat.desc}</div>
                            </div>
                        </motion.div>
                    );
                    return stat.href
                        ? <Link key={idx} href={stat.href} style={{ textDecoration: 'none' }}>{Card}</Link>
                        : <div key={idx}>{Card}</div>;
                })}
            </div>

            {/* ── Charts row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 36 }}>

                {/* Budget velocity line chart */}
                <div style={{ padding: '24px 28px', borderRadius: 20, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Task Budget Velocity</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Cumulative budget posted over the last 6 months (USD)</span>
                    </div>
                    <div style={{ width: '100%' }}>
                        <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                            <defs>
                                <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#ff4d00" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
                                <line key={i} x1={pL} y1={pT + r * gH} x2={cW - pR} y2={pT + r * gH}
                                    stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 3" />
                            ))}
                            {areaPath && (
                                <motion.path
                                    d={areaPath}
                                    fill="url(#cGrad)"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                />
                            )}
                            {linePath && (
                                <motion.path
                                    d={linePath}
                                    fill="none"
                                    stroke="#ff4d00"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    style={{ filter: 'drop-shadow(0 0 6px rgba(255,77,0,0.5))' }}
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                                />
                            )}
                            {pts.map((p, i) => (
                                <g key={i}>
                                    <motion.circle
                                        cx={p.x}
                                        cy={p.y}
                                        r="4"
                                        fill="#ff4d00"
                                        stroke="#080808"
                                        strokeWidth="1.5"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.6 + i * 0.08 }}
                                    />
                                    <motion.text
                                        x={p.x}
                                        y={p.y - 8}
                                        textAnchor="middle"
                                        fill="#fff"
                                        fontSize="9"
                                        fontWeight="700"
                                        fontFamily="monospace"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.8 + i * 0.08 }}
                                    >
                                        {chartValues[i] > 0 ? `$${chartValues[i]}` : ''}
                                    </motion.text>
                                </g>
                            ))}
                            {chartLabels.map((lbl, i) => (
                                <text key={i} x={pL + (i / (chartLabels.length - 1)) * gW} y={cH - 4}
                                    textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9.5" fontFamily="monospace">
                                    {lbl}
                                </text>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* Category breakdown */}
                <div style={{ padding: '24px 28px', borderRadius: 20, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Category Allocation</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Distribution of tasks across service niches</span>
                    </div>
                    {catList.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>NO TASKS YET</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, justifyContent: 'center' }}>
                            {catList.map(([cat, count], i) => {
                                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                                return (
                                    <motion.div
                                        key={cat}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                        style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                                            <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.82)' }}>{cat}</span>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: catColors[i % catColors.length] }}>
                                                {count} {count === 1 ? 'task' : 'tasks'} ({pct}%)
                                            </span>
                                        </div>
                                        <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: 99, overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.5, delay: 0.2 + i * 0.05 }}
                                                style={{ height: '100%', background: catColors[i % catColors.length], borderRadius: 99, boxShadow: `0 0 8px ${catColors[i % catColors.length]}` }}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom: Recent Bids + Quick Actions ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

                {/* Recent Proposals */}
                <div style={{ padding: '24px 28px', borderRadius: 20, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Recent Incoming Bids</h3>
                        <Link href="/dashboard/client/proposals" style={{ fontSize: 12, fontWeight: 700, color: '#ff4d00', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            View all <ArrowRight width={12} height={12} />
                        </Link>
                    </div>
                    {proposals.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'monospace' }}>
                            No proposals received yet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {proposals.slice(0, 4).map((p, i) => {
                                const isA = p.status?.toLowerCase() === 'accepted';
                                const isR = p.status?.toLowerCase() === 'rejected';
                                const c = isA ? '#22c55e' : isR ? '#ef4444' : '#ff8040';
                                return (
                                    <motion.div
                                        key={p._id || i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                        style={{ padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
                                    >
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {p.taskTitle || 'Untitled Task'}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>by {p.freelancerEmail}</div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: '#ff4d00', marginBottom: 2 }}>${p.proposedBudget}</div>
                                            <span style={{ fontSize: 9, fontWeight: 700, color: c, fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                                ● {p.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div style={{ padding: '24px 28px', borderRadius: 20, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'center' }}>
                        {[
                            { label: 'Post a New Task',    desc: 'Publish a job and receive proposals',     href: '/dashboard/client/post-task' },
                            { label: 'Manage My Tasks',    desc: 'Edit, view, or delete posted tasks',      href: '/dashboard/client/my-tasks' },
                            { label: 'Review Proposals',   desc: 'Accept or decline submitted bids',        href: '/dashboard/client/proposals' },
                            { label: 'Account Settings',   desc: 'Profile, notifications, security',        href: '/dashboard/client/settings' },
                        ].map((act, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.06 }}
                                whileHover={{ scale: 1.01 }}
                            >
                                <Link href={act.href} style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        padding: '13px 15px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.05)',
                                        background: 'rgba(255,77,0,0.02)', cursor: 'pointer', transition: 'all 0.18s',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,77,0,0.28)'; e.currentTarget.style.background = 'rgba(255,77,0,0.05)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,77,0,0.02)'; }}
                                    >
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{act.label}</div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{act.desc}</div>
                                        </div>
                                        <ArrowRight width={14} height={14} style={{ color: '#ff4d00', flexShrink: 0 }} />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}