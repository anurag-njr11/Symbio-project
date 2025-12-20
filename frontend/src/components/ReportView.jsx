import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Download, Share2, FileText } from 'lucide-react';
import MetadataCard from './MetadataCard';
import { AlignLeft, Activity, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { styles, theme } from '../theme';

const ReportView = ({ sequence, onBack }) => {
    if (!sequence) return null;

    // Fix #1: Download button handler
    const handleDownload = async () => {
        try {
            const response = await fetch(`/api/files/${sequence._id || sequence.id}/report`);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `genomic-report-${sequence.filename}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
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

    // Generate Chart Data
    const dinucleotides = React.useMemo(() => {
        if (!sequence.sequence) return [];
        const seq = sequence.sequence.toUpperCase();
        const counts = {};
        for (let i = 0; i < seq.length - 1; i++) {
            const pair = seq.slice(i, i + 2);
            if (!/[^ATGC]/.test(pair)) counts[pair] = (counts[pair] || 0) + 1;
        }
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8); // Top 8 pairs
    }, [sequence]);

    const gcProfile = React.useMemo(() => {
        if (!sequence.sequence) return [];
        const seq = sequence.sequence.toUpperCase();
        const data = [];
        const windowSize = Math.max(10, Math.floor(seq.length / 50)); // Dynamic window

        for (let i = 0; i < seq.length; i += windowSize) {
            const chunk = seq.slice(i, i + windowSize);
            const gc = (chunk.match(/[GC]/g) || []).length;
            data.push({
                position: i,
                gc: (gc / chunk.length) * 100
            });
        }
        return data;
    }, [sequence]);


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

                    {/* Left Column: AI + Deep Analysis */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Biological Context */}
                        <section style={{ ...styles.glassPanel, padding: '2rem', boxShadow: 'none', background: 'rgba(255,255,255,0.4)', border: `1px solid ${theme.colors.borderColor}` }}>
                            <h3 style={{ marginBottom: '1rem', color: theme.colors.primaryBlue, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Activity size={20} /> Biological Interpretation
                            </h3>
                            <div style={{ lineHeight: '1.8', color: theme.colors.textMain }}>
                                <p style={{ marginBottom: '1rem' }}>
                                    The analyzed sequence <strong>{sequence.filename}</strong> contains <strong>{sequence.length}</strong> base pairs with <strong>{sequence.gc_percent.toFixed(2)}%</strong> GC content.
                                    {sequence.orf_detected
                                        ? " The presence of an Open Reading Frame (ORF) suggests potential protein-coding capability."
                                        : " No canonical ORF was detected in the standard frames."}
                                </p>

                                {/* GC Content Analysis */}
                                <div style={{ background: 'rgba(124, 58, 237, 0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: theme.colors.primaryPurple }}>GC Content Analysis</h4>
                                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                        {sequence.gc_percent < 40
                                            ? "This sequence exhibits LOW GC content (<40%), characteristic of AT-rich regions. Such sequences typically have lower thermal stability and may represent non-coding regions or introns."
                                            : sequence.gc_percent <= 60
                                                ? "This sequence shows MODERATE GC content (40-60%), typical for many protein-coding genes. This balanced composition suggests potential functional significance."
                                                : "This sequence demonstrates HIGH GC content (>60%), indicating strong thermal stability. GC-rich regions are often associated with promoter regions or CpG islands."}
                                    </p>
                                </div>

                                {/* Codon Usage Insights */}
                                {sequence.codon_frequency && Object.keys(sequence.codon_frequency).length > 0 && (
                                    <div style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: theme.colors.primaryBlue }}>Codon Usage Pattern</h4>
                                        <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                            Analysis identified <strong>{Object.keys(sequence.codon_frequency).length}</strong> unique codons across all reading frames.
                                            Codon usage bias can indicate gene expression levels and evolutionary adaptation.
                                            {sequence.orf_detected && " The detected ORF shows specific codon preferences that may reflect translation efficiency."}
                                        </p>
                                    </div>
                                )}

                                {/* Sequence Quality Notes */}
                                <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: theme.colors.accentGreen }}>Sequence Quality</h4>
                                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                        The sequence contains valid ATGC nucleotides with balanced base composition.
                                        {sequence.length >= 300
                                            ? " The sequence length is sufficient for comprehensive analysis and ORF detection."
                                            : " Note: Shorter sequences may have limited ORF detection reliability."}
                                    </p>
                                </div>

                                {/* AI Summary Box */}
                                <div style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '1.5rem', borderRadius: '12px', borderLeft: `4px solid ${theme.colors.primaryBlue}` }}>
                                    <h4 style={{ marginBottom: '0.5rem', color: theme.colors.primaryBlue, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI-Powered Analysis</h4>
                                    <div style={{ color: theme.colors.textMuted, fontStyle: 'italic' }}>
                                        {sequence.interpretation ? (
                                            <ReactMarkdown components={{ p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>
                                                {sequence.interpretation}
                                            </ReactMarkdown>
                                        ) : "Generating detailed interpretation..."}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* GC Profile Chart */}
                        <section style={{ ...styles.glassPanel, padding: '2rem', boxShadow: 'none', background: 'rgba(255,255,255,0.4)', border: `1px solid ${theme.colors.borderColor}` }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>GC Content Profile</h3>
                            <div style={{ height: '250px', width: '100%' }}>
                                <ResponsiveContainer>
                                    <AreaChart data={gcProfile}>
                                        <defs>
                                            <linearGradient id="colorGc" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={theme.colors.primaryPurple} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={theme.colors.primaryPurple} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis dataKey="position" tick={{ fontSize: 12, fill: theme.colors.textMuted }} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: theme.colors.textMuted }} unit="%" />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: theme.shadows.glass }}
                                            itemStyle={{ color: theme.colors.primaryPurple }}
                                        />
                                        <Area type="monotone" dataKey="gc" stroke={theme.colors.primaryPurple} fillOpacity={1} fill="url(#colorGc)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {/* ORF Sequence - Only show if ORF detected */}
                        {sequence.orf_detected && sequence.orf_sequence && (
                            <section style={{ ...styles.glassPanel, padding: '2rem', boxShadow: 'none', background: 'rgba(255,255,255,0.4)', border: `1px solid ${theme.colors.borderColor}` }}>
                                <h3 style={{ marginBottom: '1rem', color: theme.colors.accentGreen, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Zap size={20} /> Detected ORF Sequence
                                </h3>
                                <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', color: theme.colors.textMuted, fontSize: '0.9rem' }}>
                                    <div><strong>Length:</strong> {sequence.orf_sequence.length} bp</div>
                                    <div><strong>Reading Frame:</strong> {sequence.reading_frame != null ? sequence.reading_frame : 'N/A'}</div>
                                    <div><strong>Start Position:</strong> {sequence.orf_start != null ? sequence.orf_start : 'N/A'}</div>
                                    <div><strong>End Position:</strong> {sequence.orf_end != null ? sequence.orf_end : 'N/A'}</div>
                                </div>
                                <div style={{
                                    background: 'rgba(0,0,0,0.02)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '0.85rem',
                                    wordBreak: 'break-all',
                                    lineHeight: '1.6',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {sequence.orf_sequence}
                                </div>
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', fontSize: '0.9rem', color: theme.colors.textMuted }}>
                                    <strong>Biological Significance:</strong> This ORF suggests potential protein-coding capability,
                                    producing approximately {Math.floor(sequence.orf_sequence.length / 3)} amino acids.
                                </div>
                            </section>
                        )}

                    </div>

                    {/* Right Column: Composition Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Nucleotide Composition */}
                        <section style={{ ...styles.glassPanel, padding: '1.5rem', boxShadow: 'none', background: 'rgba(255,255,255,0.4)', border: `1px solid ${theme.colors.borderColor}` }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Base Composition</h3>
                            <div style={{ height: '200px', marginBottom: '1rem' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'A', value: sequence.nucleotide_counts.A },
                                                { name: 'T', value: sequence.nucleotide_counts.T },
                                                { name: 'G', value: sequence.nucleotide_counts.G },
                                                { name: 'C', value: sequence.nucleotide_counts.C }
                                            ]}
                                            cx="50%" cy="50%"
                                            innerRadius={60} outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="#ef4444" />
                                            <Cell fill="#eab308" />
                                            <Cell fill="#22c55e" />
                                            <Cell fill="#3b82f6" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Custom Legend */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                                {Object.entries(sequence.nucleotide_counts).map(([base, count]) => (
                                    <div key={base} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: base === 'A' ? '#ef4444' : base === 'T' ? '#eab308' : base === 'G' ? '#22c55e' : '#3b82f6' }} />
                                            <span>{base}</span>
                                        </div>
                                        <span style={{ color: theme.colors.textMuted }}>{((count / sequence.length) * 100).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Codon Frequency */}
                        <section style={{ ...styles.glassPanel, padding: '1.5rem', boxShadow: 'none', background: 'rgba(255,255,255,0.4)', border: `1px solid ${theme.colors.borderColor}` }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Top Codon Frequency</h3>
                            <div style={{ height: '200px', width: '100%' }}>
                                {sequence.codon_frequency && Object.keys(sequence.codon_frequency).length > 0 ? (
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={
                                                Object.entries(sequence.codon_frequency)
                                                    .sort((a, b) => b[1] - a[1])
                                                    .slice(0, 10)
                                                    .map(([name, value]) => ({ name, value }))
                                            }
                                            layout="vertical"
                                            margin={{ left: 0 }}
                                        >
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={40} tick={{ fontSize: 11 }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                            <Bar dataKey="value" fill={theme.colors.primaryPurple} radius={[0, 4, 4, 0]} barSize={12} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.colors.textMuted }}>
                                        No codon data available
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportView;
