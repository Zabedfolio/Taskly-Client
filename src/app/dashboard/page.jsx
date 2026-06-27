'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

export default function DashboardRedirectPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (isPending) return;

        if (!session?.user) {
            router.push('/auth/login');
        } else {
            const role = session.user.role || 'client';
            router.push(`/dashboard/${role}`);
        }
    }, [session, isPending, router]);

    return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '2.5px solid rgba(255,77,0,0.2)', borderTopColor: '#ff4d00',
                animation: 'spin 0.75s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
