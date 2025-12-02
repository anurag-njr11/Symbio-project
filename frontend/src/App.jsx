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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sequence?")) return;

    try {
      const response = await fetch(`/api/fasta/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUploads(prev => prev.filter(item => item.id !== id));
      } else {
        alert("Failed to delete sequence");
      }
    } catch (error) {
      console.error("Error deleting sequence:", error);
      alert("Error deleting sequence");
    }
  };

  const handleGenerateReport = (sequence) => {
    setSelectedSequence(sequence);
    setActiveView('view_report');
  };

  const handleBack = () => {
    setActiveView('dashboard');
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
          <div style={{ ...styles.glassPanel, padding: '3rem', textAlign: 'center' }}>
            <h3>Project Summary</h3>
            <p style={{ color: theme.colors.textMuted, marginTop: '1rem' }}>
              This platform allows for the analysis of genomic sequences.
              Currently tracking {uploads.length} sequences.
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
