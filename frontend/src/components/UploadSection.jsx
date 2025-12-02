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

    const handleSubmit = () => {
        if (file) {
            onUpload(file);
            clearFile();
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
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current.click()}
                    style={{
                        border: `2px dashed ${theme.colors.borderColor}`,
                        borderRadius: '12px',
                        padding: '3rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'rgba(255,255,255,0.02)'
                    }}
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
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
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
                        >
                            <X size={20} />
                        </button>
                        <button
                            onClick={handleSubmit}
                            style={styles.btnPrimary}
                        >
                            <CheckCircle size={18} />
                            Process Sequence
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadSection;
