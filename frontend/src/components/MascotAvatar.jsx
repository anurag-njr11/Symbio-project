import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { theme } from '../theme';

const MascotAvatar = ({ emotion = 'idle', size = 64 }) => {
    const faceRef = useRef(null);
    const eyesRef = useRef(null);
    const mouthRef = useRef(null);
    const headRef = useRef(null);

    // Generate unique ID for this instance's SVG filters/gradients
    const uniqueId = `mascot-${Math.random().toString(36).substr(2, 9)}`;

    // Animation states based on emotion
    useEffect(() => {
        const eyes = eyesRef.current;
        const mouth = mouthRef.current;
        const head = headRef.current;

        // Reset standard transforms
        gsap.killTweensOf([eyes, mouth, head]);
        gsap.to(head, { rotation: 0, x: 0, y: 0, duration: 0.5 }); // Reset head shake

        switch (emotion) {
            case 'happy':
                gsap.to(eyes, { scaleY: 0.5, rotation: 0, duration: 0.2 });
                gsap.to(mouth, { scaleY: 1, scaleX: 1, attr: { d: "M 35 65 Q 50 78 65 65" }, duration: 0.2 });
                // Add Wiggle
                gsap.to(head, { rotation: 10, yoyo: true, repeat: -1, duration: 0.3, ease: "sine.inOut" });
                break;
            case 'sad':
                gsap.to(eyes, { scaleY: 1, rotation: -10, duration: 0.2 });
                gsap.to(mouth, { scaleY: 1, scaleX: 1, attr: { d: "M 35 70 Q 50 60 65 70" }, duration: 0.2 });
                break;
            case 'surprised':
                gsap.to(eyes, { scaleY: 1.4, scaleX: 1.2, duration: 0.2 });
                gsap.to(mouth, { scaleY: 1.5, scaleX: 0.8, attr: { d: "M 45 70 Q 50 75 55 70 Q 50 65 45 70" }, duration: 0.2 });
                break;
            case 'dizzy':
                // Swirling eyes effect - Fixed origin so they don't fly off
                gsap.set(eyes, { transformOrigin: "50% 50%" });
                gsap.to(eyes, { rotation: 360, repeat: -1, duration: 1, ease: "linear" }); // Slowed down spin
                gsap.to(mouth, { attr: { d: "M 35 68 Q 42 62 50 68 T 65 68" }, duration: 0.2 }); // Wavy mouth
                gsap.to(head, { rotation: 5, x: 2, yoyo: true, repeat: -1, duration: 0.1 }); // Shake
                break;
            case 'thinking':
                gsap.to(eyes, { scaleY: 1, x: 5, y: -5, duration: 0.3 }); // Look up right
                gsap.to(mouth, { attr: { d: "M 40 70 Q 50 70 55 70" }, duration: 0.3 }); // Small flat mouth
                gsap.to(head, { rotation: -5, duration: 0.5 }); // Tilt head
                break;
            case 'pointing':
                gsap.to(eyes, { scaleY: 1, duration: 0.2 });
                gsap.to(".left-eye", { scaleY: 0.1, duration: 0.1 });
                gsap.to(mouth, { attr: { d: "M 40 65 Q 50 70 60 65" }, duration: 0.2 });
                break;
            default: // idle
                gsap.to(eyes, { scaleY: 1, scaleX: 1, rotation: 0, x: 0, y: 0, duration: 0.2 });
                gsap.to(mouth, { scaleY: 1, scaleX: 1, attr: { d: "M 40 65 Q 50 70 60 65" }, duration: 0.2 }); // Default smile
                break;
        }
    }, [emotion]);

    // Blinking Animation
    useEffect(() => {
        const blink = () => {
            if (emotion !== 'surprised' && emotion !== 'dizzy') {
                gsap.to(".eye-pupil", { scaleY: 0.1, duration: 0.1, yoyo: true, repeat: 1 });
            }
            setTimeout(blink, Math.random() * 3000 + 2000);
        };
        const timer = setTimeout(blink, 2000);
        return () => clearTimeout(timer);
    }, [emotion]);

    // Random Head Tilts (Dog-like curiosity)
    useEffect(() => {
        if (emotion !== 'idle') return;

        const tilt = () => {
            if (emotion !== 'idle') return;
            const angle = Math.random() > 0.5 ? 15 : -15; // Tilt left or right
            gsap.to(headRef.current, { rotation: angle, duration: 0.4, ease: "back.out(1.5)" });

            // Return to normal after a bit
            setTimeout(() => {
                if (emotion === 'idle') {
                    gsap.to(headRef.current, { rotation: 0, duration: 0.4, ease: "power1.out" });
                }
            }, 1500);

            setTimeout(tilt, Math.random() * 5000 + 4000);
        };

        const timer = setTimeout(tilt, 3000);
        return () => clearTimeout(timer);
    }, [emotion]);

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
            {/* Drop Shadow */}
            <ellipse cx="50" cy="95" rx="30" ry="10" fill={theme.colors.primaryPurple} opacity="0.2" className="shadow" />

            {/* Main Container */}
            <g className="character-body" ref={headRef}>
                {/* Head Base - Match Theme Gradients */}
                <defs>
                    <linearGradient id={`bodyGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#e0e7ff" />
                    </linearGradient>
                    <filter id={`glow-${uniqueId}`}>
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Outer Glow/Border */}
                <path d="M 15 50 Q 15 15 50 15 Q 85 15 85 50 Q 85 85 50 85 Q 15 85 15 50"
                    fill={`url(#bodyGradient-${uniqueId})`}
                    stroke={theme.colors.primaryBlue}
                    strokeWidth="2.5"
                    filter={`url(#glow-${uniqueId})`}
                />

                {/* Cute Ears / Headphones */}
                <circle cx="15" cy="50" r="8" fill={theme.colors.primaryPurple} />
                <circle cx="85" cy="50" r="8" fill={theme.colors.primaryPurple} />
                <circle cx="15" cy="50" r="4" fill="#fff" opacity="0.5" />
                <circle cx="85" cy="50" r="4" fill="#fff" opacity="0.5" />

                {/* Antenna */}
                <path d="M 50 15 Q 50 5 50 5" stroke={theme.colors.primaryBlue} strokeWidth="2" fill="none" />
                <circle cx="50" cy="5" r="5" fill={theme.colors.accentCyan} className="antenna-ball">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* Face */}
                <g ref={faceRef}>
                    {/* Eyes */}
                    <g ref={eyesRef} className="eyes">
                        {/* Left Eye */}
                        <g className="left-eye" transform="translate(32, 48)">
                            <ellipse cx="0" cy="0" rx="7" ry="9" fill={theme.colors.textMain} className="eye-pupil" />
                            <circle cx="2.5" cy="-2.5" r="2.5" fill="white" />
                            <circle cx="-2" cy="3" r="1.5" fill="white" opacity="0.7" />
                        </g>
                        {/* Right Eye */}
                        <g className="right-eye" transform="translate(68, 48)">
                            <ellipse cx="0" cy="0" rx="7" ry="9" fill={theme.colors.textMain} className="eye-pupil" />
                            <circle cx="2.5" cy="-2.5" r="2.5" fill="white" />
                            <circle cx="-2" cy="3" r="1.5" fill="white" opacity="0.7" />
                        </g>
                    </g>

                    {/* Cheeks - Only visible when happy/shy */}
                    {(emotion === 'happy' || emotion === 'idle') && (
                        <>
                            <circle cx="25" cy="62" r="5" fill="#f43f5e" opacity="0.3" />
                            <circle cx="75" cy="62" r="5" fill="#f43f5e" opacity="0.3" />
                        </>
                    )}

                    {/* Mouth */}
                    <path ref={mouthRef} d="M 40 65 Q 50 70 60 65" fill="none" stroke={theme.colors.textMain} strokeWidth="2.5" strokeLinecap="round" />
                </g>
            </g>
        </svg>
    );
};

export default MascotAvatar;
