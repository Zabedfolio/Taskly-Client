'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Gear, Person, Bell, Lock, ArrowRightFromSquare, TrashBin, Pencil, Eye, EyeSlash } from '@gravity-ui/icons';

/* ─────────────────────────────────────────────────────────────
   Shared styles
   ───────────────────────────────────────────────────────────── */
function inputBase(focused) {
    return {
        width: '100%',
        padding: '11px 14px',
        borderRadius: 10,
        border: `1px solid ${focused ? '#ff4d00' : 'rgba(255,255,255,0.09)'}`,
        backgroundColor: focused ? 'rgba(255,77,0,0.04)' : 'rgba(255,255,255,0.04)',
        color: '#fff',
        fontSize: 14,
        outline: 'none',
        transition: 'all 0.18s',
        boxShadow: focused ? '0 0 0 3px rgba(255,77,0,0.10)' : 'none',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, sans-serif',
    };
}

/* ─────────────────────────────────────────────────────────────
   Section card wrapper
   ───────────────────────────────────────────────────────────── */
function Section({ id, icon: Icon, title, subtitle, children }) {
    return (
        <div id={id} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18,
            overflow: 'hidden',
            marginBottom: 20,
        }}>
            {/* Section header */}
            <div style={{
                padding: '20px 28px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.01)',
                display: 'flex', alignItems: 'center', gap: 12,
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <Icon width={16} height={16} style={{ color: '#ff4d00' }} />
                </div>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 1 }}>{title}</div>
                    {subtitle && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{subtitle}</div>}
                </div>
            </div>
            <div style={{ padding: '24px 28px' }}>{children}</div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Field row
   ───────────────────────────────────────────────────────────── */
function Field({ label, hint, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(255,255,255,0.42)' }}>
                    {label}
                </label>
                {hint && <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.22)', fontFamily: 'monospace' }}>{hint}</span>}
            </div>
            {children}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Toggle switch
   ───────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, id }) {
    return (
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            style={{
                width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
                background: checked ? '#ff4d00' : 'rgba(255,255,255,0.12)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                boxShadow: checked ? '0 0 10px rgba(255,77,0,0.4)' : 'none',
            }}
        >
            <span style={{
                position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18,
                borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }} />
        </button>
    );
}

/* ─────────────────────────────────────────────────────────────
   Notification preference row
   ───────────────────────────────────────────────────────────── */
