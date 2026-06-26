'use client';

import { useEffect, useState } from 'react';
import StarRating from './StarRating';
import { getClientAverageRating, getClientKey } from '@/lib/clientRatings';

/**
 * Shows a client's average rating from stored freelancer reviews.
 */
export default function ClientRatingBadge({ clientId, clientEmail, clientName, size = 'sm' }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const key = getClientKey({ clientId, clientEmail, clientName });
        setStats(getClientAverageRating(key));
    }, [clientId, clientEmail, clientName]);

    if (!stats) return null;

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <StarRating value={Math.round(stats.average)} readOnly size={size} />
            <span style={{
                fontSize: size === 'sm' ? 10 : 11,
                fontWeight: 700,
                color: 'rgba(255,128,64,0.9)',
                fontFamily: "'JetBrains Mono', monospace",
            }}>
                {stats.average.toFixed(1)} ({stats.count})
            </span>
        </div>
    );
}
