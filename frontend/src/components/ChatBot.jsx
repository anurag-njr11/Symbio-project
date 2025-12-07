import React, { useState, useRef, useEffect } from 'react';
import { X, Send, HelpCircle, Cloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { theme } from '../theme';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MascotAvatar from './MascotAvatar';

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
    @keyframes dotBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
    }
    .thought-cloud {
        position: absolute;
        bottom: 120%;
        right: 0;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 50%;
        box-shadow: 0 8px 20px rgba(124, 58, 237, 0.15);
        font-size: 0.9rem;
        color: #1e293b;
        white-space: nowrap;
        opacity: 0;
        transform: scale(0);
        pointer-events: none;
        border: 2px solid ${theme.colors.bgDark};
        font-weight: 600;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 100px;
        min-height: 80px;
    }
    .thought-dot-1 {
        position: absolute;
        bottom: 110%;
        right: 20px;
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        opacity: 0;
    }
    .thought-dot-2 {
        position: absolute;
        bottom: 115%;
        right: 15px;
        width: 18px;
        height: 18px;
        background: white;
        border-radius: 50%;
        opacity: 0;
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
    }
];

const THOUGHTS = {
    idle: [
        "Meow?", "Purr...", "Chasing data mice...", "Grooming my code...",
        "Any treats?", "I love loops!", "Cat-culating...", "Pawsitive vibes!",
        "Where is the red dot?", "Nap time soon?", "Hunting for bugs...",
        "Zoomies loading...", "Data is tasty!", "Soft kitty...", "Warm kitty...",
        "Little ball of fur...", "Happy kitty...", "Sleepy kitty...",
        // Energetic
        "Zoomies!", "Pounce!", "I'm fast!", "Catch me!",
        "Boing!", "Leap!", "Parkour!", "Cat nip kicks in!", "Yippee!"
    ],
    hover: [
        "Pet me!", "Purrrrr!", "Scratch behind ears?", "Attention please!",
        "I'm fluffy!", "Play with me!", "Meow!", "Hiss... jk!",
        "Don't stop!", "More pets!", "You're nice!", "Rub against leg!"
    ],
    working: [
        "Stalking prey...", "Pouncing on data...", "Eating bytes...", "Digesting info...",
        "Sharpening claws...", "Focusing...", "Eyes dilated...", "Tail twitching..."
    ]
};

const ChatBot = ({ currentView }) => {
    // ... existing state ...
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Meow! I am SymbioCat. Ask me about your DNA sequences or select a topic below!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Mascot State
    const [mascotEmotion, setMascotEmotion] = useState('idle');
    const [thoughtText, setThoughtText] = useState('');

    const messagesEndRef = useRef(null);
    const botContainerRef = useRef(null);
    const thoughtRef = useRef(null);
    const dot1Ref = useRef(null);
    const dot2Ref = useRef(null);
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

    // 2. Random Thoughts (Idle)
    useEffect(() => {
        if (isOpen) return;

        const think = () => {
            if (thoughtText || mascotEmotion !== 'idle') return;
            const text = THOUGHTS.idle[Math.floor(Math.random() * THOUGHTS.idle.length)];
            showThought(text, 4000);

            setMascotEmotion('thinking');
            setTimeout(() => setMascotEmotion('idle'), 4000);

            setTimeout(think, Math.random() * 8000 + 8000);
        };

        const timer = setTimeout(think, 3000);
        return () => clearTimeout(timer);
    }, [isOpen, thoughtText, mascotEmotion]);

    // 3. Scroll Reaction - REMOVED per user request
    // useEffect(() => {
    //     if (isOpen) return;
    //     ... logic removed ...
    // }, [isOpen, mascotEmotion]);

    const showThought = (text, duration = 3000) => {
        if (text === thoughtText && duration < 1000) return; // Debounce fast updates

        setThoughtText(text);

        // Animate Cloud Appearance
        const tl = gsap.timeline();
        tl.to([dot1Ref.current, dot2Ref.current], { opacity: 1, duration: 0.2, stagger: 0.1 });
        tl.to(thoughtRef.current, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" });

        if (duration) {
            setTimeout(() => {
                gsap.to(thoughtRef.current, { opacity: 0, scale: 0, duration: 0.3 });
                gsap.to([dot1Ref.current, dot2Ref.current], { opacity: 0, duration: 0.2, delay: 0.1 });
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
        }, 600);
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
                }, 600);
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
                        showThought(text, 0); // 0 means don't auto-hide immediately, let leave handle it

                        // Scale up container slightly
                        gsap.to(botContainerRef.current, { scale: 1.15, duration: 0.3, ease: "back.out(1.7)" });
                    }}
                    onMouseLeave={() => {
                        setMascotEmotion('idle');
                        // Hide thought
                        gsap.to(thoughtRef.current, { opacity: 0, scale: 0, duration: 0.3 });
                        gsap.to([dot1Ref.current, dot2Ref.current], { opacity: 0, duration: 0.2 });
                        setThoughtText('');

                        // Scale back down
                        gsap.to(botContainerRef.current, { scale: 1, duration: 0.3, ease: "power2.out" });
                    }}
                >
                    {/* Thought Cloud */}
                    <div ref={dot1Ref} className="thought-dot-1"></div>
                    <div ref={dot2Ref} className="thought-dot-2"></div>
                    <div ref={thoughtRef} className="thought-cloud">
                        {thoughtText}
                        {/* Cloud bumps visual decoration */}
                        <div style={{ position: 'absolute', top: '-10px', left: '20px', width: '30px', height: '30px', background: 'white', borderRadius: '50%', zIndex: -1 }}></div>
                        <div style={{ position: 'absolute', top: '-15px', right: '20px', width: '40px', height: '40px', background: 'white', borderRadius: '50%', zIndex: -1 }}></div>
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
