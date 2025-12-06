import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { theme } from '../../theme';

const GSAPDecorations = () => {
    const blob1Ref = useRef(null);
    const blob2Ref = useRef(null);
    const blob3Ref = useRef(null);

    useEffect(() => {
        // Create floating animation timeline for biology-themed blobs
        const tl = gsap.timeline({ repeat: -1 });

        // Blob 1 - Cyan
        tl.to(blob1Ref.current, {
            x: 30,
            y: -40,
            duration: 8,
            ease: 'sine.inOut',
        }, 0)
            .to(blob1Ref.current, {
                x: -20,
                y: 20,
                duration: 8,
                ease: 'sine.inOut',
            }, 8)
            .to(blob1Ref.current, {
                x: 0,
                y: 0,
                duration: 8,
                ease: 'sine.inOut',
            }, 16);

        // Blob 2 - Purple
        gsap.to(blob2Ref.current, {
            x: -40,
            y: 30,
            duration: 10,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
        });

        // Blob 3 - Blue
        gsap.to(blob3Ref.current, {
            x: 25,
            y: -25,
            duration: 12,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
        });

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <>
            {/* Cyan Blob */}
            <div
                ref={blob1Ref}
                style={{
                    position: 'fixed',
                    top: '15%',
                    left: '10%',
                    width: '300px',
                    height: '300px',
                    background: `radial-gradient(circle, ${theme.colors.pastelBlue}, transparent)`,
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0.4,
                }}
            />

            {/* Purple Blob */}
            <div
                ref={blob2Ref}
                style={{
                    position: 'fixed',
                    bottom: '20%',
                    right: '15%',
                    width: '350px',
                    height: '350px',
                    background: `radial-gradient(circle, ${theme.colors.pastelPurple}, transparent)`,
                    borderRadius: '50%',
                    filter: 'blur(70px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0.4,
                }}
            />

            {/* Cyan Accent Blob */}
            <div
                ref={blob3Ref}
                style={{
                    position: 'fixed',
                    top: '50%',
                    right: '5%',
                    width: '200px',
                    height: '200px',
                    background: `radial-gradient(circle, ${theme.colors.pastelCyan}, transparent)`,
                    borderRadius: '50%',
                    filter: 'blur(50px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0.3,
                }}
            />
        </>
    );
};

export default GSAPDecorations;
