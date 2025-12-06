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
                                    The analyzed sequence <strong>{sequence.filename}</strong> contains <strong>{sequence.length}</strong> base pairs with <strong>{sequence.gc_percent}%</strong> GC content.
                                    {sequence.orf_detected
                                        ? " The presence of an Open Reading Frame (ORF) suggests potential protein-coding capability."
                                        : " No canonical ORF was detected in the standard frames."}
                                </p>

                                {/* AI Summary Box */}
                                <div style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '1.5rem', borderRadius: '12px', borderLeft: `4px solid ${theme.colors.primaryBlue}` }}>
                                    <h4 style={{ marginBottom: '0.5rem', color: theme.colors.primaryBlue, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Analysis</h4>
                                    <div style={{ color: theme.colors.textMuted, fontStyle: 'italic' }}>
                                        {sequence.interpretation ? (
                                            <ReactMarkdown components={{ p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>
                                                {sequence.interpretation}
                                            </ReactMarkdown>
                                        ) : "Interpretation pending..."}
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

                        {/* Dinucleotide Frequency */}
                        <section style={{ ...styles.glassPanel, padding: '1.5rem', boxShadow: 'none', background: 'rgba(255,255,255,0.4)', border: `1px solid ${theme.colors.borderColor}` }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Top Dinucleotides</h3>
                            <div style={{ height: '200px', width: '100%' }}>
                                <ResponsiveContainer>
                                    <BarChart data={dinucleotides} layout="vertical" margin={{ left: 0 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={30} tick={{ fontSize: 12 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                        <Bar dataKey="value" fill={theme.colors.accentCyan} radius={[0, 4, 4, 0]} barSize={15} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportView;
