import React, { useEffect, useRef } from 'react';
import { UploadCloud, FileCode, Activity, Clock, Eye } from 'lucide-react';
import { styles, theme } from '../theme';
import gsap from 'gsap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const MetricCard = ({ title, value, icon: Icon, color, index }) => {
    // Select gradient based on index or color
    const getGradient = (idx) => {
        const grads = [theme.gradients.cardBlue, theme.gradients.cardPurple, theme.gradients.cardCyan, theme.gradients.cardGreen];
        return grads[idx % grads.length] || theme.colors.glassBg;
    };

    return (
        <div
            className="metric-card"
            style={{
                ...styles.metricCard,
                background: `${getGradient(index)}, ${theme.colors.glassBg}`
            }}
            onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                    y: -8,
                    boxShadow: `0 20px 40px -10px ${color}40`, // Stronger colored glow
                    scale: 1.03, // Slight scale up
                    borderColor: color,
                    duration: 0.4,
                    ease: "power3.out"
                });
            }}
            onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                    y: 0,
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ color: theme.colors.textMuted, fontSize: '0.9rem' }}>{title}</span>
                <Icon size={18} color={color} style={{ opacity: 0.8 }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</div>
        </div>
    );
};

const Dashboard = ({ uploads = [], onGenerateReport }) => {
    const containerRef = useRef(null);
    const tableRef = useRef(null);
    const chartsRef = useRef(null);

    // Safety check for uploads
    const safeUploads = Array.isArray(uploads) ? uploads : [];

    // Calculate metrics
    const totalUploads = safeUploads.length;
    const orfCount = safeUploads.filter(u => u.orf_detected).length;
    const avgGc = totalUploads > 0
        ? (safeUploads.reduce((acc, curr) => acc + parseFloat(curr.gc_percent || 0), 0) / totalUploads).toFixed(1)
        : 0;

    // Chart Data Preparation
    const gcBuckets = [
        { name: '<40%', count: 0 },
        { name: '40-50%', count: 0 },
        { name: '50-60%', count: 0 },
        { name: '>60%', count: 0 },
    ];

    safeUploads.forEach(u => {
        const gc = parseFloat(u.gc_percent || 0);
        if (gc < 40) gcBuckets[0].count++;
        else if (gc < 50) gcBuckets[1].count++;
        else if (gc < 60) gcBuckets[2].count++;
        else gcBuckets[3].count++;
    });

    const lengthData = safeUploads.slice(0, 10).map(u => ({
        name: u.filename.length > 10 ? u.filename.substring(0, 8) + '...' : u.filename,
        length: u.length || 0
    }));

    // Mock data for "Recent Activity"
    const recentActivity = totalUploads > 0 ? totalUploads : 0;

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Metrics Animation
            gsap.from(".metric-card", {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: ".metric-card",
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            });

            // Charts Animation - Delayed
            if (chartsRef.current) {
                gsap.from(chartsRef.current.children, {
                    y: 60,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: chartsRef.current,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    }
                });
            }

            // Table Animation - More Delayed
            if (tableRef.current) {
                gsap.fromTo(tableRef.current,
                    { y: 60, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: tableRef.current,
                            start: "top 85%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            }

            // Animate decorative blob
            gsap.to(".decorative-blob", {
                y: 30,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${theme.colors.glassBorder}`, boxShadow: theme.shadows.glass }}>
                    <p style={{ margin: 0, fontWeight: 600, color: theme.colors.textMain }}>{label}</p>
                    <p style={{ margin: 0, color: theme.colors.primaryBlue }}>{`${payload[0].value} Sequences`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div ref={containerRef} className="animate-fade-in" style={{ position: 'relative', paddingBottom: '2rem' }}>
            {/* Decorative Element */}
            <div className="decorative-blob" style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(0,0,0,0) 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: -1
            }} />

            <h2 style={{ marginBottom: '2rem' }}>Dashboard</h2>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <MetricCard
                    title="Total Uploads"
                    value={totalUploads.toLocaleString()}
                    icon={UploadCloud}
                    color={theme.colors.primaryBlue}
                    index={0}
                />
                <MetricCard
                    title="Files With ORF"
                    value={orfCount.toLocaleString()}
                    icon={FileCode}
                    color={theme.colors.primaryPurple}
                    index={1}
                />
                <MetricCard
                    title="Avg GC%"
                    value={`${avgGc}%`}
                    icon={Activity}
                    color={theme.colors.accentCyan}
                    index={2}
                />
                <MetricCard
                    title="Recent Activity"
                    value={recentActivity}
                    icon={Clock}
                    color={theme.colors.accentGreen}
                    index={3}
                />
            </div>

            {/* Charts Section */}
            {totalUploads > 0 && (
                <div ref={chartsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                    {/* GC Distribution Chart */}
                    <div style={{
                        ...styles.glassPanel,
                        background: `${theme.gradients.cardBlue}, ${theme.colors.glassBg}`,
                        padding: '2rem',
                        height: '450px',
                        border: `1px solid ${theme.colors.glassBorder}`
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: theme.colors.textMuted, fontWeight: 600 }}>GC Content Distribution</h3>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={gcBuckets} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke={theme.colors.textMuted} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke={theme.colors.textMuted} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar name="Sequence Count" dataKey="count" radius={[8, 8, 0, 0]}>
                                    {gcBuckets.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? theme.colors.primaryBlue : theme.colors.primaryPurple} fillOpacity={0.9} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Sequence Length Chart */}
                    <div style={{
                        ...styles.glassPanel,
                        background: `${theme.gradients.cardGreen}, ${theme.colors.glassBg}`,
                        padding: '2rem',
                        height: '450px',
                        border: `1px solid ${theme.colors.glassBorder}`
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: theme.colors.textMuted, fontWeight: 600 }}>Top Sequences by Length</h3>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={lengthData} layout="vertical" margin={{ top: 20, right: 50, left: 40, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={true} />
                                <XAxis type="number" stroke={theme.colors.textMuted} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="name" stroke={theme.colors.textMuted} fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar name="Length (bp)" dataKey="length" fill={theme.colors.accentGreen} radius={[0, 8, 8, 0]} fillOpacity={0.9} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Recent Uploads Table */}
            <div ref={tableRef} style={{ ...styles.glassPanel, padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Recent Uploads</h3>
                {totalUploads === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: theme.colors.textMuted }}>
                        No uploads yet. Go to "Upload FASTA" to get started.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Filename</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>GC%</th>
                                    <th style={styles.th}>ORF</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {safeUploads.map((upload) => (
                                    <tr key={upload.id} className="table-row">
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FileCode size={16} color={theme.colors.textMuted} />
                                                {upload.filename}
                                            </div>
                                        </td>
                                        <td style={styles.td}>{new Date(upload.timestamp).toLocaleDateString()}</td>
                                        <td style={styles.td}>{upload.gc_percent}%</td>
                                        <td style={styles.td}>{upload.orf_detected ? 'Yes' : 'No'}</td>
                                        <td style={styles.td}>
                                            <span style={{ color: theme.colors.accentGreen }}>Completed</span>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => onGenerateReport(upload)}
                                                style={{
                                                    ...styles.btnPrimary,
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                View Report
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
