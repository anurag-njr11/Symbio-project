import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, X, CheckCircle } from 'lucide-react';
import { styles, theme } from '../theme';
import gsap from 'gsap';

const UploadSection = ({ onUpload }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    const fileCardRef = useRef(null);

    // Animate file card entry
    useEffect(() => {
        if (file && fileCardRef.current) {
            gsap.fromTo(fileCardRef.current,
                { opacity: 0, y: 20, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
            );
        }
    }, [file]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        setError('');
        if (!selectedFile) return;

        const validExtensions = ['.fasta', '.fa'];
        const fileName = selectedFile.name.toLowerCase();
        const isValid = validExtensions.some(ext => fileName.endsWith(ext));

        if (!isValid) {
            setError('Invalid file format. Please upload .fasta or .fa files.');
            return;
        }

        setFile(selectedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        gsap.to(dropZoneRef.current, { scale: 1, borderColor: theme.colors.borderColor, duration: 0.2 });
        const selectedFile = e.dataTransfer.files[0];
        validateAndSetFile(selectedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        gsap.to(dropZoneRef.current, { scale: 1.02, borderColor: theme.colors.primaryBlue, duration: 0.2 });
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        gsap.to(dropZoneRef.current, { scale: 1, borderColor: theme.colors.borderColor, duration: 0.2 });
    }

    const clearFile = () => {
        gsap.to(fileCardRef.current, {
            opacity: 0,
            scale: 0.9,
            duration: 0.2,
            onComplete: () => {
                setFile(null);
                setError('');
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    };

    const handleSubmit = async () => {
        if (!file) return;

        // Animate button click
        const btn = document.getElementById('process-btn');
        if (btn) gsap.to(btn, { scale: 0.95, yoyo: true, repeat: 1, duration: 0.1 });

        // Validate FASTA format before sending to backend (Fix #10)
        try {
            const text = await file.text();

            if (!text.trim().startsWith(">")) {
                setError('Invalid FASTA: missing header (file must start with >)');
                return;
            }

            const lines = text.trim().split('\n');
            const sequence = lines.slice(1).join('').replace(/\s/g, '');

            if (/[^ATGC]/i.test(sequence)) {
                setError('Invalid characters in sequence. Only A, T, G, C are allowed.');
                return;
            }

            if (!sequence) {
                setError('Invalid FASTA format: No sequence found');
                return;
            }

            onUpload(file);
            // Don't clear immediately, let parent handle view switch
        } catch (err) {
            setError('Error reading file: ' + err.message);
        }
    };

    return (
        <div className="animate-fade-in" style={{ ...styles.glassPanel, padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud style={{ stroke: 'url(#gradient)' }} /> {/* Simple workaround or just use color */}
                <span style={styles.textGradient}>Upload Sequence</span>
            </h2>

            {!file ? (
                <div
                    ref={dropZoneRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current.click()}
                    style={{
                        border: `2px dashed ${theme.colors.borderColor}`,
                        borderRadius: '12px',
                        padding: '3rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s ease',
                        backgroundColor: 'rgba(255,255,255,0.02)'
                    }}
                    onMouseEnter={() => gsap.to(dropZoneRef.current, { backgroundColor: 'rgba(255,255,255,0.05)', duration: 0.3 })}
                    onMouseLeave={() => gsap.to(dropZoneRef.current, { backgroundColor: 'rgba(255,255,255,0.02)', duration: 0.3 })}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".fasta,.fa"
                        style={{ display: 'none' }}
                    />
                    <UploadCloud size={48} style={{ color: theme.colors.primaryBlue, marginBottom: '1rem', opacity: 0.8 }} />
                    <h3 style={{ marginBottom: '0.5rem' }}>Click or Drag & Drop to Upload</h3>
                    <p style={{ color: theme.colors.textMuted }}>Supported formats: .fasta, .fa</p>
                    {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
                </div>
            ) : (
                <div
                    ref={fileCardRef}
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            color: theme.colors.accentGreen
                        }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0 }}>{file.name}</h4>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: theme.colors.textMuted }}>
                                {(file.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={clearFile}
                            style={{ ...styles.btnSecondary, padding: '0.5rem', borderColor: 'transparent', color: theme.colors.textMuted }}
                            onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.1, color: theme.colors.accentRed, duration: 0.2 })}
                            onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, color: theme.colors.textMuted, duration: 0.2 })}
                        >
                            <X size={20} />
                        </button>
                        <button
                            id="process-btn"
                            onClick={handleSubmit}
                            style={styles.btnPrimary}
                            onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.05, boxShadow: '0 4px 12px rgba(37,99,235,0.3)', duration: 0.2 })}
                            onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, boxShadow: 'none', duration: 0.2 })}
                        >
                            <CheckCircle size={18} />
                            Process Sequence
                        </button>
                    </div>
                </div>
            )}
            {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
        </div>
    );
};

export default UploadSection;
