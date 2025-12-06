import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { theme } from '../theme';

// Animation Keyframes injected into current page
const ChatAnimations = () => (
    <style>{`
    @keyframes chatPopIn {
      0% { opacity: 0; transform: scale(0.9) translateY(20px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes messageSlide {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes dotBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
    }
    @keyframes pulseGlow {
      0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); } 
      70% { box-shadow: 0 0 0 15px rgba(37, 99, 235, 0); }
      100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
    }
  `}</style>
);

const TypingIndicator = () => (
    <div style={{ display: 'flex', gap: '4px', padding: '0.2rem 0' }}>
        {[0, 1, 2].map(i => (
            <div key={i} style={{
                width: '6px',
                height: '6px',
                backgroundColor: theme.colors.textMuted,
                borderRadius: '50%',
                animation: `dotBounce 1.4s infinite ease-in-out both`,
                animationDelay: `${i * 0.16}s`
            }} />
        ))}
    </div>
);

const PREDEFINED_QA = [
    {
        question: "What is GC Content?",
        answer: "**GC Content** is the percentage of nitrogenous bases in a DNA or RNA molecule that are either guanine (G) or cytosine (C). High GC content often indicates higher thermal stability."
    },
    {
        question: "What is an ORF?",
        answer: "An **ORF (Open Reading Frame)** is a continuous stretch of codons that has the potential to encode a protein. It starts with a start codon (usually ATG) and ends with a stop codon."
    },
    {
        question: "How do I upload?",
        answer: "Navigate to the **Dashboard** or **Upload** tab, click inside the upload box, and select your `.fasta` or `.txt` file. You can also paste your sequence directly!"
    },
    {
        question: "Valid file formats?",
        answer: "Symbio currently supports **.fasta** and **.txt** files. Ensure your file starts with a `>` header line followed by the nucleotide sequence (A, T, G, C)."
    },
    {
        question: "How is Length calculated?",
        answer: "Sequence length is simply the total count of valid nucleotides (A, T, G, C) in your sequence, excluding whitespace and headers."
    }
];

const ChatBot = ({ currentView }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! I are SymbioBot. Ask me about your DNA sequences or select a topic below!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleQuestionClick = (qa) => {
        setMessages(prev => [...prev, { role: 'user', text: qa.question }]);
        setIsLoading(true);
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'model', text: qa.answer }]);
            setIsLoading(false);
        }, 600); // Fake delay for natural feel
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            // Check for exact match in predefined QA first (optional, but good for consistency)
            const localMatch = PREDEFINED_QA.find(qa => qa.question.toLowerCase() === userMessage.toLowerCase());
            if (localMatch) {
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'model', text: localMatch.answer }]);
                    setIsLoading(false);
                }, 600);
                return;
            }

            // Prepare history for context
            const history = messages.slice(-10).map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                text: m.text
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: history,
                    context: currentView
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'model', text: 'I apologize, but I am having trouble connecting right now. Please try again later.' }]);
        } finally {
            if (!PREDEFINED_QA.find(qa => qa.question.toLowerCase() === userMessage.toLowerCase())) {
                setIsLoading(false);
            }
        }
    };

    if (!isOpen) {
        return (
            <>
                <ChatAnimations />
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: theme.gradients.main,
                        color: '#fff',
                        border: 'none',
                        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        animation: 'pulseGlow 2s infinite'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                    <MessageSquare size={28} strokeWidth={2.5} />
                </button>
            </>
        );
    }

    return (
        <>
            <ChatAnimations />
            <div style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                width: '380px',
                height: '600px',
                background: 'rgba(255, 255, 255, 0.85)', // Light Glassmorphism
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.5)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                fontFamily: 'inherit',
                animation: 'chatPopIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
                color: theme.colors.textMain
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.25rem',
                    borderBottom: `1px solid ${theme.colors.borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.5)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: theme.gradients.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                        }}>
                            <Bot size={20} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: theme.colors.textMain, fontSize: '1.05rem' }}>SymbioBot</div>
                            <div style={{ fontSize: '0.75rem', color: theme.colors.accentGreen, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: theme.colors.accentGreen }}></span>
                                Online
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            color: theme.colors.textMuted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                            e.currentTarget.style.color = theme.colors.textMain;
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = theme.colors.textMuted;
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            animation: 'messageSlide 0.3s ease-out backwards',
                            animationDelay: `${idx * 0.05}s`
                        }}>
                            {msg.role === 'model' && (
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    background: 'rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '8px',
                                    marginTop: '4px',
                                    flexShrink: 0
                                }}>
                                    <Bot size={16} color={theme.colors.textMuted} />
                                </div>
                            )}
                            <div style={{
                                maxWidth: '80%',
                                padding: '0.8rem 1rem',
                                borderRadius: '16px',
                                borderTopLeftRadius: msg.role === 'model' ? '4px' : '16px',
                                borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                                // User: Primary Gradient, Bot: Light Gray
                                background: msg.role === 'user' ? theme.gradients.main : '#f1f5f9',
                                color: msg.role === 'user' ? '#fff' : theme.colors.textMain,
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                boxShadow: msg.role === 'user'
                                    ? '0 4px 15px rgba(37, 99, 235, 0.2)'
                                    : 'none',
                                border: msg.role === 'model' ? '1px solid rgba(0,0,0,0.05)' : 'none'
                            }}>
                                <ReactMarkdown
                                    components={{
                                        p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />,
                                        strong: ({ node, ...props }) => <strong style={{ color: msg.role === 'user' ? '#fff' : theme.colors.primaryBlue }} {...props} />
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'messageSlide 0.3s ease-out' }}>
                            <div style={{
                                padding: '1rem',
                                borderRadius: '16px',
                                borderTopLeftRadius: '4px',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <TypingIndicator />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions Chips */}
                <div style={{
                    padding: '0 1rem 0.5rem 1rem',
                    display: 'flex',
                    gap: '0.5rem',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    {PREDEFINED_QA.map((qa, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleQuestionClick(qa)}
                            style={{
                                flexShrink: 0,
                                background: 'rgba(255,255,255,0.8)',
                                border: `1px solid ${theme.colors.borderColor}`,
                                borderRadius: '20px',
                                padding: '0.5rem 1rem',
                                fontSize: '0.8rem',
                                color: theme.colors.primaryBlue,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.borderColor = theme.colors.primaryBlue;
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = theme.colors.borderColor;
                            }}
                        >
                            <HelpCircle size={12} />
                            {qa.question}
                        </button>
                    ))}
                </div>


                {/* Input */}
                <form onSubmit={handleSubmit} style={{
                    padding: '1rem',
                    borderTop: `1px solid ${theme.colors.borderColor}`,
                    display: 'flex',
                    gap: '0.75rem',
                    background: 'rgba(255,255,255,0.5)'
                }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '12px',
                            border: `1px solid ${theme.colors.borderColor}`,
                            background: '#fff',
                            color: theme.colors.textMain,
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                        }}
                        onFocus={e => {
                            e.target.style.borderColor = theme.colors.primaryBlue;
                            e.target.style.boxShadow = `0 0 0 2px ${theme.colors.primaryBlue}20`;
                        }}
                        onBlur={e => {
                            e.target.style.borderColor = theme.colors.borderColor;
                            e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.03)';
                        }}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: isLoading || !input.trim()
                                ? '#e2e8f0'
                                : theme.gradients.main,
                            color: isLoading || !input.trim() ? theme.colors.textMuted : '#fff',
                            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isLoading || !input.trim() ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        <Send size={20} strokeWidth={2.5} />
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChatBot;
