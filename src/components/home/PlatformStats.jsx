'use client';

import React, { useState, useEffect } from 'react';
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

    return (
        <section style={{ padding: '80px 24px', background: 'radial-gradient(circle at 50% 50%, rgba(255,77,0,0.02) 0%, transparent 70%)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                    <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 12px', color: '#fff' }}>
                        Platform <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Statistics</span>
                    </h2>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
                        Real-time tracking of our community, task throughput, and total freelancer earnings completed.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                    
                    {/* Card 1: Total Tasks Posted */}
                    <div style={{
                        background: 'rgba(255,255,255,0.015)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 28,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        height: 380,
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,77,0,0.3)'; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        {/* Graphic Area */}
                        <div style={{
                            height: 180,
                            position: 'relative',
                            background: 'rgba(255,255,255,0.01)',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {/* Sparkline line graph */}
                            <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#ff4d00" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d={tasksGrowth 
                                        ? "M-10,130 Q50,90 100,105 T200,60 T300,30 T400,5" 
                                        : "M-10,120 Q50,118 100,120 T200,118 T300,122 T400,120"
                                    }
                                    fill="none"
                                    stroke="#ff4d00"
                                    strokeWidth="3"
                                    style={{ transition: 'd 0.5s ease-in-out' }}
                                />
                                <path
                                    d={tasksGrowth 
                                        ? "M-10,130 Q50,90 100,105 T200,60 T300,30 T400,5 L400,180 L-10,180 Z" 
                                        : "M-10,120 Q50,118 100,120 T200,118 T300,122 T400,120 L400,180 L-10,180 Z"
                                    }
                                    fill="url(#tasksGradient)"
                                    style={{ transition: 'd 0.5s ease-in-out' }}
                                />
                            </svg>

                            {/* Small floating badge */}
                            <div style={{
                                position: 'absolute',
                                top: 20,
                                right: 24,
                                padding: '4px 10px',
                                borderRadius: 12,
                                background: 'rgba(255,77,0,0.08)',
                                border: '1px solid rgba(255,77,0,0.2)',
                                fontSize: 10.5,
                                fontWeight: 800,
                                color: '#ff4d00',
                                fontFamily: 'monospace',
                                letterSpacing: '0.05em'
                            }}>
                                + 160%
                            </div>

                            {/* Floating Glass Card */}
                            <div style={{
                                padding: '14px 18px',
                                borderRadius: 16,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                            }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                                    Turn on <span style={{ color: '#ff4d00' }}>Growth</span>
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
                        </div>

                        {/* Content Area */}
                        <div style={{ padding: '24px 28px', textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Total Tasks Posted</h3>
                            <div style={{ fontSize: 36, fontWeight: 900, color: '#ff4d00', margin: '4px 0 8px', fontFamily: "'Outfit', sans-serif" }}>
                                {loading ? '…' : stats.totalTasks.toLocaleString()}
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                                Active marketplace tasks currently open and completed by global clients.
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Total Platform Users */}
                    <div style={{
                        background: 'rgba(255,255,255,0.015)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 28,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        height: 380,
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)'; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        {/* Graphic Area */}
                        <div style={{
                            height: 180,
                            position: 'relative',
                            background: 'rgba(255,255,255,0.01)',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {/* Grid layout mockup in background */}
                            <div style={{
                                position: 'absolute',
                                width: '120%',
                                height: '120%',
                                opacity: 0.1,
                                background: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
                                backgroundSize: '16px 16px',
                                transform: 'rotate(-5deg)'
                            }} />

                            {/* Floating User Growth Progress card */}
                            <div style={{
                                padding: '20px 24px',
                                borderRadius: 20,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                                width: '75%',
                                textAlign: 'center',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                            }}>
                                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                                    200%
                                </div>
                                <div style={{ height: 10, width: '100%', borderRadius: 10, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '82%' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        style={{
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #ff4d00, #ff8c42)',
                                            boxShadow: '0 0 8px rgba(255,77,0,0.5)',
                                            borderRadius: 10,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div style={{ padding: '24px 28px', textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Total Platform Users</h3>
                            <div style={{ fontSize: 36, fontWeight: 900, color: '#a855f7', margin: '4px 0 8px', fontFamily: "'Outfit', sans-serif" }}>
                                {loading ? '…' : stats.totalUsers.toLocaleString()}
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                                Registered freelancers, administrators, and client profiles active MoM.
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Total Payout Completed */}
                    <div style={{
                        background: 'rgba(255,255,255,0.015)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 28,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        height: 380,
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        {/* Graphic Area */}
                        <div style={{
                            height: 180,
                            position: 'relative',
                            background: 'rgba(255,255,255,0.01)',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            overflow: 'hidden',
                            paddingBottom: 16
                        }}>
                            {/* Dual-line wave chart */}
                            <div style={{ height: 100, width: '100%', position: 'relative' }}>
                                <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                    <defs>
                                        <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M0,75 Q25,60 50,70 T100,45 T150,55 T200,35 T250,40 T320,20"
                                        fill="none"
                                        stroke="rgba(255,77,0,0.3)"
                                        strokeWidth="1.5"
                                        strokeDasharray="4 4"
                                    />
                                    <path
                                        d="M0,60 Q25,45 50,55 T100,30 T150,40 T200,20 T250,25 T320,5"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M0,60 Q25,45 50,55 T100,30 T150,40 T200,20 T250,25 T320,5 L320,100 L0,100 Z"
                                        fill="url(#payoutGradient)"
                                    />
                                </svg>
                            </div>
                            {/* Months label */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0 24px',
                                marginTop: 8,
                                fontSize: 10,
                                color: 'rgba(255,255,255,0.3)',
                                fontFamily: 'monospace',
                                letterSpacing: '0.05em'
                            }}>
                                <span>Feb</span>
                                <span>Mar</span>
                                <span>Apr</span>
                                <span>May</span>
                                <span>Jun</span>
                                <span>Jul</span>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div style={{ padding: '24px 28px', textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Total Payout Completed</h3>
                            <div style={{ fontSize: 36, fontWeight: 900, color: '#10b981', margin: '4px 0 8px', fontFamily: "'Outfit', sans-serif" }}>
                                {loading ? '…' : `$${stats.totalPayout.toLocaleString()}`}
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                                Total value of payout transactions successfully cleared for freelancers.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
