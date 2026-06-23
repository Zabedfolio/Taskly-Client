'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

import LayoutCellsLarge from '@gravity-ui/icons/LayoutCellsLarge';
import LayoutSideContentLeft from '@gravity-ui/icons/LayoutSideContentLeft';
import Briefcase from '@gravity-ui/icons/Briefcase';
import Gear from '@gravity-ui/icons/Gear';
import Persons from '@gravity-ui/icons/Persons';
import {
    Bookmark, CreditCard, Factory, FileText,
    Magnifier, ArrowRightFromSquare,
    ChartBar, Plus, Xmark,
} from '@gravity-ui/icons';
import UnauthorizedPage from '@/app/unauthorized/page';

// ─── Nav map per role ─────────────────────────────────────────────────────────
const NAV_MAP = {
    client: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutCellsLarge, href: '/dashboard/client' },
        { id: 'post-task', label: 'Post a Task', icon: Plus, href: '/dashboard/client/post-task' },
        { id: 'my-tasks', label: 'My Tasks', icon: Briefcase, href: '/dashboard/client/my-tasks' },
        { id: 'proposals', label: 'Proposals', icon: FileText, href: '/dashboard/client/proposals' },
        { id: 'settings', label: 'Settings', icon: Gear, href: '/dashboard/client/settings' },
    ],
    freelancer: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutCellsLarge, href: '/dashboard/freelancer' },
        { id: 'browse', label: 'Browse Tasks', icon: Magnifier, href: '/dashboard/freelancer/browse' },
        { id: 'proposals', label: 'My Proposals', icon: FileText, href: '/dashboard/freelancer/proposals' },
        { id: 'active', label: 'Active Work', icon: Briefcase, href: '/dashboard/freelancer/active' },
        { id: 'earnings', label: 'Earnings', icon: CreditCard, href: '/dashboard/freelancer/earnings' },
        { id: 'settings', label: 'Settings', icon: Gear, href: '/dashboard/freelancer/settings' },
    ],
    admin: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutCellsLarge, href: '/dashboard/admin' },
        { id: 'users', label: 'Users', icon: Persons, href: '/dashboard/admin/users' },
        { id: 'tasks', label: 'Tasks', icon: Briefcase, href: '/dashboard/admin/tasks' },
        { id: 'transactions', label: 'Transactions', icon: CreditCard, href: '/dashboard/admin/transactions' },
        { id: 'settings', label: 'Settings', icon: Gear, href: '/dashboard/admin/settings' },
    ],
};

const ALLOWED_ROLES = ['client', 'freelancer', 'admin'];

// ─── Layout constants ─────────────────────────────────────────────────────────
const NAVBAR_HEIGHT = 84;
const DASH_TOPBAR_HEIGHT = 56;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}
function routeToNavId(pathname, navItems) {
    if (!pathname) return 'dashboard';
    const matched = navItems.find(
        item => item.id !== 'dashboard' && pathname.startsWith(item.href)
    );
    return matched ? matched.id : 'dashboard';
}

// ─── Role accent colours ──────────────────────────────────────────────────────
const ROLE_ACCENT = {
    client: { color: '#ff4d00', glow: 'rgba(255,77,0,0.18)', label: 'Client' },
    freelancer: { color: '#ff4d00', glow: 'rgba(255,77,0,0.18)', label: 'Freelancer' },
    admin: { color: '#ff4d00', glow: 'rgba(255,77,0,0.18)', label: 'Admin' },
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#080808', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00',
                    animation: 'spin 0.75s linear infinite',
                }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                    LOADING
                </span>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ─── Nav list ─────────────────────────────────────────────────────────────────
function NavList({ navItems, activeId, collapsed = false, onClose }) {
    return (
        <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
            {navItems.map(({ id, label, href, icon: Icon }) => {
                const isActive = activeId === id;
                return (
                    <Link key={id} href={href} onClick={() => onClose?.()} title={collapsed ? label : undefined} style={{
                        position: 'relative', display: 'flex', alignItems: 'center',
                        gap: collapsed ? 0 : 11,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        padding: collapsed ? '10px' : '10px 12px',
                        borderRadius: 12,
                        border: `1px solid ${isActive ? 'rgba(255,77,0,0.3)' : 'transparent'}`,
                        background: isActive ? 'rgba(255,77,0,0.1)' : 'transparent',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                        textDecoration: 'none', fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                        transition: 'all 0.18s',
                    }}>
                        {isActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: '0 3px 3px 0', background: '#ff4d00', boxShadow: '0 0 8px #ff4d00' }} />}
                        <Icon width={17} height={17} style={{ flexShrink: 0 }} />
                        {!collapsed && <span>{label}</span>}
                    </Link>
                );
            })}
        </nav>
    );
}

