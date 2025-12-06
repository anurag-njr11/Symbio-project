import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FileText, X, CheckCircle } from 'lucide-react';
import { theme, styles } from '../../theme';

const FastaPreviewCard = ({ file, onClear, onSubmit }) => {
    const cardRef = useRef(null);
    const badgeRef = useRef(null);

    useEffect(() => {
        // Card entrance animation
        gsap.fromTo(
            cardRef.current,
            {
                opacity: 0,
                scale: 0.9,
                y: 20,
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.5,
                ease: 'back.out(1.5)',
            }
        );

        // Badge pulse animation
        gsap.to(badgeRef.current, {
            scale: 1.1,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
        });
    }, []);

    return (
        <div
            ref={cardRef}
            style={{
                background: theme.colors.glassBgLight,
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: `1px solid ${theme.colors.glassBorder}`,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div
                    ref={badgeRef}
                    style={{
                        background: `${theme.colors.accentGreen}20`,
                        padding: '1rem',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <FileText size={32} color={theme.colors.accentGreen} />
                </div>
                <div>
                    <h4
                        style={{
                            margin: 0,
                            marginBottom: '0.25rem',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            color: theme.colors.textSecondary,
                        }}
                    >
                        {file.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.textMuted }}>
                        {(file.size / 1024).toFixed(2)} KB
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={onClear}
                    style={{
                        ...styles.btnSecondary,
                        padding: '0.6rem',
                        borderColor: 'transparent',
                    }}
                >
                    <X size={20} />
                </button>
                <button onClick={onSubmit} className="btn-primary" style={styles.btnPrimary}>
                    <CheckCircle size={18} />
                    Process Sequence
                </button>
            </div>
        </div>
    );
};

export default FastaPreviewCard;
