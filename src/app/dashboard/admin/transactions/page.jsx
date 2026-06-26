'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getAdminTransactions } from '@/lib/api/admin/adminApi';
import { CreditCard, ArrowLeft, CircleDollar, CircleCheck, CircleExclamation, Clock } from '@gravity-ui/icons';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminTransactionsPage() {
    const { data: session, isPending } = useSession();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isPending) return;
        if (!session?.session?.token) {
            setLoading(false);
            return;
        }

        async function load() {
            try {
                const data = await getAdminTransactions(session.session.token);
                setTransactions(data || []);
            } catch (err) {
                console.error(err);
                toast.error(err.message || 'Failed to load transaction history.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [session, isPending]);

    if (isPending || loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00', animation: 'spin 0.75s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>LOADING TRANSACTIONS</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Stats calculations
    const successfulTx = transactions.filter(t => t.paymentStatus === 'succeeded');
    const totalVolume = successfulTx.reduce((sum, t) => sum + (t.payoutSize || 0), 0);
    const processingTx = transactions.filter(t => t.paymentStatus === 'processing');
    const failedTx = transactions.filter(t => t.paymentStatus === 'failed');

    const statusColors = {
        succeeded: { color: '#22c55e', bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.2)' },
        processing: { color: '#eab308', bg: 'rgba(234,179,8,0.06)', border: 'rgba(234,179,8,0.2)' },
        failed: { color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)' },
    };

    return (
        <div className="dash-page-container">


            <div style={{ marginBottom: 20 }}>
                <Link href="/dashboard/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff4d00'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                    <ArrowLeft width={14} height={14} /> Back to Dashboard
                </Link>
            </div>

            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                    Transactions <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>History</span>
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    Overview of all payments processed via Stripe Integration on the platform.
                </p>
            </div>

            {/* Metrics cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                    { label: 'Total Volume', value: `$${totalVolume.toLocaleString()} USD`, color: '#ff4d00', icon: CircleDollar },
                    { label: 'Successful Payments', value: successfulTx.length, color: '#22c55e', icon: CircleCheck },
                    { label: 'Processing', value: processingTx.length, color: '#eab308', icon: Clock },
                    { label: 'Failed Payments', value: failedTx.length, color: '#ef4444', icon: CircleExclamation },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} style={{
                            padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.015)',
                            border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 8
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                                    {stat.label}
                                </span>
                                <Icon width={14} height={14} style={{ color: stat.color }} />
                            </div>
                            <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>
                                {stat.value}
                            </span>
                        </div>
                    );
                })}
            </div>

            {transactions.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                    <CreditCard width={24} height={24} style={{ color: '#ff4d00', marginBottom: 12 }} />
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No transactions recorded</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)' }}>There are no processed payments on the platform yet.</p>
                </div>
            ) : (
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Client Email</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Freelancer Email</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Payout Size</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Payment Date</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>Payment Status Label</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx, idx) => {
                                    const st = statusColors[tx.paymentStatus] || { color: '#fff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
                                    const formattedDate = tx.paymentDate
                                        ? new Date(tx.paymentDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : 'N/A';

                                    return (
                                        <tr key={tx._id || idx} style={{
                                            borderBottom: idx < transactions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                            transition: 'background 0.2s',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '18px 24px', fontSize: 13.5, fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
                                                {tx.clientEmail}
                                            </td>
                                            <td style={{ padding: '18px 24px', fontSize: 13.5, color: 'rgba(255,255,255,0.8)' }}>
                                                {tx.freelancerEmail}
                                            </td>
                                            <td style={{ padding: '18px 24px', fontSize: 14, fontWeight: 800, color: '#ff4d00' }}>
                                                ${tx.payoutSize || 0} USD
                                            </td>
                                            <td style={{ padding: '18px 24px', fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>
                                                {formattedDate}
                                            </td>
                                            <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99,
                                                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace',
                                                    color: st.color, background: st.bg, border: `1px solid ${st.border}`
                                                }}>
                                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.color }} />
                                                    {tx.paymentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
