import React from 'react';
import { ArrowLeft, Download, Share2, FileText } from 'lucide-react';
import MetadataCard from './MetadataCard';
import { AlignLeft, Activity, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { styles, theme } from '../theme';

const ReportView = ({ sequence, onBack }) => {
    if (!sequence) return null;

    // Fix #1: Download button handler
    const handleDownload = () => {
        window.location.href = `/api/files/${sequence._id || sequence.id}/report`;
    };

    // Fix #2: Share button handler
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Genomic Report: ${sequence.filename}`,
                text: `View the genomic analysis report for ${sequence.filename}`,
                url: `/report/${sequence._id || sequence.id}`
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback for browsers that don't support Web Share API
            alert('Share feature is not supported on this browser');
        }
    };

    return (
        <div className="animate-fade-in">
            <button
                onClick={onBack}
                style={{ ...styles.btnSecondary, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <ArrowLeft size={18} />
                Back to Dashboard
            </button>

            <div style={{ ...styles.glassPanel, padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative background element */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, rgba(0,0,0,0) 70%)',
                    pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                    <div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(37, 99, 235, 0.1)',
                            color: theme.colors.primaryBlue,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: '1rem'
                        }}>
                            <FileText size={14} />
                            Genomic Analysis Report
                        </div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{sequence.filename}</h1>
                        <p style={{ color: theme.colors.textMuted, fontSize: '1.1rem' }}>{sequence.header}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handleDownload}
                            style={styles.btnSecondary}
                            title="Download Sequence"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            onClick={handleShare}
                            style={styles.btnSecondary}
                            title="Share Report"
                        >
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    <MetadataCard
                        title="Sequence Length"
                        value={`${sequence.length} bp`}
                        icon={AlignLeft}
                        color={theme.colors.primaryBlue}
                    />
                    <MetadataCard
                        title="GC Content"
                        value={`${sequence.gc_percent}%`}
                        icon={Activity}
                        color={theme.colors.primaryPurple}
                    />
                    <MetadataCard
                        title="ORF Detected"
                        value={sequence.orf_detected ? "Positive" : "Negative"}
                        icon={Zap}
                        color={sequence.orf_detected ? theme.colors.accentGreen : theme.colors.textMuted}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: `1px solid ${theme.colors.borderColor}`, paddingBottom: '0.5rem' }}>
                            Biological Interpretation
                        </h3>
                        <div style={{ lineHeight: '1.8', color: theme.colors.textMain }}>
                            <p style={{ marginBottom: '1.5rem' }}>
                                The analyzed sequence <strong>{sequence.filename}</strong> contains <strong>{sequence.length}</strong> base pairs.
                                With a GC content of <strong>{sequence.gc_percent}%</strong>, this sequence exhibits {sequence.gc_percent > 50 ? 'high' : 'standard/low'} thermal stability characteristics.
                            </p>
                            <p style={{ marginBottom: '1.5rem' }}>
                                <strong>Open Reading Frame (ORF) Analysis:</strong><br />
                                {sequence.orf_detected
                                    ? "A potential protein-coding region was detected. The sequence contains a standard start codon (ATG) and a valid stop codon, suggesting it may represent a functional gene or gene fragment."
                                    : "No complete Open Reading Frame was detected in the standard reading frame. This may indicate a non-coding region, a partial sequence, or a regulatory element."
                                }
                            </p>

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', marginTop: '2rem' }}>
                                <h4 style={{ marginBottom: '1rem', color: theme.colors.accentCyan }}>AI Summary</h4>
                                <p style={{ fontStyle: 'italic', color: theme.colors.textMuted }}>
                                    "This sequence shows characteristics consistent with {sequence.gc_percent > 60 ? 'GC-rich organisms such as certain bacteria or thermophiles' : 'standard genomic DNA'}.
                                    The nucleotide distribution is {Math.abs(sequence.nucleotide_counts.A - sequence.nucleotide_counts.T) < sequence.length * 0.1 ? 'balanced' : 'skewed'},
                                    indicating potential biological significance in..."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: `1px solid ${theme.colors.borderColor}`, paddingBottom: '0.5rem' }}>
                            Composition
                        </h3>
                        {/* Pie Chart (Fix #5) */}
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'A', value: sequence.nucleotide_counts.A },
                                            { name: 'T', value: sequence.nucleotide_counts.T },
                                            { name: 'G', value: sequence.nucleotide_counts.G },
                                            { name: 'C', value: sequence.nucleotide_counts.C }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${((value / sequence.length) * 100).toFixed(1)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        <Cell fill="#ef4444" />
                                        <Cell fill="#eab308" />
                                        <Cell fill="#22c55e" />
                                        <Cell fill="#3b82f6" />
                                    </Pie>
                                    <Tooltip formatter={(value) => `${((value / sequence.length) * 100).toFixed(1)}%`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar Chart (existing) */}
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                            {Object.entries(sequence.nucleotide_counts).map(([base, count]) => (
                                <div key={base} style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 600 }}>{base}</span>
                                        <span style={{ color: theme.colors.textMuted }}>{((count / sequence.length) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(count / sequence.length) * 100}%`,
                                            background: base === 'A' ? '#ef4444' : base === 'T' ? '#eab308' : base === 'G' ? '#22c55e' : '#3b82f6'
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportView;
