'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { CreditCard, Briefcase, Magnifier, CircleDollar, ArrowLeft } from '@gravity-ui/icons';
import Link from 'next/link';
import { motion } from 'framer-motion';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function FreelancerEarningsPage() {
    const { data: session, isPending: sessionPending } = useSession();
    const [earnings, setEarnings] = useState([]);
    const [stats, setStats] = useState({ totalEarnings: 0, completedCount: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'amount-desc', 'amount-asc'

    const fetchEarningsData = async () => {
        if (!session?.user?.email) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const email = session.user.email.toLowerCase().trim();
            
            // Fetch proposals and tasks in parallel
            const [propsRes, tasksRes] = await Promise.all([
                fetch(`${BASE_URL}/api/proposals?email=${email}`),
                fetch(`${BASE_URL}/api/tasks`)
            ]);
            
            if (propsRes.ok && tasksRes.ok) {
                const proposals = await propsRes.json();
                const tasks = await tasksRes.json();
                
                const acceptedProposals = proposals.filter(p => 
                    p.freelancerEmail?.toLowerCase() === email && 
                    p.status?.toLowerCase() === 'accepted'
                );
                
                const earningsList = [];
                let total = 0;
                
                for (const prop of acceptedProposals) {
                    const task = tasks.find(t => t._id === prop.taskId);
                    if (task && task.status?.toLowerCase() === 'completed') {
                        const amount = Number(prop.proposedBudget) || Number(task.budget) || 0;
                        earningsList.push({
                            _id: task._id,
                            taskTitle: task.title,
                            clientName: task.clientName || 'Client',
                            amountMade: amount,
                            completionDate: task.completedAt || task.updatedAt || prop.submittedAt || new Date()
                        });
                        total += amount;
                    }
                }
                
                earningsList.sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate));
                
                setEarnings(earningsList);
                setStats({
                    totalEarnings: total,
                    completedCount: earningsList.length
                });
                setError('');
            } else {
                throw new Error('Failed to retrieve proposals or tasks from server.');
            }
        } catch (err) {
            console.error("Error fetching earnings data:", err);
            setError(err.message || 'Error loading earnings statement. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sessionPending) return;
        fetchEarningsData();
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
                    RETRIEVING STATEMENT
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!session) {
        return (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#fff' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Access Denied</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Please sign in to view your earnings statement.</p>
                <Link href="/auth/login" style={{
                    padding: '10px 20px', borderRadius: 8, background: '#ff4d00', color: '#fff', fontWeight: 600, textDecoration: 'none'
                }}>Sign In</Link>
            </div>
        );
    }

    // Filter and Sort earnings
    const filteredEarnings = earnings
        .filter(item => {
            const query = searchQuery.toLowerCase();
            return (
                (item.taskTitle || '').toLowerCase().includes(query) ||
                (item.clientName || '').toLowerCase().includes(query)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'date-desc') {
                return new Date(b.completionDate) - new Date(a.completionDate);
            }
            if (sortBy === 'date-asc') {
                return new Date(a.completionDate) - new Date(b.completionDate);
            }
            if (sortBy === 'amount-desc') {
                return b.amountMade - a.amountMade;
            }
            if (sortBy === 'amount-asc') {
                return a.amountMade - b.amountMade;
            }
            return 0;
        });

    const averageEarning = stats.completedCount > 0 ? Math.round(stats.totalEarnings / stats.completedCount) : 0;

    const cards = [
        { label: 'Total Earnings', value: `$${stats.totalEarnings.toLocaleString()}`, desc: 'Net revenue cleared', icon: CreditCard, color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
        { label: 'Completed Gigs', value: `${stats.completedCount}`, desc: 'Total payouts processed', icon: Briefcase, color: '#06b6d4', bg: 'rgba(6,182,212,0.06)' },
        { label: 'Avg. Payout size', value: `$${averageEarning.toLocaleString()}`, desc: 'Average earnings per job', icon: CircleDollar, color: '#ff4d00', bg: 'rgba(255,77,0,0.06)' }
    ];

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="dash-page-container">
            <style>{`
                @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
                
                .earnings-card {
                    padding: 24px; border-radius: 16px; background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.07); transition: all 0.2s;
                    display: flex; flex-direction: column; gap: 16px;
                }
                .earnings-card:hover {
                    border-color: rgba(255,77,0,0.3); transform: translateY(-2px);
                }

                .earnings-input {
                    padding: 10px 14px; border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.09);
                    background: rgba(255,255,255,0.04); color: #fff;
                    outline: none; font-size: 13.5px; transition: border 0.2s;
                    min-width: 140px; box-sizing: border-box;
                }
                .earnings-input:focus { border-color: #ff4d00; background: rgba(255,77,0,0.04); }

                select.earnings-input {
                    appearance: none; cursor: pointer;
                    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.35)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                    background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
                }
                select.earnings-input option { background: #111; color: #fff; }

                .table-container {
                    width: 100%; overflow-x: auto;
                    background: rgba(255,255,255,0.015);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px;
                }
                
                .earnings-table {
                    width: 100%; border-collapse: collapse; text-align: left;
                    font-size: 13.5px;
                }
                
                .earnings-table th {
                    padding: 14px 18px;
                    font-size: 10.5px; font-weight: 700;
                    letter-spacing: 0.12em; text-transform: uppercase;
                    color: rgba(255,255,255,0.35);
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                    font-family: monospace;
                }

                .earnings-table td {
                    padding: 16px 18px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    color: rgba(255,255,255,0.8);
                }

                .earnings-table tr:last-child td {
                    border-bottom: none;
                }

                .earnings-table tr {
                    transition: background 0.18s;
                }

                .earnings-table tr:hover td {
                    background: rgba(255,77,0,0.015);
                    color: #fff;
                }
                @media(max-width: 640px) {
                    .earnings-filter-row { flex-direction: column !important; align-items: stretch !important; }
                    .earnings-input { width: 100% !important; }
                }
            `}</style>

            {/* Ambient Glow */}
            <div style={{
                pointerEvents: 'none', position: 'fixed', top: 0, left: '50%',
                transform: 'translateX(-50%)', width: '80vw', height: '40vh', zIndex: 0,
                background: 'radial-gradient(ellipse at 50% 0%,rgba(255,77,0,0.06) 0%,transparent 70%)',
                filter: 'blur(40px)',
            }} />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: 'relative', zIndex: 1, marginBottom: 36, display: 'flex', flexDirection: 'column', gap: 12 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link href="/dashboard/freelancer" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)',
                        transition: 'all 0.15s', cursor: 'pointer', textDecoration: 'none'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    >
                        <ArrowLeft width={14} height={14} />
                    </Link>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                        Financial Ledger
                    </span>
                </div>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                        Earnings & Payouts
                    </h1>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        Review your completed contracts, client details, and revenue logs.
                    </p>
                </div>
            </motion.div>

            {error && (
                <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13.5, marginBottom: 24, position: 'relative', zIndex: 1 }}>
                    {error}
                </div>
            )}

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 18, marginBottom: 40, position: 'relative', zIndex: 1 }}>
                {cards.map((c, idx) => {
                    const Icon = c.icon;
                    return (
                        <motion.div
                            key={idx}
                            className="earnings-card"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.08 }}
                            whileHover={{ y: -3, borderColor: 'rgba(255,77,0,0.3)', boxShadow: '0 8px 30px rgba(255,77,0,0.06)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>
                                    {c.label}
                                </span>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon width={16} height={16} style={{ color: c.color }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: c.color, marginBottom: 2, fontFamily: "'JetBrains Mono',monospace" }}>
                                    {c.value}
                                </div>
                                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>
                                    {c.desc}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Table & Filter Section */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Filters */}
                <div
                    className="earnings-filter-row"
                    style={{
                        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
                        background: 'rgba(255,255,255,0.012)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 16, padding: 16
                    }}
                >
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
                            <Magnifier width={14} height={14} />
                        </span>
                        <input
                            type="text"
                            placeholder="Filter by task title or client name…"
                            className="earnings-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: 38, width: '100%' }}
                        />
                    </div>

                    {/* Sort */}
                    <select
                        className="earnings-input"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        style={{ minWidth: 180 }}
                    >
                        <option value="date-desc">Newest Finished</option>
                        <option value="date-asc">Oldest Finished</option>
                        <option value="amount-desc">Highest Earning</option>
                        <option value="amount-asc">Lowest Earning</option>
                    </select>
                </div>

                {/* Earnings List */}
                <div className="table-container">
                    {filteredEarnings.length === 0 ? (
                        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,77,0,0.06)', border: '1px solid rgba(255,77,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <CreditCard width={20} height={20} style={{ color: '#ff4d00' }} />
                            </div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>No completed earnings found</h3>
                            <p style={{ fontSize: 12.5, margin: 0 }}>
                                {searchQuery ? 'Adjust your search parameters and try again.' : 'Completed gigs and client payouts will appear here.'}
                            </p>
                        </div>
                    ) : (
                        <table className="earnings-table">
                            <thead>
                                <tr>
                                    <th>Task Title</th>
                                    <th>Client Name</th>
                                    <th style={{ textAlign: 'right' }}>Amount Made</th>
                                    <th style={{ textAlign: 'right' }}>Completion Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEarnings.map((item, idx) => (
                                    <motion.tr
                                        key={item._id || idx}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.04 }}
                                    >
                                        <td style={{ fontWeight: 700, color: '#fff' }}>
                                            {item.taskTitle}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#ff7300' }}>
                                                    {(item.clientName || 'C').charAt(0).toUpperCase()}
                                                </div>
                                                {item.clientName}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#10b981', fontFamily: "'JetBrains Mono',monospace" }}>
                                            ${item.amountMade.toLocaleString()} USD
                                        </td>
                                        <td style={{ textAlign: 'right', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                                            {formatDate(item.completionDate)}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
