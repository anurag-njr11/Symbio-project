import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { theme } from '../theme';
import { Dna, FlaskConical, Microscope, Binary, Atom } from 'lucide-react';
import { createRoot } from 'react-dom/client';

const AnimatedBackground = () => {
    const containerRef = useRef(null);
    const particleRoots = useRef([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Cleanup previous particles
        particleRoots.current.forEach(root => root.unmount());
        particleRoots.current = [];
        container.innerHTML = '';

        // Configuration
        const iconCount = 15;
        const blurParticlesCount = 12;
        const IconComponents = [Dna, FlaskConical, Microscope, Binary, Atom];

        // 1. Create Floating Icons
        for (let i = 0; i < iconCount; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'bio-icon-wrapper';
            container.appendChild(wrapper);

            // Random properties
            const Icon = IconComponents[Math.floor(Math.random() * IconComponents.length)];
            const size = Math.random() * 40 + 20; // 20px to 60px
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            const rotation = Math.random() * 360;

            // Mount React Icon
            const root = createRoot(wrapper);
            root.render(
                <Icon
                    size={size}
                    color={i % 2 === 0 ? theme.colors.primaryBlue : theme.colors.primaryPurple}
                    style={{ opacity: 0.15 }}
                />
            );
            particleRoots.current.push(root);

            // Initial Style
            Object.assign(wrapper.style, {
                position: 'absolute',
                left: `${startX}%`,
                top: `${startY}%`,
                transform: `rotate(${rotation}deg)`,
                pointerEvents: 'none',
                zIndex: -1
            });

            // Animate
            gsap.to(wrapper, {
                x: `random(-100, 100)`,
                y: `random(-100, 100)`,
                rotation: `random(-180, 180)`,
                duration: `random(20, 40)`,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: i * 0.5
            });

            // Gentle Floating
            gsap.to(wrapper, {
                scale: 'random(0.9, 1.1)',
                duration: 'random(4, 8)',
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

        // 2. Create Blurred Blobs (Original Effect)
        for (let i = 0; i < blurParticlesCount; i++) {
            const particle = document.createElement('div');

            // Random properties
            const size = Math.random() * 200 + 100;
            const x = Math.random() * 100;
            const y = Math.random() * 100;

            Object.assign(particle.style, {
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}%`,
                top: `${y}%`,
                borderRadius: '50%',
                background: i % 2 === 0
                    ? `radial-gradient(circle, ${theme.colors.primaryBlue}15, transparent 70%)`
                    : `radial-gradient(circle, ${theme.colors.primaryPurple}15, transparent 70%)`,
                opacity: Math.random() * 0.4 + 0.1,
                pointerEvents: 'none',
                filter: 'blur(30px)',
                zIndex: -2
            });

            container.appendChild(particle);

            gsap.to(particle, {
                x: 'random(-150, 150)',
                y: 'random(-150, 150)',
                duration: 'random(15, 30)',
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: i * 0.2
            });
        }

        return () => {
            particleRoots.current.forEach(root => root.unmount());
            container.innerHTML = ''; // Clear container
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
