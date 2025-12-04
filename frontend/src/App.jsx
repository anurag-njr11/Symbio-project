import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import ReportView from './components/ReportView';
import HistoryView from './components/HistoryView';
import { parseFasta } from './utils';
import { GlobalStyles, styles, theme } from './theme';

function App() {
  const [uploads, setUploads] = useState([]);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'upload' | 'reports' | 'summary' | 'view_report'
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previousView, setPreviousView] = useState('dashboard'); // Track where user came from

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await fetch('/api/fasta');
      if (response.ok) {
        const data = await response.json();
        // The backend returns an array of sequences. 
        // We might need to map them if the structure is slightly different, 
        // but based on controller.js it seems to match what we need (except maybe 'id' vs '_id').
        // Let's map _id to id for frontend consistency if needed.
        const formattedData = data.map(item => ({
          ...item,
          id: item._id, // Use MongoDB _id as id
          timestamp: item.createdAt || new Date().toISOString() // Ensure timestamp exists
        }));
        setUploads(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch uploads", error);
    }
  };

  const handleUpload = async (file) => {
    setIsProcessing(true);
    try {
      // Parse locally first to get data, or send file content directly.
      // The backend expects JSON body with { fasta: string, filename: string }
      // So we need to read the file text first.
      const text = await file.text();

      const response = await fetch('/api/fasta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fasta: text,
          filename: file.name
        }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      // result.data contains the new sequence
      const newUpload = {
        ...result.data,
        id: result.data._id
      };

      setUploads(prev => [newUpload, ...prev]);
      setActiveView('dashboard');
    } catch (error) {
      console.error("Failed to upload file", error);
      alert("Failed to upload file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this sequence from the view?")) return;

    // UI-only deletion - does NOT delete from database
    setUploads(prev => prev.filter(item => item.id !== id));
  };

  const handleGenerateReport = (sequence) => {
    setPreviousView(activeView); // Remember current view before navigating
    setSelectedSequence(sequence);
    setActiveView('view_report');
  };

  const handleBack = () => {
    setActiveView(previousView); // Go back to previous view
    setSelectedSequence(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard uploads={uploads} onGenerateReport={handleGenerateReport} />;
      case 'upload':
        return (
          <>
            <h2 style={{ marginBottom: '2rem' }}>Upload FASTA File</h2>
            <UploadSection onUpload={handleUpload} />
            {isProcessing && (
              <div style={{ textAlign: 'center', padding: '2rem', color: theme.colors.accentCyan }}>
                <div className="animate-pulse">Processing Sequence Data...</div>
              </div>
            )}
          </>
        );
      case 'reports':
        return <HistoryView uploads={uploads} onViewReport={handleGenerateReport} onDelete={handleDelete} />;
      case 'summary':
        return (
          <div style={{ ...styles.glassPanel, padding: '3rem' }}>
            <h2 style={{ marginBottom: '2rem' }}>Project Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ color: theme.colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Sequences</div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{uploads.length}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ color: theme.colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Avg GC Content</div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                  {uploads.length > 0 ? (uploads.reduce((acc, curr) => acc + curr.gc_percent, 0) / uploads.length).toFixed(1) : 0}%
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ color: theme.colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Base Pairs</div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                  {uploads.length > 0 ? (uploads.reduce((acc, curr) => acc + curr.length, 0)).toLocaleString() : 0}
                </div>
              </div>
            </div>
            <p style={{ color: theme.colors.textMuted, marginTop: '1rem' }}>
              This platform allows for the analysis of genomic sequences. Upload FASTA files to analyze their properties including GC content, ORF detection, and nucleotide composition.
            </p>
          </div>
        );
      case 'view_report':
        return <ReportView sequence={selectedSequence} onBack={handleBack} />;
      default:
        return <Dashboard uploads={uploads} onGenerateReport={handleGenerateReport} />;
    }
  };

  return (
    <>
      <GlobalStyles />
      <div style={styles.appContainer}>
        <Sidebar activeView={activeView === 'view_report' ? 'reports' : activeView} onNavigate={setActiveView} />
        <main style={styles.mainContent}>
          {renderContent()}
        </main>
      </div>
    </>
  );
}

export default App;
