'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';

import { getMyProposals } from '@/lib/api/freelancer/getMyProposals';

import { FileText, Calendar, Clock, ArrowLeft, Magnifier, CircleDollar } from '@gravity-ui/icons';
import Link from 'next/link';

export default function MyProposalsPage() {
    const { data: session, isPending: sessionPending } = useSession();
    const  [proposals, setProposals] = useState([]);
    const  [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;
    const totalPages = Math.ceil(proposals.length / limit) || 1;
    const paginatedProposals = proposals.slice((currentPage - 1) * limit, currentPage * limit);

    useEffect(() => {
        if (sessionPending) return;
        
          if (!session?.session?.token) {

            setLoading(false);
            return;
        }

        async function fetchProposals() {
            try {

                setLoading(true);
                const  data = await getMyProposals(session.user.email);
                setProposals(data);
                setCurrentPage(1);
                setError('');
            } catch (err) {
                console.error("Error fetching proposals:", err);

                setError(err.message || 'Failed to load proposals.');

            } finally {
                setLoading(false);
            }
        }

        fetchProposals();
    }, [session, sessionPending]);

    if (sessionPending || (loading && proposals.length === 0)) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                       border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00',
                    animation: 'spin 0.75s linear infinite',
                }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                    LOADING PROPOSALS

                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!session) {
        return   (

            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#fff' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Access Denied</h3>
                   <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Please sign in to view your proposals.</p>
                 <Link href="/auth/login" style={{
                    padding: '10px 20px', borderRadius: 8, background: '#ff4d00', color: '#fff', fontWeight: 600, textDecoration: 'none'
                }}>Sign In</Link>
            </div>
        );
      }

    

    const totalBids = proposals.length;
    const pendingBids = proposals.filter(p => p.status === 'pending').length;
    const acceptedBids = proposals.filter(p => p.status === 'accepted' || p.status === 'Accepted').length;

    const avgBid = totalBids > 0 ? (proposals.reduce((sum, p) => sum + (Number(p.proposedBudget) || 0), 0) / totalBids).toFixed(2) : '0.00';

    return (
        <div className="dash-page-container">
            
            <div style={{ marginBottom: 20 }}>
                <Link href="/dashboard/freelancer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ff4d00'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                    <ArrowLeft width={14} height={14} /> Back to Dashboard
                </Link>
            </div>

            
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                    My <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Proposals</span>
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    Track all applications, bids, and status updates on tasks you applied for.

                </p>
            </div>

            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                    { label: 'Total Bids', value: totalBids, color: '#ff4d00' },
                    { label: 'Pending Bids', value: pendingBids, color: '#eab308' },
                    { label: 'Accepted Bids', value: acceptedBids, color: '#22c55e' },
                    { label: 'Avg Bid Amount', value: `$${avgBid}`, color: '#a855f7' }
                ].map((stat, idx) => (
                    <div key={idx} style={{
                        padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.015)',
                        border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 6
                    }}>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                            {stat.label}
                        </span>
                        <span style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>
                            {stat.value}
                        </span>
                    </div>
                ))}
            </div>

            {error && (
                <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13.5, marginBottom: 24 }}>
                    {error}
                </div>
             )}

            
            {proposals.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px', background: 'rgba(255,77,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText width={24} height={24} style={{ color: '#ff4d00' }} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No proposals sent yet</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', margin: '0 auto 24px', maxWidth: 400, lineHeight: 1.6 }}>
                        You haven't submitted any applications yet. Go browse tasks to submit your first proposal.
                    </p>
                    <Link href="/dashboard/freelancer/browse" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 11,
                        background: 'linear-gradient(135deg, #ff4d00, #cc3d00)', color: '#fff', fontSize: 13.5, fontWeight: 700,
                        textDecoration: 'none', boxShadow: '0 0 16px rgba(255,77,0,0.25)', transition: 'all 0.18s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 26px rgba(255,77,0,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(255,77,0,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}

                    >
                        <Magnifier width={14} height={14} /> Browse Tasks
                    </Link>
                </div>
            ) : (
                <div style={{
                    background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20, overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 650 }}>

                             <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Task Title</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Budget Bid</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Estimated Time</th>
                                      <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Date Sent</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Status</th>

                                </tr>
                            </thead>
                            <tbody>
                                 {paginatedProposals.map((proposal, index) => {
                                    const formattedDate = proposal.submittedAt
                                        ? new Date(proposal.submittedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',

                                            year: 'numeric'
                                        })

                                        : 'N/A';

                                    const isAccepted = proposal.status?.toLowerCase() === 'accepted';
                                    const isRejected = proposal.status?.toLowerCase() === 'rejected';
                                    const isPending = !isAccepted && !isRejected;

                                    let badgeColor = '#ff4d00';
                                    let badgeBg = 'rgba(255,77,0,0.06)';
                                    let badgeBorder = 'rgba(255,77,0,0.2)';

                                    let statusText = 'Pending';

                                    if (isAccepted) {
                                          badgeColor = '#22c55e';
                                        badgeBg = 'rgba(34,197,94,0.06)';
                                        badgeBorder = 'rgba(34,197,94,0.2)';
                                           statusText = 'Accepted';
                                    } else if (isRejected) {
                                        badgeColor = '#ef4444';
                                        badgeBg = 'rgba(239,68,68,0.06)';
                                        badgeBorder = 'rgba(239,68,68,0.2)';
                                        statusText = 'Rejected';
                                    }

                                    return (
                                        <tr key={proposal._id || index} style={{
                                            borderBottom: index < paginatedProposals.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                            transition: 'background 0.2s',
                                        }}

                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {/* Task Title */}
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    <span style={{ fontSize: 14.5, fontWeight: 700, color: '#fff' }}>
                                                        {proposal.taskTitle || 'Untitled Task'}
                                                    </span>
                                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                                                        ID: {proposal.taskId}
                                                    </span>
                                                </div>

                                            </td>

                                            {/* Budget Bid */}
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <CircleDollar width={14} height={14} style={{ color: '#ff4d00' }} />
                                                    <span style={{ fontSize: 14.5, fontWeight: 800, color: '#fff' }}>
                                                        {Number(proposal.proposedBudget || 0).toLocaleString()} USD
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Estimated Time */}
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)' }}>
                                                    <Clock width={14} height={14} />
                                                    <span style={{ fontSize: 13.5 }}>
                                                        {proposal.estimatedDays} {proposal.estimatedDays === 1 ? 'day' : 'days'}

                                                    </span>
                                                </div>
                                            </td>

                                               {/* Date Sent */}
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)' }}>
                                                    <Calendar width={14} height={14} />
                                                    <span style={{ fontSize: 13.5 }}>{formattedDate}</span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td style={{ padding: '20px 24px' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    padding: '4px 10px', borderRadius: 99, fontSize: 11,

                                                    fontWeight: 700, textTransform: 'uppercase', fontFamily: 'monospace',
                                                    color: badgeColor, background: badgeBg, border: `1px solid ${badgeBorder}`
                                                }}>
                                                    <span style={{
                                                        width: 5, height: 5, borderRadius: '50%',
                                                        background: badgeColor, display: 'inline-block'
                                                    }} />
                                                    {statusText}
                                                   </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 16,
                            padding: '16px 24px',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            background: 'rgba(255,255,255,0.01)',
                        }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: currentPage === 1 ? 'transparent' : 'rgba(255,77,0,0.08)',
                                    color: currentPage === 1 ? 'rgba(255,255,255,0.25)' : '#ff4d00',
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                Previous
                            </button>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: currentPage === totalPages ? 'transparent' : 'rgba(255,77,0,0.08)',
                                    color: currentPage === totalPages ? 'rgba(255,255,255,0.25)' : '#ff4d00',
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
