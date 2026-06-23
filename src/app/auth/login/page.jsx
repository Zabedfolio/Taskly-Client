"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";

// ─── Testimonials data ────────────────────────────────────────────────────────
const TESTIMONIALS = [
    {
        id: 1,
        quote: "I posted a task at 9am and had three qualified proposals by noon. The freelancer we hired shipped the entire landing page in 48 hours.",
        author: "Aryan Kapoor",
        role: "Founder, Launchpad Studio",
        accent: "#ff4d00",
        metric: { value: "48h", label: "Landing page delivered" },
    },
    {
        id: 2,
        quote: "We had a critical Stripe bug two days before our product launch. Found a dev on Taskly, fixed and deployed in under six hours. Platform saved our launch.",
        author: "Sadia Rahman",
        role: "Co-founder, GlowCart",
        accent: "#ff7030",
        metric: { value: "6h", label: "Critical bug resolved" },
    },
    {
        id: 3,
        quote: "Taskly replaced three other platforms for me overnight. The clients are serious, the briefs are clear, and my monthly income doubled within 90 days.",
        author: "Nabil Hasan",
        role: "Full-stack Developer",
        accent: "#ff8040",
        metric: { value: "2×", label: "Income in 90 days" },
    },
    {
        id: 4,
        quote: "We white-label Taskly workflows for overflow client work. It lets our 8-person agency punch like a 40-person one. Clients just see results delivered on time.",
        author: "Rafid Ahmed",
        role: "Founder, Orbit Agency",
        accent: "#ff5510",
        metric: { value: "5×", label: "Output without new hires" },
    },
];

const STATS = [
    { value: "10k+", label: "Tasks Done" },
    { value: "$2M+", label: "Paid Out" },
    { value: "4.9★", label: "Rating" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.20c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
            <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
        </svg>
    );
}

function LogoMark({ size = 32 }) {
    return (
        <div style={{
            width: size, height: size,
            borderRadius: size * 0.26,
            background: "linear-gradient(135deg,#ff4d00,#cc3d00)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(255,77,0,0.45)",
            flexShrink: 0,
        }}>
            <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
                <path d="M3 13L8 3L13 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 9.5H11" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
        </div>
    );
}

