'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getTasksById } from '@/lib/api/client/getTasksById';
import { getClientProposals } from '@/lib/api/client/getClientProposals';
import { Briefcase, FileText, CircleDollar, Plus, ArrowRight, ChartBar } from '@gravity-ui/icons';
import Link from 'next/link';
import { motion } from 'framer-motion';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 140, thickness = 22, label, sublabel }) {
    const r = (size - thickness) / 2;
    const cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    let cumulative = 0;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={thickness} />
                {total === 0 ? (
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={thickness} />
                ) : segments.map((seg, i) => {
                    const frac = seg.value / total;
                    const dash = frac * circ;
                    const offset = circ - cumulative * circ / total;
                    cumulative += seg.value;
                    return (
                        <motion.circle
                            key={i} cx={cx} cy={cy} r={r}
                            fill="none" stroke={seg.color} strokeWidth={thickness}
                            strokeLinecap="round"
                            strokeDasharray={`${dash} ${circ - dash}`}
                            strokeDashoffset={-((1 - (cumulative - seg.value) / total) * circ)}
                            initial={{ strokeDasharray: `0 ${circ}` }}
                            animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
                            transition={{ duration: 0.9, delay: i * 0.15, ease: 'easeOut' }}
                            style={{ filter: `drop-shadow(0 0 6px ${seg.color}88)` }}
                        />
                    );
                })}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{label}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{sublabel}</div>
            </div>
        </div>
    );
}

