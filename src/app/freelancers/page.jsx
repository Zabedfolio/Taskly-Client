'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllFreelancers } from '@/lib/api/home/getAllFreelancer';
import VerifiedBadge from '@/components/shared/VerifiedBadge';
import FreelancerDetailModal from '@/components/shared/FreelancerDetailModal';

// ─── Skill tag palette ──────────────────────────────────────────────────────
const SKILL_PALETTE = [
    { text: '#ff9a50', bg: '#ff640018', border: '#ff640030' },
    { text: '#50d4ff', bg: '#00aaff14', border: '#00aaff28' },
    { text: '#a78bfa', bg: '#7850ff14', border: '#7850ff28' },
    { text: '#34d399', bg: '#00c87814', border: '#00c87828' },
    { text: '#fb7185', bg: '#f0325014', border: '#f0325028' },
    { text: '#f59e0b', bg: '#d9770614', border: '#d9770628' },
];

function skillStyle(index) {
    return SKILL_PALETTE[index % SKILL_PALETTE.length];
}

// ─── Star Rating ────────────────────────────────────────────────────────────
function StarRating({ rating }) {
    const safe = Number(rating) || 0;
    const full = Math.floor(safe);
    const hasHalf = safe - full >= 0.5;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < full;
                const half = !filled && hasHalf && i === full;
                return (
                    <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <defs>
                            <linearGradient id={`hs-${i}`} x1="0" x2="1" y1="0" y2="0">
                                <stop offset="50%" stopColor="#ff8040" />
                                <stop offset="50%" stopColor="#ffffff20" />
                            </linearGradient>
                        </defs>
                        <polygon
                            points="6,1 7.5,4.5 11,4.8 8.5,7.2 9.2,11 6,9.2 2.8,11 3.5,7.2 1,4.8 4.5,4.5"
                            fill={filled ? '#ff8040' : half ? `url(#hs-${i})` : 'rgba(255,255,255,0.12)'}
                        />
                    </svg>
                );
            })}
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: '#ff8040', marginLeft: 3 }}>
                {safe.toFixed(1)}
            </span>
        </div>
    );
}

// ─── Verified Badge ─────────────────────────────────────────────────────────
// Uses shared VerifiedBadge component from @/components/shared/VerifiedBadge

