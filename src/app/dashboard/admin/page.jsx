'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getAdminTransactions, getAllUsers, getAllTasks } from '@/lib/api/admin/adminApi';
import { Persons, Briefcase, CircleDollar, ChartBar, ArrowRight } from '@gravity-ui/icons';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
    const { data: session, isPending } = useSession();
    const [payments, setPayments] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isPending) return;
        if (!session?.session?.token) {
            setLoading(false);
            return;
        }
        async function load() {
            try {
                const token = session.session.token;
                const [paymentsData, tasksData, usersData] = await Promise.all([
                    getAdminTransactions(token),
                    getAllTasks(),
                    getAllUsers(token)
                ]);
                setPayments(paymentsData || []);
                setTasks(tasksData || []);
                setUsers(usersData || []);
            } catch (err) {
                console.error("Admin load error:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [session, isPending]);

    if (isPending || loading) {
        return (
            <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00', animation: 'spin 0.75s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>LOADING ADMIN CONSOLE</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const user = session?.user;
    const totalUsers = users.length;
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(t => t.status === 'open').length;
    const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.payoutSize) || 0), 0);

    // Role distribution for donut chart
    const clientCount = users.filter(u => u.role === 'client').length;
    const freelancerCount = users.filter(u => u.role === 'freelancer').length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const blockedCount = users.filter(u => u.isBlocked).length;

    // Tasks by category
    const categoryCounts = {};
    tasks.forEach(t => {
        if (t.category) categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const catColors = ['#ff4d00', '#a855f7', '#06b6d4', '#10b981', '#eab308'];

    // Monthly task creation chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTasks = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        monthlyTasks[monthNames[d.getMonth()]] = 0;
    }
    tasks.forEach(t => {
        if (!t.createdAt) return;
        const d = new Date(t.createdAt);
        const label = monthNames[d.getMonth()];
        if (monthlyTasks[label] !== undefined) monthlyTasks[label] += 1;
    });

    const chartLabels = Object.keys(monthlyTasks);
    const chartValues = Object.values(monthlyTasks);
    const maxVal = Math.max(...chartValues, 5);
    const barWidth = 36;

    return (
        <div style={{ padding: '32px 24px 60px', maxWidth: 1100, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ marginBottom: 36 }}
            >
                <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                    Admin <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Console</span>
                </h1>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    Platform-wide statistics, user management, and content moderation overview.
                </p>
            </motion.div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 36 }}>
                {[
                    { label: 'Total Users', value: totalUsers, icon: Persons, color: '#ff4d00', bg: 'rgba(255,77,0,0.06)' },
                    { label: 'Total Tasks', value: totalTasks, icon: Briefcase, color: '#a855f7', bg: 'rgba(168,85,247,0.06)' },
                    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: CircleDollar, color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
                    { label: 'Active Tasks', value: activeTasks, icon: ChartBar, color: '#06b6d4', bg: 'rgba(6,182,212,0.06)' },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.08 }}
                            whileHover={{ y: -3, borderColor: 'rgba(255,255,255,0.18)', boxShadow: '0 8px 30px rgba(255,77,0,0.05)' }}
                            style={{
                                padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 14,
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</span>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon width={16} height={16} style={{ color: stat.color }} />
                                </div>
                            </div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{stat.value}</div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 36 }}>
                {/* Bar Chart: Monthly Task Creations */}
                <div style={{
                    padding: '24px 28px', borderRadius: 20, background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 20
                }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>Task Creation Rate</h3>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>New tasks posted per month (last 6 months)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, height: 140, paddingBottom: 20 }}>
                        {chartLabels.map((label, idx) => {
                            const val = chartValues[idx];
                            const height = maxVal > 0 ? Math.max((val / maxVal) * 110, 4) : 4;
                            return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#ff4d00', fontFamily: 'monospace' }}>
                                        {val > 0 ? val : ''}
                                    </span>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height }}
                                        transition={{ duration: 0.6, delay: 0.2 + idx * 0.06, ease: 'easeOut' }}
                                        style={{
                                            width: barWidth, borderRadius: '6px 6px 2px 2px',
                                            background: 'linear-gradient(180deg, #ff4d00 0%, rgba(255,77,0,0.4) 100%)',
                                            boxShadow: val > 0 ? '0 0 12px rgba(255,77,0,0.3)' : 'none',
                                        }}
                                    />
                                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* User Role Distribution + Category Breakdown */}
                <div style={{
                    padding: '24px 28px', borderRadius: 20, background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 20
                }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px' }}>User & Category Breakdown</h3>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Platform composition overview</span>
                    </div>

                    {/* User role pills */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Clients', count: clientCount, color: '#ff4d00' },
                            { label: 'Freelancers', count: freelancerCount, color: '#a855f7' },
                            { label: 'Admins', count: adminCount, color: '#06b6d4' },
                            { label: 'Blocked', count: blockedCount, color: '#ef4444' },
                        ].map((r, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                style={{
                                    padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${r.color}33`, display: 'flex', alignItems: 'center', gap: 8
                                }}
                            >
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.color, boxShadow: `0 0 6px ${r.color}` }} />
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{r.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 800, color: r.color }}>{r.count}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Task Category Bars */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {topCategories.length === 0 ? (
                            <div style={{ padding: 16, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 11 }}>NO TASKS YET</div>
                        ) : topCategories.map(([cat, count], idx) => {
                            const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                            return (
                                <motion.div
                                    key={cat}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                                        <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{cat}</span>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: catColors[idx % catColors.length] }}>{count} ({pct}%)</span>
                                    </div>
                                    <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 99 }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.5, delay: 0.2 + idx * 0.05 }}
                                            style={{ height: '100%', background: catColors[idx % catColors.length], borderRadius: 99, boxShadow: `0 0 6px ${catColors[idx % catColors.length]}` }}
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Nav */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {[
                    { label: 'Manage Users', desc: 'View, block, or unblock platform accounts', href: '/dashboard/admin/users' },
                    { label: 'Manage Tasks', desc: 'Review and moderate all posted tasks', href: '/dashboard/admin/tasks' },
                    { label: 'Transactions', desc: 'View Stripe payment history and status logs', href: '/dashboard/admin/transactions' },
                ].map((act, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <Link href={act.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                padding: '18px 20px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)',
                                background: 'rgba(255,77,0,0.02)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,77,0,0.3)'; e.currentTarget.style.background = 'rgba(255,77,0,0.05)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,77,0,0.02)'; }}
                            >
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{act.label}</div>
                                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>{act.desc}</div>
                                </div>
                                <ArrowRight width={14} height={14} style={{ color: '#ff4d00' }} />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
