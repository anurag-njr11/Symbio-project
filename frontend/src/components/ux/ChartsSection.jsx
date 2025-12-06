import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CodonFrequencyChart from './charts/CodonFrequencyChart';
import SlidingGCChart from './charts/SlidingGCChart';
import ATGCRatioGauge from './charts/ATGCRatioGauge';
import ORFMap from './charts/ORFMap';
import { theme } from '../../theme';

gsap.registerPlugin(ScrollTrigger);

const ChartsSection = ({ sequence }) => {
    const sectionRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(
            sectionRef.current,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
            }
        );
    }, []);

    if (!sequence || !sequence.sequence) {
        return null;
    }

    return (
        <div ref={sectionRef} style={{ marginTop: '1rem', paddingTop: 0 }}>
            {/* Section Header */}
            <h3
                style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    marginTop: 0,
                    background: theme.gradients.text,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                Genomic Insights
            </h3>

            {/* Compact PowerBI-style Grid: 2 rows x 2 columns */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    maxHeight: '450px',
                }}
            >
                {/* Row 1 */}
                <CodonFrequencyChart sequence={sequence.sequence} />
                <SlidingGCChart sequence={sequence.sequence} />

                {/* Row 2 */}
                <ATGCRatioGauge nucleotideCounts={sequence.nucleotide_counts} />
                <ORFMap sequence={sequence.sequence} />
            </div>
        </div>
    );
};

export default ChartsSection;
