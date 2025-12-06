import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { theme } from '../../../theme';
import { calculateGCRatio } from '../../../utils/chartUtils';

const ATGCRatioGauge = ({ nucleotideCounts }) => {
    const containerRef = useRef(null);
    const needleRef = useRef(null);
    const gcRatio = calculateGCRatio(nucleotideCounts);
    const percentage = (gcRatio * 100).toFixed(1);

    const rotation = -90 + (gcRatio * 180);

    useEffect(() => {
        gsap.fromTo(
            containerRef.current,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)', delay: 0.3 }
        );

        gsap.fromTo(
            needleRef.current,
            { rotation: -90 },
            { rotation: rotation, duration: 1.2, ease: 'elastic.out(1, 0.5)', delay: 0.6 }
        );
    }, [rotation]);

    return (
        <div
            ref={containerRef}
            style={{
                background: theme.colors.glassBgLight,
                backdropFilter: 'blur(16px)',
                borderRadius: '14px',
                padding: '0.75rem',
                border: `1px solid ${theme.colors.glassBorder}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <h4
                style={{
                    margin: '0 0 0.25rem 0',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: theme.colors.primaryPurple,
                    textAlign: 'center',
                }}
            >
                GC Ratio
            </h4>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <svg width="130" height="85" viewBox="0 0 130 85" style={{ overflow: 'visible' }}>
                    <path
                        d="M 15 70 A 50 50 0 0 1 115 70"
                        fill="none"
                        stroke={theme.colors.pastelBlue}
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 15 70 A 50 50 0 0 1 115 70"
                        fill="none"
                        stroke={`url(#gcGradient)`}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${gcRatio * 157} 157`}
                    />

                    <defs>
                        <linearGradient id="gcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={theme.colors.accentCyan} />
                            <stop offset="50%" stopColor={theme.colors.primaryBlue} />
                            <stop offset="100%" stopColor={theme.colors.primaryPurple} />
                        </linearGradient>
                    </defs>

                    <g ref={needleRef} transform="translate(65, 70)">
                        <line
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="-44"
                            stroke={theme.colors.textSecondary}
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <circle cx="0" cy="0" r="3" fill={theme.colors.primaryBlue} />
                    </g>
                </svg>

                <div style={{ textAlign: 'center', marginTop: '0.15rem' }}>
                    <div
                        style={{
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            background: theme.gradients.text,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: 1,
                        }}
                    >
                        {percentage}%
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ATGCRatioGauge;
