import React from 'react';
import { LayoutDashboard, UploadCloud, FileText, BarChart2, Dna } from 'lucide-react';
import { styles, theme } from '../theme';

import { useMascot } from '../contexts/MascotContext';

const Sidebar = ({ activeView, onNavigate, user, onLogout }) => {
    const { setMascotMessage } = useMascot();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, msg: "Home base! See all your stats here." },
        { id: 'upload', label: 'Upload FASTA', icon: UploadCloud, msg: "Submit your DNA for analysis! I'm hungry for data." },
        { id: 'reports', label: 'Upload History', icon: FileText, msg: "Review your past scientific discoveries!" },
        { id: 'summary', label: 'Summary', icon: BarChart2, msg: "AI-powered insights just for you! Meow." },
    ];

    const getUserInitials = () => {
        if (!user || (!user.name && !user.email)) return 'G';
        const name = user.name || user.email || 'Guest';
        return name.slice(0, 2).toUpperCase();
    };

    const getUserDisplayName = () => {
        return user ? (user.name || user.email || 'Guest') : 'Guest';
    };

    const getUserRole = () => {
        return user ? (user.role || 'User') : 'Guest';
    };

    // ... (rest of logic)

    return (
        <aside style={styles.sidebar}>
            {/* ... header ... */}
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
                        onMouseEnter={() => setMascotMessage(item.msg, 'happy')}
                        onMouseLeave={() => setMascotMessage('')}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', padding: '1rem', borderTop: `1px solid ${theme.colors.borderColor}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: theme.colors.primaryBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
                        {getUserInitials()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{getUserDisplayName()}</div>
                        <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{getUserRole()}</div>
                    </div>
                </div>
                {onLogout && (
                    <button
                        onClick={onLogout}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            color: theme.colors.textMuted,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Logout
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
