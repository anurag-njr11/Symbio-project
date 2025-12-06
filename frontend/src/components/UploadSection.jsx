import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, CheckCircle } from 'lucide-react';
import { styles, theme } from '../theme';

const UploadSection = ({ onUpload }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

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
        const selectedFile = e.dataTransfer.files[0];
        validateAndSetFile(selectedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const clearFile = () => {
        setFile(null);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!file) return;

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
            clearFile();
        } catch (err) {
            setError('Error reading file: ' + err.message);
        }
    };

    return (
        <div className="animate-fade-in" style={{ ...styles.glassPanel, padding: '2.5rem', marginBottom: '2rem' }}>
            <h2 style={{
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '1.8rem',
                fontWeight: 700,
            }}>
                <UploadCloud size={28} color={theme.colors.accentCyan} />
                <span style={{
                    background: theme.gradients.text,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>Upload Sequence</span>
            </h2>

            {!file ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current.click()}
                    style={{
                        border: `2px dashed ${theme.colors.glassBorder}`,
                        borderRadius: '20px',
                        padding: '4rem 3rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: theme.colors.glassBgLight,
                        backdropFilter: 'blur(10px)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = theme.colors.accentCyan;
                        e.currentTarget.style.background = 'rgba(6, 182, 212, 0.05)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = theme.colors.glassBorder;
                        e.currentTarget.style.background = theme.colors.glassBgLight;
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".fasta,.fa"
                        style={{ display: 'none' }}
                    />
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
                        <UploadCloud size={40} color={theme.colors.accentCyan} />
                    </div>
                    <h3 style={{
                        marginBottom: '0.75rem',
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        color: theme.colors.textSecondary,
                    }}>Click or Drag & Drop to Upload</h3>
                    <p style={{ color: theme.colors.textMuted, fontSize: '1rem' }}>Supported formats: .fasta, .fa</p>
                    {error && <p style={{ color: '#ef4444', marginTop: '1.5rem', fontWeight: 500 }}>{error}</p>}
                </div>
            ) : (
                <div style={{
                    background: theme.colors.glassBgLight,
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: `1px solid ${theme.colors.glassBorder}`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            background: `${theme.colors.accentGreen}20`,
                            padding: '1rem',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <FileText size={32} color={theme.colors.accentGreen} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.1rem', fontWeight: 600, color: theme.colors.textSecondary }}>{file.name}</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.textMuted }}>
                                {(file.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={clearFile}
                            style={{
                                ...styles.btnSecondary,
                                padding: '0.6rem',
                                borderColor: 'transparent',
                            }}
                        >
                            <X size={20} />
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="btn-primary"
                            style={styles.btnPrimary}
                        >
                            <CheckCircle size={18} />
                            Process Sequence
                        </button>
                    </div>
                </div>
            )}
            {error && file && <p style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 500 }}>{error}</p>}
        </div>
    );
};

export default UploadSection;
