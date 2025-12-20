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
import CustomCursor from './components/CustomCursor';
import AnimatedBackground from './components/AnimatedBackground';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Dna, Database, Activity } from 'lucide-react';
import { MascotProvider } from './contexts/MascotContext';

gsap.registerPlugin(ScrollTrigger);

const SummaryView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ count: 0, avgGc: 0, totalBp: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const cardHoverStyle = `
    .summary-card {
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .summary-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15) !important;
      border-color: ${theme.colors.primaryBlue} !important;
      z-index: 10;
    }
  `;

  const fetchStats = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userId = user?.id || user?._id || null;

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
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.glassPanel, padding: '3rem', minHeight: '80vh', position: 'relative', overflow: 'hidden' }}>
      <style>{cardHoverStyle}</style>

      <div className="animate-fade-in" style={{ marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
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
          Statistical overview of your sequences
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="summary-card animate-fade-in" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '2rem',
          borderRadius: '20px',
          border: `1px solid ${theme.colors.primaryBlue}`,
          position: 'relative',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          opacity: 0,
          animationDelay: '0.1s'
        }}>
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.1 }}>
            <Database size={48} color={theme.colors.primaryBlue} />
          </div>
          <div style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>TOTAL SEQUENCES</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#1e3a8a' }}>
            {stats.count}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#334155' }}>
            Uploaded files
          </div>
        </div>

        <div className="summary-card animate-fade-in" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '2rem',
          borderRadius: '20px',
          border: `1px solid ${theme.colors.primaryPurple}`,
          position: 'relative',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          opacity: 0,
          animationDelay: '0.2s'
        }}>
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.1 }}>
            <Activity size={48} color={theme.colors.primaryPurple} />
          </div>
          <div style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>AVG GC CONTENT</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#581c87' }}>
            {stats.avgGc}%
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#334155' }}>
            Nucleotide composition
          </div>
        </div>

        <div className="summary-card animate-fade-in" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '2rem',
          borderRadius: '20px',
          border: `1px solid ${theme.colors.accentGreen}`,
          position: 'relative',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          opacity: 0,
          animationDelay: '0.3s'
        }}>
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.1 }}>
            <Dna size={48} color={theme.colors.accentGreen} />
          </div>
          <div style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>TOTAL BASE PAIRS</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#064e3b' }}>
            {stats.totalBp.toLocaleString()}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#334155' }}>
            Combined length
          </div>
        </div>
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
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          filename: file.name,
          ...parsedData,
          timestamp: new Date().toISOString()
        };
        guestUploads.unshift(newUpload);
        localStorage.setItem('guestUploads', JSON.stringify(guestUploads));
        setUploads(guestUploads);

        setIsProcessing(false);
        return newUpload;
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
      setIsProcessing(false);
      return newUpload;

    } catch (error) {
      console.error("Failed to upload file", error);
      setIsProcessing(false);
      throw error;
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
    <MascotProvider>
      <GlobalStyles />
      <AnimatedBackground />
      <CustomCursor />
      <div style={styles.appContainer} ref={appRef}>
        <Sidebar activeView={activeView === 'view_report' ? 'reports' : activeView} onNavigate={setActiveView} user={user} onLogout={handleLogout} />
        <main style={styles.mainContent}>
          {renderContent()}
        </main>
        <ChatBot currentView={activeView} />
      </div>
    </MascotProvider>
  );
}

export default App;
