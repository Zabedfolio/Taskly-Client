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

/** Fetch all ratings submitted by the logged-in freelancer. */
export async function fetchMyRatings(token) {
    if (!token) return [];

    const res = await fetch(`${BASE_URL}/api/ratings?mine=true`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

/** Fetch average client rating stats from the backend. */
export async function fetchClientRatingStats(clientId) {
    if (!clientId) return null;

    try {
        const res = await fetch(`${BASE_URL}/api/ratings/client/${encodeURIComponent(clientId)}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data?.count) return null;
        return { average: data.average, count: data.count };
    } catch {
        return null;
    }
}
