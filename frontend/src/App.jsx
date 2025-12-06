import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import ReportView from './components/ReportView';
import HistoryView from './components/HistoryView';
import AuthPage from './components/AuthPage';
import { parseFasta } from './utils';
import { GlobalStyles, styles, theme } from './theme';

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'upload' | 'reports' | 'summary' | 'view_report'
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previousView, setPreviousView] = useState('dashboard'); // Track where user came from

  useEffect(() => {
    checkAuth();
    checkForPublicReport();
  }, []);

  const checkAuth = () => {
    try {
      // Check localStorage for user
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setAuthChecked(true);
    }
  };

  // Check if URL is a public report link
  const checkForPublicReport = async () => {
    const path = window.location.pathname;
    const reportMatch = path.match(/^\/report\/([a-f0-9]+)$/i);

    if (reportMatch) {
      const reportId = reportMatch[1];
      try {
        const response = await fetch(`/api/fasta/${reportId}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedSequence({ ...data, id: data._id });
          setActiveView('view_report');
          setAuthChecked(true);
        }
      } catch (error) {
        console.error('Failed to load public report', error);
        setAuthChecked(true);
      }
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userId = user?.id || user?._id || null;

      // For guest users, only show uploads from localStorage
      if (!user || user.role === 'guest' || user.email === 'guest') {
        const guestUploads = JSON.parse(localStorage.getItem('guestUploads')) || [];
        setUploads(guestUploads);
        return;
      }

      // For registered users, fetch from server with userId filter
      const url = userId ? `/api/fasta?userId=${userId}` : '/api/fasta';
      const response = await fetch(url, {
        headers: { 'x-user-id': userId || '' }
      });
      if (response.ok) {
        const data = await response.json();
        let formattedData = data.map(item => ({
          ...item,
          id: item._id,
          timestamp: item.createdAt || new Date().toISOString()
        }));

        // Filter soft-deleted files if user is logged in
        if (user && user.softDeletedFiles && Array.isArray(user.softDeletedFiles)) {
          formattedData = formattedData.filter(f => !user.softDeletedFiles.includes(f._id));
        }

        setUploads(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch uploads", error);
    }
  };

  const handleUpload = async (file) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userId = user?.id || user?._id || null;

      // For guest users, parse locally and save to localStorage only
      if (!user || user.role === 'guest' || user.email === 'guest') {
        const parsedData = parseFasta(text, file.name);
        const guestUploads = JSON.parse(localStorage.getItem('guestUploads')) || [];
        const newUpload = {
          id: Date.now().toString(),
          _id: Date.now().toString(),
          filename: file.name,
          ...parsedData,
          timestamp: new Date().toISOString()
        };
        guestUploads.unshift(newUpload);
        localStorage.setItem('guestUploads', JSON.stringify(guestUploads));
        setUploads(guestUploads);
        setActiveView('dashboard');
        setIsProcessing(false);
        return;
      }

      // For registered users, save to server
      const response = await fetch('/api/fasta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || ''
        },
        body: JSON.stringify({
          fasta: text,
          filename: file.name,
          userId
        }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
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
    if (!window.confirm("Are you sure you want to delete this sequence from the view?")) return;

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    // Guest users: UI-only deletion, do NOT persist
    if (!user || user.role === 'guest' || user.email === 'guest') {
      setUploads(prev => prev.filter(item => item.id !== id));
      return;
    }

    // Registered users: Soft delete via API (persist for user)
    try {
      const userId = user.id || user._id;
      const response = await fetch('/api/user/soft-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ userId, fileId: id })
      });

      if (response.ok) {
        // Update UI only after successful soft-delete
        setUploads(prev => prev.filter(item => item.id !== id));

        // Update user in localStorage to include this file in softDeletedFiles if needed, 
        // but the backend handles the persistence. 
        // We might want to update the local user object if we were using it for filtering, 
        // but we filter based on API response on fetch.
        // However, for immediate consistency if we re-fetch, it should be fine.

        // Optionally update the user object in localStorage to reflect the change immediately if we were using it client-side
        // But the requirement says "On login or page load... Filter them". 
        // So just updating UI state is enough for now.

        const data = await response.json();
        if (data.softDeletedFiles) {
          const updatedUser = { ...user, softDeletedFiles: data.softDeletedFiles };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }

      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete');
      }
    } catch (error) {
      console.error('Failed to delete', error);
      alert('Failed to delete sequence');
    }
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard uploads={uploads} onGenerateReport={handleGenerateReport} />;
      case 'upload':
        return (
          <>
            <h2 style={{
              marginBottom: '2rem',
              fontSize: '2rem',
              fontWeight: 700,
              background: theme.gradients.text,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Upload FASTA File</h2>
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
          <div className="animate-fade-in" style={{ ...styles.glassPanel, padding: '3rem' }}>
            <h2 style={{
              marginBottom: '2rem',
              fontSize: '2rem',
              fontWeight: 700,
              background: theme.gradients.text,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Project Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{
                background: theme.colors.glassBgLight,
                backdropFilter: 'blur(10px)',
                padding: '1.5rem',
                borderRadius: '20px',
                border: `1px solid ${theme.colors.glassBorder}`,
              }}>
                <div style={{ color: theme.colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Total Sequences</div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  background: theme.gradients.text,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>{uploads.length}</div>
              </div>
              <div style={{
                background: theme.colors.glassBgLight,
                backdropFilter: 'blur(10px)',
                padding: '1.5rem',
                borderRadius: '20px',
                border: `1px solid ${theme.colors.glassBorder}`,
              }}>
                <div style={{ color: theme.colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Avg GC Content</div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  background: theme.gradients.text,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {uploads.length > 0 ? (uploads.reduce((acc, curr) => acc + curr.gc_percent, 0) / uploads.length).toFixed(1) : 0}%
                </div>
              </div>
              <div style={{
                background: theme.colors.glassBgLight,
                backdropFilter: 'blur(10px)',
                padding: '1.5rem',
                borderRadius: '20px',
                border: `1px solid ${theme.colors.glassBorder}`,
              }}>
                <div style={{ color: theme.colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>Total Base Pairs</div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  background: theme.gradients.text,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {uploads.length > 0 ? (uploads.reduce((acc, curr) => acc + curr.length, 0)).toLocaleString() : 0}
                </div>
              </div>
            </div>
            <p style={{ color: theme.colors.textMuted, marginTop: '1rem', lineHeight: '1.7' }}>
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

  if (!authChecked) {
    return (
      <>
        <GlobalStyles />
        <div style={{ ...styles.appContainer, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ color: theme.colors.textPrimary }}>Loading...</div>
        </div>
      </>
    );
  }

  // Allow public viewing of reports via shared links
  if (!user && activeView === 'view_report' && selectedSequence) {
    return (
      <>
        <GlobalStyles />
        <div style={styles.appContainer}>
          <main style={{ ...styles.mainContent, marginLeft: 0, width: '100%' }}>
            {renderContent()}
          </main>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <GlobalStyles />
        <AuthPage onAuthSuccess={(userData) => setUser(userData)} />
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div style={{ ...styles.appContainer, position: 'relative', overflow: 'hidden' }}>
        {/* Light biology-themed floating particles */}
        <div style={{
          position: 'fixed',
          top: '15%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${theme.colors.pastelBlue}, transparent)`,
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'floatSlow 15s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.4,
        }} />
        <div style={{
          position: 'fixed',
          bottom: '20%',
          right: '15%',
          width: '350px',
          height: '350px',
          background: `radial-gradient(circle, ${theme.colors.pastelPurple}, transparent)`,
          borderRadius: '50%',
          filter: 'blur(70px)',
          animation: 'floatSlow 18s ease-in-out infinite reverse',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.4,
        }} />
        <div style={{
          position: 'fixed',
          top: '50%',
          right: '5%',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${theme.colors.pastelCyan}, transparent)`,
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'float 12s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.3,
        }} />

        <Sidebar activeView={activeView === 'view_report' ? 'reports' : activeView} onNavigate={setActiveView} user={user} onLogout={handleLogout} />
        <main style={{ ...styles.mainContent, position: 'relative', zIndex: 1 }}>
          {renderContent()}
        </main>
      </div>
    </>
  );
}

export default App;
