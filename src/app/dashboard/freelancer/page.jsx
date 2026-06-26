'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getMyProposals } from '@/lib/api/freelancer/getMyProposals';
import { Briefcase, Magnifier, FileText, CreditCard, Clock, ArrowRight, CircleDollar } from '@gravity-ui/icons';
import Link from 'next/link';
import { motion } from 'framer-motion';

// ── Reusable: Donut Chart ────────────────────────────────────────────────────
function DonutChart({ segments, size = 140, thickness = 20, label, sublabel }) {
    const r = (size - thickness) / 2;
    const cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    let cumulativeFrac = 0;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={thickness} />
                {total === 0 ? null : segments.map((seg, i) => {
                    const frac = seg.value / total;
                    const dash = frac * circ;
                    const off = -(cumulativeFrac * circ);
                    cumulativeFrac += frac;
                    return (
                        <motion.circle key={i} cx={cx} cy={cy} r={r} fill="none"
                            stroke={seg.color} strokeWidth={thickness} strokeLinecap="round"
                            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={off}
                            initial={{ strokeDasharray: `0 ${circ}` }}
                            animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
                            transition={{ duration: 0.9, delay: i * 0.15, ease: 'easeOut' }}
                            style={{ filter: `drop-shadow(0 0 5px ${seg.color}99)` }}
                        />
                    );
                })}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{label}</div>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{sublabel}</div>
            </div>
        </div>
    );
}

// ── Sparkline / Small Line Chart ─────────────────────────────────────────────
function Sparkline({ values, color = '#ff4d00', height = 40, width = 100 }) {
    if (!values || values.length < 2) return null;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const pts = values.map((v, i) => ({
        x: (i / (values.length - 1)) * width,
        y: height - ((v - min) / range) * height,
    }));
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <motion.path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeInOut' }}
                style={{ filter: `drop-shadow(0 0 4px ${color}88)` }} />
            <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="3.5" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        </svg>
    );
}

