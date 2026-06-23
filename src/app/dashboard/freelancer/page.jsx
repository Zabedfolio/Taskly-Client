'use client';

import React from 'react';
import { useSession } from '@/lib/auth-client';
import { Briefcase, Magnifier, FileText, CreditCard } from '@gravity-ui/icons';
import Link from 'next/link';

export default function FreelancerDashboardHomePage() {
    const { data: session } = useSession();
    const user = session?.user;

    const stats = [
        { label: 'Browse Jobs', value: 'Find Work', icon: Magnifier, href: '/dashboard/freelancer/browse', color: '#ff4d00', bg: 'rgba(255,77,0,0.06)' },
        { label: 'My Proposals', value: '0 Submitted', icon: FileText, href: '/dashboard/freelancer/proposals', color: '#ff4d00', bg: 'rgba(255,77,0,0.06)' },
        { label: 'Active Work', value: '0 Active', icon: Briefcase, href: '/dashboard/freelancer/active', color: '#ff4d00', bg: 'rgba(255,77,0,0.06)' },
        { label: 'Total Earnings', value: '$0.00', icon: CreditCard, href: '/dashboard/freelancer/earnings', color: '#ff4d00', bg: 'rgba(255,77,0,0.06)' },
    ];

    return (
        <div style={{ padding: '32px 24px 60px', maxWidth: 1100, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff' }}>
            {/* Header */}
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                    Welcome back, <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name || 'Freelancer'}</span>!
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    Here's a quick look at your profile and recent activity.
                </p>
            </div>

            {/* Quick Actions / Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 40 }}>
                {stats.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
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
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{item.value}</div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Main Section */}
            <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '40px 32px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, margin: '0 auto 20px', background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase width={26} height={26} style={{ color: '#ff4d00' }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Find your next project</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', margin: '0 auto 24px', maxWidth: 440, lineHeight: 1.6 }}>
                    Browse through latest open tasks posted by verified clients, select your preferred niche, and pitch your proposals directly.
                </p>
                <Link href="/dashboard/freelancer/browse" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 11,
                    background: 'linear-gradient(135deg, #ff4d00, #cc3d00)', color: '#fff', fontSize: 13.5, fontWeight: 700,
                    textDecoration: 'none', boxShadow: '0 0 16px rgba(255,77,0,0.25)', transition: 'all 0.18s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 26px rgba(255,77,0,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(255,77,0,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    <Magnifier width={15} height={15} /> Go to Job Board
                </Link>
            </div>
        </div>
    );
}