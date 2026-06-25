'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { confirmSession } from '@/lib/api/client/stripePayments';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────
   Tiny helpers
───────────────────────────────────────────────────────────── */

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

/* ─────────────────────────────────────────────────────────────
   Confetti burst (canvas-based, no dependencies)
───────────────────────────────────────────────────────────── */
function ConfettiCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#ff4d00', '#ff8c42', '#ffbe76', '#22c55e', '#a78bfa', '#38bdf8', '#f472b6', '#fff'];
        const pieces = Array.from({ length: 120 }, () => ({
            x: canvas.width / 2 + rand(-80, 80),
            y: canvas.height / 2 - 60,
            vx: rand(-9, 9),
            vy: rand(-18, -4),
            size: rand(5, 11),
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: rand(0, Math.PI * 2),
            rotV: rand(-0.15, 0.15),
            opacity: 1,
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
        }));

        let raf;
        let frame = 0;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame++;
            pieces.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.38; // gravity
                p.vx *= 0.99;
                p.rotation += p.rotV;
                p.opacity -= 0.008;

                if (p.opacity <= 0) return;

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            });

            if (frame < 260) raf = requestAnimationFrame(draw);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Delay confetti slightly so success ring appears first
        const timer = setTimeout(() => { raf = requestAnimationFrame(draw); }, 350);

        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed', inset: 0,
                pointerEvents: 'none',
                zIndex: 999,
            }}
        />
    );
}

