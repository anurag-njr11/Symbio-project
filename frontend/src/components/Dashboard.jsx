import React from 'react';
import { UploadCloud, FileCode, Activity, Clock, Eye } from 'lucide-react';
import { styles, theme } from '../theme';

const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div style={styles.metricCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ color: theme.colors.textMuted, fontSize: '0.9rem' }}>{title}</span>
            <Icon size={18} color={color} style={{ opacity: 0.8 }} />
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</div>
    </div>
);

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
            <h2 style={{ marginBottom: '2rem' }}>Dashboard</h2>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <MetricCard
                    title="Total Uploads"
                    value={totalUploads.toLocaleString()}
                    icon={UploadCloud}
                    color={theme.colors.primaryBlue}
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
                    color={theme.colors.accentCyan}
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
                                {uploads.map((upload) => (
                                    <tr key={upload.id}>
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
