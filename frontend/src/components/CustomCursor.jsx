import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { theme } from '../theme';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const cursor = cursorRef.current;

        // Initial setup
        // Cursor tip (0,0) should be at mouse, so no centering for cursorRef
        gsap.set(cursor, { xPercent: 0, yPercent: 0 });

        // Mouse move handlers
        const moveCursor = (e) => {
            gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0 }); // Instant follow
        };

        // Hover detection
        const handleMouseOver = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a') || e.target.getAttribute('role') === 'button' || e.target.style.cursor === 'pointer') {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    // Hover Animation (Optional: maybe a slight scale up?)
    useEffect(() => {
        const cursor = cursorRef.current;
        if (isHovering) {
            gsap.to(cursor, { scale: 1.1, duration: 0.2 });
        } else {
            gsap.to(cursor, { scale: 1, duration: 0.2 });
        }
    }, [isHovering]);

    return (
        <>
            <style>{`
                * { cursor: none !important; }
            `}</style>

            {/* Main Pointer - Blue Arrow (Bigger) */}
            <div
                ref={cursorRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '32px', // Increased from 24px
                    height: '32px', // Increased from 24px
                    pointerEvents: 'none',
                    zIndex: 9999,
                }}
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19135L11.7116 11.1219L7.33956 11.5973L5.65376 12.3673Z"
                        fill={theme.colors.primaryBlue} stroke="white" strokeWidth="1.5" />
                </svg>
            </div>
        </>
    );
};

export default CustomCursor;
