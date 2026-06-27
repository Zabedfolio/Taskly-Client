
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';


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

            
            ctx.fillStyle = 'rgba(255,77,0,0.07)';
            const spacing = 28;
            for (let x = 0; x < width; x += spacing) {
                for (let   y = 0; y < height; y += spacing) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            
            const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
            grad.addColorStop(0, 'rgba(255,77,0,0)');
              grad.addColorStop(0.5, 'rgba(255,77,0,0.06)');
            grad.addColorStop(1, 'rgba(255,77,0,0)');
            ctx.fillStyle = grad;
               ctx.fillRect(0, scanY - 60, width, 120);

            scanY = (scanY + 0.6) % (height + 120);
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
            style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                pointerEvents: 'none',
              }}
        />
    );
}


function GlitchText({ text, style }) {
    const [glitch, setGlitch] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setGlitch(true);
            setTimeout(() => setGlitch(false), 120);

        }, 3200);
        return () => clearInterval(interval);
    }, []);


    return (

        <span style={{ position: 'relative', display: 'inline-block', ...style }}>
            {text}
            {glitch && (
                <>
                    <span style={{
                        position: 'absolute', inset: 0,
                        color: '#ff4d00', clipPath: 'inset(30% 0 50% 0)',
                        transform: 'translate(-3px, 0)', opacity: 0.7,
                         pointerEvents: 'none',
                    }}>{text}</span>
                     <span style={{
                        position: 'absolute', inset: 0,
                        color: '#00c8ff', clipPath: 'inset(55% 0 20% 0)',
                        transform: 'translate(3px, 0)', opacity: 0.5,
                        pointerEvents: 'none',
                    }}>{text}</span>
                </>
            )}
        </span>
    );

}


function CountdownTicker({ redirectTo = '/' }) {
     const [count, setCount] = useState(10);
    const router = useRouter();

    useEffect(() => {

        if (count <= 0) { router.push(redirectTo); return; }
        const t = setTimeout(() => setCount(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [count, router, redirectTo]);

    const pct = (count / 10) * 100;
    const circumference = 2 * Math.PI * 20;

    return (
         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,77,0,0.12)" strokeWidth="2.5" />

                <circle
                    cx="26" cy="26" r="20" fill="none"
                    stroke="#ff4d00" strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct / 100)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.9s linear', filter: 'drop-shadow(0 0 4px rgba(255,77,0,0.6))' }}
                />
                <text
                    x="26" y="26"
                    dominantBaseline="middle" textAnchor="middle"
                    fill="#fff" fontSize="13" fontWeight="700"
                    style={{ transform: 'rotate(90deg)', transformOrigin: '26px 26px', fontFamily: 'monospace' }}

                >
                    {count}
                </text>
            </svg>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>

                Redirecting in {count}s
            </span>
        </div>
    );
}


function ErrorCode({ code, label }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{
                fontFamily: 'monospace',
                fontSize: 11, letterSpacing: '0.2em',
                 color: 'rgba(255,77,0,0.5)',
                textTransform: 'uppercase',
                marginBottom: 4,
            }}>
                {label}
            </div>
            <div style={{
                fontFamily: 'monospace',
                fontSize: 13, fontWeight: 700,
                color: 'rgba(255,255,255,0.18)',
                letterSpacing: '0.15em',
             }}>
                {code}
               </div>
        </div>
    );
}


