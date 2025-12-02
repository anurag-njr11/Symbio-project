import React from 'react';
import { FileText, Eye, Trash2 } from 'lucide-react';
import { styles, theme } from '../theme';

const HistoryView = ({ uploads, onViewReport }) => {
    if (!uploads || uploads.length === 0) {
        return (
            <div style={{ ...styles.glassPanel, padding: '3rem', textAlign: 'center', color: theme.colors.textMuted }}>
                <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>No History Available</h3>
                <p>Uploaded sequences will appear here.</p>
            </div>
        );
    }

    return (
        <div style={{ ...styles.glassPanel, padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Upload History</h2>
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
                            <tr key={upload.id}>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FileText size={16} color={theme.colors.primaryBlue} />
                                        {upload.filename}
                                    </div>
                                </td>
                                <td style={styles.td}>{new Date(upload.timestamp).toLocaleDateString()}</td>
                                <td style={styles.td}>{upload.length}</td>
                                <td style={styles.td}>{upload.gc_percent}%</td>
                                <td style={styles.td}>
                                    <span style={{
                                        color: upload.orf_detected ? theme.colors.accentGreen : theme.colors.textMuted,
                                        background: upload.orf_detected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem'
                                    }}>
                                        {upload.orf_detected ? 'Detected' : 'None'}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button
                                        onClick={() => onViewReport(upload)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: theme.colors.primaryBlue,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                        }}
                                    >
                                        <Eye size={16} /> View
                                    </button>
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
