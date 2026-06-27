'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getAdminTransactions, getAllUsers, getAllTasks } from '@/lib/api/admin/adminApi';
import { Persons, Briefcase, CircleDollar, ChartBar, ArrowRight } from '@gravity-ui/icons';
import Link from 'next/link';
import { motion } from 'framer-motion';


function DonutChart({ segments, size = 140, thickness = 20, label, sublabel }) {
    const  r = (size - thickness) / 2;
    const cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const total = segments.reduce((s, g) => s + g.value, 0);
     let cumFrac = 0;

    return   (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={thickness} />
                {total > 0 && segments.map((seg, i) => {

                    const frac = seg.value / total;
                    const dash = frac * circ;
                    const off  = -(cumFrac * circ);
                     cumFrac += frac;
                    return (
                        <motion.circle key={i} cx={cx} cy={cy} r={r} fill="none"
                            stroke={seg.color} strokeWidth={thickness} strokeLinecap="round"
                            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={off}
                            initial={{ strokeDasharray: `0 ${circ}` }}
                            animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
                            transition={{ duration: 0.9, delay: i * 0.15, ease: 'easeOut' }}
                            style={{ filter: `drop-shadow(0 0 6px ${seg.color}88)` }}
                        />
                    );
                })}
            </svg>

            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{label}</div>
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>{sublabel}</div>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {

    const { data: session, isPending } = useSession();
    const [payments, setPayments] = useState([]);
    const [tasks, setTasks]       = useState([]);
    const [users, setUsers]       = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        if (isPending) return;
        if (!session?.session?.token) { setLoading(false); return; }
        async function load() {

            try {
                const token = session.session.token;
                const [paymentsData, tasksData, usersData] = await Promise.all([
                    getAdminTransactions(token),
                    getAllTasks(),
                    getAllUsers(token)
                ]);

                setPayments(paymentsData || []);
                setTasks(tasksData || []);
                setUsers(usersData || []);
            } catch (err) {
                console.error('Admin load error:', err);
            } finally {

                   setLoading(false);
            }
        }

        load();
    }, [session, isPending]);

    if (isPending || loading) {
        return (
            <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00', animation: 'spin 0.75s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>LOADING ADMIN CONSOLE</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    
    const totalUsers    = users.length;
     const totalTasks    = tasks.length;
    const activeTasks   = tasks.filter(t => t.status === 'open').length;
      const totalRevenue  = payments.reduce((sum, p) => sum + (Number(p.payoutSize) || 0), 0);

    const clientCount     = users.filter(u => u.role === 'client').length;

    const freelancerCount = users.filter(u => u.role === 'freelancer').length;
    const  adminCount      = users.filter(u => u.role === 'admin').length;
    const blockedCount    = users.filter(u => u.isBlocked).length;

    
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyTasks = {}, monthlyRevenue = {}, monthlyUsers = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const lbl = monthNames[d.getMonth()];
        monthlyTasks[lbl] = 0; monthlyRevenue[lbl] = 0; monthlyUsers[lbl] = 0;

    }
    tasks.forEach(t => {
        if (!t.createdAt) return;
        const lbl = monthNames[new Date(t.createdAt).getMonth()];
        if (monthlyTasks[lbl] !== undefined) monthlyTasks[lbl]++;

    });
    payments.forEach(p => {

          if (!p.createdAt) return;
        const lbl = monthNames[new Date(p.createdAt).getMonth()];

          if (monthlyRevenue[lbl] !== undefined) monthlyRevenue[lbl] += (Number(p.payoutSize) || 0);

    });
    users.forEach(u => {
        if (!u.createdAt) return;
         const lbl = monthNames[new Date(u.createdAt).getMonth()];
        if (monthlyUsers[lbl] !== undefined) monthlyUsers[lbl]++;
    });


    const  chartLabels  = Object.keys(monthlyTasks);
    const taskValues   = Object.values(monthlyTasks);

    const revValues    = Object.values(monthlyRevenue);
    const userValues   = Object.values(monthlyUsers);
    const maxTask      = Math.max(...taskValues, 3);
    const maxRev       = Math.max(...revValues, 500);
    const  maxUser      = Math.max(...userValues, 3);

    
    const cW = 520, cH = 160, pL = 44, pR = 16, pT = 20, pB = 24;
    const gW = cW - pL - pR, gH = cH - pT - pB;
    const mkPts = (vals, mx) => vals.map((v, i) => ({ x: pL + (i / Math.max(vals.length-1,1)) * gW, y: pT + gH - (v / mx) * gH }));
    const mkLine = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const mkArea = (pts, line) => pts.length > 0 ? `${line} L ${pts[pts.length-1].x} ${pT+gH} L ${pts[0].x} ${pT+gH} Z` : '';

    const revPts   = mkPts(revValues, maxRev);
    const taskPts  = mkPts(taskValues.map(v => v * (maxRev / Math.max(maxTask,1))), maxRev); 
    const  revLine  = mkLine(revPts);

    const revArea  = mkArea(revPts, revLine);

    
    const categoryCounts = {};
    tasks.forEach(t => { if (t.category) categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1; });
      const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const catColors = ['#ff4d00','#a855f7','#06b6d4','#10b981','#eab308'];

    
    const openCount      = tasks.filter(t => (t.status||'').toLowerCase() === 'open').length;
    const progressCount  = tasks.filter(t => (t.status||'').toLowerCase().replace('-','_') === 'in_progress').length;
    const completedCount = tasks.filter(t => (t.status||'').toLowerCase() === 'completed').length;

    const CARD = { padding: '24px 26px', borderRadius: 20, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 16 };


    return   (
           <div className="dash-page-container">
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 36 }}>

                   <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                    Admin <span style={{ background: 'linear-gradient(135deg,#ff4d00,#ff8c42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Console</span>
                </h1>
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Platform-wide statistics, user management, and content moderation overview.</p>
            </motion.div>

            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 32 }}>
                 {[
                    { label: 'Total Users',   value: totalUsers,    icon: Persons,      color: '#ff4d00', bg: 'rgba(255,77,0,0.06)' },
                    { label: 'Total Tasks',   value: totalTasks,    icon: Briefcase,    color: '#a855f7', bg: 'rgba(168,85,247,0.06)' },
                    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: CircleDollar, color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
                    { label: 'Open Tasks',    value: activeTasks,   icon: ChartBar,     color: '#06b6d4', bg: 'rgba(6,182,212,0.06)' },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div key={idx} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.08 }} whileHover={{ y: -3 }}
                            style={{ padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{stat.label}</span>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon width={16} height={16} style={{ color: stat.color }} />
                                </div>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{stat.value}</div>
                        </motion.div>

                      );
                })}
            </div>

            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,300px),1fr))', gap: 20, marginBottom: 20 }}>

                

                <div style={CARD}>
                    <div>

                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Revenue Trend (USD)</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Monthly platform revenue — last 6 months</span>
                       </div>
                    <div style={{ width: '100%' }}>
                        <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                  </linearGradient>
                               </defs>
                            {[0,0.25,0.5,0.75,1].map((r,i) => (
                                <g key={i}>
                                      <line x1={pL} y1={pT+r*gH} x2={cW-pR} y2={pT+r*gH} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 3" />
                                    <text x={pL-6} y={pT+r*gH+3} textAnchor="end" fill="rgba(255,255,255,0.22)" fontSize="8" fontFamily="monospace">${Math.round(maxRev*(1-r))}</text>
                                </g>
                            ))}
                            {revArea && <motion.path d={revArea} fill="url(#revGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />}
                            {revLine && <motion.path d={revLine} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.5))' }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />}
                             {revPts.map((p, i) => (
                                <g key={i}>
                                    <motion.circle cx={p.x} cy={p.y} r="4" fill="#10b981" stroke="#080808" strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 + i * 0.08 }} />
                                    {revValues[i] > 0 && <motion.text x={p.x} y={p.y-9} textAnchor="middle" fill="#10b981" fontSize="8.5" fontWeight="700" fontFamily="monospace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 + i * 0.08 }}>${revValues[i]}</motion.text>}
                                </g>
                            ))}
                            {chartLabels.map((lbl, i) => (
                                <text key={i} x={pL+(i/Math.max(chartLabels.length-1,1))*gW} y={cH-4} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">{lbl}</text>
                            ))}
                        </svg>
                    </div>
                </div>

                
                <div style={CARD}>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Growth Metrics / Month</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>New tasks posted vs. new users registered</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 4 }}>
                        {[{ label: 'New Tasks', color: '#ff4d00' }, { label: 'New Users', color: '#a855f7' }].map((l, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ width: 12, height: 12, borderRadius: 3, background: l.color, display: 'inline-block' }} />
                                <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{l.label}</span>

                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, paddingBottom: 20, justifyContent: 'space-around' }}>
                        {chartLabels.map((lbl, i) => {
                            const tVal = taskValues[i], uVal = userValues[i];
                            const tH = maxTask > 0 ? Math.max((tVal / maxTask) * 90, tVal > 0 ? 6 : 0) : 0;
                              const  uH = maxUser > 0 ? Math.max((uVal / maxUser) * 90, uVal > 0 ? 6 : 0) : 0;
                            return (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 94 }}>
                                        <motion.div initial={{ height: 0 }} animate={{ height: tH }} transition={{ duration: 0.7, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
                                            style={{ width: 10, borderRadius: '3px 3px 1px 1px', background: tH > 0 ? 'linear-gradient(180deg,#ff4d00,rgba(255,77,0,0.3))' : 'rgba(255,255,255,0.04)', boxShadow: tH > 0 ? '0 0 8px rgba(255,77,0,0.25)' : 'none' }} />
                                        <motion.div initial={{ height: 0 }} animate={{ height: uH }} transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: 'easeOut' }}
                                            style={{ width: 10, borderRadius: '3px 3px 1px 1px', background: uH > 0 ? 'linear-gradient(180deg,#a855f7,rgba(168,85,247,0.3))' : 'rgba(255,255,255,0.04)', boxShadow: uH > 0 ? '0 0 8px rgba(168,85,247,0.25)' : 'none' }} />
                                    </div>
                                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{lbl}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,240px),1fr))', gap: 20, marginBottom: 20 }}>

                

                <div style={CARD}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>User Role Distribution</h3>

                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Breakdown of registered account types</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                        <DonutChart
                            segments={[
                                { value: clientCount,     color: '#ff4d00' },
                                { value: freelancerCount, color: '#a855f7' },
                                { value: adminCount,      color: '#06b6d4' },
                                { value: blockedCount,    color: '#ef4444' },
                            ].filter(s => s.value > 0)}

                            size={130} thickness={18}
                            label={totalUsers} sublabel="Users"
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, minWidth: 100 }}>
                            {[
                                { label: 'Clients',     count: clientCount,     color: '#ff4d00' },
                                { label: 'Freelancers', count: freelancerCount, color: '#a855f7' },
                                { label: 'Admins',      count: adminCount,      color: '#06b6d4' },

                                { label: 'Blocked',     count: blockedCount,    color: '#ef4444' },
                            ].map((r, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: 2, background: r.color, flexShrink: 0, boxShadow: `0 0 5px ${r.color}` }} />
                                    <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', flex: 1 }}>{r.label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: r.color, fontFamily: 'monospace' }}>{r.count}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                
                <div style={CARD}>

                    <div>

                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Task Status Overview</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Platform-wide task status breakdown</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                        <DonutChart
                            segments={[
                                { value: openCount,      color: '#06b6d4' },
                                 { value: progressCount,  color: '#eab308' },
                                { value: completedCount, color: '#22c55e' },
                                { value: Math.max(totalTasks - openCount - progressCount - completedCount, 0), color: 'rgba(255,255,255,0.1)' },
                            ].filter(s => s.value > 0)}
                            size={130} thickness={18}
                            label={totalTasks} sublabel="Tasks"
                          />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, minWidth: 100 }}>
                            {[
                                { label: 'Open',        count: openCount,      color: '#06b6d4' },
                                { label: 'In Progress', count: progressCount,  color: '#eab308' },
                                { label: 'Completed',   count: completedCount, color: '#22c55e' },
                            ].map((s, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                                        <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                              <span style={{ width: 7, height: 7, borderRadius: 2, background: s.color, display: 'inline-block' }} />{s.label}
                                        </span>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: s.color }}>{s.count}</span>
                                    </div>

                                    <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 99, overflow: 'hidden' }}>
                                          <motion.div initial={{ width: 0 }} animate={{ width: totalTasks > 0 ? `${(s.count/totalTasks)*100}%` : '0%' }} transition={{ duration: 0.6, delay: 0.2 + i * 0.07 }}
                                            style={{ height: '100%', background: s.color, borderRadius: 99, boxShadow: `0 0 6px ${s.color}` }} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                
                <div style={CARD}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 3px' }}>Top Task Categories</h3>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>Most popular service niches on the platform</span>
                    </div>
                    {topCategories.length === 0 ? (
                         <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>NO TASKS YET</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1, justifyContent: 'center' }}>
                            {topCategories.map(([cat, count], i) => {
                                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                                   return (
                                    <motion.div key={cat} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                                             <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '58%' }}>{cat}</span>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: catColors[i % catColors.length], flexShrink: 0 }}>{count} ({pct}%)</span>
                                        </div>
                                        <div style={{ height: 7, background: 'rgba(255,255,255,0.04)', borderRadius: 99, overflow: 'hidden' }}>

                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.2 + i * 0.06 }}
                                                style={{ height: '100%', background: catColors[i % catColors.length], borderRadius: 99, boxShadow: `0 0 8px ${catColors[i % catColors.length]}` }} />
                                        </div>
                                     </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>

            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
                {[
                    { label: 'Manage Users',  desc: 'View, block, or unblock platform accounts',    href: '/dashboard/admin/users' },
                    { label: 'Manage Tasks',  desc: 'Review and moderate all posted tasks',          href: '/dashboard/admin/tasks' },

                    { label: 'Transactions',  desc: 'View Stripe payment history and status logs',   href: '/dashboard/admin/transactions' },

                ].map((act, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.08 }} whileHover={{ scale: 1.01 }}>
                        <Link href={act.href} style={{ textDecoration: 'none' }}>
                            <div style={{ padding: '18px 20px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,77,0,0.02)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                 onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,77,0,0.3)'; e.currentTarget.style.background = 'rgba(255,77,0,0.05)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,77,0,0.02)'; }}>
                                <div>
                                       <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{act.label}</div>
                                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>{act.desc}</div>
                                </div>
                                <ArrowRight width={14} height={14} style={{ color: '#ff4d00' }} />
                            </div>
                        </Link>
                    </motion.div>
                 ))}
               </div>
        </div>
    );
}
