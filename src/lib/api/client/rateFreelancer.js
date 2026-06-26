import { saveFreelancerRatingLocally } from '@/lib/freelancerRatings';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function rateFreelancer({
    taskId,
    freelancerEmail,
    stars,
    review,
    token,
}) {
    const payload = {
        taskId: String(taskId),
        freelancerEmail: String(freelancerEmail),
        stars,
        review: (review || '').trim(),
    };

    try {
        const res = await fetch(`${BASE_URL}/api/freelancer-ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            saveFreelancerRatingLocally({
                taskId: payload.taskId,
                freelancerEmail: payload.freelancerEmail,
                stars,
                review: payload.review,
            });
            return { ok: true, source: 'api', rating: data };
        }

        if (data.error) {
            throw new Error(data.error);
        }

        if (res.status === 404) {
            console.warn('[rateFreelancer] POST /api/freelancer-ratings not found — saving locally.');
        } else {
            throw new Error(`Failed to submit rating (${res.status})`);
        }
    } catch (err) {
        if (err.message && !err.message.includes('fetch')) {
            throw err;
        }
    }

    saveFreelancerRatingLocally({
        taskId: payload.taskId,
        freelancerEmail: payload.freelancerEmail,
        stars,
        review: payload.review,
    });

    return { ok: true, source: 'local' };
}

/** Fetch all freelancer ratings submitted by this client. */
export async function fetchMyFreelancerRatings(email) {
    if (!email) return [];

    const res = await fetch(`${BASE_URL}/api/freelancer-ratings?clientEmail=${encodeURIComponent(email)}`);

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}
