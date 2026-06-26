const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/** Fetch dynamic stats for the logged-in freelancer (completed jobs, etc.). */
export async function getFreelancerStats(token) {
    if (!token) throw new Error('Authentication session token is required.');

    const res = await fetch(`${BASE_URL}/api/freelancers/me/stats`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to fetch freelancer stats: ${res.status}`);
    }

    return res.json();
}
