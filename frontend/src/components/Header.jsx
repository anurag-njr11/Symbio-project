import React from 'react';
import { Dna, Activity } from 'lucide-react';
import { styles, theme } from '../theme';

const Header = () => {
  return (
    <header style={{
      ...styles.glassPanel,
      marginBottom: '2rem',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          background: theme.gradients.main,
          padding: '0.5rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Dna size={24} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Symbio-NLM</h1>
          <p style={{ fontSize: '0.875rem', color: theme.colors.textMuted, margin: 0 }}>Genomics Insight Platform</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.colors.accentCyan }}>
          <Activity size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>System Active</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