// ─── FreelancerCard ─────────────────────────────────────────────────────────
function FreelancerCard({ freelancer, index, onClick }) {
    const name       = freelancer.name        ?? 'Freelancer';
    const title      = freelancer.title       ?? freelancer.role ?? '';
    const avatar     = freelancer.image       ?? freelancer.avatarUrl ?? 'https://i.pravatar.cc/300?img=1';
    let skills = freelancer.skills ?? [];
    if (typeof skills === 'string') {
        skills = skills.split(',').map(s => s.trim()).filter(Boolean);
    } else if (!Array.isArray(skills)) {
        skills = [];
    }
    const rating     = freelancer.rating      ?? 0;
    const jobsDone   = freelancer.completedJobs ?? freelancer.jobsDone ?? 0;
    const isVerified = freelancer.isVerified === true || freelancer.emailVerified === true;

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -5, boxShadow: '0 20px 60px rgba(255,77,0,0.13), 0 0 0 1px rgba(255,77,0,0.20)' }}
            className="freelancer-card"
            onClick={onClick}
        >
            {/* Top accent bar */}
            <motion.div
                style={{ height: 3, width: '100%', background: 'linear-gradient(90deg,#ff4d00,#ff8c42,transparent)', transformOrigin: 'left' }}
                initial={{ scaleX: 0, opacity: 0 }}
                whileHover={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            />

            <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', flex: 1, gap: 0 }}>
                {/* Avatar + name + verified */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                    <img
                        src={avatar}
                        alt={name}
                        style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,77,0,0.35)' }}
                        onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff4d00&color=fff`; }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', lineHeight: 1.2 }}>
                                {name}
                            </div>
                            {isVerified && <VerifiedBadge size="sm" />}
                        </div>
                        {title && (
                            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.38)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {title}
                            </div>
                        )}
                    </div>
                </div>

                {/* Skills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    {skills.slice(0, 5).map((skill, i) => {
                        const s = skillStyle(i);
                        return (
                            <span key={skill} style={{
                                fontFamily: "'JetBrains Mono',monospace",
                                fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                                color: s.text, background: s.bg, border: `1px solid ${s.border}`,
                                padding: '3px 8px', borderRadius: 5,
                            }}>
                                {skill}
                            </span>
                        );
                    })}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(255,77,0,0.18),rgba(255,255,255,0.05),transparent)', marginBottom: 16 }} />

                {/* Rating + Jobs Done */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 5 }}>
                            Avg. Rating
                        </div>
                        <StarRating rating={rating} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 5 }}>
                            Jobs Done
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700, color: '#ff8040', letterSpacing: '-0.02em' }}>
                            {Number(jobsDone).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

// ─── Skeleton Card ──────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div style={{
            height: 210, borderRadius: 16,
            background: 'linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0.03) 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
        }} />
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
const ALL_SKILLS = ['React', 'Node.js', 'Figma', 'After Effects', 'SEO', 'AWS', 'Python', 'Vue', 'Flutter', 'PostgreSQL', 'Premiere', 'Go', 'Docker', 'TypeScript', 'MongoDB'];

export default function FreelancersPage() {
    const [rawFreelancers, setRawFreelancers] = useState([]);
    const [allRatings, setAllRatings] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [allProposals, setAllProposals] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);

    const [searchQuery, setSearchQuery]       = useState('');
    const [selectedSkill, setSelectedSkill]   = useState('All Skills');
    const [sortBy, setSortBy]                 = useState('rating');
    const [verifiedOnly, setVerifiedOnly]     = useState(false);
    const [selectedFreelancerEmail, setSelectedFreelancerEmail] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
            const [freelancersData, ratingsRes, tasksRes, proposalsRes] = await Promise.all([
                getAllFreelancers(),
                fetch(`${baseUrl}/api/freelancer-ratings`),
                fetch(`${baseUrl}/api/tasks`),
                fetch(`${baseUrl}/api/proposals`)
            ]);
            
            const ratingsData = ratingsRes.ok ? await ratingsRes.json() : [];
            const tasksData = tasksRes.ok ? await tasksRes.json() : [];
            const proposalsData = proposalsRes.ok ? await proposalsRes.json() : [];

            setRawFreelancers(Array.isArray(freelancersData) ? freelancersData : []);
            setAllRatings(Array.isArray(ratingsData) ? ratingsData : []);
            setAllTasks(Array.isArray(tasksData) ? tasksData : []);
            setAllProposals(Array.isArray(proposalsData) ? proposalsData : []);
        } catch (err) {
            setError(err.message || 'Failed to load freelancers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // Compute stats client-side
    const freelancers = rawFreelancers.map(f => {
        const email = f.email?.toLowerCase().trim();
        
        // Average rating
        const fRatings = allRatings.filter(r => r.freelancerEmail?.toLowerCase() === email);
        const avg = fRatings.length > 0
            ? fRatings.reduce((sum, r) => sum + r.stars, 0) / fRatings.length
            : 0;

        // Completed jobs
        const fProposals = allProposals.filter(p => 
            p.freelancerEmail?.toLowerCase() === email && 
            p.status?.toLowerCase() === 'accepted'
        );
        const done = fProposals.filter(p => {
            const t = allTasks.find(task => task._id === p.taskId);
            return t && t.status?.toLowerCase() === 'completed';
        }).length;

        let skillsArr = f.skills ?? [];
        if (typeof skillsArr === 'string') {
            skillsArr = skillsArr.split(',').map(s => s.trim()).filter(Boolean);
        } else if (!Array.isArray(skillsArr)) {
            skillsArr = [];
        }

        return {
            ...f,
            skills: skillsArr,
            rating: avg || f.rating || 0,
            completedJobs: done || f.completedJobs || 0
        };
    });

    // Collect all unique skills from data for the filter
    const availableSkills = ['All Skills', ...Array.from(new Set([
        ...ALL_SKILLS,
        ...freelancers.flatMap(f => f.skills ?? []),
    ])).sort()];

    const filtered = freelancers
        .filter(f => {
            const matchSearch = !searchQuery ||
                (f.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (f.skills ?? []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchSkill = selectedSkill === 'All Skills' || (f.skills ?? []).includes(selectedSkill);
            const matchVerified = !verifiedOnly || f.emailVerified === true;
            return matchSearch && matchSkill && matchVerified;
        })
        .sort((a, b) => {
            if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
            if (sortBy === 'jobs') return (b.completedJobs ?? 0) - (a.completedJobs ?? 0);
            if (sortBy === 'name') return (a.name ?? '').localeCompare(b.name ?? '');
            return 0;
        });

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedSkill('All Skills');
        setSortBy('rating');
        setVerifiedOnly(false);
    };

    const hasActiveFilters = searchQuery || selectedSkill !== 'All Skills' || sortBy !== 'rating' || verifiedOnly;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
            <style>{`
                @keyframes shimmer { to { background-position: -200% 0; } }
                @keyframes pulse-glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
                .fl-filter-input {
                    padding: 10px 14px; border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.09);
                    background: rgba(255,255,255,0.04); color: #fff;
                    outline: none; font-size: 13.5px; transition: border 0.2s;
                    min-width: 140px; box-sizing: border-box;
                }
                .fl-filter-input:focus { border-color: #ff4d00; background: rgba(255,77,0,0.04); }
                select.fl-filter-input {
                    appearance: none; cursor: pointer;
                    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.35)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                    background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
                }
                select.fl-filter-input option { background: #111; color: #fff; }
                .freelancer-card {
                    background: #0f0604; border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 16px; overflow: hidden;
                    display: flex; flex-direction: column; cursor: pointer;
                }
                .fl-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }
                .verified-toggle {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 10px 14px; border-radius: 10px; cursor: pointer;
                    border: 1px solid rgba(255,255,255,0.09);
                    background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.55);
                    font-size: 13px; font-weight: 600; transition: all 0.2s; white-space: nowrap;
                    user-select: none;
                }
                .verified-toggle.active {
                    border-color: rgba(34,197,94,0.4);
                    background: rgba(34,197,94,0.07);
                    color: #22c55e;
                }
                @media(max-width: 640px) {
                    .fl-filter-row { flex-direction: column !important; align-items: stretch !important; }
                    .fl-filter-input, .verified-toggle, .fl-search-wrapper { width: 100% !important; }
                }
            `}</style>

            {/* Ambient background glow */}
            <div style={{
                pointerEvents: 'none', position: 'fixed', top: 0, left: '50%',
                transform: 'translateX(-50%)', width: '80vw', height: '40vh', zIndex: 0,
                background: 'radial-gradient(ellipse at 50% 0%,rgba(255,77,0,0.06) 0%,transparent 70%)',
                filter: 'blur(40px)',
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '120px 24px 80px' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: 36 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: '3px 10px', borderRadius: 99, marginBottom: 12,
                            background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.2)',
                        }}
                    >
                        <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="#ff4d00" strokeWidth="1.5" />
                            <path d="M5 8l2 2 4-4" stroke="#ff4d00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: '#ff4d00', letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: 'monospace' }}>Verified Talent</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}
                        style={{ fontSize: 'clamp(1.9rem,4vw,3rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 10px' }}
                    >
                        Browse{' '}
                        <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            Freelancers
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
                        style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', margin: 0 }}
                    >
                        {loading ? 'Loading talent…' : `${filtered.length} freelancer${filtered.length !== 1 ? 's' : ''} available`}
                    </motion.p>
                </div>

                {/* ── Filter Panel ── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
                    style={{
                        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 16, padding: 18, marginBottom: 28,
                    }}
                    className="fl-filter-row"
                >
                    {/* Search */}
                    <div className="fl-search-wrapper" style={{ flex: 2, minWidth: 220, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
                            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by name or skill…"
                            className="fl-filter-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: 38, width: '100%' }}
                        />
                    </div>

                    {/* Skill filter */}
                    <select
                        className="fl-filter-input"
                        value={selectedSkill}
                        onChange={e => setSelectedSkill(e.target.value)}
                        style={{ flex: 1, minWidth: 160 }}
                    >
                        {availableSkills.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Sort */}
                    <select
                        className="fl-filter-input"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        style={{ flex: 0.8, minWidth: 150 }}
                    >
                        <option value="rating">Highest Rated</option>
                        <option value="jobs">Most Jobs Done</option>
                        <option value="name">Name A–Z</option>
                    </select>

                    {/* Verified toggle */}
                    <button
                        onClick={() => setVerifiedOnly(v => !v)}
                        className={`verified-toggle${verifiedOnly ? ' active' : ''}`}
                    >
                        <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                            <circle cx="5" cy="5" r="4.5" stroke="currentColor" strokeWidth="1" />
                            <path d="M3 5l1.3 1.4L7 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Verified Only
                    </button>

                    {/* Reset */}
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            style={{ background: 'transparent', border: 'none', color: '#ff4d00', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: '6px 12px', textDecoration: 'underline', whiteSpace: 'nowrap' }}
                        >
                            Clear Filters
                        </button>
                    )}
                </motion.div>

                {/* ── Content ── */}
                {loading ? (
                    <div className="fl-grid">
                        {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                        <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#fff' }}>Failed to load freelancers</p>
                        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{error}</p>
                        <button
                            onClick={load}
                            style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,77,0,0.35)', background: 'rgba(255,77,0,0.08)', color: '#ff4d00', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                        >
                            Retry
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px', background: 'rgba(255,77,0,0.07)', border: '1px solid rgba(255,77,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#ff4d00" strokeWidth="1.8" strokeLinecap="round" />
                                <circle cx="12" cy="7" r="4" stroke="#ff4d00" strokeWidth="1.8" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>No freelancers found</h3>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    <div className="fl-grid">
                        {filtered.map((freelancer, i) => (
                            <FreelancerCard 
                                key={freelancer._id ?? i} 
                                freelancer={freelancer} 
                                index={i} 
                                onClick={() => setSelectedFreelancerEmail(freelancer.email)}
                            />
                        ))}
                    </div>
                )}

            </div>
            <FreelancerDetailModal
                open={!!selectedFreelancerEmail}
                onClose={() => setSelectedFreelancerEmail(null)}
                freelancerEmail={selectedFreelancerEmail}
            />
        </div>
    );
}
