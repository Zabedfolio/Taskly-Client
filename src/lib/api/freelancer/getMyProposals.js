const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Fetches all proposals submitted by the logged-in freelancer.
 * Queries the backend using ?freelancerEmail=mine and authenticates with the session token.
 */
export const getMyProposals = async (token) => {
    if (!token) throw new Error('Authentication session token is required.');

    const res = await fetch(
        `${BASE_URL}/api/proposals?freelancerEmail=mine`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to fetch proposals: ${res.status}`);
    }

    return res.json();
};
