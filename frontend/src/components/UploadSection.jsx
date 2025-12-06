import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, CheckCircle } from 'lucide-react';
import { styles, theme } from '../theme';
import DragDropUpload from './ux/DragDropUpload';
import FastaPreviewCard from './ux/FastaPreviewCard';

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
                <>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".fasta,.fa"
                        style={{ display: 'none' }}
                    />
                    <DragDropUpload
                        onFileSelect={validateAndSetFile}
                        error={error}
                    />
                </>
            ) : (
                <FastaPreviewCard
                    file={file}
                    onClear={clearFile}
                    onSubmit={handleSubmit}
                />
            )}
            {error && file && <p style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 500 }}>{error}</p>}
        </div>
    );
};

export default UploadSection;
