'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { confirmSession } from '@/lib/api/client/stripePayments';
import Link from 'next/link';


function rand(min, max) {
    return Math.random() * (max - min) + min;
}



function ConfettiCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
         const ctx = canvas.getContext('2d');

        function resize() {

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const  colors = ['#ff4d00', '#ff8c42', '#ffbe76', '#22c55e', '#a78bfa', '#38bdf8', '#f472b6', '#fff'];
        const pieces = Array.from({ length: 140 }, () => ({
            x: canvas.width / 2 + rand(-100, 100),
            y: canvas.height * 0.4,
            vx: rand(-10, 10),
            vy: rand(-20, -5),
            size: rand(5, 12),
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: rand(0, Math.PI * 2),
            rotV: rand(-0.18, 0.18),
            opacity: 1,
             shape: Math.random() > 0.5 ? 'rect' : 'circle',
        }));

          let raf;
        let   frame = 0;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame++;
            pieces.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.4;

                p.vx *= 0.99;
                p.rotation += p.rotV;
                p.opacity -= 0.007;
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
            if (frame < 300) raf = requestAnimationFrame(draw);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        const timer = setTimeout(() => { raf = requestAnimationFrame(draw); }, 400);
        return   () => {
            clearTimeout(timer);
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, []);


    return (
        <canvas
            ref={canvasRef}
            style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999 }}
        />

    );
}


function AnimatedCheck() {
    return (
        <div style={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
            <div style={{
                position: 'absolute', inset: -16, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 72%)',
                animation: 'glowPulse 2.4s ease-in-out infinite',
            }} />
            <svg viewBox="0 0 104 104" style={{ width: '100%', height: '100%', display: 'block' }}>
                <circle cx="52" cy="52" r="48" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="3" />
                <circle
                    cx="52" cy="52" r="48"
                    fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round"
                    strokeDasharray="301.6" strokeDashoffset="301.6"
                    style={{
                         animation: 'drawRing 0.7s 0.1s cubic-bezier(0.4,0,0.2,1) forwards',
                        transformOrigin: 'center', transform: 'rotate(-90deg)',
                    }}
                />
                <polyline

                     points="30,54 47,71 74,37"
                    fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="62" strokeDashoffset="62"
                    style={{ animation: 'drawCheck 0.45s 0.68s cubic-bezier(0.4,0,0.2,1) forwards' }}
                />
              </svg>
        </div>
    );

}


function  ReceiptRow({ label, value, accent = false, delay = 0 }) {

    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '15px 0',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.45s ease, transform 0.45s ease',
        }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)',
                fontFamily: 'ui-monospace, monospace',
            }}>{label}</span>
            <span style={{
                fontSize: accent ? 22 : 14.5,
                fontWeight: accent ? 900 : 700,
                color: accent ? '#ff4d00' : '#fff',
                letterSpacing: accent ? '-0.02em' : 'normal',
            }}>{value}</span>
        </div>
    );
}


function LoadingState() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>

            <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid rgba(255,77,0,0.12)', borderTopColor: '#ff4d00',
                  animation: 'spin 0.75s linear infinite',
            }} />
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0 }}>
                Verifying Payment…

            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}


function ErrorState({ message }) {
    return (
           <div style={{ minHeight: '100vh', backgroundColor: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '32px 20px', textAlign: 'center' }}>

            <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 32px rgba(239,68,68,0.12)',
            }}>
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />

                </svg>
            </div>
            <div>

                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 10px' }}>Verification Failed</h2>

                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', maxWidth: 400, margin: 0, lineHeight: 1.7 }}>{message}</p>
            </div>
            <Link href="/dashboard/client/proposals" style={{
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '11px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600,
            }}>
                ← Back to Proposals
            </Link>
        </div>
    );
}



function SuccessPageContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const proposalId = searchParams.get('proposal_id');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const  [txDetails, setTxDetails] = useState(null);
    const [showCard, setShowCard] = useState(false);

    useEffect(() => {

        if (!sessionId || !proposalId) {
            setError('Missing session parameters. Payment confirmation could not be verified.');
            setLoading(false);
            return;
        }

        async function verify() {
            try {
                const data = await confirmSession(sessionId, proposalId);
                setTxDetails(data);
                setTimeout(() => setShowCard(true), 100);
            } catch (err) {
                console.error('Payment confirmation error:', err);

                  setError(err.message || 'Failed to verify transaction with backend.');
            } finally {
                setLoading(false);
            }
        }

        verify();
    }, [sessionId, proposalId]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    const formattedPrice = Number(txDetails?.priceSize || 0).toLocaleString('en-US', {
        style: 'currency', currency: 'USD', minimumFractionDigits: 2,
    });

    return (
        <>

            <ConfettiCanvas />

            <div style={{
                   minHeight: '100vh',
                backgroundColor: '#080808',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '48px 20px',
            }}>
                
                <div style={{ position: 'relative', width: '100%', maxWidth: 540 }}>

                    
                    <div style={{
                        position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
                        width: 400, height: 300, borderRadius: '50%',
                        background: 'radial-gradient(ellipse, rgba(34,197,94,0.14) 0%, transparent 70%)',
                        pointerEvents: 'none', zIndex: 0,
                    }} />

                    
                    <div style={{
                        position: 'relative', zIndex: 1,
                        background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                        border: '1px solid rgba(255,255,255,0.09)',

                        borderRadius: 28,
                        padding: '52px 44px 44px',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
                        backdropFilter: 'blur(24px)',

                        opacity: showCard ? 1 : 0,

                        transform: showCard ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
                        transition: 'opacity 0.6s ease, transform 0.6s ease',
                        overflow: 'hidden',
                    }}>

                        
                        <div style={{
                            position: 'absolute', top: -60, right: -60, width: 240, height: 240,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(34,197,94,0.09) 0%, transparent 65%)',
                             pointerEvents: 'none',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: -80, left: -60, width: 220, height: 220,
                            borderRadius: '50%',
                               background: 'radial-gradient(circle, rgba(255,77,0,0.06) 0%, transparent 65%)',
                            pointerEvents: 'none',
                        }} />

                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 22, marginBottom: 44 }}>

                            <AnimatedCheck />

                            
                            <Link href="/" style={{
                                textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7,
                                animation: 'fadeUp 0.5s 0.7s both ease',
                            }}>
                                <div style={{
                                     width: 28, height: 28, borderRadius: 7,
                                    background: 'linear-gradient(135deg,#ff4d00,#cc3d00)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',

                                }}>
                                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                                        <polyline points="3,8 7,12 13,4" />

                                    </svg>
                                 </div>
                                <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Taskly</span>
                            </Link>

                            <div style={{ animation: 'fadeUp 0.5s 0.85s both ease' }}>
                                <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', margin: '0 0 12px' }}>
                                       Payment{' '}
                                    <span style={{
                                        background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    }}>Confirmed!</span>
                                </h1>
                                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', maxWidth: 360, margin: '0 auto', lineHeight: 1.7 }}>
                                    Your simulated transaction was verified. The task is now{' '}
                                    <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>active</strong>{' '}
                                    and the freelancer has been successfully hired.
                                </p>
                            </div>

                            
                            <div style={{
                                 display: 'inline-flex', alignItems: 'center', gap: 7,
                                padding: '5px 16px', borderRadius: 99,
                                background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)',
                                animation: 'fadeUp 0.5s 1s both ease',

                            }}>
                                <span style={{
                                    width: 7, height: 7, borderRadius: '50%', background: '#22c55e',
                                    boxShadow: '0 0 8px #22c55e', animation: 'glowPulse 2s ease-in-out infinite',
                                }} />
                                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#22c55e', fontFamily: 'ui-monospace, monospace' }}>
                                    Secure · Verified
                                </span>
                            </div>
                        </div>

                        
                        <div style={{
                              borderRadius: 18, background: 'rgba(0,0,0,0.28)',
                            border: '1px solid rgba(255,255,255,0.07)',

                            padding: '10px 26px 6px',
                            marginBottom: 32, position: 'relative', overflow: 'hidden',
                        }}>
                            
                             <div style={{
                                position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
                                background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.011) 3px, rgba(255,255,255,0.011) 4px)',
                             }} />

                            

                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                   padding: '14px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 4,
                            }}>
                                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', fontFamily: 'ui-monospace, monospace' }}>
                                    Transaction Receipt
                                </span>
                                <span style={{ fontSize: 9.5, fontWeight: 700, color: '#22c55e', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.08em' }}>
                                    ✓ CONFIRMED
                                </span>
                            </div>

                            <ReceiptRow label="Paid Task" value={txDetails?.taskTitle || 'Untitled Task'} delay={900} />
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                            <ReceiptRow label="Hired Worker" value={txDetails?.workerName || 'Freelancer'} delay={1060} />
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                            <ReceiptRow label="Total Paid" value={formattedPrice} accent delay={1220} />
                        </div>

                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp 0.5s 1.35s both ease' }}>
                            <Link
                                href="/dashboard/client"
                                id="go-to-dashboard-btn"
                                style={{
                                     textDecoration: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    padding: '15px 28px', borderRadius: 13,
                                    background: 'linear-gradient(135deg, #ff4d00 0%, #cc3d00 100%)',
                                    color: '#fff', fontSize: 15.5, fontWeight: 800,
                                    letterSpacing: '-0.01em',
                                    boxShadow: '0 0 0 1px rgba(255,100,30,0.5) inset, 0 10px 32px rgba(255,77,0,0.42)',
                                    transition: 'all 0.22s ease',
                                }}
                                   onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,100,30,0.6) inset, 0 16px 40px rgba(255,77,0,0.56)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1) translateY(0)';

                                    e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255,100,30,0.5) inset, 0 10px 32px rgba(255,77,0,0.42)';
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
                                    padding: '13px 24px', borderRadius: 13,
                                       background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                                    color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 600,
                                    transition: 'all 0.2s ease',
                                }}

                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                            >
                                View My Tasks
                            </Link>

                        </div>

                        
                        <p style={{

                            marginTop: 28, textAlign: 'center',
                            fontSize: 11, color: 'rgba(255,255,255,0.18)',
                            lineHeight: 1.6, fontFamily: 'ui-monospace, monospace',
                            animation: 'fadeUp 0.5s 1.55s both ease',
                           }}>
                            A confirmation email has been dispatched.
                        </p>
                    </div>

                </div>

            </div>

            
            <style>{`
                @keyframes drawRing {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes drawCheck {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.55; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.25); }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                   @keyframes spin {
                    to { transform: rotate(360deg); }
                }

            `}</style>
        </>
    );

}

export default function RedesignedSuccessPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <SuccessPageContent />
        </Suspense>

    );
}