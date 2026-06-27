'use client';

import { useEffect, useState } from 'react';
import StarRating from './StarRating';
import {
    getClientAverageRating,
      getClientKey,
    RATINGS_UPDATED_EVENT,

} from '@/lib/clientRatings';
import { fetchClientRatingStats } from '@/lib/api/freelancer/rateClient';


export default function  ClientRatingBadge({ clientId, clientEmail, clientName, size = 'sm' }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const key = getClientKey({ clientId, clientEmail, clientName });

        async function  load() {
            const apiStats = clientId ? await fetchClientRatingStats(clientId) : null;
               if (cancelled) return;

            if (apiStats) {

                setStats(apiStats);
                return;
            }

             const localStats = getClientAverageRating(key);
            setStats(localStats);
        }

        load();

        function handleUpdate() {
            load();
        }


        window.addEventListener(RATINGS_UPDATED_EVENT, handleUpdate);
        return () => {
            cancelled = true;
            window.removeEventListener(RATINGS_UPDATED_EVENT, handleUpdate);
        };
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
