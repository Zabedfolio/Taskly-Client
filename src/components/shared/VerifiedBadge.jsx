'use client';



export default function VerifiedBadge({ size = 'md' }) {
      const  sizes = {
        sm: { icon: 12, pad: '2px 5px', font: 9,  gap: 3,  r: 5  },
        md: { icon: 14, pad: '3px 7px', font: 10, gap: 4,  r: 6  },
        lg: { icon: 16, pad: '4px 9px', font: 11, gap: 5,  r: 7  },
    };
    const s = sizes[size] || sizes.md;


    return (
        <span
            title="Verified Freelancer"
            style={{
                display: 'inline-flex',

                  alignItems: 'center',
                   gap: s.gap,
                padding: s.pad,
                borderRadius: s.r,
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#60a5fa',
                fontSize: s.font,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",

                letterSpacing: '0.06em',
                flexShrink: 0,
                userSelect: 'none',
            }}
        >
            
            <svg
                width={s.icon}
                height={s.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"

                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"

            >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Verified
        </span>
    );
}