function NotifRow({ id, label, desc, checked, onChange }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>{desc}</div>
            </div>
            <Toggle id={id} checked={checked} onChange={onChange} />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Password input with show/hide
   ───────────────────────────────────────────────────────────── */
function PasswordInput({ name, placeholder, value, onChange }) {
    const [show, setShow] = useState(false);
    const [focused, setFocused] = useState(false);
    const EyeIcon = show ? EyeSlash : Eye;
    return (
        <div style={{ position: 'relative' }}>
            <input
                name={name}
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{ ...inputBase(focused), paddingRight: 44 }}
            />
            <button
                type="button"
                onClick={() => setShow(v => !v)}
                style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)',
                    display: 'flex', padding: 4, transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >
                <EyeIcon width={15} height={15} />
            </button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Danger zone confirm modal
   ───────────────────────────────────────────────────────────── */
function DangerModal({ title, message, confirmLabel, onConfirm, onCancel, loading }) {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={!loading ? onCancel : undefined}>
            <div onClick={e => e.stopPropagation()} style={{
                background: '#111', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 18, padding: '32px 28px', maxWidth: 400, width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <TrashBin width={22} height={22} style={{ color: '#ef4444' }} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 900, color: '#fff' }}>{title}</h3>
                <p style={{ margin: '0 0 24px', fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{message}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onCancel} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
                        {loading
                            ? <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />Working…</>
                            : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────────── */
export default function AdminSettingsPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const user = session?.user;

    // Profile state
    const [profileName, setProfileName]   = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [nameFocused, setNameFocused]   = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    // Password state
    const [pwCurrent, setPwCurrent]   = useState('');
    const [pwNew, setPwNew]           = useState('');
    const [pwConfirm, setPwConfirm]   = useState('');
    const [savingPw, setSavingPw]     = useState(false);

    // Admin notifications
    const [notifs, setNotifs] = useState({
        flaggedContent:     true,  // Moderation triggers
        newUserSignup:      false, // New signups logging
        largeTransactions:  true,  // Payout size thresholds warnings
        platformWeekly:     true,  // Administrative digest reports
        marketingEmails:    false,
    });

    // Danger zone
    const [dangerModal, setDangerModal] = useState(null); // 'logout-all'
    const [dangerLoading, setDangerLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileName(user.name || '');
            setProfileEmail(user.email || '');
        }
    }, [user]);

    if (isPending) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00', animation: 'spin 0.75s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    async function handleSaveProfile(e) {
        e.preventDefault();
        if (!profileName.trim() || profileName.length < 2) {
            toast.error('Name must be at least 2 characters.');
            return;
        }
        setSavingProfile(true);
        try {
            await authClient.updateUser({ name: profileName.trim() });
            toast.success('Admin profile updated!');
        } catch (err) {
            toast.error(err.message || 'Failed to update admin details.');
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        if (!pwCurrent) { toast.error('Enter your current password.'); return; }
        if (pwNew.length < 8) { toast.error('New password must be at least 8 characters.'); return; }
        if (pwNew !== pwConfirm) { toast.error('Passwords do not match.'); return; }
        setSavingPw(true);
        try {
            await authClient.changePassword({ currentPassword: pwCurrent, newPassword: pwNew });
            toast.success('Password updated successfully!');
            setPwCurrent(''); setPwNew(''); setPwConfirm('');
        } catch (err) {
            toast.error(err.message || 'Failed to update password.');
        } finally {
            setSavingPw(false);
        }
    }

    async function handleSignOut() {
        setDangerLoading(true);
        try {
            await authClient.signOut();
            router.push('/auth/login');
        } catch (err) {
            toast.error('Sign-out failed.');
        } finally {
            setDangerLoading(false);
            setDangerModal(null);
        }
    }

    const initials = (user?.name || user?.email || 'A').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return (
        <>


            {dangerModal === 'logout-all' && (
                <DangerModal
                    title="Sign out everywhere?"
                    message="This ends active sessions for this admin account across all active browsers."
                    confirmLabel="Sign Out Everywhere"
                    onConfirm={handleSignOut}
                    onCancel={() => setDangerModal(null)}
                    loading={dangerLoading}
                />
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                 input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
                 .settings-container {
                     max-width: 720px;
                     margin: 0 auto;
                     padding: 32px 24px 80px;
                     font-family: system-ui, -apple-system, sans-serif;
                     color: #fff;
                     box-sizing: border-box;
                 }
                 @media (max-width: 640px) {
                     .settings-container {
                         padding: 20px 14px 60px;
                     }
                 }
            `}</style>

            <div className="settings-container">

                {/* Page title */}
                <div style={{ marginBottom: 36 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '4px 12px', borderRadius: 99, background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.2)' }}>
                        <Gear width={12} height={12} style={{ color: '#ff4d00' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#ff4d00', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'monospace' }}>Settings</span>
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                        Admin <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Settings</span>
                    </h1>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.38)', margin: 0 }}>
                        Configure secure administrative properties and platform logs alerts.
                    </p>
                </div>

                {/* Profile avatar card */}
                <div style={{
                    marginBottom: 20, padding: '20px 28px',
                    borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#ff4d00,#cc3d00)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 900, color: '#fff',
                        boxShadow: '0 0 20px rgba(255,77,0,0.35)',
                    }}>
                        {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{user?.name || 'Administrator'}</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{user?.email}</div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: '#ef4444' }}>
                            ● System Admin
                        </span>
                    </div>
                </div>

                {/* Profile Information */}
                <Section id="profile" icon={Person} title="Admin Identity" subtitle="Manage your display credentials">
                    <form onSubmit={handleSaveProfile} noValidate>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <Field label="Display Name" hint="Administrator identity">
                                <input
                                    type="text"
                                    value={profileName}
                                    onChange={e => setProfileName(e.target.value)}
                                    onFocus={() => setNameFocused(true)}
                                    onBlur={() => setNameFocused(false)}
                                    style={inputBase(nameFocused)}
                                    placeholder="Your full name"
                                />
                            </Field>
                            <Field label="Security Email" hint="Cannot be modified">
                                <input
                                    type="email"
                                    value={profileEmail}
                                    disabled
                                    style={{ ...inputBase(false), opacity: 0.5, cursor: 'not-allowed' }}
                                />
                            </Field>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" disabled={savingProfile} style={{
                                    padding: '10px 24px', borderRadius: 10, border: 'none',
                                    background: savingProfile ? 'rgba(255,77,0,0.5)' : 'linear-gradient(135deg,#ff4d00,#cc3d00)',
                                    color: '#fff', fontSize: 13.5, fontWeight: 700,
                                    cursor: savingProfile ? 'not-allowed' : 'pointer',
                                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
                                    boxShadow: savingProfile ? 'none' : '0 0 14px rgba(255,77,0,0.25)',
                                    transition: 'all 0.2s',
                                }}>
                                    {savingProfile
                                        ? <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />Saving…</>
                                        : <><Pencil width={13} height={13} />Update Identity</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </Section>

                {/* Notifications */}
                <Section id="notifications" icon={Bell} title="Moderation & Logs Alerts" subtitle="Select triggers for platform safety events and system warnings">
                    <div>
                        <NotifRow id="notif-flagged" label="Flagged Safety Reports" desc="Instant alert when content or messages trigger toxicity filters" checked={notifs.flaggedContent} onChange={v => setNotifs(n => ({ ...n, flaggedContent: v }))} />
                        <NotifRow id="notif-signups" label="Sign-up Audit Logs" desc="Log notifications when new freelancer or client accounts are generated" checked={notifs.newUserSignup} onChange={v => setNotifs(n => ({ ...n, newUserSignup: v }))} />
                        <NotifRow id="notif-transactions" label="High-value Transactions" desc="Alert when payouts exceed normal volume thresholds" checked={notifs.largeTransactions} onChange={v => setNotifs(n => ({ ...n, largeTransactions: v }))} />
                        <NotifRow id="notif-report" label="Platform Digests" desc="Weekly administration reports summarizing active tasks, users, and revenues" checked={notifs.platformWeekly} onChange={v => setNotifs(n => ({ ...n, platformWeekly: v }))} />

                        <div style={{ paddingTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => toast.success('Administrative log options updated!')} style={{
                                padding: '10px 24px', borderRadius: 10, border: 'none',
                                background: 'linear-gradient(135deg,#ff4d00,#cc3d00)',
                                color: '#fff', fontSize: 13.5, fontWeight: 700,
                                cursor: 'pointer', fontFamily: 'inherit',
                                boxShadow: '0 0 14px rgba(255,77,0,0.25)',
                            }}>
                                Save Preferences
                            </button>
                        </div>
                    </div>
                </Section>

                {/* Security */}
                <Section id="security" icon={Lock} title="Password Override" subtitle="Override system credentials safely">
                    <form onSubmit={handleChangePassword} noValidate>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Field label="Current Password">
                                <PasswordInput name="current-pw" placeholder="Enter current password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} />
                            </Field>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <Field label="New Password" hint="Min. 8 characters">
                                    <PasswordInput name="new-pw" placeholder="New password" value={pwNew} onChange={e => setPwNew(e.target.value)} />
                                </Field>
                                <Field label="Confirm Password">
                                    <PasswordInput name="confirm-pw" placeholder="Repeat new password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} />
                                </Field>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" disabled={savingPw} style={{
                                    padding: '10px 24px', borderRadius: 10, border: 'none',
                                    background: savingPw ? 'rgba(255,77,0,0.5)' : 'linear-gradient(135deg,#ff4d00,#cc3d00)',
                                    color: '#fff', fontSize: 13.5, fontWeight: 700,
                                    cursor: savingPw ? 'not-allowed' : 'pointer',
                                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
                                    boxShadow: savingPw ? 'none' : '0 0 14px rgba(255,77,0,0.25)',
                                }}>
                                    {savingPw
                                        ? <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />Changing…</>
                                        : <><Lock width={13} height={13} />Change Password</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </Section>

                {/* Danger zone */}
                <div style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 18, overflow: 'hidden' }}>
                    <div style={{ padding: '20px 28px 18px', borderBottom: '1px solid rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrashBin width={16} height={16} style={{ color: '#ef4444' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#ef4444' }}>Danger Zone</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Critical safety tools</div>
                        </div>
                    </div>
                    <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Sign Out All Sessions</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>End this admin session globally on all devices</div>
                            </div>
                            <button
                                onClick={() => setDangerModal('logout-all')}
                                style={{
                                    padding: '8px 18px', borderRadius: 9,
                                    border: '1px solid rgba(255,77,0,0.3)',
                                    background: 'rgba(255,77,0,0.06)', color: '#ff8040',
                                    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                    display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.18s',
                                }}
                            >
                                <ArrowRightFromSquare width={13} height={13} /> Sign Out Everywhere
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
