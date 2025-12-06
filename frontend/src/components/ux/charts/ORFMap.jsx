import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { theme } from '../../../theme';
import { findORFRegions } from '../../../utils/chartUtils';

const ORFMap = ({ sequence }) => {
    const containerRef = useRef(null);
    const orfs = findORFRegions(sequence);
    const sequenceLength = sequence.length;

    useEffect(() => {
        gsap.fromTo(
            containerRef.current,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.4 }
        );

        if (orfs.length > 0) {
            gsap.fromTo(
                '.orf-bar',
                { scaleX: 0, transformOrigin: 'left' },
                { scaleX: 1, duration: 0.8, stagger: 0.15, ease: 'power2.out', delay: 0.8 }
            );
        }
    }, [orfs.length]);

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
            }}
        >
            <h4
                style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: theme.colors.accentGreen,
                }}
            >
                ORF Regions
            </h4>

            {orfs.length === 0 ? (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '1.5rem 0.5rem',
                        color: theme.colors.textMuted,
                        fontSize: '0.7rem',
                    }}
                >
                    <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem', opacity: 0.5 }}>🧬</div>
                    No ORF detected
                </div>
            ) : (
                <div>
                    <div
                        style={{
                            position: 'relative',
                            height: '55px',
                            background: `${theme.colors.pastelBlue}20`,
                            borderRadius: '6px',
                            marginBottom: '0.5rem',
                        }}
                    >
                        {orfs.map((orf, index) => {
                            const leftPercent = (orf.start / sequenceLength) * 100;
                            const widthPercent = (orf.length / sequenceLength) * 100;

                            return (
                                <div
                                    key={index}
                                    className="orf-bar"
                                    style={{
                                        position: 'absolute',
                                        left: `${leftPercent}%`,
                                        width: `${widthPercent}%`,
                                        height: '35px',
                                        top: '10px',
                                        background: `linear-gradient(135deg, ${theme.colors.accentGreen}, ${theme.colors.accentCyan})`,
                                        borderRadius: '4px',
                                        border: `1px solid ${theme.colors.accentGreen}`,
                                        boxShadow: `0 2px 6px ${theme.colors.accentGreen}40`,
                                    }}
                                    title={`ORF ${index + 1}: ${orf.start}-${orf.end} (${orf.length}bp)`}
                                />
                            );
                        })}
                    </div>

                    <div style={{ fontSize: '0.65rem', color: theme.colors.textMuted, textAlign: 'center' }}>
                        {orfs.length} ORF{orfs.length > 1 ? 's' : ''} detected
                    </div>
                </div>
            )}
        </div>
    );
};

export default ORFMap;
