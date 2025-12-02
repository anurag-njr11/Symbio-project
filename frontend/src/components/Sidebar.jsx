import React from 'react';
import { LayoutDashboard, UploadCloud, FileText, BarChart2, Dna } from 'lucide-react';
import { styles, theme } from '../theme';

const Sidebar = ({ activeView, onNavigate }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'upload', label: 'Upload FASTA', icon: UploadCloud },
        { id: 'reports', label: 'Metadata Report', icon: FileText },
        { id: 'summary', label: 'Summary', icon: BarChart2 },
    ];

    return (
        <aside style={styles.sidebar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', paddingLeft: '0.5rem' }}>
                <div style={{
                    background: theme.gradients.main,
                    padding: '0.4rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Dna size={20} color="white" />
                </div>
                <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Symbio-NLM</h1>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        style={styles.navItem(activeView === item.id)}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', padding: '1rem', borderTop: `1px solid ${theme.colors.borderColor}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: theme.colors.primaryBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        JD
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>John Doe</div>
                        <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>Student</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
