'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StarRating from './StarRating';
import { rateClient } from '@/lib/api/freelancer/rateClient';
import toast from 'react-hot-toast';
import { normalizeId } from '@/lib/clientRatings';

/**
 * Modal for a freelancer to rate a client after task completion.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {Object} props.task       - { _id, title, clientName, clientId }
 * @param {string} props.proposalId
 * @param {string} props.token      - Session token for auth
 * @param {Function} props.onSubmitted - Called after successful submit
 */
export default function RatingModal({ open, onClose, task, proposalId, token, onSubmitted }) {
    const [stars, setStars] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setStars(0);
            setReview('');
            setSubmitting(false);
        }
    }, [open, proposalId]);

    if (!open || !task) return null;

    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

    async function handleSubmit(e) {
        e.preventDefault();
        if (stars === 0) {
            toast.error('Please select a star rating.');
            return;
        }

        setSubmitting(true);
        const tId = toast.loading('Submitting your review…');
        try {
            const pid = normalizeId(proposalId || task.proposalId);
            await rateClient({
                proposalId: pid,
                taskId: task._id,
                clientId: task.clientId || task.clientEmail,
                clientName: task.clientName,
                stars,
                review,
                token,
            });

            toast.success('⭐ Review submitted successfully!', { id: tId });
            onSubmitted?.({ proposalId: pid, stars, review: review.trim() });
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to submit review.', { id: tId });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 500,
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 16,
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.94, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.94, y: 20, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: 440,
                            background: 'linear-gradient(180deg, #141414 0%, #0f0f0f 100%)',
                            border: '1px solid rgba(255,128,0,0.15)',
                            borderRadius: 24,
                            boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
                            padding: '32px 28px',
                            color: '#fff',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: '#fff' }}>Rate Your Client</h2>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>
                                    Share your experience working with this client
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    width: 30, height: 30, borderRadius: 9,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: 'rgba(255,255,255,0.04)',
                                    color: 'rgba(255,255,255,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', fontSize: 14,
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Task summary */}
                        <div style={{
                            padding: '12px 14px', borderRadius: 12,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            marginBottom: 24,
                        }}>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 4 }}>
                                Project
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {task.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                <span>Client:</span>
                                <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{task.clientName || 'Verified Client'}</strong>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Star picker */}
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                                    Overall Rating
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <StarRating value={stars} onChange={setStars} size="lg" />
                                    <span style={{
                                        fontSize: 13, fontWeight: 700, color: stars > 0 ? '#ff8040' : 'rgba(255,255,255,0.2)',
                                        transition: 'color 0.2s',
                                    }}>
                                        {ratingLabels[stars] || 'Tap to rate'}
                                    </span>
                                </div>
                            </div>

                            {/* Review text */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Review <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(optional)</span>
                                </label>
                                <textarea
                                    placeholder="Describe your experience with this client…"
                                    value={review}
                                    onChange={e => setReview(e.target.value)}
                                    maxLength={500}
                                    rows={4}
                                    style={{
                                        padding: '12px 14px',
                                        borderRadius: 12,
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#fff',
                                        fontSize: 13.5,
                                        resize: 'vertical',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        transition: 'border 0.2s',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#ff8040'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                                />
                                <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.2)', textAlign: 'right' }}>
                                    {review.length}/500
                                </span>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting || stars === 0}
                                style={{
                                    padding: '13px',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: submitting || stars === 0
                                        ? 'rgba(255,128,64,0.3)'
                                        : 'linear-gradient(135deg, #ff8040, #ff5000)',
                                    color: '#fff',
                                    fontSize: 14,
                                    fontWeight: 800,
                                    cursor: submitting || stars === 0 ? 'not-allowed' : 'pointer',
                                    boxShadow: stars > 0 ? '0 4px 18px rgba(255,128,64,0.3)' : 'none',
                                    transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
                                            <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                                            <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Submitting…
                                    </>
                                ) : (
                                    <>⭐ Submit Review</>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </AnimatePresence>
    );
}