// ─── Logout button ────────────────────────────────────────────────────────────
function LogoutButton({ collapsed, onLogout }) {
    return (
        <div style={{ padding: collapsed ? '12px 8px' : '12px 12px', paddingBottom: 20 }}>
            <button onClick={onLogout} title={collapsed ? 'Sign Out' : undefined} style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start', gap: 10,
                padding: collapsed ? '10px' : '10px 12px', borderRadius: 12,
                border: '1px solid rgba(255,77,0,0.15)', background: 'rgba(255,77,0,0.06)',
                color: 'rgba(255,100,0,0.8)', fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
            }}>
                <ArrowRightFromSquare width={16} height={16} style={{ flexShrink: 0 }} />
                {!collapsed && <span>Sign Out</span>}
            </button>
        </div>
    );
}

// ─── Full sidebar content ─────────────────────────────────────────────────────
function FullSidebarContent({ navItems, activeId, onToggle, onClose, onLogout, user, isMobile = false }) {
    const accent = ROLE_ACCENT[user?.role] || ROLE_ACCENT.client;
    const initials = getInitials(user?.name);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 14px',
                height: 56,
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                flexShrink: 0,
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: 'linear-gradient(135deg, #ff4d00, #cc3d00)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 12px rgba(255,77,0,0.4)', flexShrink: 0,
                    }}>
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                            <path d="M3 13L8 3L13 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 9.5H11" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                    </div>
                    {isMobile && (
                        <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Taskly</span>
                    )}
                </Link>
                <button onClick={onToggle} style={{
                    width: 30, height: 30, borderRadius: 8, border: 'none',
                    background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.5)',
                }} aria-label={isMobile ? 'Close' : 'Collapse'}>
                    {isMobile ? <Xmark width={16} height={16} /> : <LayoutSideContentLeft width={16} height={16} />}
                </button>
            </div>

            {/* User card */}
            <div style={{ padding: '12px 12px 6px' }}>
                <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: user?.image ? 'transparent' : 'linear-gradient(135deg, #ff4d00, #cc3d00)',
                            fontSize: 12, fontWeight: 800, color: '#fff',
                        }}>
                            {user?.image ? <img src={user.image} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{user?.email || ''}</div>
                        </div>
                    </div>
                    <div style={{ marginTop: 9 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace', color: accent.color, background: accent.glow, border: '1px solid rgba(255,77,0,0.28)' }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent.color, boxShadow: `0 0 5px ${accent.color}`, display: 'inline-block' }} />
                            {accent.label}
                        </span>
                    </div>
                </div>
            </div>

            <NavList navItems={navItems} activeId={activeId} onClose={onClose} />

            {/* Help card */}
            <div style={{ padding: '0 12px 8px' }}>
                <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(135deg, rgba(255,77,0,0.07) 0%, transparent 100%)', padding: '11px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 3 }}>Need help?</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>Contact support or visit our docs anytime.</div>
                </div>
            </div>

            <LogoutButton collapsed={false} onLogout={onLogout} />
        </div>
    );
}