/* ─────────────────────────────────────────────────────────────
   Animated check SVG ring
───────────────────────────────────────────────────────────── */
function AnimatedCheck() {
    return (
        <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
            {/* Outer glow pulse */}
            <div style={{
                position: 'absolute', inset: -12,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 72%)',
                animation: 'glowPulse 2.4s ease-in-out infinite',
            }} />
            {/* Ring */}
            <svg viewBox="0 0 96 96" style={{ width: '100%', height: '100%', display: 'block' }}>
                <circle
                    cx="48" cy="48" r="44"
                    fill="none"
                    stroke="rgba(34,197,94,0.12)"
                    strokeWidth="3"
                />
                <circle
                    cx="48" cy="48" r="44"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="276.5"
                    strokeDashoffset="276.5"
                    style={{
                        animation: 'drawRing 0.7s 0.1s cubic-bezier(0.4,0,0.2,1) forwards',
                        transformOrigin: 'center',
                        transform: 'rotate(-90deg)',
                    }}
                />
                {/* Check mark */}
                <polyline
                    points="28,50 43,65 68,35"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="55"
                    strokeDashoffset="55"
                    style={{
                        animation: 'drawCheck 0.45s 0.65s cubic-bezier(0.4,0,0.2,1) forwards',
                    }}
                />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Receipt row
───────────────────────────────────────────────────────────── */
function ReceiptRow({ label, value, accent, delay = 0 }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 0',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}>
            <span style={{
                fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                fontFamily: 'ui-monospace, monospace',
            }}>{label}</span>
            <span style={{
                fontSize: accent ? 20 : 14,
                fontWeight: accent ? 900 : 700,
                color: accent ? '#ff4d00' : '#fff',
                letterSpacing: accent ? '-0.01em' : 'normal',
                fontFamily: accent ? 'system-ui, sans-serif' : 'inherit',
            }}>{value}</span>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Loading skeleton
───────────────────────────────────────────────────────────── */
function LoadingState() {
    return (
        <div style={centeredWrap}>
            <div style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '2.5px solid rgba(255,77,0,0.15)',
                borderTopColor: '#ff4d00',
                animation: 'spin 0.75s linear infinite',
            }} />
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0 }}>
                Verifying Stripe Payment…
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Error state
───────────────────────────────────────────────────────────── */
function ErrorState({ message }) {
    return (
        <div style={{ ...centeredWrap, textAlign: 'center' }}>
            {/* X circle */}
            <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(239,68,68,0.12)',
            }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            </div>
            <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>Verification Failed</h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', maxWidth: 380, margin: 0, lineHeight: 1.65 }}>{message}</p>
            </div>
            <Link href="/dashboard/client/proposals" style={ghostBtn}>
                ← Back to Proposals
            </Link>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Shared style tokens
───────────────────────────────────────────────────────────── */
const centeredWrap = {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 20, padding: '40px 20px', width: '100%',
};

const ghostBtn = {
    textDecoration: 'none',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 22px', borderRadius: 10,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13.5, fontWeight: 600,
    transition: 'all 0.2s',
};

/* ─────────────────────────────────────────────────────────────
   Main success content
───────────────────────────────────────────────────────────── */
function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const proposalId = searchParams.get('proposal_id');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [txDetails, setTxDetails] = useState(null);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (!sessionId || !proposalId) {
            setError('Missing checkout parameters. Payment confirmation could not be verified.');
            setLoading(false);
            return;
        }

        async function verifyPayment() {
            try {
                const data = await confirmSession(sessionId, proposalId);
                setTxDetails(data);
                setTimeout(() => setShowContent(true), 80);
            } catch (err) {
                console.error('Payment confirmation error:', err);
                setError(err.message || 'Failed to verify transaction with backend.');
            } finally {
                setLoading(false);
            }
        }

        verifyPayment();
    }, [sessionId, proposalId]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    const formattedPrice = Number(txDetails?.priceSize || 0).toLocaleString('en-US', {
        style: 'currency', currency: 'USD', minimumFractionDigits: 2
    });

    return (
        <>
            <ConfettiCanvas />

            {/* ── Page container ── */}
            <div style={{
                minHeight: '100vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px 16px',
                background: 'transparent',
            }}>

                {/* ── Card ── */}
                <div style={{
                    width: '100%', maxWidth: 520,
                    background: 'linear-gradient(160deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.008) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 24,
                    padding: '48px 40px 40px',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
                    backdropFilter: 'blur(20px)',
                    opacity: showContent ? 1 : 0,
                    transform: showContent ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.55s ease, transform 0.55s ease',
                    position: 'relative', overflow: 'hidden',
                }}>

                    {/* Corner glow accent */}
                    <div style={{
                        position: 'absolute', top: -40, right: -40,
                        width: 200, height: 200,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    {/* ── Header ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20, marginBottom: 40 }}>
                        <AnimatedCheck />

                        <div>
                            <h1 style={{
                                fontSize: 30, fontWeight: 900, letterSpacing: '-0.035em',
                                color: '#fff', margin: '0 0 10px',
                                animation: 'fadeUp 0.5s 0.8s both ease',
                            }}>
                                Payment{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    Confirmed!
                                </span>
                            </h1>
                            <p style={{
                                fontSize: 14, color: 'rgba(255,255,255,0.42)',
                                margin: 0, lineHeight: 1.65, maxWidth: 340,
                                animation: 'fadeUp 0.5s 0.95s both ease',
                            }}>
                                Your Stripe transaction was verified. The task is now <strong style={{ color: 'rgba(255,255,255,0.7)' }}>active</strong> and the worker has been officially hired.
                            </p>
                        </div>

                        {/* Status pill */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: '5px 14px', borderRadius: 99,
                            background: 'rgba(34,197,94,0.08)',
                            border: '1px solid rgba(34,197,94,0.22)',
                            animation: 'fadeUp 0.5s 1.05s both ease',
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'glowPulse 2s ease-in-out infinite' }} />
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#22c55e', fontFamily: 'ui-monospace, monospace' }}>
                                Secure · Payment Verified
                            </span>
                        </div>
                    </div>

                    {/* ── Receipt card ── */}
                    <div style={{
                        borderRadius: 16,
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        padding: '8px 24px 4px',
                        marginBottom: 32,
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Scanline effect */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)',
                            pointerEvents: 'none', borderRadius: 16,
                        }} />

                        {/* Receipt header */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '14px 0 12px',
                            borderBottom: '1px solid rgba(255,255,255,0.07)',
                            marginBottom: 4,
                        }}>
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: 'ui-monospace, monospace' }}>
                                Transaction Receipt
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.08em' }}>
                                ✓ STRIPE CONFIRMED
                            </span>
                        </div>

                        <ReceiptRow label="Paid Task" value={txDetails?.taskTitle || 'Untitled Task'} delay={900} />
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                        <ReceiptRow label="Hired Worker" value={txDetails?.workerName || 'Freelancer'} delay={1050} />
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                        <ReceiptRow label="Total Paid" value={formattedPrice} accent delay={1200} />
                    </div>

                    {/* ── CTA buttons ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp 0.5s 1.3s both ease' }}>
                        <Link
                            href="/dashboard/client"
                            id="go-to-dashboard-btn"
                            style={{
                                textDecoration: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                padding: '14px 28px', borderRadius: 12,
                                background: 'linear-gradient(135deg, #ff4d00 0%, #cc3d00 100%)',
                                color: '#fff', fontSize: 15, fontWeight: 800,
                                letterSpacing: '-0.01em',
                                boxShadow: '0 0 0 1px rgba(255,77,0,0.5) inset, 0 8px 28px rgba(255,77,0,0.38)',
                                transition: 'all 0.22s ease',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,77,0,0.6) inset, 0 14px 36px rgba(255,77,0,0.52)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,77,0,0.5) inset, 0 8px 28px rgba(255,77,0,0.38)';
                            }}
                        >
                            Go to Dashboard
                            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 8h10M9 4l4 4-4 4" />
                            </svg>
                        </Link>

                        <Link
                            href="/dashboard/client/my-tasks"
                            style={{
                                textDecoration: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '12px 24px', borderRadius: 12,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: 13.5, fontWeight: 600,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                        >
                            View My Tasks
                        </Link>
                    </div>

                    {/* Fine print */}
                    <p style={{
                        marginTop: 24, textAlign: 'center',
                        fontSize: 11.5, color: 'rgba(255,255,255,0.2)',
                        lineHeight: 1.6, fontFamily: 'ui-monospace, monospace',
                        animation: 'fadeUp 0.5s 1.5s both ease',
                    }}>
                        A confirmation record has been saved to your account.
                    </p>
                </div>
            </div>

            {/* ── Global keyframes ── */}
            <style>{`
                @keyframes drawRing {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes drawCheck {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.18); }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}

/* ─────────────────────────────────────────────────────────────
   Export
───────────────────────────────────────────────────────────── */
export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid rgba(255,77,0,0.18)', borderTopColor: '#ff4d00', animation: 'spin 0.75s linear infinite' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Initializing…
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
