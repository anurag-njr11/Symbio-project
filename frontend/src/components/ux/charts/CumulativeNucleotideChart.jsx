import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { theme } from '../../../theme';
import { getCumulativeNucleotideCounts } from '../../../utils/chartUtils';

const CumulativeNucleotideChart = ({ sequence }) => {
    const containerRef = useRef(null);
    const cumulativeData = getCumulativeNucleotideCounts(sequence, 10);

    // Transform data for Recharts
    const chartData = cumulativeData.positions.map((pos, index) => ({
        position: pos,
        A: cumulativeData.A[index],
        T: cumulativeData.T[index],
        G: cumulativeData.G[index],
        C: cumulativeData.C[index],
    }));

    useEffect(() => {
        // Entrance animation
        gsap.fromTo(
            containerRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 1 }
        );
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                background: theme.colors.glassBgLight,
                backdropFilter: 'blur(16px)',
                borderRadius: '20px',
                padding: '1.5rem',
                border: `1px solid ${theme.colors.glassBorder}`,
                boxShadow: theme.shadows.card,
            }}
        >
            <h3
                style={{
                    margin: '0 0 1.5rem 0',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: theme.gradients.text,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                Cumulative Nucleotide Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.glassBorder} />
                    <XAxis
                        dataKey="position"
                        stroke={theme.colors.textMuted}
                        label={{ value: 'Position (bp)', position: 'insideBottom', offset: -5, fill: theme.colors.textMuted }}
                    />
                    <YAxis
                        stroke={theme.colors.textMuted}
                        label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: theme.colors.textMuted }}
                    />
                    <Tooltip
                        contentStyle={{
                            background: theme.colors.glassBg,
                            border: `1px solid ${theme.colors.glassBorder}`,
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)',
                        }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '10px' }}
                        iconType="line"
                    />
                    <Line
                        type="monotone"
                        dataKey="A"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        dot={false}
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                    />
                    <Line
                        type="monotone"
                        dataKey="T"
                        stroke="#eab308"
                        strokeWidth={2.5}
                        dot={false}
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                        animationBegin={200}
                    />
                    <Line
                        type="monotone"
                        dataKey="G"
                        stroke="#22c55e"
                        strokeWidth={2.5}
                        dot={false}
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                        animationBegin={400}
                    />
                    <Line
                        type="monotone"
                        dataKey="C"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        dot={false}
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                        animationBegin={600}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CumulativeNucleotideChart;
