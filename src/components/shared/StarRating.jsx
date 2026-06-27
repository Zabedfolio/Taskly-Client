'use client';

import { useState } from 'react';


export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
    const [hovered, setHovered] = useState(0);

    const starSizes = { sm: 14, md: 20, lg: 28 };
    const starSize = starSizes[size] || 20;

    const active = hovered || value;

    return (
        <div
             style={{
                display: 'inline-flex',
                alignItems: 'center',

                gap: size === 'sm' ? 2 : 4,
            }}
        >
            {[1, 2, 3, 4, 5].map(star => {
                const filled = star <= active;
                return (
                    <button

                        key={star}
                        type="button"
                        disabled={readOnly}
                        onClick={() => !readOnly && onChange?.(star)}
                        onMouseEnter={() => !readOnly && setHovered(star)}
                        onMouseLeave={() => !readOnly && setHovered(0)}
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: readOnly ? 'default' : 'pointer',
                            transition: 'transform 0.12s',
                               transform: !readOnly && star <= hovered ? 'scale(1.2)' : 'scale(1)',
                          }}
                    >
                        <svg
                            width={starSize}
                            height={starSize}
                            viewBox="0 0 24 24"
                              fill={filled ? '#ff8040' : 'none'}
                            stroke={filled ? '#ff8040' : 'rgba(255,255,255,0.25)'}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                               <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </button>
                );
            })}

            {!readOnly && value > 0 && (
                <span style={{
                    fontSize: size === 'sm' ? 11 : 13,
                    fontWeight: 800,
                    color: '#ff8040',
                    marginLeft: 4,
                    fontFamily: 'monospace',
                }}>
                    {value}.0
                </span>
            )}
        </div>
    );
}
