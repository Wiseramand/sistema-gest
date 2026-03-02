'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    text: string;
    timestamp: string;
}

export default function ProfessorChatPage() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    async function fetchMessages() {
        try {
            const res = await fetch('/api/chat');
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: newMessage,
                    recipientId: 'admin', // Default to admin for support
                }),
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            alert('Erro ao enviar mensagem');
        }
    }

    const userId = (session?.user as any)?.id;

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>Suporte Maritimo</h1>
                <p>Fala diretamente com a Administração</p>
            </div>

            <div className="chat-messages" ref={scrollRef}>
                {loading && messages.length === 0 ? (
                    <div className="loading">A carregar mensagens...</div>
                ) : (
                    messages.map((m) => (
                        <div key={m.id} className={`message-wrapper ${m.senderId === userId ? 'own' : 'other'}`}>
                            <div className="message-bubble">
                                <span className="sender">{m.senderName}</span>
                                <p className="text">{m.text}</p>
                                <span className="time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    ))
                )}
                {!loading && messages.length === 0 && (
                    <div className="empty-chat">
                        <span className="icon">👋</span>
                        <p>Olá! Envia uma mensagem para iniciares conversa com o suporte.</p>
                    </div>
                )}
            </div>

            <form className="chat-input" onSubmit={handleSend}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escreve a tua mensagem aqui..."
                    required
                />
                <button type="submit" className="send-btn">Enviar</button>
            </form>

            <style jsx>{`
                .chat-container { height: calc(100vh - 180px); display: flex; flex-direction: column; background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden; }
                .chat-header { padding: 1.5rem 2rem; background: #1e293b; color: white; }
                .chat-header h1 { font-size: 1.25rem; margin: 0; }
                .chat-header p { font-size: 0.8rem; margin: 0.25rem 0 0; opacity: 0.7; }

                .chat-messages { flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; background: #f8fafc; }
                .message-wrapper { display: flex; width: 100%; }
                .message-wrapper.own { justify-content: flex-end; }
                .message-wrapper.other { justify-content: flex-start; }

                .message-bubble { max-width: 70%; padding: 1rem; border-radius: 15px; position: relative; }
                .own .message-bubble { background: #3b82f6; color: white; border-bottom-right-radius: 2px; }
                .other .message-bubble { background: white; color: #1e293b; border-bottom-left-radius: 2px; border: 1px solid #e2e8f0; }

                .sender { font-size: 0.7rem; font-weight: 800; display: block; margin-bottom: 0.25rem; text-transform: uppercase; }
                .other .sender { color: #3b82f6; }
                .own .sender { color: rgba(255,255,255,0.7); }

                .text { margin: 0; font-size: 0.95rem; line-height: 1.4; }
                .time { font-size: 0.65rem; opacity: 0.6; display: block; margin-top: 0.5rem; text-align: right; }

                .empty-chat { text-align: center; margin: auto; color: #64748b; }
                .empty-chat .icon { font-size: 3rem; display: block; margin-bottom: 1rem; }

                .chat-input { padding: 1.5rem 2rem; border-top: 1px solid #e2e8f0; display: flex; gap: 1rem; }
                .chat-input input { flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.75rem 1.25rem; font-size: 0.95rem; }
                .send-btn { background: #3b82f6; color: white; border: none; padding: 0 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .send-btn:hover { background: #2563eb; transform: scale(1.02); }
            `}</style>
        </div>
    );
}

