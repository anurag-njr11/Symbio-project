import React from 'react';
import { UploadCloud, FileCode, Activity, Clock, Eye } from 'lucide-react';
import { styles, theme } from '../theme';

const MetricCard = ({ title, value, icon: Icon, color }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div
            className="metric-card"
            style={{
                ...styles.metricCard,
                transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: isHovered ? theme.shadows.hover : theme.shadows.glass,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ color: theme.colors.textMuted, fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.5px' }}>{title}</span>
                <div style={{
                    background: `${color}20`,
                    padding: '0.5rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Icon size={20} color={color} style={{ opacity: 0.9 }} />
                </div>
            </div>
            <div style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${color}, ${theme.colors.accentPurple})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>{value}</div>
        </div>
    );
};

const Dashboard = ({ uploads, onGenerateReport }) => {
    // Calculate metrics
    const totalUploads = uploads.length;
    const orfCount = uploads.filter(u => u.orf_detected).length;
    const avgGc = totalUploads > 0
        ? (uploads.reduce((acc, curr) => acc + parseFloat(curr.gc_percent), 0) / totalUploads).toFixed(1)
        : 0;

    // Mock data for "Recent Activity" if uploads are low, to match screenshot vibe
    const recentActivity = totalUploads > 0 ? totalUploads : 0;

    return (
        <div className="animate-fade-in">
            <h2 style={{
                marginBottom: '2rem',
                fontSize: '2rem',
                fontWeight: 700,
                background: theme.gradients.text,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>Dashboard</h2>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <MetricCard
                    title="Total Uploads"
                    value={totalUploads.toLocaleString()}
                    icon={UploadCloud}
                    color={theme.colors.accentCyan}
                />
                <MetricCard
                    title="Files With ORF"
                    value={orfCount.toLocaleString()}
                    icon={FileCode}
                    color={theme.colors.primaryPurple}
                />
                <MetricCard
                    title="Avg GC%"
                    value={`${avgGc}%`}
                    icon={Activity}
                    color={theme.colors.accentPurple}
                />
                <MetricCard
                    title="Recent Activity"
                    value={recentActivity}
                    icon={Clock}
                    color={theme.colors.accentGreen}
                />
            </div>

            {/* Recent Uploads Table */}
            <div style={{ ...styles.glassPanel, padding: '2rem' }}>
                <h3 style={{
                    marginBottom: '1.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: theme.colors.textSecondary,
                }}>Recent Uploads</h3>
                {totalUploads === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: theme.colors.textMuted }}>
                        <UploadCloud size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p style={{ fontSize: '1.1rem' }}>No uploads yet. Go to "Upload FASTA" to get started.</p>
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
                                {uploads.slice(0, 5).map((upload) => (
                                    <tr
                                        key={upload.id}
                                        style={{ transition: 'all 0.2s ease' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FileCode size={16} color={theme.colors.accentCyan} />
                                                <span style={{ fontWeight: 500 }}>{upload.filename}</span>
                                            </div>
                                        </td>
                                        <td style={styles.td}>{new Date(upload.timestamp).toLocaleDateString()}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                color: theme.colors.accentPurple,
                                                fontWeight: 600,
                                            }}>{upload.gc_percent}%</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                background: upload.orf_detected ? `${theme.colors.accentGreen}20` : 'rgba(255,255,255,0.05)',
                                                color: upload.orf_detected ? theme.colors.accentGreen : theme.colors.textMuted,
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: 500,
                                            }}>
                                                {upload.orf_detected ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                color: theme.colors.accentGreen,
                                                fontWeight: 500,
                                            }}>Completed</span>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => onGenerateReport(upload)}
                                                className="btn-primary"
                                                style={{
                                                    ...styles.btnPrimary,
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                <Eye size={16} />
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
