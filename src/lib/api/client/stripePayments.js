const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


export const createCheckoutSession = async (proposalId, token) => {
    if (!proposalId || !token) throw new Error('Proposal ID and Auth token are required.');

    const res = await fetch(`${BASE_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ proposalId })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to initiate checkout session');
    }

       return res.json();
};


export const confirmSession = async (sessionId, proposalId) => {
    if (!sessionId || !proposalId) throw new Error('Session ID and Proposal ID are required.');

    const res = await fetch(`${BASE_URL}/api/confirm-session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId, proposalId })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Payment confirmation failed');

    }

    return res.json();
};
