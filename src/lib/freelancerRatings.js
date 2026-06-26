const FREELANCER_RATINGS_KEY = 'taskly-freelancer-ratings';
export const FREELANCER_RATINGS_UPDATED_EVENT = 'taskly-freelancer-ratings-updated';

export function normalizeId(id) {
    if (id == null) return '';
    return typeof id === 'string' ? id : String(id);
}

export function getStoredFreelancerRatings() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(FREELANCER_RATINGS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveFreelancerRatingLocally(rating) {
    if (typeof window === 'undefined') return;
    try {
        const tid = normalizeId(rating.taskId);
        const existing = getStoredFreelancerRatings().filter(r => normalizeId(r.taskId) !== tid);
        existing.unshift({
            ...rating,
            taskId: tid,
            createdAt: rating.createdAt || new Date().toISOString(),
        });
        localStorage.setItem(FREELANCER_RATINGS_KEY, JSON.stringify(existing.slice(0, 200)));
        window.dispatchEvent(new CustomEvent(FREELANCER_RATINGS_UPDATED_EVENT));
    } catch (_) {}
}

export function getFreelancerRatingByTaskId(taskId) {
    if (!taskId) return null;
    const tid = normalizeId(taskId);
    return getStoredFreelancerRatings().find(r => normalizeId(r.taskId) === tid) || null;
}

export function getFreelancerRatingsMapByTaskId() {
    const map = {};
    getStoredFreelancerRatings().forEach(r => {
        const tid = normalizeId(r.taskId);
        if (tid) map[tid] = r;
    });
    return map;
}

export function mergeRatingsMaps(...maps) {
    return Object.assign({}, ...maps);
}
