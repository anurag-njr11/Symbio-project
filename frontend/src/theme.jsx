import React from 'react';

export const theme = {
  colors: {
    // Light theme - Biology inspired
    bgPrimary: '#ffffff',
    bgSecondary: '#f9fafb',
    bgGradientStart: '#ffffff',
    bgGradientMid: '#e0f2ff',
    bgGradientEnd: '#ebe7ff',

    // Soft biology colors
    primaryBlue: '#3b82f6',
    primaryPurple: '#8b5cf6',
    accentCyan: '#06b6d4',
    accentPurple: '#a855f7',
    accentGreen: '#10b981',
    accentPink: '#ec4899',

    // Pastel accents
    pastelBlue: '#e0f2ff',
    pastelPurple: '#ebe7ff',
    pastelCyan: '#c7f7ff',
    pastelGreen: '#dff7e8',

    // Text colors
    textPrimary: '#1f2937',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',

    // Glass & borders
    glassBg: 'rgba(255, 255, 255, 0.6)',
    glassBgLight: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(148, 163, 184, 0.2)',
    borderColor: '#e5e7eb',
  },
  gradients: {
    main: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    bg: 'linear-gradient(135deg, #ffffff 0%, #e0f2ff 50%, #ebe7ff 100%)',
    text: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    card: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))',
    hover: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
  },
  shadows: {
    glass: '0 8px 32px rgba(31, 38, 135, 0.15)',
    hover: '0 12px 40px rgba(31, 38, 135, 0.25)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)',
    card: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  fonts: {
    main: "'Inter', system-ui, -apple-system, sans-serif",
  }
};

export const styles = {
  glassPanel: {
    background: theme.colors.glassBg,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${theme.colors.glassBorder}`,
    boxShadow: theme.shadows.glass,
    borderRadius: '24px',
  },
  btnPrimary: {
    background: theme.gradients.main,
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  btnSecondary: {
    background: 'rgba(255, 255, 255, 0.8)',
    border: `1.5px solid ${theme.colors.glassBorder}`,
    color: theme.colors.textSecondary,
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  textGradient: {
    background: theme.gradients.text,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  tabContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: `1px solid ${theme.colors.borderColor}`,
    paddingBottom: '1rem',
  },
  tab: (isActive) => ({
    background: 'transparent',
    border: 'none',
    color: isActive ? theme.colors.primaryBlue : theme.colors.textMuted,
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    borderBottom: isActive ? `2px solid ${theme.colors.primaryBlue}` : '2px solid transparent',
    transition: 'all 0.2s ease',
  }),
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    color: theme.colors.textPrimary,
  },
  th: {
    textAlign: 'left',
    padding: '1rem',
    borderBottom: `2px solid ${theme.colors.borderColor}`,
    color: theme.colors.textSecondary,
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  td: {
    padding: '1rem',
    borderBottom: `1px solid ${theme.colors.borderColor}`,
  },
  // New Layout Styles
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '250px',
    background: theme.colors.glassBg,
    backdropFilter: 'blur(16px)',
    borderRight: `1px solid ${theme.colors.glassBorder}`,
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    top: 0,
    left: 0,
  },
  mainContent: {
    marginLeft: '250px',
    flex: 1,
    padding: '2rem',
    maxWidth: 'calc(100vw - 250px)',
  },
  navItem: (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    color: isActive ? 'white' : theme.colors.textSecondary,
    background: isActive ? theme.gradients.main : 'transparent',
    cursor: 'pointer',
    marginBottom: '0.5rem',
    transition: 'all 0.3s ease',
    fontWeight: 500,
    border: 'none',
    width: '100%',
    textAlign: 'left',
    boxShadow: isActive ? theme.shadows.glow : 'none',
  }),
  metricCard: {
    background: theme.colors.glassBgLight,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${theme.colors.glassBorder}`,
    boxShadow: theme.shadows.card,
    borderRadius: '20px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    transition: 'all 0.3s ease',
  }
};

export const GlobalStyles = () => (
  <style>{`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: ${theme.fonts.main};
      background: ${theme.gradients.bg};
      background-attachment: fixed;
      color: ${theme.colors.textPrimary};
      min-height: 100vh;
      line-height: 1.6;
      letter-spacing: 0.3px;
    }
    
    /* Biology-themed animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); opacity: 0.3; }
      50% { transform: translateY(-20px); opacity: 0.6; }
    }
    
    @keyframes floatSlow {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(10px, -10px); }
      50% { transform: translate(-5px, -20px); }
      75% { transform: translate(-10px, -5px); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.05); opacity: 0.7; }
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes dnaRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.6s ease-out forwards;
    }
    
    .animate-pulse {
      animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    /* Hover effects */
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.95);
      border-color: ${theme.colors.primaryBlue};
      transform: translateY(-1px);
    }
    
    .card-hover:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(31, 38, 135, 0.25);
    }
    
    /* Smooth transitions */
    * {
      transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
      transition-duration: 200ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
  `}</style>
);
