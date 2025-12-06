import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import ReportView from './components/ReportView';
import HistoryView from './components/HistoryView';
import AuthPage from './components/AuthPage';
import { parseFasta } from './utils';
import { GlobalStyles, styles, theme } from './theme';
import ReactMarkdown from 'react-markdown';

const SummaryView = () => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ count: 0, avgGc: 0, totalBp: 0 });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userId = user?.id || user?._id || null;

      // Fetch stats (reuse existing endpoint or calculate from uploads if passed, but let's fetch fresh)
      const url = userId ? `/api/fasta?userId=${userId}` : '/api/fasta';
      const response = await fetch(url, { headers: { 'x-user-id': userId || '' } });
      let uploads = [];
      if (response.ok) {
        uploads = await response.json();
        const count = uploads.length;
        const avgGc = count > 0 ? (uploads.reduce((acc, curr) => acc + curr.gc_percent, 0) / count).toFixed(1) : 0;
        const totalBp = count > 0 ? uploads.reduce((acc, curr) => acc + curr.length, 0) : 0;
        setStats({ count, avgGc, totalBp });
      }

      // Fetch AI Summary
      const summaryResponse = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' }
      });

      if (summaryResponse.ok) {
        const data = await summaryResponse.json();
        setSummary(data.summary);
      } else {
        setError('Failed to generate summary');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching the summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.glassPanel, padding: '3rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Project Summary</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ color: theme.colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Sequences</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.count}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ color: theme.colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Avg GC Content</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.avgGc}%</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ color: theme.colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Base Pairs</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalBp.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '12px', border: `1px solid ${theme.colors.border}` }}>
        <h3 style={{ marginBottom: '1rem', color: theme.colors.accentCyan }}>AI Analysis</h3>
        {loading ? (
          <div className="animate-pulse" style={{ color: theme.colors.textMuted }}>Generating insight from your data...</div>
        ) : error ? (
          <div style={{ color: theme.colors.accentRed }}>{error}</div>
        ) : (
          <div style={{ lineHeight: '1.6', color: theme.colors.textSecondary, whiteSpace: 'pre-line' }}>
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 style={{ color: theme.colors.accentCyan, marginTop: '1rem', marginBottom: '0.5rem' }} {...props} />,
                h2: ({ node, ...props }) => <h2 style={{ color: theme.colors.accentCyan, marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.5rem' }} {...props} />,
                h3: ({ node, ...props }) => <h3 style={{ color: theme.colors.textPrimary, marginTop: '0.8rem', marginBottom: '0.4rem', fontSize: '1.2rem' }} {...props} />,
                p: ({ node, ...props }) => <p style={{ marginBottom: '1rem', lineHeight: '1.6' }} {...props} />,
                ul: ({ node, ...props }) => <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }} {...props} />,
                li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
                strong: ({ node, ...props }) => <strong style={{ color: theme.colors.accentPurple }} {...props} />
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

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
        const formattedData = data.map(item => ({
          ...item,
          id: item._id,
          timestamp: item.createdAt || new Date().toISOString()
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

    // Guest users: UI-only deletion from localStorage
    if (!user || user.role === 'guest' || user.email === 'guest') {
      setUploads(prev => prev.filter(item => item.id !== id));
      const guestUploads = JSON.parse(localStorage.getItem('guestUploads')) || [];
      const filtered = guestUploads.filter(item => item.id !== id);
      localStorage.setItem('guestUploads', JSON.stringify(filtered));
      return;
    }

    // Registered users: Delete from database
    try {
      const userId = user.id || user._id;
      const response = await fetch(`/api/fasta/${id}?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });

      if (response.ok) {
        setUploads(prev => prev.filter(item => item.id !== id));
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
        return <SummaryView />;
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
      <div style={styles.appContainer}>
        <Sidebar activeView={activeView === 'view_report' ? 'reports' : activeView} onNavigate={setActiveView} user={user} onLogout={handleLogout} />
        <main style={styles.mainContent}>
          {renderContent()}
        </main>
      </div>
    </>
  );
}

export default App;
