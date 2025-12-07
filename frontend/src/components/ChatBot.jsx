import React, { useState, useRef, useEffect } from 'react';
import { X, Send, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { theme } from '../theme';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MascotAvatar from './MascotAvatar';
import { useMascot } from '../contexts/MascotContext';

gsap.registerPlugin(ScrollTrigger);

// Animation Styles
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
    .thought-cloud {
        position: absolute;
        bottom: 105%;
        right: 0;
        background: white;
        padding: 1.25rem;
        border-radius: 20px;
        border-bottom-right-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        font-size: 0.85rem;
        color: #334155;
        opacity: 0;
        transform: scale(0);
        pointer-events: none;
        border: 1px solid ${theme.colors.borderColor};
        font-weight: 500;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 150px;
        height: auto;
        min-height: 80px;
        aspect-ratio: 1; 
        white-space: normal;
        text-align: center;
        line-height: 1.4;
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
        question: "What is Symbio?",
        answer: "**Symbio** is your personal genomic analysis lab! We help you analyze DNA sequences, check for ORFs, and calculate GC content—all with a purr-fect interface!"
    },
    {
        question: "How do I upload?",
        answer: "Just head to the **Dashboard** or **Upload** tab! You can drag & drop your `.fasta` or `.txt` files there. I'll watch the upload progress for you! 😸"
    },
    {
        question: "What is GC Content?",
        answer: "**GC Content** is the percentage of G & C bases in your DNA. High GC often means your sequence is tough and heat-resistant! Symbio calculates this automatically."
    },
    {
        question: "Can I see past reports?",
        answer: "Absolutely! The **History** tab keeps track of all your past adventures in DNA analysis. You can revisit them anytime!"
    }
];

const THOUGHTS = {
    idle: [
        "Symbio is purr-fect!", "Analyzing your DNA...", "Upload a FASTA?",
        "I run on code & kibble!", "Checking the Dashboard...", "Any new sequences?",
        "Symbio loves Biology!", "GC Content? High!", "Hunting for ORFs...",
        "Bioinformatics is fun!", "Meow... calculating...", "Data looks tasty!",
        "Your research rocks!", "Symbio: DNA & Cats!", "Paws-itive results!"
    ],
    hover: [
        "Ask me about Symbio!", "I can help upload!", "Click to chat!",
        "I know Biology!", "Let's analyze data!", "Symbio helper here!",
        "Need a hand (or paw)?", "I'm listening!", "Ready for science!"
    ],
    working: [
        "Processing on Symbio...", "Reading FASTA...", " crunching numbers...",
        "Generating report...", "Fetching insights...", "Symbio is working..."
    ]
};

