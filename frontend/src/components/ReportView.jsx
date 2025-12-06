import React from 'react';
import { ArrowLeft, Download, Share2, FileText } from 'lucide-react';
import MetadataCard from './MetadataCard';
import { AlignLeft, Activity, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { styles, theme } from '../theme';

const ReportView = ({ sequence, onBack }) => {
    const [aiSummaryHovered, setAiSummaryHovered] = React.useState(false);
    const [pieChartHovered, setPieChartHovered] = React.useState(null);

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
                url: `${window.location.origin}/report/${sequence._id || sequence.id}`
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
                {/* Animated decorative background elements */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: '400px',
                    height: '400px',
                    background: `radial-gradient(circle, ${theme.colors.accentPurple}30, transparent)`,
                    borderRadius: '50%',
                    filter: 'blur(80px)',
                    animation: 'float 8s ease-in-out infinite',
                    pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-5%',
                    width: '350px',
                    height: '350px',
                    background: `radial-gradient(circle, ${theme.colors.accentCyan}25, transparent)`,
                    borderRadius: '50%',
                    filter: 'blur(70px)',
                    animation: 'float 6s ease-in-out infinite reverse',
                    pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
                    <div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: `${theme.colors.accentCyan}20`,
                            color: theme.colors.accentCyan,
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: '1rem',
                            border: `1px solid ${theme.colors.accentCyan}40`,
                        }}>
                            <FileText size={14} />
                            Genomic Analysis Report
                        </div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            marginBottom: '0.5rem',
                            fontWeight: 700,
                            color: theme.colors.textPrimary,
                        }}>{sequence.filename}</h1>
                        <p style={{ color: theme.colors.textMuted, fontSize: '1.1rem' }}>{sequence.header}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handleDownload}
                            className="btn-secondary"
                            style={styles.btnSecondary}
                            title="Download Report"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="btn-secondary"
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

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', position: 'relative', zIndex: 1 }}>
                    <div>
                        <h3 style={{
                            marginBottom: '1.5rem',
                            borderBottom: `1px solid ${theme.colors.glassBorder}`,
                            paddingBottom: '0.75rem',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: theme.colors.textSecondary,
                        }}>
                            Biological Interpretation
                        </h3>
                        <div style={{ lineHeight: '1.8', color: theme.colors.textSecondary }}>
                            <p style={{ marginBottom: '1.5rem' }}>
                                The analyzed sequence <strong style={{ color: theme.colors.accentCyan }}>{sequence.filename}</strong> contains <strong style={{ color: theme.colors.accentPurple }}>{sequence.length}</strong> base pairs.
                                With a GC content of <strong style={{ color: theme.colors.accentGreen }}>{sequence.gc_percent}%</strong>, this sequence exhibits {sequence.gc_percent > 50 ? 'high' : 'standard/low'} thermal stability characteristics.
                            </p>
                            <p style={{ marginBottom: '1.5rem' }}>
                                <strong style={{ color: theme.colors.accentCyan }}>Open Reading Frame (ORF) Analysis:</strong><br />
                                {sequence.orf_detected
                                    ? "A potential protein-coding region was detected. The sequence contains a standard start codon (ATG) and a valid stop codon, suggesting it may represent a functional gene or gene fragment."
                                    : "No complete Open Reading Frame was detected in the standard reading frame. This may indicate a non-coding region, a partial sequence, or a regulatory element."
                                }
                            </p>

                            {/* Enhanced AI Summary Section with Hover */}
                            <div
                                style={{
                                    background: theme.colors.glassBgLight,
                                    backdropFilter: 'blur(10px)',
                                    padding: '2rem',
                                    borderRadius: '20px',
                                    marginTop: '2rem',
                                    border: `1px solid ${theme.colors.glassBorder}`,
                                    boxShadow: aiSummaryHovered
                                        ? '0 20px 60px rgba(59, 130, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)'
                                        : '0 8px 32px rgba(31, 38, 135, 0.15)',
                                    animation: 'slideIn 0.5s ease-out',
                                    transform: aiSummaryHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={() => setAiSummaryHovered(true)}
                                onMouseLeave={() => setAiSummaryHovered(false)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        background: theme.gradients.main,
                                        padding: '0.5rem',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transform: aiSummaryHovered ? 'rotate(5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                                        transition: 'transform 0.3s ease',
                                    }}>
                                        <Zap size={20} color="white" />
                                    </div>
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: '1.2rem',
                                        fontWeight: 600,
                                        background: theme.gradients.text,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}>AI Summary</h4>
                                </div>
                                <p style={{
                                    fontStyle: 'italic',
                                    color: theme.colors.textMuted,
                                    lineHeight: '1.7',
                                    margin: 0,
                                }}>
                                    "This sequence shows characteristics consistent with {sequence.gc_percent > 60 ? 'GC-rich organisms such as certain bacteria or thermophiles' : 'standard genomic DNA'}.
                                    The nucleotide distribution is {Math.abs(sequence.nucleotide_counts.A - sequence.nucleotide_counts.T) < sequence.length * 0.1 ? 'balanced' : 'skewed'},
                                    indicating potential biological significance in genomic research."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style={{
                            marginBottom: '1.5rem',
                            borderBottom: `1px solid ${theme.colors.glassBorder}`,
                            paddingBottom: '0.75rem',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: theme.colors.textSecondary,
                        }}>
                            Composition
                        </h3>
                        {/* Enhanced Pie Chart with Individual Slice Hover */}
                        <div
                            style={{
                                background: theme.colors.glassBgLight,
                                backdropFilter: 'blur(10px)',
                                padding: '1.5rem',
                                borderRadius: '20px',
                                marginBottom: '1.5rem',
                                border: `1px solid ${theme.colors.glassBorder}`,
                            }}
                        >
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
                                        onMouseEnter={(data, index) => setPieChartHovered(index)}
                                        onMouseLeave={() => setPieChartHovered(null)}
                                        activeIndex={pieChartHovered}
                                        activeShape={{
                                            outerRadius: 95,
                                            stroke: '#fff',
                                            strokeWidth: 3,
                                            filter: 'drop-shadow(0 0 15px currentColor)',
                                        }}
                                    >
                                        <Cell fill="#ef4444" />
                                        <Cell fill="#eab308" />
                                        <Cell fill="#22c55e" />
                                        <Cell fill="#3b82f6" />
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `${((value / sequence.length) * 100).toFixed(1)}%`}
                                        contentStyle={{
                                            background: theme.colors.glassBg,
                                            border: `1px solid ${theme.colors.glassBorder}`,
                                            borderRadius: '8px',
                                            backdropFilter: 'blur(10px)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Enhanced Bar Chart */}
                        <div style={{
                            background: theme.colors.glassBgLight,
                            backdropFilter: 'blur(10px)',
                            padding: '1.5rem',
                            borderRadius: '20px',
                            border: `1px solid ${theme.colors.glassBorder}`,
                        }}>
                            {Object.entries(sequence.nucleotide_counts).map(([base, count]) => {
                                const [isHovered, setIsHovered] = React.useState(false);
                                const barColor = base === 'A' ? '#ef4444' : base === 'T' ? '#eab308' : base === 'G' ? '#22c55e' : '#3b82f6';

                                return (
                                    <div
                                        key={base}
                                        style={{ marginBottom: '1rem' }}
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{
                                                fontWeight: 600,
                                                color: isHovered ? barColor : theme.colors.textSecondary,
                                                transition: 'color 0.3s ease',
                                            }}>{base}</span>
                                            <span style={{
                                                color: isHovered ? barColor : theme.colors.textMuted,
                                                fontWeight: 500,
                                                transition: 'color 0.3s ease',
                                            }}>{((count / sequence.length) * 100).toFixed(1)}%</span>
                                        </div>
                                        <div style={{
                                            height: '10px',
                                            background: 'rgba(148, 163, 184, 0.15)',
                                            borderRadius: '6px',
                                            overflow: 'visible',
                                            position: 'relative',
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${(count / sequence.length) * 100}%`,
                                                background: barColor,
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                borderRadius: '6px',
                                                transform: isHovered ? 'scaleY(1.4)' : 'scaleY(1)',
                                                transformOrigin: 'center',
                                                boxShadow: isHovered ? `0 0 20px ${barColor}80, 0 4px 12px ${barColor}60` : 'none',
                                                position: 'relative',
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportView;
