export const metadata = {
    title: 'Payment Confirmed — Taskly',
    description: 'Your Stripe payment was successfully verified.',
};

export default function PaymentSuccessLayout({ children }) {
    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,197,94,0.07) 0%, transparent 65%), #0a0a0a',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {children}
        </div>
    );
}