// ── Radial Gauge ─────────────────────────────────────────────────────────────
function RadialGauge({ value, max, color, label, size = 120 }) {
    const r = 48, cx = size / 2, cy = size / 2 + 10;
    const startAngle = -200, endAngle = 20;
    const range = endAngle - startAngle;
    const pct = max > 0 ? Math.min(value / max, 1) : 0;
    const angle = startAngle + pct * range;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const arcPath = (start, end) => {
        const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) };
        const e = { x: cx + r * Math.cos(toRad(end)), y: cy + r * Math.sin(toRad(end)) };
        const large = Math.abs(end - start) > 180 ? 1 : 0;
        return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
    };
    return (
        <div style={{ position: 'relative', width: size, height: size * 0.75, flexShrink: 0 }}>
            <svg width={size} height={size * 0.75} style={{ overflow: 'visible' }}>
                <path d={arcPath(startAngle, endAngle)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} strokeLinecap="round" />
                <motion.path
                    d={arcPath(startAngle, angle)}
                    fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${color}99)` }}
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
                <text x={cx} y={cy + 6} textAnchor="middle" fill="#fff" fontSize="18" fontWeight="900" fontFamily="system-ui">{Math.round(pct * 100)}%</text>
                <text x={cx} y={cy + 20} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="monospace">{label}</text>
            </svg>
        </div>
    );
}

export default function ClientDashboardHomePage() {
    const { data: session, isPending: sessionPending } = useSession();
    const [tasks, setTasks] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (sessionPending) return;
        if (!session?.user?.id || !session?.session?.token) { setLoading(false); return; }

        async function fetchDashboardData() {
            try {
                setLoading(true);
                const [tasksData, proposalsData] = await Promise.all([
                    getTasksById(session.user.id),
                    getClientProposals(session.user.id),
                ]);
                setTasks(tasksData || []);
                setProposals(proposalsData || []);

                if (session.user.email) {
                    try {
                        const paymentsRes = await fetch(`${BASE_URL}/api/payments`);
                        if (paymentsRes.ok) {
                            const payments = await paymentsRes.json();
                            const clientEmail = session.user.email.toLowerCase().trim();
                            const clientPayments = payments.filter(p =>
                                p.clientEmail?.toLowerCase() === clientEmail && p.paymentStatus === 'succeeded'
                            );
                            setTotalSpent(clientPayments.reduce((sum, p) => sum + (Number(p.payoutSize) || 0), 0));
                        }
                    } catch (_) {}
                }
                setError('');
            } catch (err) {
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

    // ── Derived metrics ────────────────────────────────────────────────────────
    const totalTasks      = tasks.length;
    const openTasks       = tasks.filter(t => (t.status || '').toLowerCase() === 'open').length;
    const inProgressTasks = tasks.filter(t => (t.status || '').toLowerCase().replace('-', '_') === 'in_progress').length;
    const completedTasks  = tasks.filter(t => (t.status || '').toLowerCase() === 'completed').length;
    const totalBudget     = tasks.reduce((s, t) => s + (Number(t.budget) || 0), 0);

    // ── Area chart: budget by month ────────────────────────────────────────────
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyData = {};
    for (let i = 5; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); monthlyData[monthNames[d.getMonth()]] = 0; }
    tasks.forEach(task => {
        if (!task.createdAt) return;
        const lbl = monthNames[new Date(task.createdAt).getMonth()];
        if (monthlyData[lbl] !== undefined) monthlyData[lbl] += (task.budget || 0);
    });
    const chartLabels = Object.keys(monthlyData);
    const chartValues = Object.values(monthlyData);
    const maxVal = Math.max(...chartValues, 500);
    const cW = 500, cH = 160, pL = 44, pR = 16, pT = 20, pB = 24;
    const gW = cW - pL - pR, gH = cH - pT - pB;
    const pts = chartValues.map((v, i) => ({ x: pL + (i / Math.max(chartValues.length - 1, 1)) * gW, y: pT + gH - (v / maxVal) * gH }));
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = pts.length > 0 ? `${linePath} L ${pts[pts.length-1].x} ${pT+gH} L ${pts[0].x} ${pT+gH} Z` : '';

    // ── Bar chart: tasks per month ─────────────────────────────────────────────
    const monthlyTaskCount = {};
    for (let i = 5; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); monthlyTaskCount[monthNames[d.getMonth()]] = 0; }
    tasks.forEach(t => {
        if (!t.createdAt) return;
        const lbl = monthNames[new Date(t.createdAt).getMonth()];
        if (monthlyTaskCount[lbl] !== undefined) monthlyTaskCount[lbl]++;
    });
    const barLabels = Object.keys(monthlyTaskCount);
    const barValues = Object.values(monthlyTaskCount);
    const maxBar = Math.max(...barValues, 3);

    // ── Donut chart: task status distribution ──────────────────────────────────
    const donutSegments = [
        { label: 'Open',        value: openTasks,       color: '#06b6d4' },
        { label: 'In Progress', value: inProgressTasks, color: '#eab308' },
        { label: 'Completed',   value: completedTasks,  color: '#22c55e' },
        { label: 'Other',       value: Math.max(totalTasks - openTasks - inProgressTasks - completedTasks, 0), color: 'rgba(255,255,255,0.12)' },
    ].filter(s => s.value > 0);

    // ── Category breakdown ─────────────────────────────────────────────────────
    const catCounts = {};
    tasks.forEach(t => { if (t.category) catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
    const catList = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const catColors = ['#ff4d00','#a855f7','#06b6d4','#10b981','#eab308'];

    // ── Proposal win rate ──────────────────────────────────────────────────────
    const acceptedProposals = proposals.filter(p => p.status?.toLowerCase() === 'accepted').length;
    const winRate = proposals.length > 0 ? acceptedProposals / proposals.length : 0;

    const CARD = { padding: '24px 26px', borderRadius: 20, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 16 };

    return (
        <div className="dash-page-container">
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                        Client <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
                    </h1>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        Welcome back, <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{session.user.name || session.user.email}</strong>. Here's your overview.
                    </p>
                </div>
                <Link href="/dashboard/client/post-task" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, background: 'linear-gradient(135deg, #ff4d00, #cc3d00)', color: '#fff', fontSize: 13.5, fontWeight: 700, textDecoration: 'none', boxShadow: '0 0 20px rgba(255,77,0,0.3)' }}>
                    <Plus width={16} height={16} /> Post a New Task
                </Link>
            </motion.div>

            {error && <div style={{ padding: '14px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13.5, marginBottom: 24 }}>{error}</div>}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 32 }}>
                {[
                    { label: 'Total Tasks',      value: totalTasks,       desc: 'All posted tasks',          icon: Briefcase,    color: '#ff4d00', bg: 'rgba(255,77,0,0.07)',    href: '/dashboard/client/my-tasks' },
                    { label: 'Open Tasks',        value: openTasks,        desc: 'Accepting new proposals',   icon: FileText,     color: '#06b6d4', bg: 'rgba(6,182,212,0.07)',   href: '/dashboard/client/my-tasks' },
                    { label: 'In Progress',       value: inProgressTasks,  desc: 'Currently being worked on', icon: ChartBar,     color: '#eab308', bg: 'rgba(234,179,8,0.07)',   href: '/dashboard/client/my-tasks' },
                    { label: 'Total Spent',       value: `$${totalSpent.toLocaleString('en-US',{minimumFractionDigits:2})}`, desc: 'Paid via Stripe (USD)', icon: CircleDollar, color: '#22c55e', bg: 'rgba(34,197,94,0.07)', href: null },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    const Card = (
                        <motion.div key={idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.08 }} whileHover={{ y: -3 }}
                            style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 14, cursor: stat.href ? 'pointer' : 'default' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', fontFamily: 'monospace' }}>{stat.label}</span>
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
                    return stat.href ? <Link key={idx} href={stat.href} style={{ textDecoration: 'none' }}>{Card}</Link> : <div key={idx}>{Card}</div>;
                })}
            </div>

            {/* ── Row 1: Area Chart + Donut Chart ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,300px),1fr))', gap: 20, marginBottom: 20 }}>

                {/* 1. Area/Line Chart — Budget Velocity */}
                <div style={CARD}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Budget Posted Over Time</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Cumulative task budget (USD) — last 6 months</span>
                    </div>
                    <div style={{ width: '100%' }}>
                        <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                            <defs>
                                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#ff4d00" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {[0,0.25,0.5,0.75,1].map((r,i) => (
                                <line key={i} x1={pL} y1={pT+r*gH} x2={cW-pR} y2={pT+r*gH} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 3" />
                            ))}
                            {[0,0.25,0.5,0.75,1].map((r,i) => (
                                <text key={i} x={pL-6} y={pT+r*gH+3} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">
                                    ${Math.round(maxVal*(1-r))}
                                </text>
                            ))}
                            {areaPath && <motion.path d={areaPath} fill="url(#aGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />}
                            {linePath && <motion.path d={linePath} fill="none" stroke="#ff4d00" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(255,77,0,0.5))' }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeInOut' }} />}
                            {pts.map((p, i) => (
                                <g key={i}>
                                    <motion.circle cx={p.x} cy={p.y} r="4" fill="#ff4d00" stroke="#080808" strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: 0.6 + i * 0.08 }} />
                                    {chartValues[i] > 0 && <motion.text x={p.x} y={p.y - 9} textAnchor="middle" fill="#fff" fontSize="8.5" fontWeight="700" fontFamily="monospace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.08 }}>${chartValues[i]}</motion.text>}
                                </g>
                            ))}
                            {chartLabels.map((lbl, i) => (
                                <text key={i} x={pL + (i / Math.max(chartLabels.length-1,1)) * gW} y={cH-4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">{lbl}</text>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* 2. Donut Chart — Task Status Distribution */}
                <div style={CARD}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Task Status Breakdown</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Distribution of tasks by current status</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                        <DonutChart
                            segments={donutSegments.length ? donutSegments : [{ label: 'No Data', value: 1, color: 'rgba(255,255,255,0.08)' }]}
                            size={140} thickness={20}
                            label={totalTasks} sublabel="Tasks"
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 120 }}>
                            {[
                                { label: 'Open',        value: openTasks,       color: '#06b6d4' },
                                { label: 'In Progress', value: inProgressTasks, color: '#eab308' },
                                { label: 'Completed',   value: completedTasks,  color: '#22c55e' },
                            ].map((s, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0, boxShadow: `0 0 6px ${s.color}` }} />
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', flex: 1 }}>{s.label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.value}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Row 2: Bar Chart + Radial Gauge + Category Bars ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,260px),1fr))', gap: 20, marginBottom: 20 }}>

                {/* 3. Bar Chart — Tasks Created Per Month */}
                <div style={CARD}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Tasks Created / Month</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Number of tasks posted each month</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, paddingBottom: 20, justifyContent: 'space-around' }}>
                        {barLabels.map((lbl, i) => {
                            const val = barValues[i];
                            const h = maxBar > 0 ? Math.max((val / maxBar) * 90, 4) : 4;
                            return (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
                                    <span style={{ fontSize: 9.5, fontWeight: 700, color: val > 0 ? '#ff4d00' : 'transparent', fontFamily: 'monospace' }}>{val}</span>
                                    <motion.div initial={{ height: 0 }} animate={{ height: h }} transition={{ duration: 0.7, delay: 0.1 + i * 0.07, ease: 'easeOut' }}
                                        style={{ width: '100%', maxWidth: 32, borderRadius: '5px 5px 2px 2px', background: val > 0 ? 'linear-gradient(180deg,#ff4d00,rgba(255,77,0,0.35))' : 'rgba(255,255,255,0.05)', boxShadow: val > 0 ? '0 0 10px rgba(255,77,0,0.28)' : 'none' }} />
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{lbl}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Radial Gauges — Proposal Win Rate */}
                <div style={CARD}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Proposal Metrics</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Acceptance rate on submitted bids</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <RadialGauge value={acceptedProposals} max={Math.max(proposals.length, 1)} color="#22c55e" label="WIN RATE" size={120} />
                            <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>ACCEPTED</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { label: 'Total Bids', value: proposals.length, color: '#fff' },
                                { label: 'Accepted', value: acceptedProposals, color: '#22c55e' },
                                { label: 'Pending', value: proposals.filter(p => p.status?.toLowerCase() === 'pending').length, color: '#eab308' },
                                { label: 'Rejected', value: proposals.filter(p => p.status?.toLowerCase() === 'rejected').length, color: '#ef4444' },
                            ].map((s, i) => (
                                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.08 }}
                                    style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
                                    <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.value}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. Horizontal Bar Chart — Category Breakdown */}
                <div style={CARD}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Category Allocation</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Task distribution across service niches</span>
                    </div>
                    {catList.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>NO TASKS YET</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
                            {catList.map(([cat, count], i) => {
                                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                                return (
                                    <motion.div key={cat} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                            <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.78)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{cat}</span>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: catColors[i % catColors.length], flexShrink: 0 }}>{count} ({pct}%)</span>
                                        </div>
                                        <div style={{ height: 7, width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: 99, overflow: 'hidden' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.2 + i * 0.06 }}
                                                style={{ height: '100%', background: catColors[i % catColors.length], borderRadius: 99, boxShadow: `0 0 8px ${catColors[i % catColors.length]}` }} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Bottom: Recent Bids + Quick Actions ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
                {/* Recent Proposals */}
                <div style={CARD}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Recent Incoming Bids</h3>
                        <Link href="/dashboard/client/proposals" style={{ fontSize: 12, fontWeight: 700, color: '#ff4d00', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            View all <ArrowRight width={12} height={12} />
                        </Link>
                    </div>
                    {proposals.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'monospace' }}>No proposals received yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {proposals.slice(0, 4).map((p, i) => {
                                const isA = p.status?.toLowerCase() === 'accepted';
                                const isR = p.status?.toLowerCase() === 'rejected';
                                const c = isA ? '#22c55e' : isR ? '#ef4444' : '#ff8040';
                                return (
                                    <motion.div key={p._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                                        style={{ padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.taskTitle || 'Untitled Task'}</div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>by {p.freelancerEmail}</div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: '#ff4d00', marginBottom: 2 }}>${p.proposedBudget}</div>
                                            <span style={{ fontSize: 9, fontWeight: 700, color: c, fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>● {p.status}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div style={CARD}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'center' }}>
                        {[
                            { label: 'Post a New Task',   desc: 'Publish a job and receive proposals',    href: '/dashboard/client/post-task' },
                            { label: 'Manage My Tasks',   desc: 'Edit, view, or delete posted tasks',     href: '/dashboard/client/my-tasks' },
                            { label: 'Review Proposals',  desc: 'Accept or decline submitted bids',       href: '/dashboard/client/proposals' },
                            { label: 'Account Settings',  desc: 'Profile, notifications, security',       href: '/dashboard/client/settings' },
                        ].map((act, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }} whileHover={{ scale: 1.01 }}>
                                <Link href={act.href} style={{ textDecoration: 'none' }}>
                                    <div style={{ padding: '13px 15px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,77,0,0.02)', cursor: 'pointer', transition: 'all 0.18s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,77,0,0.28)'; e.currentTarget.style.background = 'rgba(255,77,0,0.05)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,77,0,0.02)'; }}>
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
        </div>
    );
}