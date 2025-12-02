import React from 'react';

export const theme = {
  colors: {
    bgDark: '#f8fafc', // Light background (Slate 50)
    bgPanel: '#ffffff', // White panels
    primaryBlue: '#2563eb',
    primaryPurple: '#7c3aed',
    accentCyan: '#06b6d4',
    accentGreen: '#10b981',
    textMain: '#0f172a', // Dark text (Slate 900)
    textMuted: '#64748b', // Muted text (Slate 500)
    borderColor: '#e2e8f0', // Light border (Slate 200)
    glassBg: 'rgba(255, 255, 255, 0.9)', // More opaque white for light mode
    glassBorder: 'rgba(0, 0, 0, 0.05)',
  },
  gradients: {
    main: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    bg: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)', // Subtle light gradient
    text: 'linear-gradient(to right, #2563eb, #7c3aed)', // Darker gradient for text
  },
  shadows: {
    glass: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Softer shadow
    hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  fonts: {
    main: "'Inter', system-ui, -apple-system, sans-serif",
  }
};

export const styles = {
  glassPanel: {
    background: theme.colors.glassBg,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${theme.colors.glassBorder}`,
    boxShadow: theme.shadows.glass,
    borderRadius: '16px',
  },
  btnPrimary: {
    background: theme.gradients.main,
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  btnSecondary: {
    background: 'transparent',
    border: `1px solid ${theme.colors.borderColor}`,
    color: theme.colors.textMain,
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
    color: theme.colors.textMain,
  },
  th: {
    textAlign: 'left',
    padding: '1rem',
    borderBottom: `1px solid ${theme.colors.borderColor}`,
    color: theme.colors.textMuted,
    fontWeight: 600,
  },
  td: {
    padding: '1rem',
    borderBottom: `1px solid ${theme.colors.glassBorder}`,
  },
  // New Layout Styles
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '250px',
    background: theme.colors.bgPanel,
    borderRight: `1px solid ${theme.colors.borderColor}`,
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
    borderRadius: '8px',
    color: isActive ? 'white' : theme.colors.textMuted,
    background: isActive ? theme.gradients.main : 'transparent',
    cursor: 'pointer',
    marginBottom: '0.5rem',
    transition: 'all 0.2s ease',
    fontWeight: 500,
    border: 'none',
    width: '100%',
    textAlign: 'left',
  }),
  metricCard: {
    background: theme.colors.glassBg,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${theme.colors.glassBorder}`,
    boxShadow: theme.shadows.glass,
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
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
      background-color: ${theme.colors.bgDark};
      background-image: ${theme.gradients.bg};
      background-attachment: fixed;
      color: ${theme.colors.textMain};
      min-height: 100vh;
      line-height: 1.5;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    /* Hover effects for buttons handled via JS events or simple classes if needed, 
       but for pure JS we can use onMouseEnter/Leave or keep simple CSS classes for pseudo-states 
       in this style block */
    .btn-primary:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
      box-shadow: ${theme.shadows.hover};
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: ${theme.colors.textMuted};
    }
  `}</style>
);
