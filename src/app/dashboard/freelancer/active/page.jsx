'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getMyProposals } from '@/lib/api/freelancer/getMyProposals';
import { updateTask } from '@/lib/api/client/updateTask';
import { Briefcase, Clock, ArrowLeft, Check } from '@gravity-ui/icons';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import RatingModal from '@/components/shared/RatingModal';
import StarRating from '@/components/shared/StarRating';
import { getRatingsMapByProposalId, mergeRatingsMaps, normalizeId } from '@/lib/clientRatings';
import { fetchMyRatings } from '@/lib/api/freelancer/rateClient';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function ActiveProjectsPage() {
    const { data: session, isPending: sessionPending } = useSession();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'
    
    // Modal states
    const [selectedTask, setSelectedTask] = useState(null);
    const [deliverableUrl, setDeliverableUrl] = useState('');
    const [submittingDeliverable, setSubmittingDeliverable] = useState(false);
    const [ratingTask, setRatingTask] = useState(null);
    const [ratingsByProposal, setRatingsByProposal] = useState({});

    useEffect(() => {
        async function loadRatings() {
            const localMap = getRatingsMapByProposalId();
            const email = session?.user?.email;
            if (!email) {
                setRatingsByProposal(localMap);
                return;
            }

            try {
                const apiRatings = await fetchMyRatings(email);
                const apiMap = {};
                apiRatings.forEach(r => {
                    const pid = normalizeId(r.proposalId);
                    if (pid) {
                        apiMap[pid] = { stars: r.stars, review: r.review };
                    }
                });
                setRatingsByProposal(mergeRatingsMaps(localMap, apiMap));
            } catch {
                setRatingsByProposal(localMap);
            }
        }

        loadRatings();
    }, [session?.user?.email]);

    const fetchGigs = async () => {
        if (!session?.session?.token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const proposals = await getMyProposals(session.session.token);
            // Filter to proposals accepted by client
            const accepted = proposals.filter(p => p.status?.toLowerCase() === 'accepted');

            // Fetch corresponding task details
            const taskPromises = accepted.map(async (proposal) => {
                try {
                    const res = await fetch(`${BASE_URL}/api/tasks/${proposal.taskId}`);
                    if (res.ok) {
                        const task = await res.json();
                        return {
                            ...task,
                            proposalId: normalizeId(proposal._id),
                            proposedBudget: proposal.proposedBudget,
                            estimatedDays: proposal.estimatedDays,
                            coverNote: proposal.coverNote,
                            submittedAt: proposal.submittedAt,
                        };
                    }
                } catch (err) {
                    console.error("Error loading task detail for active project:", err);
                }
                return null;
            });

            const taskDetails = (await Promise.all(taskPromises)).filter(Boolean);
            setTasks(taskDetails);
            setError('');
        } catch (err) {
            console.error("Error fetching active projects:", err);
            setError('Failed to load active contracts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sessionPending) return;
        fetchGigs();
    }, [session, sessionPending]);

    // Deliverable submit handler
    const handleSubmitDeliverable = async (e) => {
        e.preventDefault();
        if (!selectedTask) return;
        
        const urlTrimmed = deliverableUrl.trim();
        if (!urlTrimmed) {
            toast.error('Deliverable link cannot be empty.');
            return;
        }

        // Basic URL validation
        try {
            new URL(urlTrimmed);
        } catch (_) {
            toast.error('Please enter a valid absolute URL (e.g. https://github.com/...)');
            return;
        }

        setSubmittingDeliverable(true);
        const tId = toast.loading('Submitting deliverable & finalizing contract...');
        try {
            // Update task status in DB to "Completed" and save deliverable URL
            await updateTask(selectedTask._id, {
                status: 'Completed',
                deliverable_url: urlTrimmed,
            });

            toast.success('🎉 Work submitted successfully! Project completed.', { id: tId });
            setSelectedTask(null);
            setDeliverableUrl('');
            
            // Refresh list
            await fetchGigs();
        } catch (err) {
            console.error("Error submitting deliverable:", err);
            toast.error(err.message || 'Failed to submit work. Please try again.', { id: tId });
        } finally {
            setSubmittingDeliverable(false);
        }
    };

    if (sessionPending || (loading && tasks.length === 0)) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00',
                    animation: 'spin 0.75s linear infinite',
                }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                    LOADING CONTRACTS
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!session) {
        return (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#fff' }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Access Denied</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Please sign in to track your projects.</p>
                <Link href="/auth/login" style={{
                    padding: '10px 20px', borderRadius: 8, background: '#ff4d00', color: '#fff', fontWeight: 600, textDecoration: 'none'
                }}>Sign In</Link>
            </div>
        );
    }

    // Filter into Active vs Completed
    const activeGigs = tasks.filter(t => t.status === 'in-progress' || t.status === 'in_progress');
    const completedGigs = tasks.filter(t => t.status?.toLowerCase() === 'completed');

    return (
        <div style={{ padding: '32px 24px 60px', maxWidth: 1100, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#fff', position: 'relative' }}>
            <Toaster position="top-center" toastOptions={{
                style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, borderRadius: 10 },
                success: { iconTheme: { primary: '#22c55e', secondary: '#1a1a1a' } },
                error:   { iconTheme: { primary: '#ff4d00', secondary: '#1a1a1a' } },
            }} />

            {/* Ambient background glow */}
            <div style={{
                pointerEvents: 'none', position: 'fixed', top: 0, left: '50%',
                transform: 'translateX(-50%)', width: '80vw', height: '40vh', zIndex: 0,
                background: 'radial-gradient(ellipse at 50% 0%,rgba(255,77,0,0.055) 0%,transparent 70%)',
                filter: 'blur(40px)',
            }} />

            {/* Breadcrumbs */}
            <div style={{ marginBottom: 20, position: 'relative', zIndex: 1 }}>
                <Link href="/dashboard/freelancer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ff4d00'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                    <ArrowLeft width={14} height={14} /> Back to Dashboard
                </Link>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 32, position: 'relative', zIndex: 1 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                    Active <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Projects</span>
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                    Manage accepted bids, submit deliverables, and track paid project completions.
                </p>
            </div>

            {/* Error state */}
            {error && (
                <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13.5, marginBottom: 24, position: 'relative', zIndex: 1 }}>
                    {error}
                </div>
            )}

            {/* Tabs Row */}
            <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12, marginBottom: 28, position: 'relative', zIndex: 1 }}>
                {[
                    { id: 'active', label: 'In Progress Gigs', count: activeGigs.length },
                    { id: 'completed', label: 'Completed Projects', count: completedGigs.length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)',
                            fontSize: 14.5,
                            fontWeight: activeTab === tab.id ? 700 : 500,
                            padding: '8px 16px',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'color 0.2s',
                        }}
                    >
                        {tab.label}
                        <span style={{
                            marginLeft: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: activeTab === tab.id ? 'rgba(255,77,0,0.12)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === tab.id ? '#ff4d00' : 'rgba(255,255,255,0.4)',
                            border: activeTab === tab.id ? '1px solid rgba(255,77,0,0.25)' : '1px solid transparent',
                        }}>
                            {tab.count}
                        </span>
                        {activeTab === tab.id && (
                            <div style={{
                                position: 'absolute', bottom: -13, left: 0, right: 0, height: 2,
                                background: '#ff4d00', boxShadow: '0 0 8px #ff4d00'
                            }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Main content grid */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {activeTab === 'active' ? (
                    activeGigs.length === 0 ? (
                        <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                            <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px', background: 'rgba(255,77,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Briefcase width={24} height={24} style={{ color: '#ff4d00' }} />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No active projects</h3>
                            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', margin: '0 auto', maxWidth: 420, lineHeight: 1.6 }}>
                                You are not currently assigned to any active contracts. Place bids on the task board to find new work!
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 20 }}>
                            {activeGigs.map(task => (
                                <div key={task._id} style={{
                                    background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 18, padding: '24px', display: 'flex', flexDirection: 'column',
                                    justifyContent: 'space-between', transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,77,0,0.22)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                                >
                                    <div>
                                        {/* category */}
                                        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: '#ff4d00', background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.2)', padding: '3px 8px', borderRadius: 6 }}>
                                            {task.category}
                                        </span>
                                        <h3 style={{ fontSize: 16.5, fontWeight: 800, margin: '14px 0 8px', lineHeight: 1.35, color: '#fff' }}>
                                            {task.title}
                                        </h3>
                                        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 20, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                            {task.description}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                                            <div>
                                                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>Your Bid</span>
                                                <div style={{ fontSize: 15, fontWeight: 800, color: '#ff4d00', marginTop: 2 }}>
                                                    ${Number(task.proposedBudget || 0).toLocaleString()} USD
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>Est. Days</span>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Clock width={12} height={12} /> {task.estimatedDays} days
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: 'rgba(255,255,255,0.38)', marginBottom: 20 }}>
                                            <span>Client Name:</span>
                                            <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{task.clientName || 'Verified Client'}</strong>
                                        </div>

                                        <button
                                            onClick={() => setSelectedTask(task)}
                                            style={{
                                                width: '100%', padding: '11px', borderRadius: 10, border: 'none',
                                                background: 'linear-gradient(135deg,#ff4d00,#cc3d00)',
                                                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                                boxShadow: '0 4px 14px rgba(255,77,0,0.2)', transition: 'all 0.18s'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,77,0,0.3)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255,77,0,0.2)'; }}
                                        >
                                            Submit Deliverable
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    completedGigs.length === 0 ? (
                        <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '60px 32px', textAlign: 'center' }}>
                            <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px', background: 'rgba(34,197,94,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check width={24} height={24} style={{ color: '#22c55e' }} />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No completed projects</h3>
                            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', margin: '0 auto', maxWidth: 420, lineHeight: 1.6 }}>
                                You have not finished any contracts yet. Once you complete a gig and submit the deliverable, it will appear here.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 20 }}>
                            {completedGigs.map(task => (
                                <div key={task._id} style={{
                                    background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: 18, padding: '24px', display: 'flex', flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: '#22c55e', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', padding: '3px 8px', borderRadius: 6 }}>
                                                COMPLETED
                                            </span>
                                            <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                                                Task #{task._id?.slice(-6).toUpperCase()}
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: 16.5, fontWeight: 800, margin: '14px 0 8px', lineHeight: 1.35, color: '#fff' }}>
                                            {task.title}
                                        </h3>
                                        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, marginBottom: 20, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {task.description}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
                                        
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                            <div>
                                                <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>Payout Received</span>
                                                <div style={{ fontSize: 16, fontWeight: 800, color: '#22c55e', marginTop: 2 }}>
                                                    ${Number(task.proposedBudget || 0).toLocaleString()} USD
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>Client</span>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                                                    {task.clientName || 'Verified Client'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 14 }}>
                                            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', textTransform: 'uppercase' }}>Deliverable URL</span>
                                            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <a href={task.deliverable_url} target="_blank" rel="noopener noreferrer" style={{
                                                    fontSize: 12, color: '#ff4d00', textDecoration: 'underline', fontWeight: 600,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220
                                                }}>
                                                    {task.deliverable_url}
                                                </a>
                                                <a href={task.deliverable_url} target="_blank" rel="noopener noreferrer" style={{
                                                    color: '#ff4d00', display: 'inline-flex', alignItems: 'center', textDecoration: 'none'
                                                }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>

                                        {ratingsByProposal[normalizeId(task.proposalId)] ? (
                                            <div style={{
                                                padding: '12px 14px', borderRadius: 10,
                                                background: 'rgba(255,128,64,0.06)', border: '1px solid rgba(255,128,64,0.18)',
                                            }}>
                                                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                                                    Your Client Rating
                                                </span>
                                                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                    <StarRating value={ratingsByProposal[normalizeId(task.proposalId)].stars} readOnly size="sm" />
                                                    {ratingsByProposal[normalizeId(task.proposalId)].review && (
                                                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>
                                                            &ldquo;{ratingsByProposal[normalizeId(task.proposalId)].review}&rdquo;
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setRatingTask(task)}
                                                style={{
                                                    width: '100%', padding: '11px', borderRadius: 10,
                                                    border: '1px solid rgba(255,128,64,0.35)',
                                                    background: 'rgba(255,128,64,0.08)',
                                                    color: '#ff8040', fontSize: 13, fontWeight: 700,
                                                    cursor: 'pointer', transition: 'all 0.18s',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,128,64,0.14)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,128,64,0.08)'; }}
                                            >
                                                ⭐ Rate Client
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SUBMIT DELIVERABLE MODAL DIALOG
            ══════════════════════════════════════════════════════════════════ */}
            {selectedTask && (
                <div
                    onClick={() => setSelectedTask(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 300,
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '16px',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: 460,
                            background: '#0f0f0f',
                            border: '1px solid rgba(255,255,255,0.09)',
                            borderRadius: 20,
                            boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,77,0,0.05)',
                            padding: '30px 24px',
                            animation: 'scaleIn 0.2s ease',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#fff' }}>Submit Project Work</h3>
                                <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>Provide the final deliverable link for the client</p>
                            </div>
                            <button onClick={() => setSelectedTask(null)} style={{
                                width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                                background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}>
                                ✕
                            </button>
                        </div>

                        {/* Brief summary */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 12, marginBottom: 20 }}>
                            <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', textTransform: 'uppercase' }}>Project Title</div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {selectedTask.title}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11.5 }}>
                                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Contract Value:</span>
                                <strong style={{ color: '#22c55e' }}>${selectedTask.proposedBudget} USD</strong>
                            </div>
                        </div>

                        {/* Submit form */}
                        <form onSubmit={handleSubmitDeliverable} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Deliverable URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="e.g. https://github.com/my-repo or https://docs.google.com/..."
                                    required
                                    value={deliverableUrl}
                                    onChange={e => setDeliverableUrl(e.target.value)}
                                    disabled={submittingDeliverable}
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: 10,
                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                                        color: '#fff', fontSize: 13.5, outline: 'none', transition: 'border 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#ff4d00'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}
                                />
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', lineHeight: 1.4 }}>
                                    Must be an absolute URL (including http:// or https://) linking to repository or files.
                                </span>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submittingDeliverable}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                                    background: submittingDeliverable ? 'rgba(255,77,0,0.5)' : 'linear-gradient(135deg,#ff4d00,#cc3d00)',
                                    color: '#fff', fontSize: 14, fontWeight: 700, cursor: submittingDeliverable ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 16px rgba(255,77,0,0.25)', transition: 'all 0.18s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}
                            >
                                {submittingDeliverable ? (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
                                            <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                                            <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Submitting…
                                    </>
                                ) : (
                                    <>
                                        <Check width={14} height={14} /> Submit Deliverable & Complete
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <RatingModal
                open={!!ratingTask}
                onClose={() => setRatingTask(null)}
                task={ratingTask}
                proposalId={ratingTask?.proposalId}
                token={session?.session?.token}
                onSubmitted={({ proposalId, stars, review }) => {
                    const pid = normalizeId(proposalId);
                    setRatingsByProposal(prev => ({
                        ...prev,
                        [pid]: { stars, review },
                    }));
                }}
            />

            <style>{`
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
