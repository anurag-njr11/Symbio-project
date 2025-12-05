import React from 'react';
import { LayoutDashboard, UploadCloud, FileText, BarChart2, Dna } from 'lucide-react';
import { styles, theme } from '../theme';

const Sidebar = ({ activeView, onNavigate, user, onLogout }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'upload', label: 'Upload FASTA', icon: UploadCloud },
        { id: 'reports', label: 'Upload History', icon: FileText },
        { id: 'summary', label: 'Summary', icon: BarChart2 },
    ];

    const getUserDisplayName = () => {
        if (!user) return 'Guest User';
        if (user.name === 'Guest User' || user.role === 'guest') return 'Guest User';
        if (user.oauthProvider) {
            const provider = user.oauthProvider.charAt(0).toUpperCase() + user.oauthProvider.slice(1);
            return `${user.name} (${provider})`;
        }
        return user.name || user.email || 'User';
    };

    const getUserInitials = () => {
        const name = user?.name || 'Guest User';
        if (name === 'Guest User') return 'GU';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getUserRole = () => {
        if (!user || user.role === 'guest' || user.name === 'Guest User') return 'Guest';
        return 'Student';
    };

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
