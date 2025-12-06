import React, { useEffect, useRef } from 'react';
import { UploadCloud, FileCode, Activity, Clock, Eye } from 'lucide-react';
import { styles, theme } from '../theme';
import gsap from 'gsap';

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
                background: getGradient(index)
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

    // Safety check for uploads
    const safeUploads = Array.isArray(uploads) ? uploads : [];

    // Calculate metrics
    const totalUploads = safeUploads.length;
    const orfCount = safeUploads.filter(u => u.orf_detected).length;
    const avgGc = totalUploads > 0
        ? (safeUploads.reduce((acc, curr) => acc + parseFloat(curr.gc_percent || 0), 0) / totalUploads).toFixed(1)
        : 0;

    // Mock data for "Recent Activity" if uploads are low, to match screenshot vibe

    const recentActivity = totalUploads > 0 ? totalUploads : 0;

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".metric-card", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.7)"
            });

            gsap.from(tableRef.current, {
                y: 40,
                opacity: 0,
                duration: 0.8,
                delay: 0.4,
                ease: "power3.out"
            });

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

    return (
        <div ref={containerRef} className="animate-fade-in" style={{ position: 'relative' }}>
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
