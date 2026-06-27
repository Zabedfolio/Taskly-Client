'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';


const BARE_ROUTES = ['/payment-success', '/dashboard'];

export default function ConditionalShell({ children }) {
    const pathname = usePathname();
    const isBare = BARE_ROUTES.some((route) => pathname?.startsWith(route));

    if (isBare) {
        return (
            <>
                {children}
            </>
        );
    }

    return (
          <>

            <Navbar />
            {children}
            <Footer />
        </>
    );
}
