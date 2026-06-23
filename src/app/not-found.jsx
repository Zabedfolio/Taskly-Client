'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ─── Animated dot-grid + scanline (reused from UnauthorizedPage) ──────────────
function ScanGrid() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let raf;
        let scanY = 0;

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        function draw() {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = 'rgba(255,77,0,0.06)';
            const spacing = 28;
            for (let x = 0; x < width; x += spacing) {
                for (let y = 0; y < height; y += spacing) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
            grad.addColorStop(0, 'rgba(255,77,0,0)');
            grad.addColorStop(0.5, 'rgba(255,77,0,0.05)');
            grad.addColorStop(1, 'rgba(255,77,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, scanY - 60, width, 120);

            scanY = (scanY + 0.5) % (height + 120);
            raf = requestAnimationFrame(draw);
        }
        draw();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
    );
}

// ─── Animated 404 digits with stagger ────────────────────────────────────────
function BigFourOhFour() {
    const digits = ['4', '0', '4'];

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
            {digits.map((d, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        fontSize: 'clamp(96px, 20vw, 148px)',
                        fontWeight: 900,
                        letterSpacing: '-0.06em',
                        lineHeight: 1,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        // Middle zero is the accent
                        color: i === 1 ? 'transparent' : 'rgba(255,255,255,0.08)',
                        ...(i === 1 ? {
                            WebkitTextStroke: '2px rgba(255,77,0,0.6)',
                        } : {
                            WebkitTextStroke: '1.5px rgba(255,255,255,0.1)',
                        }),
                        userSelect: 'none',
                    }}
                >
                    {d}
                </motion.span>
            ))}
        </div>
    );
}

// ─── Floating particle dots ───────────────────────────────────────────────────
function FloatingParticles() {
    const particles = [
        { x: '12%', y: '20%', size: 3, delay: 0, dur: 4.5 },
        { x: '85%', y: '15%', size: 2, delay: 0.8, dur: 5.2 },
        { x: '75%', y: '70%', size: 4, delay: 1.2, dur: 3.8 },
        { x: '20%', y: '75%', size: 2, delay: 0.4, dur: 6 },
        { x: '50%', y: '12%', size: 3, delay: 1.8, dur: 4.2 },
        { x: '90%', y: '45%', size: 2, delay: 2.2, dur: 5.5 },
        { x: '8%', y: '50%', size: 4, delay: 0.6, dur: 4.8 },
    ];

    return (
        <>
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    animate={{ y: [0, -14, 0], opacity: [0.25, 0.55, 0.25] }}
                    transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
                    style={{
                        position: 'absolute',
                        left: p.x, top: p.y,
                        width: p.size, height: p.size,
                        borderRadius: '50%',
                        background: '#ff4d00',
                        pointerEvents: 'none',
                    }}
                />
            ))}
        </>
    );
}

