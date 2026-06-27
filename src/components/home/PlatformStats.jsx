'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Persons, CircleDollar } from '@gravity-ui/icons';
import { motion } from 'framer-motion';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://taskly-server-zabedfolio.vercel.app';

export default function PlatformStats() {
    const [stats, setStats] = useState({ totalTasks: 0, totalUsers: 0, totalPayout: 0 });
    const [loading, setLoading] = useState(true);
    const [tasksGrowth, setTasksGrowth] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch(`${BASE_URL}/api/platform-stats`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Error fetching platform stats:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const cards = [
        {
            label: 'Total Tasks Posted',
            value: stats.totalTasks.toLocaleString(),
            icon: Briefcase,
            color: '#ff4d00',
            bg: 'rgba(255,77,0,0.06)',
            border: 'rgba(255,77,0,0.15)',
        },
        {
            label: 'Total Platform Users',
            value: stats.totalUsers.toLocaleString(),
            icon: Persons,
            color: '#a855f7',
            bg: 'rgba(168,85,247,0.06)',
            border: 'rgba(168,85,247,0.15)',
        },
        {
            label: 'Total Payout Completed',
            value: `$${stats.totalPayout.toLocaleString()}`,
            icon: CircleDollar,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.06)',
            border: 'rgba(16,185,129,0.15)',
        }
    ];

    return (
        <section style={{ padding: '80px 24px', background: 'radial-gradient(circle at 50% 50%, rgba(255,77,0,0.02) 0%, transparent 70%)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 12px', color: '#fff' }}>
                        Platform <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Statistics</span>
                    </h2>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
                        Real-time tracking of our community, task throughput, and total freelancer earnings completed.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                    {cards.map((card, idx) => {
                        const IconComponent = card.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                style={{
                                    background: 'rgba(255,255,255,0.01)',
                                    border: `1px solid ${card.border}`,
                                    borderRadius: 24,
                                    padding: '32px 28px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 4,
                                    background: `linear-gradient(90deg, ${card.color}, transparent)`,
                                }} />

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {card.label}
                                    </span>
                                    {idx === 0 ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 10.5, fontWeight: 700, color: tasksGrowth ? '#ff4d00' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Growth
                                            </span>
                                            <div
                                                onClick={() => setTasksGrowth(!tasksGrowth)}
                                                style={{
                                                    width: 32,
                                                    height: 18,
                                                    borderRadius: 10,
                                                    background: tasksGrowth ? '#ff4d00' : 'rgba(255,255,255,0.1)',
                                                    position: 'relative',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s',
                                                }}
                                            >
                                                <div style={{
                                                    width: 14,
                                                    height: 14,
                                                    borderRadius: '50%',
                                                    background: '#fff',
                                                    position: 'absolute',
                                                    top: 2,
                                                    left: tasksGrowth ? 16 : 2,
                                                    transition: 'left 0.2s',
                                                }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 14,
                                            background: card.bg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: card.color,
                                            border: `1px solid ${card.border}`,
                                        }}>
                                            <IconComponent width={18} height={18} />
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                    <span style={{
                                        fontSize: 42,
                                        fontWeight: 900,
                                        color: '#fff',
                                        letterSpacing: '-0.02em',
                                        fontFamily: "'Outfit', sans-serif",
                                    }}>
                                        {loading ? '…' : card.value}
                                    </span>
                                </div>

                                {/* Custom Visual Charts matching the reference UI */}
                                {idx === 0 && (
                                    <div style={{ marginTop: 24, position: 'relative', height: 60 }}>
                                        <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                            <defs>
                                                <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.2" />
                                                    <stop offset="100%" stopColor="#ff4d00" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d={tasksGrowth 
                                                    ? "M0,50 Q40,48 80,38 T160,25 T240,10 T320,2" 
                                                    : "M0,45 Q40,43 80,44 T160,45 T240,46 T320,44"
                                                }
                                                fill="none"
                                                stroke="#ff4d00"
                                                strokeWidth="2.5"
                                                style={{ transition: 'd 0.5s ease-in-out' }}
                                            />
                                            <path
                                                d={tasksGrowth 
                                                    ? "M0,50 Q40,48 80,38 T160,25 T240,10 T320,2 L320,60 L0,60 Z" 
                                                    : "M0,45 Q40,43 80,44 T160,45 T240,46 T320,44 L320,60 L0,60 Z"
                                                }
                                                fill="url(#tasksGradient)"
                                                style={{ transition: 'd 0.5s ease-in-out' }}
                                            />
                                        </svg>
                                    </div>
                                )}

                                {idx === 1 && (
                                    <div style={{ marginTop: 24 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#a855f7' }}>200% Growth Rate</span>
                                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>Active Signups</span>
                                        </div>
                                        <div style={{ height: 10, width: '100%', borderRadius: 10, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '82%' }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                style={{
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                                                    boxShadow: '0 0 8px rgba(168,85,247,0.5)',
                                                    borderRadius: 10,
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Signups verified and active MoM</span>
                                        </div>
                                    </div>
                                )}

                                {idx === 2 && (
                                    <div style={{ marginTop: 24, position: 'relative' }}>
                                        <div style={{ height: 60, width: '100%', position: 'relative' }}>
                                            <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                                <defs>
                                                    <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                <path
                                                    d="M0,50 Q25,35 50,45 T100,20 T150,30 T200,10 T250,15 T320,2"
                                                    fill="none"
                                                    stroke="#10b981"
                                                    strokeWidth="2.5"
                                                />
                                                <path
                                                    d="M0,50 Q25,35 50,45 T100,20 T150,30 T200,10 T250,15 T320,2 L320,60 L0,60 Z"
                                                    fill="url(#payoutGradient)"
                                                />
                                            </svg>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: 6,
                                            padding: '0 4px',
                                            fontSize: 9.5,
                                            color: 'rgba(255,255,255,0.3)',
                                            fontFamily: 'monospace',
                                            letterSpacing: '0.05em'
                                        }}>
                                            <span>FEB</span>
                                            <span>MAR</span>
                                            <span>APR</span>
                                            <span>MAY</span>
                                            <span>JUN</span>
                                            <span>JUL</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
