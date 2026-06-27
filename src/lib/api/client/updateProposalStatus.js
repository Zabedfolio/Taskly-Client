const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


export const updateProposalStatus = async (proposalId, status, token) => {
    if (!proposalId) throw new Error('Proposal ID is required.');

    if (!status) throw new Error('Status is required.');
    if (!token) throw new Error('Authentication session token is required.');

    const res = await fetch(
        `${BASE_URL}/api/proposals/${proposalId}/status`,

        {
            method: 'PATCH',
            headers: {

                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));

        throw new Error(err.error || `Failed to update proposal status: ${res.status}`);
    }

      return res.json();
};
