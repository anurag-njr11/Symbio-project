import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { theme } from '../../../theme';
import { getSlidingGCContent } from '../../../utils/chartUtils';

const SlidingGCChart = ({ sequence }) => {
    const containerRef = useRef(null);
    const gcData = getSlidingGCContent(sequence, 50);

    useEffect(() => {
        gsap.fromTo(
            containerRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.2 }
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
                    color: theme.colors.accentCyan,
                }}
            >
                GC% Trend
            </h4>
            <ResponsiveContainer width="100%" height={170}>
                <LineChart data={gcData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis
                        dataKey="window"
                        stroke={theme.colors.textMuted}
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                    />
                    <YAxis
                        stroke={theme.colors.textMuted}
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            background: theme.colors.glassBg,
                            border: `1px solid ${theme.colors.glassBorder}`,
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                        }}
                        formatter={(value) => [`${value}%`, 'GC']}
                    />
                    <Line
                        type="monotone"
                        dataKey="gcPercent"
                        stroke={theme.colors.accentCyan}
                        strokeWidth={2}
                        dot={false}
                        animationDuration={1500}
                        animationEasing="ease-in-out"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SlidingGCChart;
