const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Fetches all proposals submitted to the tasks posted by the logged-in client.
 * Authenticates with the session token.
 */
export const getClientProposals = async (token) => {
    if (!token) throw new Error('Authentication session token is required.');

    const res = await fetch(
        `${BASE_URL}/api/client/proposals`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to fetch client proposals: ${res.status}`);
    }

    return res.json();
};