// ─── Collapsed rail ───────────────────────────────────────────────────────────
function CollapsedRail({ navItems, activeId, onToggle, onLogout, user }) {
    const initials = getInitials(user?.name);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)', width: '100%', flexShrink: 0 }}>
                <button onClick={onToggle} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                    <LayoutSideContentLeft width={16} height={16} />
                </button>
            </div>
            <div style={{ padding: '12px 0 8px' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: user?.image ? 'transparent' : 'linear-gradient(135deg, #ff4d00, #cc3d00)', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                    {user?.image ? <img src={user.image} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
            </div>
            <div style={{ width: 'calc(100% - 16px)', height: 1, background: 'rgba(255,255,255,0.07)', margin: '2px 0 4px' }} />
            <NavList navItems={navItems} activeId={activeId} collapsed />
            <LogoutButton collapsed onLogout={onLogout} />
        </div>
    );
}

// ─── Main DashboardLayout ─────────────────────────────────────────────────────
export default function DashboardSidebar({ children }) {
    const { data: session, isPending } = useSession();
    const user = session?.user;
    const pathname = usePathname();
    const router = useRouter();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        setLoggingOut(true);
        try { await authClient.signOut(); } catch (_) { }
        router.push('/auth/login');
    }

    useEffect(() => { setMobileOpen(false); }, [pathname]);

    if (isPending || loggingOut) return <LoadingSkeleton />;
    if (!user) { router.replace('/auth/login'); return <LoadingSkeleton />; }

    // ── Role guard → new futuristic UnauthorizedPage ──────────────────────────
    if (!ALLOWED_ROLES.includes(user.role)) return <UnauthorizedPage role={user.role} />;
    const routeRole = pathname?.split('/')[2];
    if (routeRole && ALLOWED_ROLES.includes(routeRole) && routeRole !== user.role) {
        return <UnauthorizedPage role={user.role} />;
    }

    const navItems = NAV_MAP[user.role] || NAV_MAP.client;
    const activeId = routeToNavId(pathname, navItems);

    return (
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; }
                body { margin: 0; }
                @keyframes spin { to { transform: rotate(360deg); } }
                a { text-decoration: none; }
                input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
                input:-webkit-autofill, input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0 40px #0a0200 inset !important;
                    -webkit-text-fill-color: #fff !important;
                }

                .dash-wrapper {
                    display: flex;
                    margin-top: ${NAVBAR_HEIGHT}px;
                    min-height: calc(100vh - ${NAVBAR_HEIGHT}px);
                    background: #080808;
                    font-family: system-ui, -apple-system, sans-serif;
                    position: relative;
                }

                .desktop-sidebar {
                    position: sticky;
                    top: ${NAVBAR_HEIGHT}px;
                    height: calc(100vh - ${NAVBAR_HEIGHT}px);
                    flex-shrink: 0;
                    background: #0c0c0c;
                    border-right: 1px solid rgba(255,255,255,0.08);
                    overflow-x: hidden;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }

                .dash-mobile-topbar {
                    display: none;
                    position: fixed;
                    top: ${NAVBAR_HEIGHT}px;
                    left: 0; right: 0;
                    height: ${DASH_TOPBAR_HEIGHT}px;
                    z-index: 30;
                    padding: 0 16px;
                    background: #0c0c0c;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    align-items: center;
                    gap: 12px;
                }

                .dash-main {
                    flex: 1;
                    min-width: 0;
                    overflow-x: hidden;
                }

                @media (max-width: 1023px) {
                    .desktop-sidebar { display: none !important; }
                    .dash-mobile-topbar { display: flex !important; }
                    .dash-main { padding-top: ${DASH_TOPBAR_HEIGHT}px; }
                }
                @media (min-width: 640px) {
                    .dash-wrapper { margin-top: 88px; min-height: calc(100vh - 88px); }
                    .desktop-sidebar { top: 88px; height: calc(100vh - 88px); }
                    .dash-mobile-topbar { top: 88px; }
                }
            `}</style>

            <div className="dash-wrapper">

                {/* ── Mobile topbar ── */}
                <div className="dash-mobile-topbar">
                    <button
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open sidebar"
                        style={{
                            width: 40, height: 40, borderRadius: 11,
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)',
                            cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: 'rgba(255,255,255,0.8)', flexShrink: 0,
                        }}
                    >
                        <LayoutSideContentLeft width={19} height={19} />
                    </button>

                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                        Dashboard
                        <span style={{ color: '#ff4d00', marginLeft: 6, fontSize: 12, fontWeight: 600 }}>
                            / {ROLE_ACCENT[user.role]?.label}
                        </span>
                    </span>
                </div>

                {/* ── Mobile backdrop ── */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40 }}
                        />
                    )}
                </AnimatePresence>

                {/* ── Mobile drawer ── */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.aside
                            key="drawer"
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.22 }}
                            style={{
                                position: 'fixed',
                                top: NAVBAR_HEIGHT,
                                left: 0, zIndex: 50,
                                width: 272,
                                height: `calc(100dvh - ${NAVBAR_HEIGHT}px)`,
                                background: '#0c0c0c',
                                borderRight: '1px solid rgba(255,255,255,0.08)',
                                overflowY: 'auto',
                            }}
                        >
                            <FullSidebarContent
                                navItems={navItems} activeId={activeId}
                                onToggle={() => setMobileOpen(false)}
                                onClose={() => setMobileOpen(false)}
                                onLogout={handleLogout} user={user} isMobile
                            />
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* ── Desktop sidebar ── */}
                <motion.aside
                    className="desktop-sidebar"
                    animate={{ width: collapsed ? 64 : 264 }}
                    transition={{ type: 'tween', duration: 0.22 }}
                >
                    {collapsed
                        ? <CollapsedRail navItems={navItems} activeId={activeId} onToggle={() => setCollapsed(false)} onLogout={handleLogout} user={user} />
                        : <FullSidebarContent navItems={navItems} activeId={activeId} onToggle={() => setCollapsed(true)} onLogout={handleLogout} user={user} isMobile={false} />
                    }
                </motion.aside>

                {/* ── Main content ── */}
                <main className="dash-main">{children}</main>
            </div>
        </>
    );
}