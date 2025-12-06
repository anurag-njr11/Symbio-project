import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { theme } from '../../../theme';
import { getCodonFrequencies } from '../../../utils/chartUtils';

const CodonFrequencyChart = ({ sequence }) => {
    const containerRef = useRef(null);
    const codonData = getCodonFrequencies(sequence);

    const colors = [
        theme.colors.primaryBlue,
        theme.colors.accentCyan,
        theme.colors.primaryPurple,
        theme.colors.accentPurple,
        theme.colors.accentGreen,
        '#60a5fa',
        '#a78bfa',
        '#34d399'
    ];

    useEffect(() => {
        gsap.fromTo(
            containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 }
        );
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                background: theme.colors.glassBgLight,
                backdropFilter: 'blur(16px)',
                borderRadius: '14px',
                padding: '0.75rem',
                border: `1px solid ${theme.colors.glassBorder}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                height: '100%',
            }}
        >
            <h4
                style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: theme.colors.primaryBlue,
                }}
            >
                Top Codons
            </h4>
            <ResponsiveContainer width="100%" height={170}>
                <BarChart data={codonData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <XAxis type="number" stroke={theme.colors.textMuted} tick={{ fontSize: 9 }} />
                    <YAxis dataKey="codon" type="category" stroke={theme.colors.textMuted} width={35} tick={{ fontSize: 9 }} />
                    <Tooltip
                        contentStyle={{
                            background: theme.colors.glassBg,
                            border: `1px solid ${theme.colors.glassBorder}`,
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                        }}
                        formatter={(value) => [`${value}`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} animationDuration={800} animationEasing="ease-out">
                        {codonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CodonFrequencyChart;
