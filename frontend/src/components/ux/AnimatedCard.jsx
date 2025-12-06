import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { theme } from '../../theme';

const AnimatedCard = ({ children, delay = 0, style = {} }) => {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Initial entrance animation
        gsap.fromTo(
            cardRef.current,
            {
                opacity: 0,
                y: 30,
                scale: 0.95,
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                delay: delay,
                ease: 'back.out(1.2)',
            }
        );

        // Subtle floating animation
        gsap.to(cardRef.current, {
            y: -5,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: delay + 0.6,
        });
    }, [delay]);

    useEffect(() => {
        if (isHovered) {
            gsap.to(cardRef.current, {
                y: -10,
                scale: 1.02,
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.25)',
                duration: 0.3,
                ease: 'power2.out',
            });
        } else {
            gsap.to(cardRef.current, {
                y: 0,
                scale: 1,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                duration: 0.3,
                ease: 'power2.out',
            });
        }
    }, [isHovered]);

    return (
        <div
            ref={cardRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                background: theme.colors.glassBgLight,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${theme.colors.glassBorder}`,
                boxShadow: theme.shadows.card,
                borderRadius: '20px',
                padding: '1.5rem',
                transition: 'border-color 0.3s ease',
                cursor: 'pointer',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

export default AnimatedCard;