const ChatBot = ({ currentView }) => {
    // ... existing state ...
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: "Meow! 🐱 I'm SymbioCat. I can help you sniff out insights in the Dashboard, Upload new DNA sequences, or dig through your Report History! How can I help? Purr..." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Mascot State
    const [mascotEmotion, setMascotEmotion] = useState('idle');
    const [thoughtText, setThoughtText] = useState('');

    const messagesEndRef = useRef(null);
    const botContainerRef = useRef(null);
    const thoughtRef = useRef(null);
    const timeoutRef = useRef(null); // Ref to track timeout for cleanup

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // --- Mascot Behavior Logic ---

    // 1. Tennis Ball Bouncing Animation
    useEffect(() => {
        if (isOpen) return;

        const container = botContainerRef.current;
        if (!container) return;

        // Reset any previous tweens
        gsap.killTweensOf(container);

        // Initial setup
        gsap.set(container, { x: 0, y: 0, rotation: 0 });

        // Gentle "Pet" Float/Bounce
        const floatAnim = gsap.to(container, {
            y: -15, // Gentle up/down
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // Slow "Pet" Rocking/Rotation
        const rockAnim = gsap.to(container, {
            rotation: 5, // Slight tilt left/right
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        return () => {
            floatAnim.kill();
            rockAnim.kill();
            gsap.killTweensOf(container);
        };
    }, [isOpen]);

    const { mascotMessage, mascotEmotion: contextEmotion } = useMascot();

    // React to Context Messages (Hover Explanations)
    useEffect(() => {
        if (mascotMessage) {
            showThought(mascotMessage, 0); // 0 = persistent until cleared
            setMascotEmotion(contextEmotion || 'happy');
        } else {
            // Clear thought when message is cleared
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setThoughtText('');
            gsap.to(thoughtRef.current, { opacity: 0, scale: 0, duration: 0.3 });
            setMascotEmotion('idle');
        }
    }, [mascotMessage, contextEmotion]);

    // React to View Changes (Navigation Greeting)
    useEffect(() => {
        if (isOpen) return;

        const viewMessages = {
            'dashboard': "Welcome back to base! 🏠",
            'upload': "Time to feed me data! 🧬",
            'reports': "Checking the archives... 📂",
            'summary': "Let's analyze the results! 📊",
            'view_report': "Ooh, interesting data! 🧐"
        };

        const msg = viewMessages[currentView];
        if (msg) {
            // Short delay to allow hover-leave to clear first
            setTimeout(() => showThought(msg, 3000), 100);
            setMascotEmotion('happy');
            setTimeout(() => setMascotEmotion('idle'), 3100);
        }
    }, [currentView, isOpen]);

    // 2. Random Thoughts (Idle)
    useEffect(() => {
        if (isOpen || mascotMessage) return; // Don't random think if open or explaining something

        const think = () => {
            if (thoughtText || mascotEmotion !== 'idle' || mascotMessage) return;
            const text = THOUGHTS.idle[Math.floor(Math.random() * THOUGHTS.idle.length)];
            showThought(text, 5000);

            setMascotEmotion('thinking');
            setTimeout(() => setMascotEmotion('idle'), 5000);

            setTimeout(think, Math.random() * 8000 + 5000); // Faster loop: 5-13s
        };

        const timer = setTimeout(think, 3000); // Faster start: 3s
        return () => clearTimeout(timer);
    }, [isOpen, thoughtText, mascotEmotion, mascotMessage]);

    const showThought = (text, duration = 5000) => {
        // Clear any pending hide timer to prevent premature hiding
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setThoughtText(text);

        // Animate Cloud Appearance
        const tl = gsap.timeline();
        tl.to(thoughtRef.current, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" });

        if (duration > 0) {
            timeoutRef.current = setTimeout(() => {
                gsap.to(thoughtRef.current, { opacity: 0, scale: 0, duration: 0.3 });
                setTimeout(() => setThoughtText(''), 300);
            }, duration);
        }
    };

    const handleQuestionClick = (qa) => {
        setMessages(prev => [...prev, { role: 'user', text: qa.question }]);
        setIsLoading(true);
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'model', text: qa.answer }]);
            setIsLoading(false);
        }, 1200); // Slightly slower for readability
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            const localMatch = PREDEFINED_QA.find(qa => qa.question.toLowerCase() === userMessage.toLowerCase());
            if (localMatch) {
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'model', text: localMatch.answer }]);
                    setIsLoading(false);
                }, 1000); // Slower
                return;
            }

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

            // Parse Emotion Tags
            let replyText = data.reply;
            const emotionMatch = replyText.match(/\[EMOTION:([a-z]+)\]/i);

            if (emotionMatch) {
                const emotion = emotionMatch[1].toLowerCase();
                setMascotEmotion(emotion);
                // Remove tag from displayed text
                replyText = replyText.replace(/\[EMOTION:[a-z]+\]/gi, '').trim();

                // Reset to idle after a delay (except for sleeping/cool which might stay longer)
                if (emotion !== 'sleeping') {
                    setTimeout(() => setMascotEmotion('idle'), 5000);
                }
            }

            setMessages(prev => [...prev, { role: 'model', text: replyText }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'model', text: 'I apologize, but I am having trouble connecting right now. Please try again later.' }]);
        } finally {
            const userMessage = input.trim(); // Access captured variable
            if (!PREDEFINED_QA.find(qa => qa.question.toLowerCase() === userMessage.toLowerCase())) {
                setIsLoading(false);
            }
        }
    };

    // --- Render ---

    // 1. Minimized (Mascot Mode)
    if (!isOpen) {
        return (
            <>
                <ChatAnimations />
                <div
                    key="minimized-mascot"
                    ref={botContainerRef}
                    style={{
                        position: 'fixed',
                        bottom: '3rem', // Higher up
                        right: '3rem',
                        zIndex: 1000,
                        cursor: 'pointer'
                    }}
                    onClick={() => setIsOpen(true)}
                    onMouseEnter={() => {
                        setMascotEmotion('happy');
                        // Show random hover thought
                        const text = THOUGHTS.hover[Math.floor(Math.random() * THOUGHTS.hover.length)];
                        showThought(text, 5000); // Show for 5s even if mouse leaves

                        // Scale up container slightly
                        gsap.to(botContainerRef.current, { scale: 1.15, duration: 0.3, ease: "back.out(1.7)" });
                    }}
                    onMouseLeave={() => {
                        setMascotEmotion('idle');
                        // Don't hide thought immediately to allow reading

                        // Scale back down
                        gsap.to(botContainerRef.current, { scale: 1, duration: 0.3, ease: "power2.out" });
                    }}
                >
                    <div ref={thoughtRef} className="thought-cloud">
                        {thoughtText}
                    </div>

                    {/* Mascot */}
                    <MascotAvatar emotion={mascotEmotion} size={90} />
                </div>
            </>
        );
    }

    // 2. Open Chat Window
    return (
        <>
            <ChatAnimations />
            <div
                key="open-chat-window"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '380px',
                    height: '600px',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.6)',
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
                    background: 'rgba(255,255,255,0.6)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            background: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'visible'
                        }}>
                            {/* Mini Avatar in Header */}
                            <div style={{ transform: 'scale(0.6) translateY(4px)' }}>
                                <MascotAvatar emotion="idle" size={50} />
                            </div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: theme.colors.textMain, fontSize: '1.05rem' }}>SymbioCat</div>
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
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '8px',
                                    marginTop: '4px',
                                    flexShrink: 0
                                }}>
                                    {/* Tiny Bot Icon for Messages */}
                                    <div style={{ transform: 'scale(0.4)' }}>
                                        <MascotAvatar emotion="happy" size={50} />
                                    </div>
                                </div>
                            )}
                            <div style={{
                                maxWidth: '80%',
                                padding: '0.8rem 1rem',
                                borderRadius: '16px',
                                borderTopLeftRadius: msg.role === 'model' ? '4px' : '16px',
                                borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                                background: msg.role === 'user' ? theme.gradients.main : 'rgba(255,255,255,0.8)',
                                color: msg.role === 'user' ? '#fff' : theme.colors.textMain,
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                boxShadow: msg.role === 'user'
                                    ? '0 4px 15px rgba(37, 99, 235, 0.2)'
                                    : '0 2px 5px rgba(0,0,0,0.05)',
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
                            background: isLoading || !input.trim() ? '#e2e8f0' : theme.gradients.main,
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
