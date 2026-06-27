'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { confirmSession } from '@/lib/api/client/stripePayments';
import { CreditCard, ArrowLeft, Lock, Briefcase, Envelope, Person, Copy, Check } from '@gravity-ui/icons';
import toast from 'react-hot-toast';
import Link from 'next/link';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, isPending: sessionPending } = useSession();

    const proposalId = searchParams.get('proposal_id');

    const  [proposal, setProposal] = useState(null);
     const [loadingProposal, setLoadingProposal] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    
    const [email, setEmail] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');

    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');

    const [focusedField, setFocusedField] = useState(null);
    const [cardCopied, setCardCopied] = useState(false);

      const DEMO_CARD = '4242424242424242';

     const handleCopyDemoCard = useCallback(() => {
        navigator.clipboard.writeText(DEMO_CARD).then(() => {

            setCardCopied(true);
            setCardNumber('4242 4242 4242 4242');
            toast.success('Demo card number copied & filled!', { duration: 2000 });
            setTimeout(() => setCardCopied(false), 2500);
        }).catch(() => {

            toast.error('Copy failed — please copy manually.');

        });
    }, []);

    
      useEffect(() => {
        if (!proposalId) return;

        async function fetchProposal() {
            try {
                   setLoadingProposal(true);
                const res = await fetch(`${BASE_URL}/api/proposals/${proposalId}`);

                if (!res.ok) throw new Error('Could not load proposal details.');
                const data = await res.json();
                setProposal(data);
            } catch (err) {
                   console.error(err);
                toast.error('Failed to load proposal details.');
            } finally {
                setLoadingProposal(false);
            }
        }

        fetchProposal();
    }, [proposalId]);

    
    useEffect(() => {
        if (session?.user?.email) {
            setEmail(session.user.email);
        }
    }, [session]);

    if (sessionPending || loadingProposal) {
           return (

            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0400', color: '#fff', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00', animation: 'spin 0.75s linear infinite' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.12em' }}>ESTABLISHING ENCRYPTED LINK...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!proposalId || !proposal) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0400', color: '#fff', flexDirection: 'column', gap: 20, textAlign: 'center', padding: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800 }}>Invalid Checkout link</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 400 }}>No active proposal ID was detected. Please return to your proposals dashboard to accept a bid.</p>
                <Link href="/dashboard/client/proposals" style={{ textDecoration: 'none', padding: '10px 20px', borderRadius: 8, background: '#ff4d00', color: '#fff', fontWeight: 600 }}>
                    Go to Proposals
                 </Link>
            </div>
        );
    }

    
    const handleCardNumberChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
        const matches = val.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {

            parts.push(match.substring(i, i + 4));
        }

        if (parts.length > 0) {
             setCardNumber(parts.join(' '));
        } else {
            setCardNumber(val);

        }

    };

    const handleExpiryChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (val.length >= 2) {
            setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
        } else {

            setCardExpiry(val);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
            toast.error('Please enter a valid 16-digit card number.');
            return;
        }
        if (!cardExpiry || cardExpiry.length < 5) {
            toast.error('Please enter card expiry (MM/YY).');
            return;
        }
        if (!cardCvc || cardCvc.length < 3) {
            toast.error('Please enter a 3-digit CVC security code.');
            return;
        }
        if (!cardName.trim()) {
            toast.error('Please enter the cardholder name.');
            return;
        }

        setSubmitting(true);
        const tId = toast.loading('Processing payment securely...');

        try {
            
            const dummySessionId = `cs_test_dummy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            
            
            await confirmSession(dummySessionId, proposalId);
            
            toast.success('Payment completed successfully!', { id: tId });
            
            
            router.push(`/success?session_id=${dummySessionId}&proposal_id=${proposalId}`);
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Payment confirmation failed. Please try again.', { id: tId });

            setSubmitting(false);
        }
    };

    const budgetSize = proposal.proposedBudget || 0;
    const processingFee = (budgetSize * 0.035).toFixed(2);
    const totalAmount = (Number(budgetSize) + Number(processingFee)).toFixed(2);

    const  inputStyle = (fieldName) => {
        const active = focusedField === fieldName;
        return {

             width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: `1px solid ${active ? '#ff4d00' : 'rgba(255,255,255,0.08)'}`,
            backgroundColor: active ? 'rgba(255,77,0,0.03)' : 'rgba(255,255,255,0.03)',
            color: '#fff',
            fontSize: 13.5,
            outline: 'none',
            transition: 'all 0.2s',
            boxSizing: 'border-box',
               fontFamily: 'inherit',
            boxShadow: active ? '0 0 0 3px rgba(255,77,0,0.12)' : 'none',

         };
    };

    return (
         <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #160701 0%, #0d0400 100%)',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflowX: 'hidden'
        }}>


            
            <div style={{ position: 'absolute', top: 82, left: 28, zIndex: 10 }}>
                <Link href="/dashboard/client/proposals" style={{
                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7,
                    color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
                }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ff4d00'}
                         onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                    <ArrowLeft width={14} height={14} /> Back to Proposals
                </Link>
            </div>

            
            <div style={{
                position: 'absolute', top: -120, left: '20%',
                width: 350, height: 350, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,77,0,0.06) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: 0,
            }} />
            <div style={{
                position: 'absolute', bottom: -120, right: '10%',
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,77,0,0.04) 0%, transparent 70%)',

                pointerEvents: 'none', zIndex: 0,
            }} />

            
            <div className="checkout-container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',

                minHeight: '100vh',
                position: 'relative',
                zIndex: 1
            }}>
                
                
                <div style={{
                       padding: '120px 48px 48px',

                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                       borderRight: '1px solid rgba(255,77,0,0.08)',
                    background: 'linear-gradient(135deg, rgba(255,77,0,0.015) 0%, transparent 100%)'
                }}>
                    <div style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
                        
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44 }}>
                            <img
                                src="https://i.ibb.co.com/RkRMLc0c/Untitled-design.png"
                                alt="Taskly logo"
                                style={{
                                    height: 32,
                                    width: 32,
                                    borderRadius: '9px',
                                    objectFit: 'cover',
                                    boxShadow: '0 2px 10px rgba(255,77,0,0.45)'

                                }}
                            />
                            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Taskly Checkout

                            </span>
                        </div>

                        
                        <div style={{ marginBottom: 32 }}>
                              <span style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#ff4d00',
                                textTransform: 'uppercase', fontFamily: 'monospace', background: 'rgba(255,77,0,0.08)',
                                padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(255,77,0,0.22)'
                            }}>
                                Hire Payout
                            </span>
                            <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.035em', margin: '14px 0 12px', color: '#fff', lineHeight: 1.25 }}>
                                {proposal.taskTitle || 'Untitled Task'}
                            </h2>
                            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.4)', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                                <Briefcase width={13} height={13} style={{ color: '#ff4d00' }} /> Freelancer: <strong style={{ color: 'rgba(255,255,255,0.75)' }}>{proposal.freelancerEmail}</strong>
                            </p>
                        </div>

                        
                        <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 36, fontFamily: 'system-ui' }}>
                            ${Number(budgetSize).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>USD</span>
                        </div>

                        
                        <div style={{
                               borderTop: '1px solid rgba(255,255,255,0.06)',
                            paddingTop: 20,
                            display: 'flex',
                               flexDirection: 'column',
                            gap: 15
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'rgba(255,255,255,0.4)' }}>
                                <span>Subtotal</span>
                                <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 600 }}>${Number(budgetSize).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'rgba(255,255,255,0.4)' }}>
                                <span>Platform Processing Fee (3.5%)</span>
                                <span style={{ color: '#fff', fontFamily: 'monospace', fontWeight: 600 }}>${processingFee}</span>
                            </div>
                              <div style={{ borderTop: '1px dashed rgba(255,77,0,0.2)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 14.5, fontWeight: 800 }}>
                                   <span style={{ color: '#fff' }}>Total Amount</span>
                                <span style={{ color: '#ff4d00', fontFamily: 'monospace', fontSize: 18, textShadow: '0 0 10px rgba(255,77,0,0.15)' }}>${totalAmount}</span>
                              </div>
                        </div>

                        
                        <div style={{
                               marginTop: 44,
                            display: 'flex',
                            alignItems: 'center',

                            gap: 11,
                            padding: '12px 18px',

                            borderRadius: 12,
                            background: 'rgba(34,197,94,0.04)',
                            border: '1px solid rgba(34,197,94,0.15)'
                        }}>
                            <Lock width={14} height={14} style={{ color: '#22c55e' }} />
                            <span style={{ fontSize: 11.5, color: 'rgba(34,197,94,0.8)', fontWeight: 600 }}>
                                Encrypted using mock Stripe integration.
                             </span>
                        </div>
                    </div>
                </div>

                
                <div style={{ padding: '120px 48px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
                        
                        <form onSubmit={handleSubmit} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 22,

                            padding: '36px',
                            borderRadius: 24,
                            border: '1px solid rgba(255,77,0,0.1)',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.015) 0%, transparent 100%)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                        }}>
                            <h3 style={{ fontSize: 19, fontWeight: 900, letterSpacing: '-0.027em', margin: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
                                <CreditCard width={17} height={17} style={{ color: '#ff4d00' }} /> Payment Details
                            </h3>

                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Email Address</label>

                                <div style={{ position: 'relative' }}>
                                    <input
                                          type="email"

                                        value={email}
                                        disabled
                                        style={{ ...inputStyle('email'), paddingLeft: 36, opacity: 0.55, cursor: 'not-allowed' }}
                                    />
                                    <Envelope width={13} height={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                </div>

                            </div>

                            
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, rgba(255,77,0,0.07) 0%, rgba(255,77,0,0.03) 100%)',

                                border: '1px dashed rgba(255,77,0,0.3)',
                                gap: 10,
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'monospace', color: '#ff4d00', textTransform: 'uppercase', letterSpacing: '0.14em' }}>🧪 Test Card Number</span>
                                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.18em', color: '#fff' }}>4242 4242 4242 4242</span>
                                </div>
                                <button
                                      type="button"
                                    id="copy-demo-card-btn"
                                    onClick={handleCopyDemoCard}

                                    title={cardCopied ? 'Copied!' : 'Copy & fill card number'}

                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        padding: '6px 12px',
                                        borderRadius: 7,
                                        border: `1px solid ${cardCopied ? 'rgba(34,197,94,0.4)' : 'rgba(255,77,0,0.3)'}`,
                                        background: cardCopied ? 'rgba(34,197,94,0.08)' : 'rgba(255,77,0,0.08)',
                                        color: cardCopied ? '#22c55e' : '#ff4d00',

                                        fontSize: 11,
                                        fontWeight: 700,
                                        fontFamily: 'monospace',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s',
                                        whiteSpace: 'nowrap',
                                        letterSpacing: '0.04em',
                                    }}

                                     onMouseEnter={e => { if (!cardCopied) { e.currentTarget.style.background = 'rgba(255,77,0,0.15)'; e.currentTarget.style.transform = 'scale(1.03)'; } }}
                                    onMouseLeave={e => { if (!cardCopied) { e.currentTarget.style.background = 'rgba(255,77,0,0.08)'; e.currentTarget.style.transform = 'scale(1)'; } }}
                                >
                                    {cardCopied
                                        ? <><Check width={11} height={11} /> Copied!</>
                                        : <><Copy width={11} height={11} /> Copy</>}
                                </button>
                            </div>

                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Card Number</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"

                                        placeholder="4242 4242 4242 4242"
                                        value={cardNumber}
                                          onChange={handleCardNumberChange}
                                        onFocus={() => setFocusedField('card-number')}
                                          onBlur={handleBlur => setFocusedField(null)}
                                        style={{ ...inputStyle('card-number'), paddingLeft: 36, letterSpacing: '0.08em' }}

                                         required
                                    />
                                     <CreditCard width={13} height={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                </div>
                            </div>

                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <label style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Expiry Date</label>
                                       <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={cardExpiry}
                                        onChange={handleExpiryChange}
                                        onFocus={() => setFocusedField('expiry')}
                                        onBlur={() => setFocusedField(null)}
                                          style={{ ...inputStyle('expiry'), textAlign: 'center' }}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                      <label style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>CVC Code</label>
                                      <input
                                        type="password"
                                         placeholder="•••"
                                        value={cardCvc}
                                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                        onFocus={() => setFocusedField('cvc')}
                                        onBlur={() => setFocusedField(null)}
                                        style={{ ...inputStyle('cvc'), textAlign: 'center', letterSpacing: '0.15em' }}
                                        required
                                    />

                                </div>
                            </div>

                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <label style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Cardholder Name</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Jane Doe"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        onFocus={() => setFocusedField('card-name')}
                                        onBlur={() => setFocusedField(null)}
                                        style={{ ...inputStyle('card-name'), paddingLeft: 36 }}
                                        required
                                    />
                                    <Person width={13} height={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                </div>
                            </div>

                            
                            <button
                                 type="submit"
                                disabled={submitting}

                                style={{
                                    marginTop: 10,
                                    padding: '14px 24px',
                                    borderRadius: 12,

                                    border: 'none',
                                    background: submitting ? 'rgba(255,77,0,0.5)' : 'linear-gradient(135deg, #ff4d00 0%, #cc3d00 100%)',
                                    color: '#fff',
                                    fontSize: 15,
                                    fontWeight: 700,
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    boxShadow: submitting ? 'none' : '0 0 20px rgba(255,77,0,0.35)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(255,77,0,0.5)'; } }}
                                onMouseLeave={e => { if (!submitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,77,0,0.35)'; } }}
                             >
                                {submitting ? (
                                    <>
                                        <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                                        Authorizing…
                                       </>
                                ) : (
                                    <>
                                        <Lock width={14} height={14} /> Pay ${totalAmount} USD
                                    </>
                                )}
                            </button>
                        </form>

                        <div style={{ marginTop: 28, textAlign: 'center', color: 'rgba(255,255,255,0.22)', fontSize: 11, lineHeight: 1.55, fontFamily: 'monospace' }}>

                            Secured by simulated Stripe API integration.<br />
                            Do not enter real credit card numbers.
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                   @media (max-width: 767px) {
                    .checkout-container { grid-template-columns: 1fr !important; }
                  }
            `}</style>
        </div>
    );
}


export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0400', color: '#fff', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid rgba(255,77,0,0.18)', borderTopColor: '#ff4d00', animation: 'spin 0.75s linear infinite' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: '0.12em' }}>INITIALIZING CHECKOUT...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        }>

            <CheckoutContent />
        </Suspense>
    );
}
