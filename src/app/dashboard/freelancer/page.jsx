'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getMyProposals } from '@/lib/api/freelancer/getMyProposals';
import { getFreelancerStats } from '@/lib/api/freelancer/getFreelancerStats';
import { Briefcase, Magnifier, FileText, CreditCard, Clock, ArrowRight, CircleDollar } from '@gravity-ui/icons';
import Link from 'next/link';

export default function FreelancerDashboardHomePage() {
    const { data: session, isPending: sessionPending } = useSession();
    const [proposals, setProposals] = useState([]);
    const [completedJobs, setCompletedJobs] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (sessionPending) return;
        if (!session?.session?.token) {
            setLoading(false);
            return;
        }

        async function fetchDashboardMetrics() {
            try {
                setLoading(true);
                const token = session.session.token;
                const [data, stats] = await Promise.all([
                    getMyProposals(token),
                    getFreelancerStats(token).catch(() => ({ completedJobs: 0 })),
                ]);
                setProposals(data || []);
                setCompletedJobs(stats?.completedJobs ?? 0);
                setError('');
            } catch (err) {
                console.error("Error loading freelancer dashboard metrics:", err);
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
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00',
                    animation: 'spin 0.75s linear infinite',
                }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                    LOADING PROFILE DATA
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!session) {
        return (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#fff' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Access Denied</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Please sign in to view your freelancer dashboard.</p>
                <Link href="/auth/login" style={{
                    padding: '10px 20px', borderRadius: 8, background: '#ff4d00', color: '#fff', fontWeight: 600, textDecoration: 'none'
                }}>Sign In</Link>
            </div>
        );
    }

    const user = session.user;

    // Metrics calculation
    const totalSubmitted = proposals.length;
    const pendingCount = proposals.filter(p => p.status?.toLowerCase() === 'pending').length;
    const acceptedProposals = proposals.filter(p => p.status?.toLowerCase() === 'accepted');
    const activeCount = acceptedProposals.length;
    const totalEarnings = acceptedProposals.reduce((sum, p) => sum + (p.proposedBudget || 0), 0);

    const stats = [
        { label: 'Total Proposals', value: `${totalSubmitted}`, desc: 'All submitted bids', icon: FileText, href: '/dashboard/freelancer/proposals', color: '#ff4d00', bg: 'rgba(255,77,0,0.06)' },
        { label: 'Pending Proposals', value: `${pendingCount}`, desc: 'Awaiting client response', icon: Clock, href: '/dashboard/freelancer/proposals', color: '#eab308', bg: 'rgba(234,179,8,0.06)' },
        { label: 'Completed Jobs', value: `${completedJobs}`, desc: 'Finished & delivered projects', icon: Briefcase, href: '/dashboard/freelancer/active', color: '#06b6d4', bg: 'rgba(6,182,212,0.06)' },
        { label: 'Total Earnings (USD)', value: `$${totalEarnings.toLocaleString()}`, desc: 'From accepted contracts', icon: CreditCard, href: '/dashboard/freelancer/active', color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
    ];

    // 1. Chart: Monthly Earnings / Bid Activity Velocity
    const monthlyEarnings = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Fill in last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = monthNames[d.getMonth()];
        monthlyEarnings[label] = 0;
    }

    // Accumulate budget of submitted proposals or accepted proposals (we will show bid activity)
    proposals.forEach(p => {
        if (!p.submittedAt) return;
        const d = new Date(p.submittedAt);
        const label = monthNames[d.getMonth()];
        if (monthlyEarnings[label] !== undefined) {
            monthlyEarnings[label] += (p.proposedBudget || 0);
        }
    });

    const chartLabels = Object.keys(monthlyEarnings);
    const chartValues = Object.values(monthlyEarnings);
    const maxVal = Math.max(...chartValues, 500); // minimal vertical scale

    const chartHeight = 150;
    const chartWidth = 500;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 20;

    const graphWidth = chartWidth - paddingLeft - paddingRight;
    const graphHeight = chartHeight - paddingTop - paddingBottom;

    const points = chartValues.map((val, idx) => {
        const x = paddingLeft + (idx / (chartValues.length - 1)) * graphWidth;
        const y = paddingTop + graphHeight - (val / maxVal) * graphHeight;
        return { x, y };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = points.length > 0 
        ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + graphHeight} L ${points[0].x} ${paddingTop + graphHeight} Z`
        : '';

    // 2. Proposal Status Ratio Distribution
    const statusCounts = { pending: 0, accepted: 0, rejected: 0 };
    proposals.forEach(p => {
        const status = p.status?.toLowerCase();
        if (status === 'accepted') statusCounts.accepted += 1;
        else if (status === 'rejected') statusCounts.rejected += 1;
        else statusCounts.pending += 1;
    });

    const statusTotals = proposals.length;
    const statusList = [
        { label: 'Accepted Bids', count: statusCounts.accepted, color: '#10b981' },
        { label: 'Pending Response', count: statusCounts.pending, color: '#eab308' },
        { label: 'Declined Applications', count: statusCounts.rejected, color: '#ef4444' }
    ];

    return (
        <div style={{ padding: '32px 24px 60px', maxWidth: 1100, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff' }}>
            {/* Header */}
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                    Welcome back, <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name || 'Freelancer'}</span>!
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    Here's a breakdown of your application velocities and active projects.
                </p>
            </div>

            {error && (
                <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13.5, marginBottom: 24 }}>
                    {error}
                </div>
            )}

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 40 }}>
                {stats.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <Link key={idx} href={item.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.2s',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16,
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,77,0,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon width={20} height={20} style={{ color: item.color }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{item.label}</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{item.value}</div>
                                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)' }}>{item.desc}</div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20, marginBottom: 40 }}>
                {/* Glowing SVG area chart of application values */}
                <div style={{
                    padding: '24px 28px', borderRadius: 20, background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 20
                }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>Bid Pipeline Volume</h3>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Total value of submitted bids over the last 6 months (USD)</span>
                    </div>

                    <div style={{ width: '100%', position: 'relative' }}>
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                            <defs>
                                <linearGradient id="freelancerGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#ff4d00" stopOpacity="0.00" />
                                </linearGradient>
                            </defs>

                            {/* Horizontal lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                const y = paddingTop + ratio * graphHeight;
                                return (
                                    <line key={idx} x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} 
                                          stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 3" />
                                );
                            })}

                            {/* Glow Path */}
                            {areaPath && <path d={areaPath} fill="url(#freelancerGradient)" />}

                            {/* Area Line */}
                            {linePath && <path d={linePath} fill="none" stroke="#ff4d00" strokeWidth="2.5" strokeLinecap="round" 
                                               style={{ filter: 'drop-shadow(0px 0px 6px rgba(255,77,0,0.45))' }} />}

                            {/* Value Markers */}
                            {points.map((p, idx) => (
                                <g key={idx}>
                                    <circle cx={p.x} cy={p.y} r="4" fill="#ff4d00" stroke="#080808" strokeWidth="1.5" />
                                    <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#fff" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                                        {chartValues[idx] > 0 ? `$${chartValues[idx]}` : ''}
                                    </text>
                                </g>
                            ))}

                            {/* X Labels */}
                            {chartLabels.map((lbl, idx) => {
                                const x = paddingLeft + (idx / (chartLabels.length - 1)) * graphWidth;
                                return (
                                    <text key={idx} x={x} y={chartHeight - 4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9.5" fontFamily="monospace">
                                        {lbl}
                                    </text>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* Status breakdown progress indicators */}
                <div style={{
                    padding: '24px 28px', borderRadius: 20, background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 20
                }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>Bid Status Ratios</h3>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Application success metrics for submitted proposals</span>
                    </div>

                    {statusTotals === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>NO APPLICATIONS SUBMITTED YET</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, justifyContent: 'center' }}>
                            {statusList.map((st, idx) => {
                                const percentage = statusTotals > 0 ? Math.round((st.count / statusTotals) * 100) : 0;
                                return (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 12.5 }}>
                                            <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{st.label}</span>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: st.color }}>{st.count} ({percentage}%)</span>
                                        </div>
                                        <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: 99, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${percentage}%`, background: st.color, borderRadius: 99, boxShadow: `0 0 8px ${st.color}` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section: Recent Applications & Dashboard Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                {/* Recent proposals submitted */}
                <div style={{
                    padding: '24px 28px', borderRadius: 20, background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.06)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Recent Bids Sent</h3>
                        <Link href="/dashboard/freelancer/proposals" style={{ fontSize: 12, fontWeight: 700, color: '#ff4d00', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            View all <ArrowRight width={12} height={12} />
                        </Link>
                    </div>

                    {proposals.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12.5, fontFamily: 'monospace' }}>
                            You have not submitted any proposals yet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {proposals.slice(0, 3).map((proposal, idx) => {
                                const isAccepted = proposal.status?.toLowerCase() === 'accepted';
                                const isRejected = proposal.status?.toLowerCase() === 'rejected';
                                let badgeColor = '#ff4d00';
                                if (isAccepted) badgeColor = '#10b981';
                                else if (isRejected) badgeColor = '#ef4444';

                                return (
                                    <div key={proposal._id || idx} style={{
                                        padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.015)',
                                        border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {proposal.taskTitle || 'Untitled Task'}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Clock width={10} height={10} /> Bid: {proposal.estimatedDays} days
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: '#ff4d00', marginBottom: 3 }}>
                                                ${proposal.proposedBudget} USD
                                            </div>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                                                fontFamily: 'monospace', color: badgeColor
                                            }}>
                                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: badgeColor }} />
                                                {proposal.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Dashboard Recommendations / Action Board */}
                <div style={{
                    padding: '24px 28px', borderRadius: 20, background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 20
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Freelancer Actions</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'center' }}>
                        {[
                            { label: 'Browse New Projects', desc: 'Find open tasks and pitch your rates', href: '/dashboard/freelancer/browse' },
                            { label: 'Review Sent Proposals', desc: 'Check proposal statuses & response rates', href: '/dashboard/freelancer/proposals' },
                            { label: 'Track Active Contracts', desc: 'Manage works currently in progress', href: '/dashboard/freelancer/active' }
                        ].map((act, idx) => (
                            <Link key={idx} href={act.href} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)',
                                    background: 'rgba(255,77,0,0.02)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,77,0,0.3)'; e.currentTarget.style.background = 'rgba(255,77,0,0.05)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,77,0,0.02)'; }}
                                >
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{act.label}</div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{act.desc}</div>
                                    </div>
                                    <ArrowRight width={14} height={14} style={{ color: '#ff4d00' }} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}