export default function UnauthorizedPage({ role }) {
    const router = useRouter();

    return (
        <div style={{

            minHeight: '100vh',

            background: '#080808',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',

              padding: 24,

            paddingTop: 50,
            position: 'relative',
            overflow: 'hidden',
        }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }

                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.6; }
                    50% { transform: scale(1.15); opacity: 0.15; }

                    100% { transform: scale(0.8); opacity: 0.6; }
                }
                @keyframes flicker {
                     0%, 95%, 100% { opacity: 1; }
                    96% { opacity: 0.4; }
                      97% { opacity: 1; }
                    98% { opacity: 0.6; }
                }
            `}</style>

            
            <ScanGrid />

            
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(255,77,0,0.06) 0%, transparent 65%)',
                   pointerEvents: 'none',

            }} />

            
            {[
                { top: 20, left: 20, rotate: 0 },
                { top: 20, right: 20, rotate: 90 },
                { bottom: 20, right: 20, rotate: 180 },
                { bottom: 20, left: 20, rotate: 270 },
            ].map((pos, i) => (
                <svg
                     key={i} width="32" height="32" viewBox="0 0 32 32"
                    style={{ position: 'absolute', ...pos, opacity: 0.25, transform: `rotate(${pos.rotate}deg)` }}
                >
                    <path d="M2 16 L2 2 L16 2" fill="none" stroke="#ff4d00" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ))}

            
            <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 520,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 20,
                    overflow: 'hidden',
                }}
            >
                
                <div style={{

                    height: 2,
                    background: 'linear-gradient(90deg, transparent 0%, #ff4d00 30%, #ff8040 60%, transparent 100%)',
                    animation: 'flicker 4s ease-in-out infinite',
                }} />

                <div style={{ padding: '40px 40px 36px' }}>

                    
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
                         <div style={{ position: 'relative', width: 88, height: 88 }}>
                            
                            {[1, 2].map(n => (
                                <div key={n} style={{
                                    position: 'absolute',

                                    inset: n === 1 ? -14 : -28,
                                    borderRadius: '50%',
                                    border: '1px solid rgba(255,77,0,0.2)',
                                    animation: `pulse-ring ${2.5 + n * 0.5}s ease-in-out infinite`,
                                    animationDelay: `${n * 0.4}s`,
                                }} />
                            ))}

                            
                            <div style={{
                                width: 88, height: 88, borderRadius: '50%',
                                background: 'rgba(255,77,0,0.07)',
                                border: '1px solid rgba(255,77,0,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative',
                            }}>
                                <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6L12 2z"
                                        stroke="#ff4d00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                      />
                                    <path

                                        d="M9 12l2 2 4-4"
                                          stroke="#ff4d00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                          style={{ opacity: 0 }}
                                    />
                                    <line x1="9" y1="10" x2="15" y2="14" stroke="#ff4d00" strokeWidth="1.5" strokeLinecap="round" />
                                    <line x1="15" y1="10" x2="9" y2="14" stroke="#ff4d00" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: '4px 13px', borderRadius: 99,
                              background: 'rgba(255,77,0,0.07)',
                            border: '1px solid rgba(255,77,0,0.2)',
                        }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: '#ff4d00',
                                boxShadow: '0 0 6px #ff4d00',
                                animation: 'pulse-ring 2s ease-in-out infinite',
                                display: 'inline-block',
                            }} />
                            <span style={{
                                fontSize: 10, fontWeight: 700,
                                color: '#ff4d00',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                fontFamily: 'monospace',
                            }}>
                                ACCESS DENIED
                            </span>
                        </div>

                    </div>

                    
                    <h1 style={{
                        textAlign: 'center',

                        fontSize: 36, fontWeight: 900,
                        letterSpacing: '-0.04em', lineHeight: 1.05,
                        color: '#fff',
                        margin: '0 0 14px',
                    }}>
                        <GlitchText text="Unauthorized" />
                    </h1>

                    
                    <p style={{
                        textAlign: 'center',
                        fontSize: 14, lineHeight: 1.7,
                         color: 'rgba(255,255,255,0.38)',
                        margin: '0 0 28px',
                        maxWidth: 340,

                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}>
                        {role
                            ? <>Your current role <span style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace', fontSize: 12, background: 'rgba(255,255,255,0.06)', padding: '1px 7px', borderRadius: 5 }}>{role}</span> doesn't have permission to access this area.</>
                               : 'You must be signed in with the correct permissions to view this page.'
                        }
                    </p>

                    {/* ── Divider with metadata ── */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: 16, marginBottom: 28,

                    }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                        <div style={{ display: 'flex', gap: 24 }}>
                            <ErrorCode code="ERR_403" label="Code" />
                            <ErrorCode code={new Date().toISOString().split('T')[0]} label="Date" />
                            <ErrorCode code="TASKLY" label="System" />
                        </div>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    </div>


                    {/* ── Actions ── */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>

                        <button
                            onClick={() => router.back()}
                            style={{
                                flex: 1,
                                padding: '11px 16px',
                                  borderRadius: 11,
                                border: '1px solid rgba(255,255,255,0.09)',
                                background: 'rgba(255,255,255,0.04)',
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: 13.5, fontWeight: 600,

                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                transition: 'all 0.18s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                         >
                            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                                <path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Go Back
                        </button>

                        <Link
                            href="/"
                            style={{
                                flex: 1,
                                padding: '11px 16px',
                                borderRadius: 11,
                                background: 'linear-gradient(135deg, #ff4d00 0%, #cc3d00 100%)',
                                 boxShadow: '0 0 20px rgba(255,77,0,0.28)',
                                color: '#fff',
                                fontSize: 13.5, fontWeight: 700,
                                textDecoration: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                transition: 'all 0.18s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 32px rgba(255,77,0,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(255,77,0,0.28)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                           >
                            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                                <path d="M6 2L10 6H7v4H5V6H2L6 2z" fill="currentColor" />
                            </svg>
                            Go Home
                        </Link>

                    </div>

                    {/* ── Countdown ── */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {(() => {
                               let redirectTo = '/';
                            if (role === 'client') redirectTo = '/dashboard/client';

                            else if (role === 'freelancer') redirectTo = '/dashboard/freelancer';
                              else if (role === 'admin') redirectTo = '/dashboard/admin';

                            return <CountdownTicker redirectTo={redirectTo} />;
                        })()}
                    </div>

                 </div>

                {/* Bottom bar */}
                <div style={{
                    padding: '14px 40px',
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
                        SECURITY MODULE v2.4
                    </span>
                </div>
             </motion.div>
        </div>
    );
}