// ─── Suggestions ─────────────────────────────────────────────────────────────
const SUGGESTIONS = [
    { label: 'Dashboard', href: '/dashboard/client', icon: (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
    )},
    { label: 'Browse Tasks', href: '/dashboard/freelancer/browse', icon: (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    )},
    { label: 'Post a Task', href: '/dashboard/client/post-task', icon: (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
    )},
    { label: 'Go Home', href: '/', icon: (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M2 7L8 2l6 5v7a1 1 0 01-1 1H9v-4H7v4H3a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
    )},
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NotFoundPage() {
    const router = useRouter();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#080808',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '24px 24px 48px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <style>{`
                @keyframes flicker {
                    0%, 94%, 100% { opacity: 1; }
                    95% { opacity: 0.35; }
                    96.5% { opacity: 1; }
                    98% { opacity: 0.55; }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.92); opacity: 0.5; }
                    50% { transform: scale(1.12); opacity: 0.12; }
                    100% { transform: scale(0.92); opacity: 0.5; }
                }
                .suggestion-link:hover {
                    background: rgba(255,255,255,0.05) !important;
                    border-color: rgba(255,77,0,0.3) !important;
                    color: #fff !important;
                    transform: translateY(-1px);
                }
                .suggestion-link:hover .suggestion-arrow {
                    transform: translateX(3px);
                    color: #ff4d00 !important;
                }
                .back-btn:hover {
                    background: rgba(255,255,255,0.07) !important;
                    color: #fff !important;
                }
            `}</style>

            {/* ── Animated background ── */}
            <ScanGrid />
            <FloatingParticles />

            {/* ── Radial glow ── */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,77,0,0.05) 0%, transparent 65%)',
            }} />

            {/* ── Corner brackets ── */}
            {[
                { top: 20, left: 20, rotate: 0 },
                { top: 20, right: 20, rotate: 90 },
                { bottom: 20, right: 20, rotate: 180 },
                { bottom: 20, left: 20, rotate: 270 },
            ].map((pos, i) => (
                <svg key={i} width="28" height="28" viewBox="0 0 32 32"
                    style={{ position: 'absolute', ...pos, opacity: 0.2, transform: `rotate(${pos.rotate}deg)`, pointerEvents: 'none' }}>
                    <path d="M2 16 L2 2 L16 2" fill="none" stroke="#ff4d00" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ))}

            {/* ── Content ── */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560, textAlign: 'center' }}>

                {/* ── Big 404 ── */}
                <div style={{ position: 'relative', marginBottom: 0 }}>
                    <BigFourOhFour />

                    {/* Glow under the 404 */}
                    <div style={{
                        position: 'absolute', bottom: -10, left: '50%',
                        transform: 'translateX(-50%)',
                        width: '50%', height: 40,
                        background: 'rgba(255,77,0,0.12)',
                        filter: 'blur(24px)',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                    }} />
                </div>

                {/* ── Card ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 20,
                        overflow: 'hidden',
                    }}
                >
                    {/* Accent bar */}
                    <div style={{
                        height: 2,
                        background: 'linear-gradient(90deg, transparent 0%, #ff4d00 30%, #ff8040 60%, transparent 100%)',
                        animation: 'flicker 5s ease-in-out infinite',
                    }} />

                    <div style={{ padding: '32px 36px 28px' }}>

                        {/* Status chip */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.55, duration: 0.4 }}
                            style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}
                        >
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                padding: '4px 13px', borderRadius: 99,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}>
                                <span style={{
                                    width: 5, height: 5, borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.3)',
                                    display: 'inline-block',
                                }} />
                                <span style={{
                                    fontSize: 10, fontWeight: 700,
                                    color: 'rgba(255,255,255,0.4)',
                                    letterSpacing: '0.18em', textTransform: 'uppercase',
                                    fontFamily: 'monospace',
                                }}>
                                    PAGE NOT FOUND
                                </span>
                            </div>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65, duration: 0.45 }}
                            style={{
                                fontSize: 26, fontWeight: 900, color: '#fff',
                                letterSpacing: '-0.03em', lineHeight: 1.1,
                                margin: '0 0 10px',
                            }}
                        >
                            Lost in the void
                        </motion.h1>

                        {/* Subtext */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.75, duration: 0.45 }}
                            style={{
                                fontSize: 13.5, lineHeight: 1.7,
                                color: 'rgba(255,255,255,0.38)',
                                margin: '0 0 26px',
                                maxWidth: 360, marginLeft: 'auto', marginRight: 'auto',
                            }}
                        >
                            The page you're looking for doesn't exist, was moved, or the URL is incorrect.
                        </motion.p>

                        {/* Divider */}
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 22 }} />

                        {/* Suggestions grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.85, duration: 0.45 }}
                        >
                            <p style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
                                textTransform: 'uppercase', fontFamily: 'monospace',
                                color: 'rgba(255,255,255,0.22)', marginBottom: 12, textAlign: 'left',
                            }}>
                                Try one of these
                            </p>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 8,
                            }}>
                                {SUGGESTIONS.map(({ label, href, icon }) => (
                                    <Link
                                        key={label}
                                        href={href}
                                        className="suggestion-link"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '10px 14px', borderRadius: 10,
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            background: 'rgba(255,255,255,0.025)',
                                            color: 'rgba(255,255,255,0.6)',
                                            textDecoration: 'none', fontSize: 13, fontWeight: 600,
                                            transition: 'all 0.18s',
                                        }}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {icon}
                                            {label}
                                        </span>
                                        <span
                                            className="suggestion-arrow"
                                            style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', transition: 'all 0.18s' }}
                                        >
                                            →
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        {/* Back button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.4 }}
                            style={{ marginTop: 16 }}
                        >
                            <button
                                onClick={() => router.back()}
                                className="back-btn"
                                style={{
                                    width: '100%', padding: '10px 16px', borderRadius: 10,
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    background: 'transparent',
                                    color: 'rgba(255,255,255,0.35)',
                                    fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer', fontFamily: 'inherit',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                    transition: 'all 0.18s',
                                }}
                            >
                                <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                                    <path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Go back to previous page
                            </button>
                        </motion.div>
                    </div>

                    {/* Bottom bar */}
                    <div style={{
                        padding: '12px 36px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.01)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 20, height: 20, borderRadius: 6,
                                background: 'linear-gradient(135deg, #ff4d00, #cc3d00)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 13L8 3L13 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M5 9.5H11" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.01em' }}>
                                Taskly
                            </span>
                        </div>
                        <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em' }}>
                            ERR_404
                        </span>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}