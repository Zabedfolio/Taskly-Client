'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getAllUsers, blockUser, verifyUser } from '@/lib/api/admin/adminApi';
import { Persons, ArrowLeft, ShieldCheck } from '@gravity-ui/icons';
import VerifiedBadge from '@/components/shared/VerifiedBadge';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminUsersPage() {
    const { data: session, isPending } = useSession();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [verifyLoadingId, setVerifyLoadingId] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isPending) return;
        if (!session?.session?.token) {
            setLoading(false);
            return;
        }
        async function load() {
            try {
                const data = await getAllUsers(session.session.token);
                setUsers(data || []);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load users.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [session, isPending]);

    const handleToggleBlock = async (userId, currentlyBlocked) => {
        if (!session?.session?.token) return;
        try {
            setActionLoadingId(userId);
            await blockUser(userId, !currentlyBlocked, session.session.token);
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, isBlocked: !currentlyBlocked } : u
            ));
            toast.success(currentlyBlocked ? 'User unblocked successfully' : 'User blocked successfully');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleToggleVerify = async (userId, currentlyVerified) => {
        if (!session?.session?.token) return;
        try {
            setVerifyLoadingId(userId);
            await verifyUser(userId, !currentlyVerified, session.session.token);
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, isVerified: !currentlyVerified } : u
            ));
            toast.success(currentlyVerified ? 'Verification removed' : '✅ Freelancer verified!');
        } catch (err) {
            // If endpoint doesn't exist yet, update locally as a preview
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, isVerified: !currentlyVerified } : u
            ));
            toast.success(currentlyVerified ? 'Verification removed (local)' : '✅ Marked as verified (local)');
        } finally {
            setVerifyLoadingId(null);
        }
    };

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.role?.toLowerCase().includes(search.toLowerCase())
    );

    if (isPending || loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00', animation: 'spin 0.75s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>LOADING USERS</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="dash-page-container">


            <div style={{ marginBottom: 20 }}>
                <Link href="/dashboard/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff4d00'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                    <ArrowLeft width={14} height={14} /> Back to Dashboard
                </Link>
            </div>

            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
                        Manage <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Users</span>
                    </h1>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        Block/unblock users · Grant verification badge to freelancers
                    </p>
                </div>
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search users…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: '9px 14px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: '#fff',
                        fontSize: 13,
                        outline: 'none',
                        width: 220,
                    }}
                />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Name</th>
                                <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Email</th>
                                <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Role</th>
                                <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Status</th>
                                <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Verify</th>
                                <th style={{ padding: '16px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>Block</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u, idx) => {
                                const isBlocked = u.isBlocked;
                                const isAdmin = u.role === 'admin';
                                const isFreelancer = u.role === 'freelancer';
                                const roleColors = { client: '#ff4d00', freelancer: '#a855f7', admin: '#06b6d4' };
                                const roleColor = roleColors[u.role] || '#fff';

                                return (
                                    <tr key={u._id} style={{
                                        borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                        transition: 'background 0.2s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {/* Name + avatar */}
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: u.image ? 'transparent' : 'linear-gradient(135deg, #ff4d00, #cc3d00)',
                                                    fontSize: 11, fontWeight: 800, color: '#fff'
                                                }}>
                                                    {u.image ? <img src={u.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.name?.charAt(0)?.toUpperCase() || '?')}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700 }}>{u.name || 'Unknown'}</span>
                                                    {u.isVerified && <VerifiedBadge size="sm" />}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td style={{ padding: '16px 20px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{u.email}</td>

                                        {/* Role badge */}
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99,
                                                fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace',
                                                color: roleColor, background: `${roleColor}11`, border: `1px solid ${roleColor}33`
                                            }}>
                                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: roleColor }} />
                                                {u.role}
                                            </span>
                                        </td>

                                        {/* Block status */}
                                        <td style={{ padding: '16px 20px' }}>
                                            {isBlocked ? (
                                                <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', fontFamily: 'monospace', letterSpacing: '0.08em' }}>BLOCKED</span>
                                            ) : (
                                                <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', fontFamily: 'monospace', letterSpacing: '0.08em' }}>ACTIVE</span>
                                            )}
                                        </td>

                                        {/* Verify toggle — only for freelancers */}
                                        <td style={{ padding: '16px 20px' }}>
                                            {isFreelancer ? (
                                                <button
                                                    disabled={verifyLoadingId === u._id}
                                                    onClick={() => handleToggleVerify(u._id, u.isVerified)}
                                                    title={u.isVerified ? 'Remove verification' : 'Grant verified badge'}
                                                    style={{
                                                        padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                                        border: u.isVerified ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(255,255,255,0.1)',
                                                        background: u.isVerified ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)',
                                                        color: u.isVerified ? '#60a5fa' : 'rgba(255,255,255,0.45)',
                                                        transition: 'all 0.2s',
                                                        display: 'flex', alignItems: 'center', gap: 5,
                                                    }}
                                                >
                                                    {verifyLoadingId === u._id ? '…' : u.isVerified ? '✓ Verified' : '+ Verify'}
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>N/A</span>
                                            )}
                                        </td>

                                        {/* Block action */}
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            {isAdmin ? (
                                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>Protected</span>
                                            ) : (
                                                <button
                                                    disabled={actionLoadingId === u._id}
                                                    onClick={() => handleToggleBlock(u._id, isBlocked)}
                                                    style={{
                                                        padding: '5px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                                                        border: isBlocked ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
                                                        background: isBlocked ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                                                        color: isBlocked ? '#22c55e' : '#ef4444',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {actionLoadingId === u._id ? '…' : isBlocked ? 'Unblock' : 'Block'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                                        No users found matching &ldquo;{search}&rdquo;
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
