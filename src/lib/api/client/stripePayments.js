const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Initiates a Stripe Checkout Session for accepting a freelancer proposal.
 * @param {string} proposalId - The ID of the proposal to accept.
 * @param {string} token - Client session authorization token.
 * @returns {Promise<{url: string}>} - The Stripe checkout redirect URL.
 */
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

/**
 * Confirms a Stripe checkout session payment and updates proposal/task statuses.
 * @param {string} sessionId - The Stripe Checkout Session ID.
 * @param {string} proposalId - The proposal ID associated with the payment.
 * @returns {Promise<{message: string, taskTitle: string, workerName: string, priceSize: number}>}
 */
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
