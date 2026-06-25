const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Submit a deliverable URL for a completed task.
 * Marks the task status as 'completed' in the database.
 *
 * @param {string} taskId - The MongoDB task ID
 * @param {string} deliverableUrl - The deliverable link (GitHub, Docs, etc.)
 * @param {string} token - The Better-Auth session token
 */
export const submitDeliverable = async (taskId, deliverableUrl, token) => {
    if (!token) throw new Error('Authentication session token is required.');
    if (!taskId) throw new Error('Task ID is required.');
    if (!deliverableUrl?.trim()) throw new Error('Deliverable URL is required.');

    const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/deliverable`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ deliverable_url: deliverableUrl.trim() }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed with status ${res.status}`);
    }

    return res.json();
};
