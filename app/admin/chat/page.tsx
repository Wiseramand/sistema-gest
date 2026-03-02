'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    recipientId: string;
    text: string;
    timestamp: string;
}

export default function AdminChatPage() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<{ id: string, name: string } | null>(null);
    const [replyText, setReplyText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedUser, messages]);

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

    async function handleSendReply(e: React.FormEvent) {
        e.preventDefault();
        if (!replyText.trim() || !selectedUser) return;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: replyText,
                    recipientId: selectedUser.id,
                }),
            });

            if (res.ok) {
                setReplyText('');
                fetchMessages();
            }
        } catch (error) {
            alert('Erro ao enviar resposta');
        }
    }

    // Identify unique users who have sent messages to admin or received messages from admin
    const conversations = messages.reduce((acc: any, msg) => {
        const otherUserId = msg.senderId === 'admin' ? msg.recipientId : msg.senderId;
        const otherUserName = msg.senderId === 'admin' ? 'Usuário' : msg.senderName;

        if (otherUserId === 'admin') return acc; // Skip admin-to-admin if any

        if (!acc[otherUserId]) {
            acc[otherUserId] = {
                id: otherUserId,
                name: otherUserName,
                lastMessage: msg.text,
                timestamp: msg.timestamp,
                role: msg.senderId === 'admin' ? '' : msg.senderRole
            };
        } else if (new Date(msg.timestamp) > new Date(acc[otherUserId].timestamp)) {
            acc[otherUserId].lastMessage = msg.text;
            acc[otherUserId].timestamp = msg.timestamp;
        }
        return acc;
    }, {});

    const chatList = Object.values(conversations).sort((a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const activeMessages = selectedUser
        ? messages.filter(m => m.senderId === selectedUser.id || m.recipientId === selectedUser.id)
        : [];

    const adminId = (session?.user as any)?.id;

    return (
        <div className="admin-chat-container">
            <aside className="chat-list">
                <div className="list-header">
                    <h2>Conversas</h2>
                </div>
                <div className="list-items">
                    {chatList.map((chat: any) => (
                        <div
                            key={chat.id}
                            className={`chat-item ${selectedUser?.id === chat.id ? 'active' : ''}`}
                            onClick={() => setSelectedUser({ id: chat.id, name: chat.name })}
                        >
                            <div className="chat-avatar">{chat.name.charAt(0).toUpperCase()}</div>
                            <div className="chat-info">
                                <span className="chat-name">{chat.name}</span>
                                <span className="chat-role">{chat.role}</span>
                                <p className="chat-last">{chat.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                    {chatList.length === 0 && <p className="empty-list">Nenhuma conversa ativa.</p>}
                </div>
            </aside>

            <main className="chat-window">
                {selectedUser ? (
                    <>
                        <header className="window-header">
                            <h3>Conversa com {selectedUser.name}</h3>
                        </header>

                        <div className="window-messages" ref={scrollRef}>
                            {activeMessages.map((m) => (
                                <div key={m.id} className={`message-wrapper ${m.senderRole === 'ADMIN' || m.senderRole === 'SUPER_ADMIN' ? 'own' : 'other'}`}>
                                    <div className="message-bubble">
                                        <p className="text">{m.text}</p>
                                        <span className="time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form className="window-input" onSubmit={handleSendReply}>
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Escreva a resposta..."
                                required
                            />
                            <button type="submit" className="send-btn">Responder</button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <span className="icon">💬</span>
                        <p>Selecione uma conversa para começar a responder.</p>
                    </div>
                )}
            </main>

            <style jsx>{`
                .admin-chat-container { display: flex; height: calc(100vh - 120px); background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                
                .chat-list { width: 350px; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; }
                .list-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; }
                .list-header h2 { font-size: 1.25rem; margin: 0; color: #1e293b; }
                .list-items { flex: 1; overflow-y: auto; }
                
                .chat-item { display: flex; gap: 1rem; padding: 1.25rem 1.5rem; cursor: pointer; transition: 0.2s; border-bottom: 1px solid #f1f5f9; }
                .chat-item:hover { background: #f8fafc; }
                .chat-item.active { background: #eff6ff; border-left: 4px solid #3b82f6; }
                
                .chat-avatar { width: 45px; height: 45px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
                .chat-info { flex: 1; min-width: 0; }
                .chat-name { display: block; font-weight: 700; font-size: 0.95rem; color: #1e293b; }
                .chat-role { font-size: 0.65rem; color: #3b82f6; font-weight: 800; text-transform: uppercase; }
                .chat-last { margin: 0.25rem 0 0; font-size: 0.8rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                .chat-window { flex: 1; display: flex; flex-direction: column; background: #f8fafc; }
                .window-header { padding: 1.25rem 2rem; background: white; border-bottom: 1px solid #e2e8f0; }
                .window-header h3 { margin: 0; font-size: 1rem; color: #1e293b; }
                
                .window-messages { flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
                .message-wrapper { display: flex; width: 100%; }
                .message-wrapper.own { justify-content: flex-end; }
                .message-wrapper.other { justify-content: flex-start; }
                
                .message-bubble { max-width: 70%; padding: 1rem; border-radius: 15px; background: white; border: 1px solid #e2e8f0; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
                .own .message-bubble { background: #1e293b; color: white; border-color: #1e293b; border-bottom-right-radius: 2px; }
                .other .message-bubble { border-bottom-left-radius: 2px; }
                
                .time { font-size: 0.65rem; opacity: 0.6; display: block; margin-top: 0.5rem; text-align: right; }

                .window-input { padding: 1.5rem 2rem; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 1rem; }
                .window-input input { flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.75rem 1.25rem; font-size: 0.95rem; }
                .send-btn { background: #1e293b; color: white; border: none; padding: 0 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .send-btn:hover { background: #0f172a; transform: scale(1.02); }

                .no-chat-selected { margin: auto; text-align: center; color: #64748b; }
                .no-chat-selected .icon { font-size: 4rem; display: block; margin-bottom: 1rem; opacity: 0.2; }
            `}</style>
        </div>
    );
}

