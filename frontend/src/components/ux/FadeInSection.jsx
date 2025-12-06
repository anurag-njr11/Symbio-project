import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FadeInSection = ({ children, delay = 0, direction = 'up' }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const element = sectionRef.current;

        const getInitialPosition = () => {
            switch (direction) {
                case 'up':
                    return { y: 50, x: 0 };
                case 'down':
                    return { y: -50, x: 0 };
                case 'left':
                    return { y: 0, x: 50 };
                case 'right':
                    return { y: 0, x: -50 };
                default:
                    return { y: 50, x: 0 };
            }
        };

        const initialPos = getInitialPosition();

        gsap.fromTo(
            element,
            {
                opacity: 0,
                ...initialPos,
            },
            {
                opacity: 1,
                x: 0,
                y: 0,
                duration: 0.8,
                delay: delay,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [delay, direction]);

    return <div ref={sectionRef}>{children}</div>;
};

export default FadeInSection;
