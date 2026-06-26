const RATINGS_KEY = 'taskly-ratings';

export function getClientKey({ clientId, clientEmail, clientName } = {}) {
    return clientId || clientEmail || clientName || null;
}

export function getStoredRatings() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(RATINGS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveRatingLocally(rating) {
    if (typeof window === 'undefined') return;
    try {
        const existing = getStoredRatings().filter(r => r.proposalId !== rating.proposalId);
        existing.unshift({
            ...rating,
            createdAt: rating.createdAt || new Date().toISOString(),
        });
        localStorage.setItem(RATINGS_KEY, JSON.stringify(existing.slice(0, 200)));
    } catch (_) {}
}

export function getRatingByProposalId(proposalId) {
    if (!proposalId) return null;
    return getStoredRatings().find(r => r.proposalId === proposalId) || null;
}

export function getRatingsMapByProposalId() {
    const map = {};
    getStoredRatings().forEach(r => {
        if (r.proposalId) map[r.proposalId] = r;
    });
    return map;
}

export function getClientAverageRating(clientKey) {
    if (!clientKey) return null;
    const ratings = getStoredRatings().filter(
        r => r.clientId === clientKey || r.clientEmail === clientKey || r.clientName === clientKey
    );
    if (ratings.length === 0) return null;
    const sum = ratings.reduce((acc, r) => acc + Number(r.stars || 0), 0);
    return {
        average: sum / ratings.length,
        count: ratings.length,
    };
}
