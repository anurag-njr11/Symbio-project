import React from 'react';

export const theme = {
  colors: {
    bgDark: '#f0f4f8', // Light AliceBlue/Slate 100 - clean and bright
    bgPanel: '#ffffff', // White
    primaryBlue: '#2563eb',
    primaryPurple: '#7c3aed',
    accentCyan: '#06b6d4',
    accentGreen: '#10b981',
    accentRed: '#ef4444',
    textMain: '#020617', // Deep Slate 950 (Almost Black) for High Contrast
    textMuted: '#475569', // Slate 600 (Dark Grey) for readability
    borderColor: '#cbd5e1', // Slate 300 (Visible Border)
    glassBg: 'rgba(255, 255, 255, 0.95)', // Nearly opaque for contrast vs background
    glassBorder: 'rgba(59, 130, 246, 0.1)', // Subtle blue tint on border
  },
  gradients: {
    main: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    bg: 'linear-gradient(to bottom right, #f0f4f8, #e2e8f0)', // High contrast light gradient
    cardBlue: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(255, 255, 255, 0.02))',
    cardPurple: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(255, 255, 255, 0.02))',
    cardGreen: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(255, 255, 255, 0.02))',
    cardCyan: 'linear-gradient(135deg, rgba(34, 211, 238, 0.08), rgba(255, 255, 255, 0.02))',
  },
  shadows: {
    glass: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    glassHover: '0 15px 30px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', // Deeper hover shadow
  },
  fonts: {
    main: "'Inter', system-ui, -apple-system, sans-serif",
  }
};

export const styles = {
  // ... existing styles ...
  glassPanel: {
    background: theme.colors.glassBg,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${theme.colors.glassBorder}`,
    boxShadow: theme.shadows.glass,
    borderRadius: '16px',
    transition: 'all 0.3s ease', // Smooth transition for global panels
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    marginTop: '1rem',
  },
  th: {
    textAlign: 'left',
    padding: '1rem',
    color: theme.colors.textMuted,
    fontSize: '0.85rem',
    fontWeight: 600,
    borderBottom: `1px solid ${theme.colors.borderColor}`,
  },
  td: {
    padding: '1rem',
    borderBottom: `1px solid rgba(0,0,0,0.05)`,
    fontSize: '0.9rem',
    color: theme.colors.textMain,
  },
  btnPrimary: {
    background: theme.gradients.main,
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy transition
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
  },
  btnSecondary: {
    background: 'transparent',
    border: `1px solid ${theme.colors.borderColor}`,
    color: theme.colors.textMain,
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy transition
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1, // Above background
  },
  mainContent: {
    flex: 1,
    padding: '2rem',
    marginLeft: '260px', // Match sidebar width
    width: 'calc(100% - 260px)',
    transition: 'all 0.3s ease',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '260px',
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRight: `1px solid ${theme.colors.glassBorder}`,
    padding: '2rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50,
  },
  navItem: (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    borderRadius: '12px',
    background: isActive ? theme.gradients.main : 'transparent',
    color: isActive ? 'white' : theme.colors.textMuted,
    fontSize: '0.95rem',
    fontWeight: isActive ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    textAlign: 'left',
    marginBottom: '0.25rem',
    boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
  }),
  metricCard: {
    background: theme.colors.glassBg, // Will be overridden by card gradients
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
    cursor: 'default', // Changed to default
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
    /* Button Hover Effects */
    .btn-primary:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
      filter: brightness(1.1);
    }
    .btn-primary:active {
      transform: translateY(0) scale(0.98);
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px) scale(1.02);
      border-color: ${theme.colors.primaryBlue};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .btn-secondary:active {
      transform: translateY(0) scale(0.98);
    }

    /* Table Row Hover */
    .table-row {
      transition: background 0.2s ease;
    }
    .table-row:hover {
      background: rgba(37, 99, 235, 0.03);
    }
  `}</style>
);
