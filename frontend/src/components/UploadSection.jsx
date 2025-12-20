import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, X, CheckCircle, Loader } from 'lucide-react';
import { styles, theme } from '../theme';
import gsap from 'gsap';

const UploadSection = ({ onUpload }) => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState({});
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    const fileListRef = useRef(null);

    // Animate file list entry
    useEffect(() => {
        if (files.length > 0 && fileListRef.current) {
            gsap.fromTo(fileListRef.current.children,
                { opacity: 0, y: 20, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" }
            );
        }
    }, [files.length]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        validateAndSetFiles(selectedFiles);
    };

    const validateAndSetFiles = (selectedFiles) => {
        setError('');
        if (!selectedFiles || selectedFiles.length === 0) return;

        const validExtensions = ['.fasta', '.fa'];
        const validFiles = [];
        const invalidFiles = [];

        selectedFiles.forEach(file => {
            const fileName = file.name.toLowerCase();
            const isValid = validExtensions.some(ext => fileName.endsWith(ext));
            if (isValid) {
                validFiles.push(file);
            } else {
                invalidFiles.push(file.name);
            }
        });

        if (invalidFiles.length > 0) {
            setError(`Invalid files skipped: ${invalidFiles.join(', ')}. Only .fasta or .fa files are allowed.`);
        }

        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        gsap.to(dropZoneRef.current, { scale: 1, borderColor: theme.colors.borderColor, duration: 0.2 });
        const selectedFiles = Array.from(e.dataTransfer.files);
        validateAndSetFiles(selectedFiles);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        gsap.to(dropZoneRef.current, { scale: 1.02, borderColor: theme.colors.primaryBlue, duration: 0.2 });
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        gsap.to(dropZoneRef.current, { scale: 1, borderColor: theme.colors.borderColor, duration: 0.2 });
    }

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[index];
            return newProgress;
        });
    };

    const clearAllFiles = () => {
        setFiles([]);
        setError('');
        setUploadProgress({});
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (files.length === 0) return;

        // Animate button click
        const btn = document.getElementById('process-btn');
        if (btn) gsap.to(btn, { scale: 0.95, yoyo: true, repeat: 1, duration: 0.1 });

        const uploadedFiles = [];

        // Process each file independently
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            try {
                setUploadProgress(prev => ({ ...prev, [i]: 'processing' }));

                const text = await file.text();

                if (!text.trim().startsWith(">")) {
                    setUploadProgress(prev => ({ ...prev, [i]: 'error' }));
                    setError(prev => prev + `\n${file.name}: Invalid FASTA format (missing header)`);
                    continue;
                }

                const lines = text.trim().split('\n');
                const sequence = lines.slice(1).join('').replace(/\s/g, '');

                if (/[^ATGC]/i.test(sequence)) {
                    setUploadProgress(prev => ({ ...prev, [i]: 'error' }));
                    setError(prev => prev + `\n${file.name}: Invalid characters in sequence`);
                    continue;
                }

                if (!sequence) {
                    setUploadProgress(prev => ({ ...prev, [i]: 'error' }));
                    setError(prev => prev + `\n${file.name}: No sequence found`);
                    continue;
                }

                // Upload file
                const uploadedData = await onUpload(file);
                if (uploadedData) {
                    uploadedFiles.push(uploadedData);
                    setUploadProgress(prev => ({ ...prev, [i]: 'success' }));
                }

            } catch (err) {
                setUploadProgress(prev => ({ ...prev, [i]: 'error' }));
                setError(prev => prev + `\n${file.name}: ${err.message}`);
            }
        }

        // Show success message and clear after delay
        setTimeout(() => {
            const allSuccess = Object.values(uploadProgress).every(status => status === 'success');
            if (allSuccess && uploadedFiles.length > 0) {
                clearAllFiles();
                // Show success notification
                alert(`Successfully uploaded ${uploadedFiles.length} file(s)! View them in Dashboard or Reports.`);
            }
        }, 1500);
    };

    return (
        <div className="animate-fade-in" style={{ ...styles.glassPanel, padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud style={{ stroke: 'url(#gradient)' }} />
                <span style={styles.textGradient}>Upload Sequences</span>
            </h2>

            <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current.click()}
                style={{
                    border: `2px dashed ${theme.colors.borderColor}`,
                    borderRadius: '12px',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s ease',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    marginBottom: files.length > 0 ? '1.5rem' : '0'
                }}
                onMouseEnter={() => gsap.to(dropZoneRef.current, { backgroundColor: 'rgba(255,255,255,0.05)', duration: 0.3 })}
                onMouseLeave={() => gsap.to(dropZoneRef.current, { backgroundColor: 'rgba(255,255,255,0.02)', duration: 0.3 })}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".fasta,.fa"
                    multiple
                    style={{ display: 'none' }}
                />
                <UploadCloud size={48} style={{ color: theme.colors.primaryBlue, marginBottom: '1rem', opacity: 0.8 }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Click or Drag & Drop to Upload</h3>
                <p style={{ color: theme.colors.textMuted }}>Supported formats: .fasta, .fa (Multiple files allowed)</p>
            </div>

            {files.length > 0 && (
                <div ref={fileListRef} style={{ marginBottom: '1rem' }}>
                    {files.map((file, index) => (
                        <div
                            key={index}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '0.75rem',
                                border: uploadProgress[index] === 'error' ? '1px solid #ef4444' :
                                    uploadProgress[index] === 'success' ? '1px solid #22c55e' :
                                        '1px solid transparent'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    background: uploadProgress[index] === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                                        uploadProgress[index] === 'success' ? 'rgba(34, 197, 94, 0.1)' :
                                            'rgba(16, 185, 129, 0.1)',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    color: uploadProgress[index] === 'error' ? '#ef4444' :
                                        uploadProgress[index] === 'success' ? '#22c55e' :
                                            theme.colors.accentGreen
                                }}>
                                    {uploadProgress[index] === 'processing' ? (
                                        <Loader size={20} className="spin" />
                                    ) : uploadProgress[index] === 'success' ? (
                                        <CheckCircle size={20} />
                                    ) : (
                                        <FileText size={20} />
                                    )}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{file.name}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: theme.colors.textMuted }}>
                                        {(file.size / 1024).toFixed(2)} KB
                                        {uploadProgress[index] === 'processing' && ' - Processing...'}
                                        {uploadProgress[index] === 'success' && ' - Uploaded ✓'}
                                        {uploadProgress[index] === 'error' && ' - Failed ✗'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                style={{ ...styles.btnSecondary, padding: '0.5rem', borderColor: 'transparent', color: theme.colors.textMuted }}
                                onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.1, color: theme.colors.accentRed, duration: 0.2 })}
                                onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, color: theme.colors.textMuted, duration: 0.2 })}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {files.length > 0 && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={clearAllFiles}
                        style={{ ...styles.btnSecondary }}
                    >
                        Clear All
                    </button>
                    <button
                        id="process-btn"
                        onClick={handleSubmit}
                        style={styles.btnPrimary}
                        onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.05, boxShadow: '0 4px 12px rgba(37,99,235,0.3)', duration: 0.2 })}
                        onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, boxShadow: 'none', duration: 0.2 })}
                    >
                        <CheckCircle size={18} />
                        Process {files.length} Sequence{files.length > 1 ? 's' : ''}
                    </button>
                </div>
            )}

            {error && <p style={{ color: '#ef4444', marginTop: '1rem', whiteSpace: 'pre-line' }}>{error}</p>}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default UploadSection;
