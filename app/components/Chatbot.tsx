'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
    id: number;
    sender: 'bot' | 'user';
    text: string;
};

type FAQOption = {
    label: string;
    answer: string;
};

const faqs: FAQOption[] = [
    {
        label: 'Como faço a inscrição?',
        answer: 'Pode pré-inscrever-se diretamente no formulário do nosso site principal (aba "Candidatura Online"). Entraremos em contacto consigo para finalizar o processo!',
    },
    {
        label: 'Onde vejo os vossos cursos?',
        answer: 'A nossa oferta formativa está detalhada na página principal na secção /cursos, ou pode pedir o nosso catálogo no formulário de contacto.',
    },
    {
        label: 'Onde fica a instituição?',
        answer: 'Estamos localizados em Luanda, Angola, dedicados à excelência em formação marítima internacional.',
    },
    {
        label: 'Os certificados são reconhecidos?',
        answer: 'Sim, a nossa formação segue rigorosamente as normas internacionais da IMO (STCW), conferindo certificações com validade internacional.',
    }
];

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: 'bot', text: '👋 Olá! Bem-vindo ao Marítimo Training Center. Como posso ajudar hoje?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, isOpen]);

    const handleOptionClick = (option: FAQOption) => {
        // Add User Message
        const userMsg: Message = { id: Date.now(), sender: 'user', text: option.label };
        setMessages(prev => [...prev, userMsg]);
        
        // Show Typing Indicator
        setIsTyping(true);
        
        // Add Bot Answer after delay
        setTimeout(() => {
            setIsTyping(false);
            const botMsg: Message = { id: Date.now() + 1, sender: 'bot', text: option.answer };
            setMessages(prev => [...prev, botMsg]);
        }, 800);
    };

    return (
        <div className="chatbot-wrapper">
            {/* The Floating Button */}
            <button className={`chatbot-toggle ${isOpen ? 'out' : 'in'}`} onClick={() => setIsOpen(true)}>
                💬 Ajuda
            </button>

            {/* The Chat Window */}
            <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
                <div className="chatbot-header">
                    <div className="header-info">
                        <strong>MTC Assistant</strong>
                        <span>Online</span>
                    </div>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
                </div>

                <div className="chatbot-messages" ref={scrollRef}>
                    {messages.map(m => (
                        <div key={m.id} className={`message-bubble ${m.sender}`}>
                            <p>{m.text}</p>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message-bubble bot typing">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    )}
                </div>

                <div className="chatbot-options">
                    <p className="options-title">Escolha um tópico:</p>
                    <div className="options-grid">
                        {faqs.map((faq, i) => (
                            <button key={i} className="option-btn" onClick={() => handleOptionClick(faq)}>
                                {faq.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .chatbot-wrapper {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    z-index: 9999;
                    font-family: var(--font-body);
                }

                .chatbot-toggle {
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    border-radius: 50px;
                    padding: 1rem 1.5rem;
                    font-size: 1rem;
                    font-weight: 700;
                    box-shadow: 0 10px 25px rgba(10, 42, 94, 0.3);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .chatbot-toggle:hover {
                    transform: scale(1.05) translateY(-5px);
                    background: var(--color-primary-mid);
                }

                .chatbot-toggle.out {
                    transform: scale(0);
                    opacity: 0;
                    pointer-events: none;
                }

                .chatbot-window {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 350px;
                    height: 500px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    opacity: 0;
                    transform: scale(0.8) translateY(20px);
                    pointer-events: none;
                    transform-origin: bottom right;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    border: 1px solid var(--color-border);
                }

                .chatbot-window.open {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    pointer-events: all;
                }

                .chatbot-header {
                    background: var(--color-primary);
                    color: white;
                    padding: 1.25rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 3px solid var(--color-accent);
                }

                .header-info {
                    display: flex;
                    flex-direction: column;
                }

                .header-info strong {
                    font-size: 1.1rem;
                    font-family: var(--font-display);
                }

                .header-info span {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.7);
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .header-info span::before {
                    content: '';
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    background: #10b981; /* green */
                    border-radius: 50%;
                }

                .close-btn {
                    background: transparent;
                    color: white;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: 0.2s;
                }

                .close-btn:hover {
                    opacity: 1;
                    transform: rotate(90deg);
                }

                .chatbot-messages {
                    flex: 1;
                    padding: 1.5rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    background: var(--color-surface);
                }

                .message-bubble {
                    max-width: 85%;
                    padding: 0.8rem 1rem;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    line-height: 1.4;
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .message-bubble.bot {
                    align-self: flex-start;
                    background: white;
                    color: var(--color-text);
                    border: 1px solid var(--color-border);
                    border-bottom-left-radius: 2px;
                }

                .message-bubble.user {
                    align-self: flex-end;
                    background: var(--color-primary);
                    color: white;
                    border-bottom-right-radius: 2px;
                }

                .typing {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                    padding: 1rem 1.25rem !important;
                }

                .dot {
                    width: 6px;
                    height: 6px;
                    background: var(--color-text-muted);
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out;
                }

                .dot:nth-child(1) { animation-delay: -0.32s; }
                .dot:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }

                .chatbot-options {
                    padding: 1.25rem;
                    background: white;
                    border-top: 1px solid var(--color-border);
                }

                .options-title {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: var(--color-text-muted);
                    margin-bottom: 0.75rem;
                    font-weight: 700;
                }

                .options-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .option-btn {
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    color: var(--color-primary);
                    padding: 0.6rem 0.8rem;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-align: left;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .option-btn:hover {
                    background: var(--color-primary-light);
                    border-color: var(--color-primary-mid);
                }
                
                @media (max-width: 480px) {
                    .chatbot-window {
                        position: fixed;
                        bottom: 0;
                        right: 0;
                        width: 100vw;
                        height: 100vh;
                        height: 100dvh;
                        border-radius: 0;
                        z-index: 10000;
                    }
                    .chatbot-wrapper {
                        bottom: 1.5rem;
                        right: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}
