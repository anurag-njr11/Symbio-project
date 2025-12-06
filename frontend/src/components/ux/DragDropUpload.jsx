import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { UploadCloud } from 'lucide-react';
import { theme } from '../../theme';

const DragDropUpload = ({ onFileSelect, error }) => {
    const fileInputRef = useRef(null);
    const uploadAreaRef = useRef(null);
    const iconRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        // Entrance animation
        gsap.fromTo(
            uploadAreaRef.current,
            {
                opacity: 0,
                y: 50,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
            }
        );

        // Icon floating animation
        gsap.to(iconRef.current, {
            y: -10,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
        });
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
        gsap.to(uploadAreaRef.current, {
            scale: 1.02,
            borderColor: theme.colors.accentCyan,
            duration: 0.3,
        });
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
        gsap.to(uploadAreaRef.current, {
            scale: 1,
            borderColor: theme.colors.glassBorder,
            duration: 0.3,
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        gsap.to(uploadAreaRef.current, {
            scale: 1,
            borderColor: theme.colors.glassBorder,
            duration: 0.3,
        });

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div
            ref={uploadAreaRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            style={{
                border: `2px dashed ${isDragging ? theme.colors.accentCyan : theme.colors.glassBorder}`,
                borderRadius: '20px',
                padding: '4rem 3rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging ? 'rgba(6, 182, 212, 0.05)' : theme.colors.glassBgLight,
                backdropFilter: 'blur(10px)',
                transition: 'background 0.3s ease',
            }}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".fasta,.fa"
                style={{ display: 'none' }}
            />
            <div
                ref={iconRef}
                style={{
                    background: `${theme.colors.accentCyan}20`,
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                }}
            >
                <UploadCloud size={40} color={theme.colors.accentCyan} />
            </div>
            <h3
                style={{
                    marginBottom: '0.75rem',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: theme.colors.textSecondary,
                }}
            >
                Click or Drag & Drop to Upload
            </h3>
            <p style={{ color: theme.colors.textMuted, fontSize: '1rem' }}>
                Supported formats: .fasta, .fa
            </p>
            {error && (
                <p style={{ color: '#ef4444', marginTop: '1.5rem', fontWeight: 500 }}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default DragDropUpload;
