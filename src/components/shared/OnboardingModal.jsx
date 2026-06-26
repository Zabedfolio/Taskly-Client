'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authClient } from '@/lib/auth-client';
import toast from 'react-hot-toast';
import { Briefcase, Thunderbolt } from '@gravity-ui/icons';

export default function OnboardingModal({ isOpen, user, onComplete }) {
    const [role, setRole] = useState('client'); // default to 'client'
    const [skills, setSkills] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e) {
        e.preventDefault();

        if (role === 'freelancer' && !skills.trim()) {
            toast.error('Skills are required for freelancer accounts.');
            return;
        }

        setLoading(true);

        try {
            // Update the user using better-auth client helper
            const { data, error } = await authClient.updateUser({
                role,
                skills: role === 'freelancer' ? skills.trim() : undefined,
                bio: bio.trim() || undefined,
                onboardingComplete: true,
            });

            if (error) {
                throw new Error(error.message || 'Failed to update profile.');
            }

            toast.success('Welcome to Taskly!');
            
            // Force location reload or redirect to dashboard
            setTimeout(() => {
                window.location.href = role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/client';
            }, 1000);

            if (onComplete) onComplete();
        } catch (err) {
            toast.error(err.message || 'An error occurred during onboarding.');
            setLoading(false);
        }
    }

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '24px',
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        background: '#0a0a0c',
                        border: '1px solid rgba(255, 77, 0, 0.22)',
                        borderRadius: '24px',
                        padding: '32px 36px',
                        maxWidth: '480px',
                        width: '100%',
                        boxShadow: '0 24px 60px rgba(255, 77, 0, 0.12), 0 0 0 1px rgba(255, 77, 0, 0.05)',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#fff',
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            background: 'linear-gradient(135deg, #ff4d00, #cc3d00)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            boxShadow: '0 0 20px rgba(255, 77, 0, 0.4)',
                        }}>
                            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                                <path d="M3 13L8 3L13 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 9.5H11" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                            Complete Your Profile
                        </h2>
                        <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.4)', lineHeight: 1.5, margin: 0 }}>
                            Hi <strong>{user?.name || 'there'}</strong>! Please choose your account type to set up your Taskly dashboard.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        
                        {/* Role selection Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                color: 'rgba(255, 255, 255, 0.38)',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                fontFamily: 'monospace',
                            }}>
                                Choose Account Type
                            </label>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {/* Client Card */}
                                <div
                                    onClick={() => setRole('client')}
                                    style={{
                                        padding: '16px 14px',
                                        borderRadius: '14px',
                                        border: `1.5px solid ${role === 'client' ? '#ff4d00' : 'rgba(255, 255, 255, 0.08)'}`,
                                        background: role === 'client' ? 'rgba(255, 77, 0, 0.07)' : 'rgba(255, 255, 255, 0.02)',
                                        boxShadow: role === 'client' ? '0 0 20px rgba(255, 77, 0, 0.06)' : 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        userSelect: 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Briefcase width={20} height={20} style={{ color: role === 'client' ? '#ff4d00' : 'rgba(255, 255, 255, 0.4)' }} />
                                        <div style={{
                                            width: 14,
                                            height: 14,
                                            borderRadius: '50%',
                                            border: `1.5px solid ${role === 'client' ? '#ff4d00' : 'rgba(255, 255, 255, 0.2)'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            {role === 'client' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d00' }} />}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: role === 'client' ? '#fff' : 'rgba(255,255,255,0.6)' }}>Client</span>
                                    <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>I want to hire talent &amp; post tasks</span>
                                </div>

                                {/* Freelancer Card */}
                                <div
                                    onClick={() => setRole('freelancer')}
                                    style={{
                                        padding: '16px 14px',
                                        borderRadius: '14px',
                                        border: `1.5px solid ${role === 'freelancer' ? '#ff4d00' : 'rgba(255, 255, 255, 0.08)'}`,
                                        background: role === 'freelancer' ? 'rgba(255, 77, 0, 0.07)' : 'rgba(255, 255, 255, 0.02)',
                                        boxShadow: role === 'freelancer' ? '0 0 20px rgba(255, 77, 0, 0.06)' : 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        userSelect: 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Thunderbolt width={20} height={20} style={{ color: role === 'freelancer' ? '#ff4d00' : 'rgba(255, 255, 255, 0.4)' }} />
                                        <div style={{
                                            width: 14,
                                            height: 14,
                                            borderRadius: '50%',
                                            border: `1.5px solid ${role === 'freelancer' ? '#ff4d00' : 'rgba(255, 255, 255, 0.2)'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            {role === 'freelancer' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4d00' }} />}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: role === 'freelancer' ? '#fff' : 'rgba(255,255,255,0.6)' }}>Freelancer</span>
                                    <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>I want to find tasks &amp; earn money</span>
                                </div>
                            </div>
                        </div>

                        {/* Freelancer-Specific Required Fields */}
                        {role === 'freelancer' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label htmlFor="skills" style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'rgba(255, 255, 255, 0.38)',
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    fontFamily: 'monospace',
                                }}>
                                    Skills <span style={{ color: '#ff4d00' }}>*</span>
                                </label>
                                <input
                                    id="skills"
                                    type="text"
                                    required
                                    placeholder="React, Next.js, Node.js, CSS"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '11px 14px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255, 255, 255, 0.09)',
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        color: '#fff',
                                        fontSize: '13.5px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.2s',
                                        fontFamily: 'inherit',
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = '#ff4d00'; e.target.style.background = 'rgba(255, 77, 0, 0.04)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.09)'; e.target.style.background = 'rgba(255, 255, 255, 0.04)'; }}
                                />
                                <span style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.25)', fontFamily: 'monospace' }}>
                                    Enter your professional skills as a comma-separated list.
                                </span>
                            </div>
                        )}

                        {/* General Bio Field */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label htmlFor="bio" style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: 'rgba(255, 255, 255, 0.38)',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                fontFamily: 'monospace',
                            }}>
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                rows="3"
                                placeholder="Tell us a little bit about yourself or your company..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '11px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.09)',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    color: '#fff',
                                    fontSize: '13.5px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.2s',
                                    fontFamily: 'inherit',
                                    resize: 'none',
                                }}
                                onFocus={(e) => { e.target.style.borderColor = '#ff4d00'; e.target.style.background = 'rgba(255, 77, 0, 0.04)'; }}
                                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.09)'; e.target.style.background = 'rgba(255, 255, 255, 0.04)'; }}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '13px',
                                borderRadius: '11px',
                                border: 'none',
                                background: loading
                                    ? 'rgba(255, 77, 0, 0.45)'
                                    : 'linear-gradient(135deg, #ff4d00 0%, #cc3d00 100%)',
                                boxShadow: loading ? 'none' : '0 4px 20px rgba(255, 77, 0, 0.25)',
                                color: '#fff',
                                fontSize: '14.5px',
                                fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '8px',
                            }}
                            onMouseEnter={e => { if(!loading) { e.target.style.boxShadow = '0 6px 24px rgba(255, 77, 0, 0.38)'; } }}
                            onMouseLeave={e => { if(!loading) { e.target.style.boxShadow = '0 4px 20px rgba(255, 77, 0, 0.25)'; } }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255, 255, 255, 0.25)',
                                        borderTopColor: '#fff',
                                        animation: 'spin 0.75s linear infinite',
                                    }} />
                                    Saving profile...
                                </>
                            ) : (
                                <>
                                    Get Started
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M2 7h10M8 3l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </AnimatePresence>
    );
}
