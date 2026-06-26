import { saveRatingLocally } from '@/lib/clientRatings';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Submit a client rating for a completed proposal.
 * Falls back to localStorage when the backend endpoint is unavailable.
 */
export async function rateClient({
    proposalId,
    taskId,
    clientId,
    clientName,
    stars,
    review,
    token,
}) {
    const payload = {
        proposalId,
        taskId,
        clientId,
        stars,
        review: (review || '').trim(),
    };

    try {
        const res = await fetch(`${BASE_URL}/api/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            saveRatingLocally({
                proposalId,
                taskId,
                clientId,
                clientName,
                stars,
                review: payload.review,
            });
            return { ok: true, source: 'api' };
        }
    } catch (_) {}

    saveRatingLocally({
        proposalId,
        taskId,
        clientId,
        clientName,
        stars,
        review: payload.review,
    });

    return { ok: true, source: 'local' };
}
