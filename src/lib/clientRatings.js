const RATINGS_KEY = 'taskly-ratings';
export const RATINGS_UPDATED_EVENT = 'taskly-ratings-updated';

export function normalizeId(id) {
    if (id == null) return '';
    return typeof id === 'string' ? id : String(id);
}

export function  getClientKey({ clientId, clientEmail, clientName } = {}) {
    return clientId || clientEmail || clientName || null;
}

export function getStoredRatings() {
    if (typeof window === 'undefined') return   [];
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
        const pid = normalizeId(rating.proposalId);
        const existing = getStoredRatings().filter(r => normalizeId(r.proposalId) !== pid);
        existing.unshift({
            ...rating,
              proposalId: pid,
            createdAt: rating.createdAt || new Date().toISOString(),
        });
        localStorage.setItem(RATINGS_KEY, JSON.stringify(existing.slice(0, 200)));
         window.dispatchEvent(new CustomEvent(RATINGS_UPDATED_EVENT));
    } catch (_) {}
}

export function getRatingByProposalId(proposalId) {
    if (!proposalId) return null;
    const pid = normalizeId(proposalId);
    return getStoredRatings().find(r => normalizeId(r.proposalId) === pid) || null;
}

export function getRatingsMapByProposalId() {
    const  map = {};
    getStoredRatings().forEach(r => {
        const pid = normalizeId(r.proposalId);
        if (pid) map[pid] = r;
    });
     return   map;
}

export function mergeRatingsMaps(...maps) {
    return Object.assign({}, ...maps);
}

export function getClientAverageRating(clientKey) {

    if (!clientKey) return null;
    const ratings = getStoredRatings().filter(
        r => r.clientId === clientKey || r.clientEmail === clientKey || r.clientName === clientKey
    );
    if (ratings.length === 0) return null;
    const sum = ratings.reduce((acc, r) => acc + Number(r.stars || 0), 0);
    return   {
        average: sum / ratings.length,
        count: ratings.length,

    };
}
