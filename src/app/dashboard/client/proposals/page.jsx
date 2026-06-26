'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { getClientProposals } from '@/lib/api/client/getClientProposals';
import { updateProposalStatus } from '@/lib/api/client/updateProposalStatus';
import { createCheckoutSession } from '@/lib/api/client/stripePayments';
import { FileText, Calendar, Clock, CircleDollar, ChevronDown, ChevronUp, Check, Xmark, Envelope } from '@gravity-ui/icons';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ClientProposalsPage() {
    const { data: session, isPending: sessionPending } = useSession();
    const router = useRouter();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedProposalId, setExpandedProposalId] = useState(null);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    useEffect(() => {
        if (sessionPending) return;

        if (!session?.session?.token) {
            setLoading(false);
            return;
        }

        async function fetchProposals() {
            try {
                setLoading(true);
                const data = await getClientProposals(session.user.id);
                setProposals(data);
                setError('');
            } catch (err) {
                console.error("Error fetching client proposals:", err);
                setError(err.message || 'Failed to load proposals.');
            } finally {
                setLoading(false);
            }
        }

        fetchProposals();
    }, [session, sessionPending]);

    const handleUpdateStatus = async (proposalId, newStatus) => {
        if (!session?.session?.token) return;

        try {
            setActionLoadingId(proposalId);
            
            if (newStatus === 'accepted') {
                // Redirect to the dummy Stripe checkout page at /payment/checkout
                router.push(`/payment/checkout?proposal_id=${proposalId}`);
                return;
            } else {
                // Standard status update for other roles (e.g. rejected)
                await updateProposalStatus(proposalId, newStatus, session.session.token);
                
                // Live update status in local state
                setProposals(prev => 
                    prev.map(prop => 
                        prop._id === proposalId ? { ...prop, status: newStatus } : prop
                    )
                );
                
                toast.success(`Proposal successfully ${newStatus === 'accepted' ? 'accepted' : 'rejected'}!`);
            }
        } catch (err) {
            console.error("Error updating status:", err);
            toast.error(err.message || "Failed to update proposal status.", { id: "payment-redirect" });
        } finally {
            setActionLoadingId(null);
        }
    };

    const toggleExpand = (id) => {
        setExpandedProposalId(expandedProposalId === id ? null : id);
    };

    if (sessionPending || (loading && proposals.length === 0)) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00',
                    animation: 'spin 0.75s linear infinite',
                }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                    LOADING INCOMING BIDS
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!session) {
        return (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#fff' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Access Denied</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Please sign in as a client to manage proposals.</p>
                <Link href="/auth/login" style={{
                    padding: '10px 20px', borderRadius: 8, background: '#ff4d00', color: '#fff', fontWeight: 600, textDecoration: 'none'
                }}>Sign In</Link>
            </div>
        );
    }

    // Stats calculations
    const totalReceived = proposals.length;
    const pendingCount = proposals.filter(p => p.status === 'pending').length;
    const acceptedCount = proposals.filter(p => p.status === 'accepted' || p.status === 'Accepted').length;
    const avgBid = totalReceived > 0 ? (proposals.reduce((sum, p) => sum + (p.proposedBudget || 0), 0) / totalReceived).toFixed(2) : '0.00';

    return (
        <div className="dash-page-container">


            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                    Received <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Proposals</span>
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    Review, accept, or decline proposals submitted by freelancers for your posted tasks.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                    { label: 'Total Bids Received', value: totalReceived, color: '#ff4d00' },
                    { label: 'Pending Review', value: pendingCount, color: '#eab308' },
                    { label: 'Accepted Bids', value: acceptedCount, color: '#22c55e' },
                    { label: 'Average Budget Bid', value: `$${avgBid} USD`, color: '#a855f7' }
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

            {/* Proposals List / Table */}
            {proposals.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px', background: 'rgba(255,77,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText width={24} height={24} style={{ color: '#ff4d00' }} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No proposals received yet</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', margin: '0 auto 24px', maxWidth: 400, lineHeight: 1.6 }}>
                        Freelancers haven't submitted any bids on your tasks yet. Once they apply, they will show up here.
                    </p>
                </div>
            ) : (
                <div style={{
                    background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20, overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Task Details</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Freelancer</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Proposed Bid</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Delivery</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Status</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proposals.map((proposal, index) => {
                                    const formattedDate = proposal.submittedAt
                                        ? new Date(proposal.submittedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })
                                        : 'N/A';

                                    const isExpanded = expandedProposalId === proposal._id;
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
                                        <React.Fragment key={proposal._id || index}>
                                            <tr style={{
                                                borderBottom: isExpanded ? 'none' : '1px solid rgba(255,255,255,0.04)',
                                                background: isExpanded ? 'rgba(255,255,255,0.015)' : 'transparent',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s',
                                            }}
                                                onClick={() => toggleExpand(proposal._id)}
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

                                                {/* Freelancer Email */}
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Envelope width={14} height={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
                                                        <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.8)' }}>
                                                            {proposal.freelancerEmail}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Bid Budget */}
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <CircleDollar width={14} height={14} style={{ color: '#ff4d00' }} />
                                                        <span style={{ fontSize: 14.5, fontWeight: 800, color: '#fff' }}>
                                                            {Number(proposal.proposedBudget || 0).toLocaleString()} USD
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Estimated Days */}
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)' }}>
                                                        <Clock width={14} height={14} />
                                                        <span style={{ fontSize: 13.5 }}>
                                                            {proposal.estimatedDays} {proposal.estimatedDays === 1 ? 'day' : 'days'}
                                                        </span>
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

                                                {/* Actions */}
                                                <td style={{ padding: '20px 24px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                                                        {isPending ? (
                                                            <>
                                                                <button
                                                                    disabled={actionLoadingId !== null}
                                                                    onClick={() => handleUpdateStatus(proposal._id, 'accepted')}
                                                                    style={{
                                                                        width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(34,197,94,0.3)',
                                                                        background: 'rgba(34,197,94,0.08)', color: '#22c55e', cursor: 'pointer',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                                                    }}
                                                                    title="Accept Proposal"
                                                                    onMouseEnter={e => { e.currentTarget.style.background = '#22c55e'; e.currentTarget.style.color = '#fff'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.08)'; e.currentTarget.style.color = '#22c55e'; }}
                                                                >
                                                                    <Check width={15} height={15} />
                                                                </button>
                                                                <button
                                                                    disabled={actionLoadingId !== null}
                                                                    onClick={() => handleUpdateStatus(proposal._id, 'rejected')}
                                                                    style={{
                                                                        width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                                                                        background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                                                    }}
                                                                    title="Decline Proposal"
                                                                    onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
                                                                >
                                                                    <Xmark width={14} height={14} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>Decided</span>
                                                        )}
                                                        <div style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>
                                                            {isExpanded ? <ChevronUp width={16} height={16} /> : <ChevronDown width={16} height={16} />}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expandable Cover Note details */}
                                            {isExpanded && (
                                                <tr style={{ background: 'rgba(255,255,255,0.015)' }}>
                                                    <td colSpan={6} style={{ padding: '0 24px 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                        <div style={{
                                                            padding: '20px', borderRadius: 12, background: 'rgba(255,255,255,0.02)',
                                                            border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 14
                                                        }}>
                                                            <div>
                                                                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                                                                    Cover Note / Pitch Message
                                                                </div>
                                                                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                                                    {proposal.coverNote || "No cover note provided."}
                                                                </div>
                                                            </div>

                                                            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                                    <Calendar width={13} height={13} /> Submitted on {formattedDate}
                                                                </span>

                                                                {isPending && (
                                                                    <div style={{ display: 'flex', gap: 10 }}>
                                                                        <button
                                                                            disabled={actionLoadingId !== null}
                                                                            onClick={() => handleUpdateStatus(proposal._id, 'accepted')}
                                                                            style={{
                                                                                padding: '6px 14px', borderRadius: 8, border: 'none',
                                                                                background: '#22c55e', color: '#fff', fontSize: 12, fontWeight: 700,
                                                                                cursor: 'pointer', transition: 'all 0.18s', display: 'inline-flex', alignItems: 'center', gap: 6
                                                                            }}
                                                                            onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                                                                            onMouseLeave={e => e.currentTarget.style.opacity = 1}
                                                                        >
                                                                            <Check width={13} height={13} /> Accept Bid
                                                                        </button>
                                                                        <button
                                                                            disabled={actionLoadingId !== null}
                                                                            onClick={() => handleUpdateStatus(proposal._id, 'rejected')}
                                                                            style={{
                                                                                padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                                                                                background: 'transparent', color: '#ef4444', fontSize: 12, fontWeight: 700,
                                                                                cursor: 'pointer', transition: 'all 0.18s', display: 'inline-flex', alignItems: 'center', gap: 6
                                                                            }}
                                                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                                                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                                                        >
                                                                            <Xmark width={12} height={12} /> Decline Bid
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
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