function Avatar({ name, accent, size = 38 }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            background: `linear-gradient(135deg,${accent},${accent}88)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: size * 0.38, color: "#fff", flexShrink: 0,
        }}>
            {name[0]}
        </div>
    );
}

// ─── Testimonial carousel ─────────────────────────────────────────────────────
function TestimonialPanel() {
    const [index, setIndex] = useState(0);
    const [dir, setDir] = useState(1);

    useEffect(() => {
        const id = setInterval(() => {
            setDir(1);
            setIndex((i) => (i + 1) % TESTIMONIALS.length);
        }, 5500);
        return () => clearInterval(id);
    }, []);

    function go(next) {
        setDir(next > index ? 1 : -1);
        setIndex(next);
    }

    const t = TESTIMONIALS[index];

    const variants = {
        enter: (d) => ({ opacity: 0, x: d > 0 ? 36 : -36, scale: 0.98 }),
        center: { opacity: 1, x: 0, scale: 1 },
        exit: (d) => ({ opacity: 0, x: d > 0 ? -36 : 36, scale: 0.98 }),
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>

            {/* Big quote mark */}
            <div style={{
                fontSize: 72, lineHeight: 1, fontFamily: "Georgia,serif",
                color: "#ff4d00", opacity: 0.35, marginBottom: -16, userSelect: "none",
                letterSpacing: "-0.05em",
            }}>
                "
            </div>

            {/* Sliding card area */}
            <div style={{ position: "relative", minHeight: 240 }}>
                <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                        key={t.id}
                        custom={dir}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        style={{ position: "absolute", inset: 0 }}
                    >
                        {/* Quote */}
                        <p style={{
                            fontSize: 16, lineHeight: 1.75,
                            color: "rgba(255,255,255,0.78)",
                            fontWeight: 400, marginBottom: 24,
                            letterSpacing: "-0.01em",
                        }}>
                            {t.quote}
                        </p>

                        {/* Metric pill */}
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 10,
                            padding: "8px 14px", borderRadius: 10, marginBottom: 24,
                            background: `${t.accent}12`,
                            border: `1px solid ${t.accent}2e`,
                        }}>
                            <span style={{
                                fontSize: 24, fontWeight: 900, color: t.accent,
                                letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums",
                            }}>
                                {t.metric.value}
                            </span>
                            <div style={{ width: 1, height: 24, background: `${t.accent}28` }} />
                            <span style={{
                                fontSize: 10.5, fontWeight: 600,
                                color: "rgba(255,255,255,0.35)",
                                letterSpacing: "0.06em", textTransform: "uppercase",
                                fontFamily: "monospace",
                            }}>
                                {t.metric.label}
                            </span>
                        </div>

                        {/* Author */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Avatar name={t.author} accent={t.accent} size={38} />
                            <div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
                                    {t.author}
                                </div>
                                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
                                    {t.role}
                                </div>
                            </div>
                            {/* Stars — right side */}
                            <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <polygon points="6,1 7.5,4.5 11,4.8 8.5,7.2 9.2,11 6,9.2 2.8,11 3.5,7.2 1,4.8 4.5,4.5" fill={t.accent} />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dot nav + counter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 32 }}>
                {TESTIMONIALS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => go(i)}
                        style={{
                            padding: 0, border: "none", borderRadius: 99, cursor: "pointer",
                            transition: "all 0.3s",
                            width: i === index ? 24 : 6,
                            height: 6,
                            background: i === index ? "#ff4d00" : "rgba(255,255,255,0.15)",
                        }}
                    />
                ))}
                <span style={{
                    marginLeft: "auto", fontSize: 10,
                    color: "rgba(255,255,255,0.2)",
                    fontFamily: "monospace", letterSpacing: "0.1em",
                }}>
                    {String(index + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
                </span>
            </div>
        </div>
    );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function InputField({ label, name, type = "text", placeholder, required }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor={name} style={{
                fontSize: 11, fontWeight: 700,
                color: focused ? "#ff4d00" : "rgba(255,255,255,0.38)",
                letterSpacing: "0.14em", textTransform: "uppercase",
                transition: "color 0.2s", fontFamily: "monospace",
            }}>
                {label}
            </label>
            <div style={{ position: "relative" }}>
                <input
                    id={name} name={name} type={type}
                    placeholder={placeholder} required={required}
                    autoComplete={type === "password" ? "current-password" : "email"}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        width: "100%",
                        padding: "12px 38px 12px 14px",
                        borderRadius: 10,
                        border: `1px solid ${focused ? "#ff4d00" : "rgba(255,255,255,0.09)"}`,
                        background: focused ? "rgba(255,77,0,0.05)" : "rgba(255,255,255,0.04)",
                        color: "#fff", fontSize: 14, outline: "none",
                        transition: "all 0.2s",
                        boxShadow: focused ? "0 0 0 3px rgba(255,77,0,0.10)" : "none",
                        boxSizing: "border-box",
                        fontFamily: "system-ui,sans-serif",
                    }}
                />
                {focused && (
                    <div style={{
                        position: "absolute", right: 13, top: "50%",
                        transform: "translateY(-50%)",
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#ff4d00", boxShadow: "0 0 8px #ff4d00",
                    }} />
                )}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const formData = new FormData(e.target);

        const email = formData.get("email");
        const password = formData.get("password");
        const rememberMe = formData.get("rememberMe") === "on";

        if (!email || !password) {
            setError("Both fields are required.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        const { data, error } = await authClient.signIn.email({
            email,
            password,
            rememberMe,
            callbackURL: "/"
        });

        if (error) {
            setError(error.message || "Login failed");
            setLoading(false);
            return;
        }

        console.log("Login successful:", data);

        setLoading(false);
    }

    function handleGoogle() {
        // TODO: signIn("google", { callbackUrl: "/dashboard" })
    }

    return (
        <>
            {/* ── All layout via <style> — no Tailwind dependency ── */}
            <style>{`
        .lp-root {
          min-height: 100vh;
          display: flex;
          flex-direction: row;
          background: #000;
          font-family: system-ui, -apple-system, sans-serif;
          overflow: hidden;
        }

        /* LEFT PANEL */
        .lp-left {
          display: flex;
          flex: 0 0 50%;
          flex-direction: column;
          position: relative;
          padding: 48px 52px;
          overflow: hidden;
          background: linear-gradient(145deg,#0e0400 0%,#070200 55%,#000 100%);
          box-sizing: border-box;
        }

        /* RIGHT PANEL */
        .lp-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          background: #060200;
          position: relative;
          box-sizing: border-box;
          min-height: 100vh;
        }

        /* Mobile: stack vertically, hide left */
        @media (max-width: 1023px) {
          .lp-root { flex-direction: column; }
          .lp-left  { display: none; }
          .lp-right { flex: 1; min-height: 100vh; padding: 48px 24px; }
          .lp-mobile-logo { display: flex !important; }
        }

        @media (min-width: 1024px) {
          .lp-mobile-logo { display: none !important; }
        }

        /* Keyframes */
        @keyframes ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shine {
          0%   { transform: translateX(-100%); }
          55%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }

        input::placeholder { color: rgba(255,255,255,0.18); }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 40px #0a0200 inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
        }
        button { font-family: inherit; }

        .lp-google-btn:hover {
          background: rgba(255,255,255,0.085) !important;
        }
        .lp-submit-btn:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(255,77,0,0.48) !important;
          transform: scale(1.01);
        }
        .lp-submit-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .lp-dot-btn:hover { opacity: 0.8; }
      `}</style>

            <div className="lp-root">

                {/* ══════════════════════════════════════
            LEFT — Testimonial panel
        ══════════════════════════════════════ */}
                <div className="lp-left">

                    {/* Glow blobs */}
                    <div style={{
                        position: "absolute", top: "-15%", left: "-10%",
                        width: "75%", height: "65%",
                        background: "radial-gradient(ellipse at center,rgba(255,77,0,0.13) 0%,transparent 68%)",
                        filter: "blur(52px)", pointerEvents: "none",
                    }} />
                    <div style={{
                        position: "absolute", bottom: "0", right: "-5%",
                        width: "55%", height: "45%",
                        background: "radial-gradient(ellipse at center,rgba(255,77,0,0.06) 0%,transparent 70%)",
                        filter: "blur(44px)", pointerEvents: "none",
                    }} />

                    {/* ISO grid */}
                    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.032, pointerEvents: "none" }}>
                        <defs>
                            <pattern id="lp-iso" x="0" y="0" width="52" height="30" patternUnits="userSpaceOnUse">
                                <path d="M0 15 L26 0 L52 15 L26 30 Z" fill="none" stroke="#ff4d00" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#lp-iso)" />
                    </svg>

                    {/* Right border fade */}
                    <div style={{
                        position: "absolute", top: "8%", right: 0,
                        width: 1, height: "84%",
                        background: "linear-gradient(to bottom,transparent,rgba(255,77,0,0.18),transparent)",
                    }} />

                    {/* Content */}
                    <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 44 }}
                        >
                            <LogoMark size={34} />
                            <span style={{ fontSize: 19, fontWeight: 900, color: "#fff", letterSpacing: "-0.025em" }}>
                                Taskly
                            </span>
                        </motion.div>

                        {/* Badge + headline */}
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.1 }}
                            style={{ marginBottom: 32 }}
                        >
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "4px 10px", borderRadius: 20, marginBottom: 14,
                                background: "rgba(255,77,0,0.08)",
                                border: "1px solid rgba(255,77,0,0.2)",
                            }}>
                                <span style={{ position: "relative", display: "inline-block", width: 6, height: 6 }}>
                                    <span style={{
                                        position: "absolute", inset: 0, borderRadius: "50%",
                                        background: "#ff4d00", opacity: 0.7,
                                        animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                                    }} />
                                    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#ff4d00" }} />
                                </span>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, color: "#ff4d00",
                                    letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "monospace",
                                }}>
                                    Verified by users
                                </span>
                            </div>

                            <h1 style={{
                                fontSize: "clamp(1.85rem,2.6vw,2.55rem)",
                                fontWeight: 900, color: "#fff",
                                lineHeight: 1.06, letterSpacing: "-0.035em",
                            }}>
                                Trusted by clients
                                <br />
                                <span style={{
                                    background: "linear-gradient(135deg,#ff4d00,#ff8c42)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}>
                                    &amp; freelancers alike.
                                </span>
                            </h1>
                        </motion.div>

                        {/* Testimonial carousel — takes remaining space */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.22 }}
                            style={{ flex: 1, display: "flex", flexDirection: "column" }}
                        >
                            <TestimonialPanel />
                        </motion.div>

                        {/* Stat strip */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.38 }}
                            style={{
                                display: "flex",
                                borderTop: "1px solid rgba(255,255,255,0.06)",
                                paddingTop: 22, marginTop: 28,
                            }}
                        >
                            {STATS.map((s, i) => (
                                <div key={s.label} style={{
                                    flex: 1,
                                    display: "flex", flexDirection: "column", alignItems: "center",
                                    borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                                    padding: "0 6px",
                                }}>
                                    <span style={{ fontSize: 21, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>
                                        {s.value}
                                    </span>
                                    <span style={{
                                        fontSize: 9.5, color: "rgba(255,255,255,0.28)",
                                        fontFamily: "monospace", letterSpacing: "0.09em",
                                        textTransform: "uppercase", marginTop: 3,
                                    }}>
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* ══════════════════════════════════════
            RIGHT — Login form
        ══════════════════════════════════════ */}
                <div className="lp-right">

                    {/* Top glow */}
                    <div style={{
                        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                        width: "100%", height: 220,
                        background: "radial-gradient(ellipse at 50% 0%,rgba(255,77,0,0.07) 0%,transparent 70%)",
                        pointerEvents: "none",
                    }} />

                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}
                    >
                        {/* Mobile logo */}
                        <div
                            className="lp-mobile-logo"
                            style={{ alignItems: "center", gap: 8, marginBottom: 40, display: "none" }}
                        >
                            <LogoMark size={30} />
                            <span style={{ fontSize: 17, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
                                Taskly
                            </span>
                        </div>

                        {/* Heading */}
                        <div style={{ marginBottom: 28 }}>
                            <h2 style={{
                                fontSize: 27, fontWeight: 900, color: "#fff",
                                letterSpacing: "-0.03em", marginBottom: 6, lineHeight: 1.1,
                            }}>
                                Welcome back
                            </h2>
                            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>
                                Sign in to your Taskly account to continue.
                            </p>
                        </div>

                        {/* Google */}
                        <button
                            onClick={handleGoogle}
                            className="lp-google-btn"
                            style={{
                                width: "100%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                gap: 10, padding: "12px 20px",
                                borderRadius: 10,
                                border: "1px solid rgba(255,255,255,0.11)",
                                background: "rgba(255,255,255,0.045)",
                                color: "rgba(255,255,255,0.82)",
                                fontSize: 14, fontWeight: 600,
                                cursor: "pointer", marginBottom: 20,
                                transition: "all 0.18s",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            <GoogleIcon />
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                            <span style={{
                                fontSize: 9.5, color: "rgba(255,255,255,0.2)",
                                fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase",
                                whiteSpace: "nowrap",
                            }}>
                                or continue with email
                            </span>
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} noValidate>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <InputField label="Email" name="email" type="email" placeholder="you@example.com" required />
                                <InputField label="Password" name="password" type="password" placeholder="••••••••" required />
                            </div>

                            {/* Remember me + Forgot */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "rgba(255,255,255,0.45)", cursor: "pointer", userSelect: "none" }}>
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        style={{ width: 14, height: 14, accentColor: "#ff4d00", cursor: "pointer" }}
                                    />
                                    Remember me
                                </label>
                                <Link
                                    href="/forgot-password"
                                    style={{ fontSize: 12, color: "rgba(255,77,0,0.7)", textDecoration: "none", fontWeight: 600 }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4d00")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,77,0,0.7)")}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: "auto" }}
                                        exit={{ opacity: 0, y: -6, height: 0 }}
                                        style={{
                                            padding: "10px 14px", borderRadius: 8, marginTop: 14,
                                            background: "rgba(239,68,68,0.09)",
                                            border: "1px solid rgba(239,68,68,0.22)",
                                            color: "#fca5a5", fontSize: 12.5,
                                            display: "flex", alignItems: "center", gap: 8, overflow: "hidden",
                                        }}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                            <circle cx="6.5" cy="6.5" r="5.5" stroke="#fca5a5" strokeWidth="1.2" />
                                            <path d="M6.5 4v3" stroke="#fca5a5" strokeWidth="1.4" strokeLinecap="round" />
                                            <circle cx="6.5" cy="9" r="0.7" fill="#fca5a5" />
                                        </svg>
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="lp-submit-btn"
                                style={{
                                    width: "100%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    gap: 8, padding: "13px 20px",
                                    borderRadius: 10, border: "none",
                                    background: loading
                                        ? "rgba(255,77,0,0.45)"
                                        : "linear-gradient(135deg,#ff4d00 0%,#cc3d00 100%)",
                                    boxShadow: loading ? "none" : "0 0 20px rgba(255,77,0,0.3)",
                                    color: "#fff", fontSize: 14.5, fontWeight: 700,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    marginTop: 18, transition: "all 0.2s",
                                    letterSpacing: "-0.01em",
                                    position: "relative", overflow: "hidden",
                                }}
                            >
                                {!loading && (
                                    <span style={{
                                        position: "absolute", inset: 0,
                                        background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.10) 50%,transparent 60%)",
                                        transform: "translateX(-100%)",
                                        animation: "shine 3.2s ease-in-out infinite",
                                    }} />
                                )}
                                {loading ? (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                            style={{ animation: "spin 0.75s linear infinite", flexShrink: 0 }}>
                                            <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                                            <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Logging in…
                                    </>
                                ) : (
                                    <>
                                        Log In
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M2 7h10M8 3l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Register link */}
                        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.28)", marginTop: 26 }}>
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/auth/signup"
                                style={{ color: "#ff4d00", textDecoration: "none", fontWeight: 700 }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.72")}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                                Sign Up →
                            </Link>
                        </p>

                        {/* Terms */}
                        <p style={{
                            textAlign: "center", fontSize: 11,
                            color: "rgba(255,255,255,0.13)",
                            marginTop: 18, lineHeight: 1.65,
                        }}>
                            By signing in you agree to our{" "}
                            <Link href="/terms" style={{ color: "rgba(255,255,255,0.28)", textDecoration: "underline" }}>Terms</Link>
                            {" "}&amp;{" "}
                            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.28)", textDecoration: "underline" }}>Privacy Policy</Link>.
                        </p>
                    </motion.div>
                </div>

            </div>
        </>
    );
}