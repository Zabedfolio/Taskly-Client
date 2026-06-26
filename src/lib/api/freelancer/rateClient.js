import { saveRatingLocally } from '@/lib/clientRatings';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


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
        proposalId: String(proposalId),
        taskId: String(taskId),
        clientId: String(clientId),
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

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            saveRatingLocally({
                proposalId: payload.proposalId,
                taskId: payload.taskId,
                clientId: payload.clientId,
                clientName,
                stars,
                review: payload.review,
            });
            return { ok: true, source: 'api', rating: data };
        }

        // Server returned a structured error (proposal not found, not completed, etc.)
        if (data.error) {
            throw new Error(data.error);
        }

        // Route not deployed / server not restarted — fall back to localStorage below
        if (res.status === 404) {
            console.warn('[rateClient] POST /api/ratings not found — saving locally. Restart taskly-server.');
        } else {
            throw new Error(`Failed to submit rating (${res.status})`);
        }
    } catch (err) {
        if (err.message && !err.message.includes('fetch')) {
            throw err;
        }
    }

    saveRatingLocally({
        proposalId: payload.proposalId,
        taskId: payload.taskId,
        clientId: payload.clientId,
        clientName,
        stars,
        review: payload.review,
    });

    return { ok: true, source: 'local' };
}

export async function fetchMyRatings(email) {
    if (!email) return [];

    const res = await fetch(`${BASE_URL}/api/ratings`);
    if (!res.ok) return [];
    const allRatings = await res.json();
    return allRatings.filter(r => r.freelancerEmail?.toLowerCase() === email.toLowerCase());
}

/** Fetch average client rating stats from the backend. */
export async function fetchClientRatingStats(clientId) {
    if (!clientId) return null;

    try {
        const res = await fetch(`${BASE_URL}/api/ratings`);
        if (!res.ok) return null;
        const allRatings = await res.json();
        const clientRatings = allRatings.filter(r => r.clientId === clientId);
        if (clientRatings.length === 0) return null;
        const sum = clientRatings.reduce((s, r) => s + r.stars, 0);
        return {
            average: sum / clientRatings.length,
            count: clientRatings.length
        };
    } catch {
        return null;
    }
}
