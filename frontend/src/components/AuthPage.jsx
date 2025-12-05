import React, { useState } from 'react';
import { Dna } from 'lucide-react';
import { styles, theme } from '../theme';

const AuthPage = ({ onAuthSuccess }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
            const body = isSignUp ? { email, password, name } : { email, password };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed');
            }

            // Store user in localStorage
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                onAuthSuccess(data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSkipLogin = () => {
        const guestUser = { email: 'guest', name: 'Guest User', role: 'guest' };
        localStorage.setItem('user', JSON.stringify(guestUser));
        onAuthSuccess(guestUser);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${theme.colors.bgPrimary} 0%, #0a0e27 50%, #1a1f3a 100%)`,
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated background elements */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: '300px',
                height: '300px',
                background: `radial-gradient(circle, ${theme.colors.accentCyan}20, transparent)`,
                borderRadius: '50%',
                filter: 'blur(60px)',
                animation: 'float 6s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '10%',
                width: '400px',
                height: '400px',
                background: `radial-gradient(circle, ${theme.colors.accentPurple}20, transparent)`,
                borderRadius: '50%',
                filter: 'blur(80px)',
                animation: 'float 8s ease-in-out infinite reverse'
            }} />

            <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                maxWidth: '480px',
                width: '100%',
                padding: '3rem 2.5rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(99, 102, 241, 0.1)',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Logo Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        background: theme.gradients.main,
                        padding: '1.2rem',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        boxShadow: `0 10px 30px ${theme.colors.accentCyan}40`,
                        animation: 'pulse 3s ease-in-out infinite'
                    }}>
                        <Dna size={40} color="white" strokeWidth={2.5} />
                    </div>
                    <h1 style={{
                        fontSize: '2.2rem',
                        fontWeight: 800,
                        marginBottom: '0.5rem',
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${theme.colors.accentCyan}, ${theme.colors.accentPurple})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px'
                    }}>
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p style={{
                        color: theme.colors.textMuted,
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        marginBottom: '0.5rem'
                    }}>
                        Welcome to Symbio-NLM
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        color: '#ff6b6b',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
                    {isSignUp && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.6rem',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: theme.colors.textSecondary,
                                letterSpacing: '0.3px'
                            }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.9rem 1.1rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    color: theme.colors.textPrimary,
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Enter your full name"
                                onFocus={(e) => {
                                    e.target.style.borderColor = theme.colors.accentCyan;
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.boxShadow = `0 0 0 3px ${theme.colors.accentCyan}20`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.6rem',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: theme.colors.textSecondary,
                            letterSpacing: '0.3px'
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.9rem 1.1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: theme.colors.textPrimary,
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                boxSizing: 'border-box'
                            }}
                            placeholder="you@example.com"
                            onFocus={(e) => {
                                e.target.style.borderColor = theme.colors.accentCyan;
                                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.target.style.boxShadow = `0 0 0 3px ${theme.colors.accentCyan}20`;
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.6rem',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: theme.colors.textSecondary,
                            letterSpacing: '0.3px'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.9rem 1.1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: theme.colors.textPrimary,
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Enter your password"
                            onFocus={(e) => {
                                e.target.style.borderColor = theme.colors.accentCyan;
                                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.target.style.boxShadow = `0 0 0 3px ${theme.colors.accentCyan}20`;
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: loading ? 'rgba(99, 102, 241, 0.5)' : theme.gradients.main,
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: loading ? 'none' : `0 10px 25px ${theme.colors.accentCyan}40`,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = `0 15px 35px ${theme.colors.accentCyan}50`;
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = `0 10px 25px ${theme.colors.accentCyan}40`;
                        }}
                    >
                        {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                {/* Toggle Sign Up / Sign In */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: theme.colors.accentCyan,
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                            textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.textDecoration = 'underline';
                            e.target.style.color = theme.colors.accentPurple;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.textDecoration = 'none';
                            e.target.style.color = theme.colors.accentCyan;
                        }}
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '1.5rem 0',
                    gap: '1rem'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                    <span style={{ color: theme.colors.textMuted, fontSize: '0.85rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                </div>

                {/* Skip Login Button */}
                <button
                    onClick={handleSkipLogin}
                    style={{
                        width: '100%',
                        padding: '0.9rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        color: theme.colors.textSecondary,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                        e.target.style.color = theme.colors.textPrimary;
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.target.style.color = theme.colors.textSecondary;
                    }}
                >
                    Continue as Guest
                </button>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AuthPage;
