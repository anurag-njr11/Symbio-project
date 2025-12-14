import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { theme } from '../theme';

const MascotAvatar = ({ emotion = 'idle', size = 64 }) => {
    const faceRef = useRef(null);
    const eyesRef = useRef(null);
    const mouthRef = useRef(null);
    const headRef = useRef(null);
    const earsRef = useRef(null);

    // Generate unique ID for this instance's SVG filters/gradients
    const uniqueId = `cat-${Math.random().toString(36).substr(2, 9)}`;

    // Animation states based on emotion
    useEffect(() => {
        const eyes = eyesRef.current;
        const mouth = mouthRef.current;
        const head = headRef.current;
        const ears = earsRef.current;

        // Reset standard transforms
        gsap.killTweensOf([eyes, mouth, head, ears]);
        gsap.to(head, { rotation: 0, x: 0, y: 0, duration: 0.5 });

        switch (emotion) {
            case 'happy':
                gsap.to(eyes, { scaleY: 0.5, rotation: 0, duration: 0.2 }); // Happy eyes
                gsap.to(mouth, { scaleY: 1, scaleX: 1, attr: { d: "M 35 65 Q 50 75 65 65" }, duration: 0.2 }); // Smile
                // Wiggle ears
                gsap.to(ears, { rotation: 10, yoyo: true, repeat: -1, duration: 0.2 });
                // Head wiggle
                gsap.to(head, { rotation: 5, yoyo: true, repeat: -1, duration: 0.4, ease: "sine.inOut" });
                break;
            case 'sad':
                gsap.to(eyes, { scaleY: 1, rotation: -15, duration: 0.2 }); // Sad eyes
                gsap.to(mouth, { attr: { d: "M 35 75 Q 50 65 65 75" }, duration: 0.2 }); // Frown
                gsap.to(ears, { rotation: -20, duration: 0.3 }); // Droopy ears
                break;
            case 'surprised':
                gsap.to(eyes, { scaleY: 1.4, scaleX: 1.3, duration: 0.2 }); // Wide eyes
                gsap.to(mouth, { attr: { d: "M 45 70 Q 50 78 55 70 Q 50 62 45 70" }, duration: 0.2 }); // 'O' mouth
                gsap.to(ears, { scale: 1.2, duration: 0.1 }); // Perked ears
                // Jump
                gsap.to(head, { y: -5, yoyo: true, repeat: 1, duration: 0.1 });
                break;
            case 'dizzy':
                gsap.set(eyes, { transformOrigin: "50% 50%" });
                gsap.to(eyes, { rotation: 360, repeat: -1, duration: 1, ease: "linear" });
                gsap.to(mouth, { attr: { d: "M 35 70 Q 42 65 50 70 T 65 70" }, duration: 0.2 }); // Wavy mouth
                break;
            case 'thinking':
                gsap.to(eyes, { x: 5, y: -5, duration: 0.3 }); // Look up
                gsap.to(mouth, { attr: { d: "M 42 70 Q 50 70 58 70" }, duration: 0.3 }); // Flat mouth
                gsap.to(ears, { rotation: 15, duration: 0.3 }); // One ear perked
                break;
            case 'sleeping':
                gsap.to(eyes, { scaleY: 0.1, duration: 0.5 }); // Closed eyes
                gsap.to(mouth, { attr: { d: "M 45 70 Q 50 75 55 70" }, duration: 0.5 }); // Small O
                gsap.to(head, { rotation: 10, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" }); // Slow nod
                // Zzz in ChatBot component handles the floating Zs usually, but icon can do slow breathe
                gsap.to(head, { scale: 1.02, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });
                break;
            case 'confused':
                gsap.to(eyes, { rotation: 10, scaleY: 0.8, x: 0, y: 0, duration: 0.3 });
                gsap.to(eyesRef.current.children[0], { y: -3, duration: 0.3 }); // One eye up
                gsap.to(eyesRef.current.children[1], { y: 2, duration: 0.3 }); // One eye down
                gsap.to(mouth, { attr: { d: "M 40 70 Q 50 65 60 70" }, duration: 0.3 }); // Wobbly line
                gsap.to(head, { rotation: -15, duration: 0.4 }); // Head tilt
                break;
            case 'cool':
                // Cool is mostly about the sunglasses which we can toggle via opacity or render
                // For now, let's just make it confident
                gsap.to(eyes, { scaleY: 0.6, duration: 0.2 }); // Squint
                gsap.to(mouth, { attr: { d: "M 40 70 Q 50 75 60 65" }, duration: 0.2 }); // Smirk
                gsap.to(head, { y: -2, duration: 0.5, yoyo: true, repeat: -1 }); // Bob
                break;
            default: // idle
                gsap.to(eyes, { scaleY: 1, scaleX: 1, rotation: 0, x: 0, y: 0, duration: 0.2 });
                gsap.to(mouth, { attr: { d: "M 40 68 Q 50 73 60 68" }, duration: 0.2 });
                gsap.to(ears, { rotation: 0, scale: 1, duration: 0.3 });
                break;
        }
    }, [emotion]);

    // Blinking
    useEffect(() => {
        const blink = () => {
            if (emotion !== 'surprised' && emotion !== 'dizzy' && emotion !== 'sleeping' && emotion !== 'cool') {
                gsap.to(".cat-eye-pupil", { scaleY: 0.1, duration: 0.1, yoyo: true, repeat: 1 });
            }
            setTimeout(blink, Math.random() * 3000 + 2000);
        };
        const timer = setTimeout(blink, 2000);
        return () => clearTimeout(timer);
    }, [emotion]);

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
            {/* Drop Shadow */}
            <ellipse cx="50" cy="95" rx="30" ry="8" fill={theme.colors.primaryPurple} opacity="0.2" className="shadow" />

            {/* Main Head Group */}
            <g className="cat-head" ref={headRef}>
                <defs>
                    <linearGradient id={`catGradient-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#f1f5f9" />
                    </linearGradient>
                    <filter id={`softGlow-${uniqueId}`}>
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Ears */}
                <g ref={earsRef}>
                    <path d="M 20 50 L 15 20 L 45 35 Z" fill={`url(#catGradient-${uniqueId})`} stroke={theme.colors.textMain} strokeWidth="2" strokeLinejoin="round" />
                    <path d="M 80 50 L 85 20 L 55 35 Z" fill={`url(#catGradient-${uniqueId})`} stroke={theme.colors.textMain} strokeWidth="2" strokeLinejoin="round" />
                    {/* Inner Ear Pink */}
                    <path d="M 22 45 L 19 28 L 38 38 Z" fill="#fbcfe8" />
                    <path d="M 78 45 L 81 28 L 62 38 Z" fill="#fbcfe8" />
                </g>

                {/* Face Shape */}
                <ellipse cx="50" cy="55" rx="40" ry="35"
                    fill={`url(#catGradient-${uniqueId})`}
                    stroke={theme.colors.textMain}
                    strokeWidth="2.5"
                    filter={`url(#softGlow-${uniqueId})`}
                />

                {/* Face Features */}
                <g ref={faceRef}>
                    {/* Eyes */}
                    <g ref={eyesRef}>
                        <g transform="translate(30, 50)">
                            <ellipse cx="0" cy="0" rx="6" ry="8" fill={theme.colors.textMain} className="cat-eye-pupil" />
                            <circle cx="2" cy="-3" r="2.5" fill="white" />
                        </g>
                        <g transform="translate(70, 50)">
                            <ellipse cx="0" cy="0" rx="6" ry="8" fill={theme.colors.textMain} className="cat-eye-pupil" />
                            <circle cx="2" cy="-3" r="2.5" fill="white" />
                        </g>
                    </g>

                    {/* Nose */}
                    <path d="M 46 62 L 54 62 L 50 67 Z" fill="#f43f5e" />

                    {/* Mouth */}
                    <path ref={mouthRef} d="M 40 68 Q 50 73 60 68" fill="none" stroke={theme.colors.textMain} strokeWidth="2" strokeLinecap="round" />
                    <line x1="50" y1="67" x2="50" y2="73" stroke={theme.colors.textMain} strokeWidth="2" />

                    {/* Whiskers */}
                    <g stroke={theme.colors.textMuted} strokeWidth="1.5" opacity="0.6">
                        <line x1="25" y1="60" x2="5" y2="55" />
                        <line x1="25" y1="65" x2="5" y2="68" />
                        <line x1="75" y1="60" x2="95" y2="55" />
                        <line x1="75" y1="65" x2="95" y2="68" />
                    </g>

                    {/* Cheeks */}
                    {(emotion === 'happy' || emotion === 'idle') && (
                        <>
                            <circle cx="25" cy="65" r="5" fill="#fbcfe8" opacity="0.6" />
                            <circle cx="75" cy="65" r="5" fill="#fbcfe8" opacity="0.6" />
                        </>
                    )}

                    {/* Sunglasses for Cool Mode */}
                    {emotion === 'cool' && (
                        <g opacity="0.9">
                            <path d="M 20 45 L 80 45 L 80 58 Q 80 65 70 65 L 65 65 Q 55 65 55 58 L 50 55 L 45 58 Q 45 65 35 65 L 30 65 Q 20 65 20 58 Z" fill="#1e293b" />
                            <line x1="20" y1="50" x2="15" y2="45" stroke="#1e293b" strokeWidth="2" />
                            <line x1="80" y1="50" x2="85" y2="45" stroke="#1e293b" strokeWidth="2" />
                            <path d="M 25 50 L 40 50 L 25 60 Z" fill="rgba(255,255,255,0.2)" />
                        </g>
                    )}
                </g>
            </g>
        </svg>
    );
};

export default MascotAvatar;
