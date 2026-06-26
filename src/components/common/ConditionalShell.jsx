'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { useSession } from '@/lib/auth-client';
import OnboardingModal from '@/components/shared/OnboardingModal';

// Routes that should render with NO Navbar or Footer
const BARE_ROUTES = ['/payment-success', '/dashboard'];

export default function ConditionalShell({ children }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isBare = BARE_ROUTES.some((route) => pathname?.startsWith(route));

    const showOnboarding = session?.user && 
        !session.user.onboardingComplete && 
        session.user.role !== 'admin' && 
        !pathname?.startsWith('/auth') && 
        pathname !== '/unauthorized';

    if (isBare) {
        return (
            <>
                {children}
                {showOnboarding && <OnboardingModal isOpen={true} user={session.user} />}
            </>
        );
    }

    return (
        <>
            <Navbar />
            {children}
            <Footer />
            {showOnboarding && <OnboardingModal isOpen={true} user={session.user} />}
        </>
    );
}
