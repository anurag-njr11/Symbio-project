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
            {/* Logo Section with gradient */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', paddingLeft: '0.5rem' }}>
                <div style={{
                    background: theme.gradients.main,
                    padding: '0.6rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 10px 30px ${theme.colors.accentCyan}40`,
                }}>
                    <Dna size={24} color="white" strokeWidth={2.5} />
                </div>
                <h1 style={{
                    fontSize: '1.3rem',
                    margin: 0,
                    fontWeight: 700,
                    background: theme.gradients.text,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>Symbio-NLM</h1>
            </div>

            {/* Navigation with enhanced hover effects */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        style={styles.navItem(activeView === item.id)}
                        onMouseEnter={(e) => {
                            if (activeView !== item.id) {
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.target.style.color = theme.colors.textSecondary;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeView !== item.id) {
                                e.target.style.background = 'transparent';
                                e.target.style.color = theme.colors.textMuted;
                            }
                        }}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* User Profile Section with glassmorphism */}
            <div style={{
                marginTop: 'auto',
                padding: '1rem',
                borderTop: `1px solid ${theme.colors.glassBorder}`,
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: theme.gradients.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        boxShadow: `0 0 20px ${theme.colors.accentCyan}40`,
                    }}>
                        {getUserInitials()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.colors.textSecondary }}>{getUserDisplayName()}</div>
                        <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{getUserRole()}</div>
                    </div>
                </div>
                {onLogout && (
                    <button
                        onClick={onLogout}
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${theme.colors.glassBorder}`,
                            borderRadius: '8px',
                            color: theme.colors.textMuted,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.target.style.borderColor = theme.colors.accentCyan;
                            e.target.style.color = theme.colors.textSecondary;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.05)';
                            e.target.style.borderColor = theme.colors.glassBorder;
                            e.target.style.color = theme.colors.textMuted;
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
