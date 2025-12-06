import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { theme } from '../theme';

const AnimatedBackground = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Create particles
        const particleCount = 20;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random properties
            const size = Math.random() * 100 + 50;
            const x = Math.random() * 100;
            const y = Math.random() * 100;

            // Styling
            Object.assign(particle.style, {
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}%`,
                top: `${y}%`,
                borderRadius: '50%',
                background: i % 2 === 0
                    ? `radial-gradient(circle, ${theme.colors.primaryBlue}10, transparent 70%)`
                    : `radial-gradient(circle, ${theme.colors.primaryPurple}10, transparent 70%)`,
                opacity: Math.random() * 0.5 + 0.1,
                pointerEvents: 'none',
                filter: 'blur(20px)',
                zIndex: 0
            });

            container.appendChild(particle);
            particles.push(particle);
        }

        // Animate particles
        particles.forEach((particle, i) => {
            gsap.to(particle, {
                x: 'random(-100, 100)',
                y: 'random(-100, 100)',
                duration: 'random(10, 20)',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: i * 0.2
            });

            gsap.to(particle, {
                scale: 'random(0.8, 1.2)',
                duration: 'random(5, 10)',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: i * 0.1
            });
        });

        return () => {
            particles.forEach(p => p.remove());
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                zIndex: -1,
                pointerEvents: 'none'
            }}
        />
    );
};

export default AnimatedBackground;
