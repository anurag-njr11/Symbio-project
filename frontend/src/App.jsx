import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import ReportView from './components/ReportView';
import HistoryView from './components/HistoryView';
import AuthPage from './components/AuthPage';
import { parseFasta } from './utils';
import { GlobalStyles, styles, theme } from './theme';
import ReactMarkdown from 'react-markdown';
import ChatBot from './components/ChatBot';
import AnimatedBackground from './components/AnimatedBackground';
import gsap from 'gsap';
import { Sparkles, Dna, Database, Activity } from 'lucide-react';

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

      // Fetch stats
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId || '' })
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

  useEffect(() => {
    if (!loading) {
      gsap.from(".summary-card", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.2)"
      });
    }
  }, [loading]);

  return (
    <div style={{ ...styles.glassPanel, padding: '3rem', minHeight: '80vh', position: 'relative', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
        <h2 style={{
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          background: theme.gradients.main,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>
          Project Analytics
        </h2>
        <p style={{ color: theme.colors.textMuted, fontSize: '1.1rem' }}>
          AI-driven insights and statistics for your sequences
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>

        {/* Card 1 */}
        <div className="summary-card" style={{
          background: theme.gradients.cardBlue,
          padding: '2rem',
          borderRadius: '20px',
          border: `1px solid ${theme.colors.glassBorder}`,
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.2 }}>
            <Database size={48} color={theme.colors.primaryBlue} />
          </div>
          <div style={{ color: theme.colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>TOTAL SEQUENCES</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: theme.colors.primaryBlue }}>
            {stats.count}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: theme.colors.textMuted }}>
            Uploaded files
          </div>
        </div>

        {/* Card 2 */}
        <div className="summary-card" style={{
          background: theme.gradients.cardPurple,
          padding: '2rem',
          borderRadius: '20px',
          border: `1px solid ${theme.colors.glassBorder}`,
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.2 }}>
            <Activity size={48} color={theme.colors.primaryPurple} />
          </div>
          <div style={{ color: theme.colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>AVG GC CONTENT</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: theme.colors.primaryPurple }}>
            {stats.avgGc}%
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: theme.colors.textMuted }}>
            Nucleotide composition
          </div>
        </div>

        {/* Card 3 */}
        <div className="summary-card" style={{
          background: theme.gradients.cardGreen,
          padding: '2rem',
          borderRadius: '20px',
          border: `1px solid ${theme.colors.glassBorder}`,
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.2 }}>
            <Dna size={48} color={theme.colors.accentGreen} />
          </div>
          <div style={{ color: theme.colors.textMuted, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>TOTAL BASE PAIRS</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: theme.colors.accentGreen }}>
            {stats.totalBp.toLocaleString()}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: theme.colors.textMuted }}>
            Combined length
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="summary-card" style={{
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: `1px solid ${theme.colors.primaryPurple}30`, // Subtle purple border
        padding: '3rem',
        boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            background: theme.gradients.main,
            padding: '0.8rem',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)'
          }}>
            <Sparkles size={24} color="white" />
          </div>
          <h3 style={{ fontSize: '1.5rem', margin: 0, background: theme.gradients.main, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Research Insights
          </h3>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: theme.colors.textMuted }}>
            <Sparkles className="animate-spin" size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <div className="animate-pulse">Analyzing sequence data...</div>
          </div>
        ) : error ? (
          <div style={{ color: theme.colors.accentRed, padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        ) : (
          <div style={{ lineHeight: '1.8', color: theme.colors.textSecondary }}>
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 style={{ color: theme.colors.primaryBlue, marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1.8rem' }} {...props} />,
                h2: ({ node, ...props }) => <h2 style={{ color: theme.colors.primaryPurple, marginTop: '1.5rem', marginBottom: '0.8rem', fontSize: '1.4rem' }} {...props} />,
                h3: ({ node, ...props }) => <h3 style={{ color: theme.colors.textMain, marginTop: '1.2rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }} {...props} />,
                p: ({ node, ...props }) => <p style={{ marginBottom: '1.2rem', fontSize: '1.05rem' }} {...props} />,
                ul: ({ node, ...props }) => <ul style={{ marginLeft: '1.5rem', marginBottom: '1.2rem' }} {...props} />,
                li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem' }} {...props} />,
                strong: ({ node, ...props }) => <strong style={{ color: theme.colors.primaryBlue, fontWeight: 600 }} {...props} />
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
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previousView, setPreviousView] = useState('dashboard');

  const appRef = useRef(null);

  useEffect(() => {
    checkAuth();
    checkForPublicReport();

    // Animate app entry
    if (appRef.current) {
      gsap.from(appRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
  }, []);

  // Fetch uploads whenever auth is checked/user changes or view changes to dashboard/history
  // Fetch uploads whenever auth is checked/user changes or view changes to dashboard/history
  useEffect(() => {
    if (authChecked && (activeView === 'dashboard' || activeView === 'reports' || activeView === 'summary')) {
      fetchUploads();
    }
  }, [authChecked, user, activeView]);

  const checkAuth = () => {
    try {
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
          setAuthChecked(true); // Allow viewing without login
        }
      } catch (error) {
        console.error('Failed to load public report', error);
        setAuthChecked(true);
      }
    }
  };

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
      const currentUser = storedUser ? JSON.parse(storedUser) : user;
      const userId = currentUser?.id || currentUser?._id || null;

      // For guest users
      if (!currentUser || currentUser.role === 'guest' || currentUser.email === 'guest') {
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

      // For registered users
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
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : user;

    if (!window.confirm("Are you sure you want to delete this sequence?")) return;

    if (!currentUser || currentUser.role === 'guest') {
      const guestUploads = JSON.parse(localStorage.getItem('guestUploads')) || [];
      const filtered = guestUploads.filter(item => item.id !== id);
      localStorage.setItem('guestUploads', JSON.stringify(filtered));
      setUploads(prev => prev.filter(item => item.id !== id));
      return;
    }

    try {
      const userId = currentUser.id || currentUser._id;
      const response = await fetch(`/api/fasta/${id}?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });

      if (response.ok) {
        setUploads(prev => prev.filter(item => item.id !== id));
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const handleGenerateReport = (sequence) => {
    setPreviousView(activeView);
    setSelectedSequence(sequence);
    setActiveView('view_report');
  };

  const handleBack = () => {
    setActiveView(previousView);
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

  // Public Report View
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

  // Auth Page
  if (!user) {
    return (
      <>
        <GlobalStyles />
        <AnimatedBackground />
        <AuthPage onAuthSuccess={(userData) => setUser(userData)} />
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <AnimatedBackground />
      <div style={styles.appContainer} ref={appRef}>
        <Sidebar activeView={activeView === 'view_report' ? 'reports' : activeView} onNavigate={setActiveView} user={user} onLogout={handleLogout} />
        <main style={styles.mainContent}>
          {renderContent()}
        </main>
        <ChatBot currentView={activeView} />
      </div>
    </>
  );
}

export default App;
