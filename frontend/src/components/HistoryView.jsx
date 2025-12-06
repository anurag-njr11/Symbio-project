import React from 'react';
import { FileText, Eye, Trash2 } from 'lucide-react';
import { styles, theme } from '../theme';

const HistoryView = ({ uploads, onViewReport, onDelete }) => {
    if (!uploads || uploads.length === 0) {
        return (
            <div style={{
                ...styles.glassPanel,
                padding: '4rem 3rem',
                textAlign: 'center',
            }}>
                <div style={{
                    background: `${theme.colors.accentCyan}20`,
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                }}>
                    <FileText size={40} color={theme.colors.accentCyan} style={{ opacity: 0.8 }} />
                </div>
                <h3 style={{
                    marginBottom: '0.5rem',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: theme.colors.textSecondary,
                }}>No History Available</h3>
                <p style={{ color: theme.colors.textMuted, fontSize: '1rem' }}>Uploaded sequences will appear here.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ ...styles.glassPanel, padding: '2.5rem' }}>
            <h2 style={{
                marginBottom: '2rem',
                fontSize: '1.8rem',
                fontWeight: 700,
                background: theme.gradients.text,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>Upload History</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Filename</th>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Length (bp)</th>
                            <th style={styles.th}>GC %</th>
                            <th style={styles.th}>ORF</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {uploads.map((upload) => (
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <FileText size={18} color={theme.colors.accentCyan} />
                                        <span style={{ fontWeight: 500 }}>{upload.filename}</span>
                                    </div>
                                </td>
                                <td style={styles.td}>{new Date(upload.timestamp).toLocaleDateString()}</td>
                                <td style={styles.td}>
                                    <span style={{ fontWeight: 500, color: theme.colors.textSecondary }}>{upload.length}</span>
                                </td>
                                <td style={styles.td}>
                                    <span style={{
                                        fontWeight: 600,
                                        color: theme.colors.accentPurple,
                                    }}>{upload.gc_percent}%</span>
                                </td>
                                <td style={styles.td}>
                                    <span style={{
                                        color: upload.orf_detected ? theme.colors.accentGreen : theme.colors.textMuted,
                                        background: upload.orf_detected ? `${theme.colors.accentGreen}20` : 'rgba(255,255,255,0.05)',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                    }}>
                                        {upload.orf_detected ? 'Detected' : 'None'}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => onViewReport(upload)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: theme.colors.accentCyan,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                padding: '0.4rem 0.75rem',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s',
                                                fontWeight: 500,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = `${theme.colors.accentCyan}20`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <Eye size={16} /> View
                                        </button>
                                        <button
                                            onClick={() => onDelete(upload.id)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#ef4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                padding: '0.4rem 0.75rem',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s',
                                                fontWeight: 500,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryView;
