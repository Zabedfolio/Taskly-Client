'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function FreelancerDetailModal({ open, onClose, freelancerEmail }) {
    const [loading, setLoading] = useState(false);
    const [freelancer, setFreelancer] = useState(null);
    const [ratingData, setRatingData] = useState({ average: 0, count: 0, reviews: [] });

    useEffect(() => {
        if (!open || !freelancerEmail) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
                const fRes = await fetch(`${baseUrl}/api/freelancers/${encodeURIComponent(freelancerEmail)}`);
                if (!fRes.ok) throw new Error('Failed to fetch freelancer details');

                const  fData = await fRes.json();
                 if (fData) {
                    let skills = fData.skills ?? [];
                    if (typeof skills === 'string') {
                           skills = skills.split(',').map(s => s.trim()).filter(Boolean);
                    } else if (!Array.isArray(skills)) {
                          skills = [];
                    }

                       fData.skills = skills;

                   }
                setFreelancer(fData);

                const rRes = await fetch(`${baseUrl}/api/freelancer-ratings?freelancerEmail=${encodeURIComponent(freelancerEmail)}`);
                if (rRes.ok) {
                    const rData = await rRes.json();
                    setRatingData(rData);
                }
            } catch (err) {
                toast.error(err.message || 'Error loading profile');
            } finally {
                setLoading(false);
            }
        };


        fetchData();
    }, [open, freelancerEmail]);

    useEffect(() => {
        if (!open) return;
        const  handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
          const hasHalf = rating % 1 >= 0.5;

        return (
            <div style={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                {[...Array(5)].map((_, i) => {
                    let fill = 'rgba(255,255,255,0.08)';
                    if (i < fullStars) fill = '#ff4d00';
                    else if (i === fullStars && hasHalf) fill = 'url(#half-star)';
                    return (
                        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={fill} stroke={fill === 'rgba(255,255,255,0.08)' ? 'rgba(255,255,255,0.2)' : '#ff4d00'} strokeWidth="1.5">
                            <defs>
                                <linearGradient id="half-star">
                                    <stop offset="50%" stopColor="#ff4d00" />
                                    <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
                                </linearGradient>
                            </defs>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>

                    );
                 })}

            </div>
        );
    };

    return (
        <>
            <style>{`
                @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
                @keyframes spin    { to { transform: rotate(360deg); } }
                
                .fdm-backdrop {
                    position: fixed; inset: 0; z-index: 500;
                    background: rgba(0,0,0,0.85);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 20px;
                }
                
                .fdm-container {
                    display: flex; flex-direction: column;
                    width: 100%; max-width: 500px;
                    background: #090909;
                    border: 1px solid rgba(255,255,255,0.08);
                       border-radius: 20px;
                    box-shadow: 0 24px 64px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,77,0,0.04);
                    overflow: hidden;
                    animation: scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                      max-height: 85vh;
                    position: relative;
                }

                .fdm-close-btn {
                    position: absolute; top: 16px; right: 16px;
                    width: 28px; height: 28px; border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.08);

                    background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.4);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s; font-size: 11px; z-index: 10;
                }
                
                .fdm-close-btn:hover {

                    background: rgba(255,77,0,0.1); border-color: rgba(255,77,0,0.3); color: #fff;
                }


                .fdm-header {
                    padding: 28px 24px 20px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    background: linear-gradient(180deg, rgba(255,77,0,0.02) 0%, transparent 100%);
                    display: flex; flex-direction: column; align-items: center;
                }

                .fdm-body {
                    padding: 20px 24px 28px;
                      overflow-y: auto;
                    display: flex; flex-direction: column; gap: 20px;
                }

                .fdm-skill-tag {
                    font-size: 10px; font-weight: 700;
                    color: #ff8c42; background: rgba(255,77,0,0.06); border: 1px solid rgba(255,77,0,0.12);
                    padding: 3px 8px; border-radius: 6px; font-family: monospace; letter-spacing: 0.02em;
                }

                .fdm-stats-grid {
                    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
                }


                .fdm-stat-box {
                    padding: 12px 8px; border-radius: 12px;
                      background: rgba(255,255,255,0.02);

                    border: 1px solid rgba(255,255,255,0.05);
                    text-align: center;
                }

                 .fdm-review-card {
                    padding: 14px 16px; border-radius: 12px;
                    background: rgba(255,255,255,0.015);
                    border: 1px solid rgba(255,255,255,0.04);
                    display: flex; flex-direction: column; gap: 8px;
                    transition: border 0.2s;
                }

                .fdm-review-card:hover {
                    border-color: rgba(255,77,0,0.15);
                }
            `}</style>

            <div className="fdm-backdrop" onClick={onClose}>
                <div className="fdm-container" onClick={e => e.stopPropagation()}>
                       <button className="fdm-close-btn" onClick={onClose} aria-label="Close modal">
                        ✕
                    </button>

                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
                            <span style={{ width: 28, height: 28, border: '3px solid rgba(255,255,255,0.12)', borderTopColor: '#ff4d00', borderRadius: '50%', animation: 'spin 0.75s linear infinite', display: 'inline-block' }} />
                        </div>
                    ) : freelancer ? (

                        <>
                            
                            <div className="fdm-header">
                                
                                <div style={{ position: 'relative', marginBottom: 14 }}>
                                       {freelancer.image ? (
                                        <img 
                                            src={freelancer.image} 
                                            alt={freelancer.name} 
                                            style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff4d00', boxShadow: '0 0 16px rgba(255,77,0,0.15)' }}
                                        />

                                    ) : (
                                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #ff4d00, #b33600)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ff4d00', color: '#fff', fontSize: 28, fontWeight: 800 }}>
                                            {freelancer.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {freelancer.isVerified && (

                                        <span style={{ position: 'absolute', bottom: -2, right: -2, background: '#10b981', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #090909', fontSize: 10 }} title="Verified Freelancer">
                                            ✓
                                        </span>

                                    )}
                                </div>

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>{freelancer.name}</h2>
                                        {freelancer.emailVerified && (
                                            <span style={{ fontSize: 8, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', padding: '2px 5px', borderRadius: 4, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                                                Verified
                                             </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{freelancer.title}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginTop: 3 }}>{freelancer.email}</div>
                                </div>
                            </div>

                            
                            <div className="fdm-body" style={{ maxHeight: 'calc(85vh - 162px)', overflowY: 'auto' }}>
                                
                                {freelancer.bio && (
                                    <div>
                                        <h4 style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                                            Biography
                                        </h4>
                                           <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                                              {freelancer.bio}
                                        </p>
                                    </div>
                                )}

                                
                                {freelancer.skills && freelancer.skills.length > 0 && (
                                    <div>
                                        <h4 style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                                            Core Skills
                                        </h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {freelancer.skills.map((skill, idx) => (
                                                <span key={idx} className="fdm-skill-tag">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                

                                  <div className="fdm-stats-grid">
                                    <div className="fdm-stat-box">
                                        <div style={{ fontSize: 8.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                                            Rating
                                        </div>
                                        <div style={{ marginBottom: 4 }}>
                                            {renderStars(ratingData.average || freelancer.rating || 0)}
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
                                            {Number(ratingData.average || freelancer.rating || 0).toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="fdm-stat-box">
                                        <div style={{ fontSize: 8.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                                            Reviews
                                        </div>
                                        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
                                            {ratingData.count ?? 0}
                                        </div>
                                        <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>

                                            {ratingData.count === 1 ? 'feedback' : 'feedbacks'}
                                        </span>
                                    </div>

                                    <div className="fdm-stat-box">
                                        <div style={{ fontSize: 8.5, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                                            Jobs Done
                                        </div>
                                        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
                                            {freelancer.completedJobs ?? 0}
                                        </div>

                                        <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                                            contracts
                                        </span>
                                    </div>
                                </div>

                                
                                <div>
                                     <h4 style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                                        Client Reviews ({ratingData.reviews?.length || 0})
                                    </h4>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {!ratingData.reviews || ratingData.reviews.length === 0 ? (
                                            <div style={{
                                                padding: '16px', borderRadius: 10,
                                                background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)',
                                                textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12
                                            }}>
                                                No reviews recorded yet.
                                            </div>
                                        ) : (
                                            ratingData.reviews.map((rev) => (
                                                <div key={rev._id || rev.createdAt} className="fdm-review-card">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                                        <div>
                                                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{rev.clientName}</div>
                                                            <div style={{ fontSize: 10, color: '#ff4d00', marginTop: 1, fontWeight: 600 }}>
                                                                {rev.taskTitle}
                                                               </div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                                                            <div style={{ display: 'flex', gap: 1.5 }}>
                                                                 {[...Array(5)].map((_, idx) => (
                                                                    <svg key={idx} width="9" height="9" viewBox="0 0 24 24" fill={idx < rev.stars ? '#ff4d00' : 'rgba(255,255,255,0.08)'}>

                                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                                    </svg>
                                                                ))}
                                                            </div>
                                                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', fontFamily: 'monospace' }}>
                                                                {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                          </div>

                                                    </div>
                                                    {rev.review && (
                                                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.45, margin: 0, paddingLeft: 6, borderLeft: '1.5px solid rgba(255,77,0,0.3)' }}>
                                                            "{rev.review}"
                                                        </p>

                                                    )}
                                                </div>
                                            ))
                                          )}
                                    </div>
                                </div>
                            </div>

                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '40px 24px' }}>
                            Profile not found.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