export default function FreelancerDashboardHomePage() {
    const { data: session, isPending: sessionPending } = useSession();
    const [proposals, setProposals] = useState([]);
    const [completedJobs, setCompletedJobs] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (sessionPending) return;
        if (!session?.session?.token) { setLoading(false); return; }

        async function fetchDashboardMetrics() {
            try {
                setLoading(true);
                const email = session.user.email?.toLowerCase().trim();
                const [data, tasksRes] = await Promise.all([
                    getMyProposals(email),
                    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/tasks`)
                ]);
                const proposalsList = data || [];
                setProposals(proposalsList);

                if (tasksRes.ok) {
                    const tasksList = await tasksRes.json();
                    const freelancerAccepted = proposalsList.filter(p =>
                        p.freelancerEmail?.toLowerCase() === email && p.status?.toLowerCase() === 'accepted'
                    );
                    setCompletedJobs(freelancerAccepted.filter(prop => {
                        const task = tasksList.find(t => t._id === prop.taskId);
                        return task && task.status?.toLowerCase() === 'completed';
                    }).length);
                }
                setError('');
            } catch (err) {
                setError('Failed to load dashboard statistics.');
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardMetrics();
    }, [session, sessionPending]);

    if (sessionPending || loading) {
        return (
            <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00', animation: 'spin 0.75s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>LOADING PROFILE DATA</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!session) {
        return (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#fff' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Access Denied</h3>
                <Link href="/auth/login" style={{ padding: '10px 20px', borderRadius: 8, background: '#ff4d00', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
            </div>
        );
    }

    const user = session.user;

    // ── Derived metrics ────────────────────────────────────────────────────────
    const totalSubmitted     = proposals.length;
    const pendingCount       = proposals.filter(p => p.status?.toLowerCase() === 'pending').length;
    const acceptedProposals  = proposals.filter(p => p.status?.toLowerCase() === 'accepted');
    const rejectedCount      = proposals.filter(p => p.status?.toLowerCase() === 'rejected').length;
    const totalEarnings      = acceptedProposals.reduce((sum, p) => sum + (p.proposedBudget || 0), 0);
    const winRate            = totalSubmitted > 0 ? Math.round((acceptedProposals.length / totalSubmitted) * 100) : 0;

    // ── Area chart: monthly bid volume ─────────────────────────────────────────
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyBids = {};
    const monthlyEarnings = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const lbl = monthNames[d.getMonth()];
        monthlyBids[lbl] = 0;
        monthlyEarnings[lbl] = 0;
    }
    proposals.forEach(p => {
        if (!p.submittedAt) return;
        const lbl = monthNames[new Date(p.submittedAt).getMonth()];
        if (monthlyBids[lbl] !== undefined) {
            monthlyBids[lbl]++;
            monthlyEarnings[lbl] += (p.proposedBudget || 0);
        }
    });
    const chartLabels  = Object.keys(monthlyBids);
    const bidValues    = Object.values(monthlyBids);
    const earnValues   = Object.values(monthlyEarnings);
    const maxBid       = Math.max(...bidValues, 3);
    const maxEarn      = Math.max(...earnValues, 500);

    // SVG line chart coords
    const cW = 500, cH = 160, pL = 44, pR = 16, pT = 20, pB = 24;
    const gW = cW - pL - pR, gH = cH - pT - pB;
    const bidPts  = bidValues.map((v, i) => ({ x: pL + (i / Math.max(bidValues.length-1,1)) * gW, y: pT + gH - (v / maxBid) * gH }));
    const earnPts = earnValues.map((v, i) => ({ x: pL + (i / Math.max(earnValues.length-1,1)) * gW, y: pT + gH - (v / maxEarn) * gH }));
    const bidLine  = bidPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const earnLine = earnPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const earnArea = earnPts.length > 0 ? `${earnLine} L ${earnPts[earnPts.length-1].x} ${pT+gH} L ${earnPts[0].x} ${pT+gH} Z` : '';

    // ── Bar chart: earnings per month ──────────────────────────────────────────
    const earnLabels = Object.keys(monthlyEarnings);
    const earnBars   = Object.values(monthlyEarnings);
    const maxEarnBar = Math.max(...earnBars, 500);

    // ── Status donut ───────────────────────────────────────────────────────────
    const statusSegments = [
        { label: 'Accepted', value: acceptedProposals.length, color: '#10b981' },
        { label: 'Pending',  value: pendingCount,             color: '#eab308' },
        { label: 'Rejected', value: rejectedCount,            color: '#ef4444' },
    ].filter(s => s.value > 0);

    // ── Sparkline: last 6 months bid count ────────────────────────────────────
    const sparkValues = bidValues;

    const CARD = { padding: '24px 26px', borderRadius: 20, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 16 };

    return (
        <div className="dash-page-container">
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 36 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                    Welcome back, <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name || 'Freelancer'}</span>!
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Here's a breakdown of your application velocities and active projects.</p>
            </motion.div>

            {error && <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13.5, marginBottom: 24 }}>{error}</div>}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 32 }}>
                {[
                    { label: 'Total Proposals', value: totalSubmitted, desc: 'All submitted bids', icon: FileText, href: '/dashboard/freelancer/proposals', color: '#ff4d00', bg: 'rgba(255,77,0,0.06)', spark: sparkValues, sparkColor: '#ff4d00' },
                    { label: 'Pending Bids',    value: pendingCount,   desc: 'Awaiting response',  icon: Clock,    href: '/dashboard/freelancer/proposals', color: '#eab308', bg: 'rgba(234,179,8,0.06)' },
                    { label: 'Completed Jobs',  value: completedJobs,  desc: 'Finished projects',   icon: Briefcase,href: '/dashboard/freelancer/active',   color: '#06b6d4', bg: 'rgba(6,182,212,0.06)' },
                    { label: 'Total Earnings',  value: `$${totalEarnings.toLocaleString()}`, desc: 'From accepted contracts', icon: CreditCard, href: null, color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    const Card = (
                        <motion.div key={idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.08 }} whileHover={{ y: -3 }}
                            style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 12, cursor: stat.href ? 'pointer' : 'default' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 11, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon width={18} height={18} style={{ color: stat.color }} />
                                </div>
                                {stat.spark && <Sparkline values={stat.spark} color={stat.sparkColor} height={32} width={70} />}
                            </div>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{stat.label}</div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 2, letterSpacing: '-0.02em' }}>{stat.value}</div>
                                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)' }}>{stat.desc}</div>
                            </div>
                        </motion.div>
                    );
                    return stat.href ? <Link key={idx} href={stat.href} style={{ textDecoration: 'none' }}>{Card}</Link> : <div key={idx}>{Card}</div>;
                })}
            </div>

            {/* ── Row 1: Multi-Line Chart + Donut ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,300px),1fr))', gap: 20, marginBottom: 20 }}>

                {/* 1. Multi-Line Chart — Bids + Earnings trend */}
                <div style={CARD}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Bid & Earnings Trend</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Monthly bids submitted vs. pipeline value</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 4 }}>
                        {[{ label: 'Bids Sent', color: '#ff4d00' }, { label: 'Pipeline Value', color: '#10b981' }].map((l, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ width: 16, height: 2.5, background: l.color, borderRadius: 2, display: 'inline-block' }} />
                                <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{l.label}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ width: '100%' }}>
                        <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                            <defs>
                                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {[0,0.25,0.5,0.75,1].map((r,i) => (
                                <line key={i} x1={pL} y1={pT+r*gH} x2={cW-pR} y2={pT+r*gH} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 3" />
                            ))}
                            {earnArea && <motion.path d={earnArea} fill="url(#earnGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />}
                            {earnLine && <motion.path d={earnLine} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 5px rgba(16,185,129,0.5))' }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }} />}
                            {bidLine && <motion.path d={bidLine} fill="none" stroke="#ff4d00" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 3" style={{ filter: 'drop-shadow(0 0 4px rgba(255,77,0,0.4))' }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, delay: 0.2 }} />}
                            {bidPts.map((p, i) => (
                                <motion.circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#ff4d00" stroke="#080808" strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 + i * 0.07 }} />
                            ))}
                            {earnPts.map((p, i) => (
                                <motion.circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#10b981" stroke="#080808" strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.07 }} />
                            ))}
                            {chartLabels.map((lbl, i) => (
                                <text key={i} x={pL + (i / Math.max(chartLabels.length-1,1)) * gW} y={cH-4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">{lbl}</text>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* 2. Donut — Proposal Status Breakdown */}
                <div style={CARD}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Bid Status Breakdown</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Accepted / Pending / Rejected ratios</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                        <DonutChart
                            segments={statusSegments.length ? statusSegments : [{ value: 1, color: 'rgba(255,255,255,0.07)' }]}
                            size={136} thickness={20}
                            label={`${winRate}%`} sublabel="Win Rate"
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 110 }}>
                            {[
                                { label: 'Accepted', value: acceptedProposals.length, color: '#10b981' },
                                { label: 'Pending',  value: pendingCount,             color: '#eab308' },
                                { label: 'Rejected', value: rejectedCount,            color: '#ef4444' },
                            ].map((s, i) => {
                                const pct = totalSubmitted > 0 ? Math.round((s.value / totalSubmitted) * 100) : 0;
                                return (
                                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                                            <span style={{ color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <span style={{ width: 7, height: 7, borderRadius: 2, background: s.color, display: 'inline-block' }} />{s.label}
                                            </span>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: s.color }}>{s.value} ({pct}%)</span>
                                        </div>
                                        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.2 + i * 0.06 }}
                                                style={{ height: '100%', background: s.color, borderRadius: 99 }} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Row 2: Bar Chart (Earnings) + Heatmap-style Activity ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,300px),1fr))', gap: 20, marginBottom: 20 }}>

                {/* 3. Bar Chart — Monthly Earnings */}
                <div style={CARD}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Monthly Pipeline Value (USD)</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Total bid value submitted each month</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, paddingBottom: 22, justifyContent: 'space-around' }}>
                        {earnLabels.map((lbl, i) => {
                            const val = earnBars[i];
                            const h = maxEarnBar > 0 ? Math.max((val / maxEarnBar) * 100, 4) : 4;
                            return (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
                                    <span style={{ fontSize: 8.5, fontWeight: 700, color: val > 0 ? '#10b981' : 'transparent', fontFamily: 'monospace' }}>{val > 0 ? `$${val}` : ''}</span>
                                    <motion.div initial={{ height: 0 }} animate={{ height: h }} transition={{ duration: 0.7, delay: 0.1 + i * 0.07, ease: 'easeOut' }}
                                        style={{ width: '100%', maxWidth: 32, borderRadius: '5px 5px 2px 2px', background: val > 0 ? 'linear-gradient(180deg,#10b981,rgba(16,185,129,0.3))' : 'rgba(255,255,255,0.04)', boxShadow: val > 0 ? '0 0 10px rgba(16,185,129,0.3)' : 'none' }} />
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{lbl}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Activity heatmap — bids per day of week */}
                <div style={CARD}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Submission Activity</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Bids submitted by day of week</span>
                    </div>
                    {(() => {
                        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                        const dayCounts = [0,0,0,0,0,0,0];
                        proposals.forEach(p => { if (p.submittedAt) dayCounts[new Date(p.submittedAt).getDay()]++; });
                        const maxDay = Math.max(...dayCounts, 1);
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {days.map((day, i) => {
                                    const pct = (dayCounts[i] / maxDay) * 100;
                                    const intensity = pct / 100;
                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)', width: 28, flexShrink: 0 }}>{day}</span>
                                            <div style={{ flex: 1, height: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                                                    style={{ height: '100%', background: `rgba(255,77,0,${0.15 + intensity * 0.85})`, borderRadius: 4, boxShadow: intensity > 0.5 ? '0 0 8px rgba(255,77,0,0.4)' : 'none' }} />
                                            </div>
                                            <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: '#ff4d00', width: 14, textAlign: 'right', flexShrink: 0 }}>{dayCounts[i]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* ── Bottom: Recent Bids + Actions ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
                <div style={CARD}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Recent Bids Sent</h3>
                        <Link href="/dashboard/freelancer/proposals" style={{ fontSize: 12, fontWeight: 700, color: '#ff4d00', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            View all <ArrowRight width={12} height={12} />
                        </Link>
                    </div>
                    {proposals.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12.5, fontFamily: 'monospace' }}>You have not submitted any proposals yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {proposals.slice(0, 3).map((proposal, idx) => {
                                const isA = proposal.status?.toLowerCase() === 'accepted';
                                const isR = proposal.status?.toLowerCase() === 'rejected';
                                const bc = isA ? '#10b981' : isR ? '#ef4444' : '#ff4d00';
                                return (
                                    <motion.div key={proposal._id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }}
                                        style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proposal.taskTitle || 'Untitled Task'}</div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock width={10} height={10} /> {proposal.estimatedDays} days</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: '#ff4d00', marginBottom: 3 }}>${proposal.proposedBudget} USD</div>
                                            <span style={{ fontSize: 9.5, fontWeight: 700, color: bc, fontFamily: 'monospace', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: bc }} />{proposal.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={CARD}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Freelancer Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'center' }}>
                        {[
                            { label: 'Browse New Projects',    desc: 'Find open tasks and pitch your rates',       href: '/browse' },
                            { label: 'Review Sent Proposals',  desc: 'Check proposal statuses & response rates',   href: '/dashboard/freelancer/proposals' },
                            { label: 'Track Active Contracts', desc: 'Manage works currently in progress',         href: '/dashboard/freelancer/active' },
                            { label: 'View Earnings',          desc: 'Track your income and payment history',      href: '/dashboard/freelancer/earnings' },
                        ].map((act, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.06 }} whileHover={{ scale: 1.01 }}>
                                <Link href={act.href} style={{ textDecoration: 'none' }}>
                                    <div style={{ padding: '13px 15px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,77,0,0.02)', cursor: 'pointer', transition: 'all 0.18s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,77,0,0.28)'; e.currentTarget.style.background = 'rgba(255,77,0,0.05)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,77,0,0.02)'; }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{act.label}</div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{act.desc}</div>
                                        </div>
                                        <ArrowRight width={14} height={14} style={{ color: '#ff4d00' }} />
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