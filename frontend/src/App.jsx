import React, { useState } from 'react';
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

  const handleUpload = async (file) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const result = await parseFasta(file);
      setUploads(prev => [result, ...prev]);
      setActiveView('dashboard'); // Redirect to dashboard after upload
    } catch (error) {
      console.error("Failed to parse file", error);
      alert("Failed to parse file");
    } finally {
      setIsProcessing(false);
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
        return <HistoryView uploads={uploads} onViewReport={handleGenerateReport} />;
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
