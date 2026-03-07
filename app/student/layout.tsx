'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const user = session?.user as any;
    const userId = user?.id;
    const unreadCount = notifications.filter((n: any) => !n.read).length;

    useEffect(() => {
        if (!userId) return;
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`/api/notifications?studentId=${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(Array.isArray(data) ? data : []);
                }
            } catch (e) { console.error(e); }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true })
            });
            setNotifications(prev => prev.map((n: any) => n.id === id ? { ...n, read: true } : n));
        } catch (e) { console.error(e); }
    };

    const handleMarkAllRead = async () => {
        const unread = notifications.filter((n: any) => !n.read);
        for (const n of unread) { await handleMarkRead(n.id); }
    };

    if (status === 'loading') {
        return <div className="loading-portal">A carregar portal...</div>;
    }

    const isStudent = user?.role === 'STUDENT';

    if (!isStudent) {
        return (
            <div className="access-denied-container">
                <div className="denied-box">
                    <span className="icon">🚫</span>
                    <h1>Acesso Restrito</h1>
                    <p>Você não tem permissão de Aluno para acessar esta área.</p>
                    <Link href="/login" className="btn-back">Ir para o Login</Link>
                </div>
                <style jsx>{`
                    .access-denied-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-family: 'Inter', sans-serif; }
                    .denied-box { text-align: center; background: white; padding: 3rem; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 400px; }
                    .icon { font-size: 4rem; display: block; margin-bottom: 1.5rem; }
                    h1 { color: #0f172a; margin-bottom: 1rem; }
                    p { color: #64748b; margin-bottom: 2rem; }
                    .btn-back { background: #3b82f6; color: white; padding: 0.75rem 2rem; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; transition: 0.2s; }
                    .btn-back:hover { background: #2563eb; transform: translateY(-2px); }
                `}</style>
            </div>
        );
    }

    const navItems = [
        { name: 'Dashboard', href: '/student', icon: '📊' },
        { name: 'Materiais', href: '/student/materials', icon: '📁' },
        { name: 'Suporte', href: '/student/chat', icon: '💬' },
        { name: 'Feedback', href: '/student/feedback', icon: '⭐' },
        { name: 'Perfil', href: '/student/profile', icon: '👤' },
    ];


    return (
        <div className="portal-container">
            <aside className="portal-sidebar">
                <div className="sidebar-inner">
                    <div className="sidebar-header">
                        <div className="logo-box">
                            <span className="logo-icon">⚓</span>
                            <div className="logo-text">
                                <h1>Maritimo</h1>
                                <span>Portal do Aluno</span>
                            </div>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <div className="nav-group">
                            <span className="nav-label">ACESSO RÁPIDO</span>
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-text">{item.name}</span>
                                    {pathname === item.href && <span className="active-indicator"></span>}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    <div className="sidebar-footer">
                        <Link href="/" className="nav-item secondary">
                            <span className="nav-icon">🏠</span>
                            <span className="nav-text">Voltar ao Site</span>
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="nav-item secondary logout-btn"
                        >
                            <span className="nav-icon">🚪</span>
                            <span className="nav-text">Sair do Sistema</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="portal-content" style={{ gridColumn: 2 }}>
                <header className="portal-header">
                    <div className="header-left">
                        <span className="breadcrumb">Aluno / {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}</span>
                    </div>

                    <div className="header-right">
                        {/* Notification Bell */}
                        <div className="notif-wrapper" ref={notifRef}>
                            <button
                                className="notif-bell"
                                onClick={() => setNotifOpen(o => !o)}
                                title="Notificações"
                            >
                                🔔
                                {unreadCount > 0 && (
                                    <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="notif-dropdown">
                                    <div className="notif-header">
                                        <span className="notif-title">Notificações</span>
                                        {unreadCount > 0 && (
                                            <button className="mark-all-btn" onClick={handleMarkAllRead}>
                                                Marcar todas como lidas
                                            </button>
                                        )}
                                    </div>
                                    <div className="notif-list">
                                        {notifications.length === 0 ? (
                                            <div className="notif-empty">Nenhuma notificação.</div>
                                        ) : (
                                            notifications.map((n: any) => (
                                                <div
                                                    key={n.id}
                                                    className={`notif-item ${n.read ? 'read' : 'unread'}`}
                                                    onClick={() => !n.read && handleMarkRead(n.id)}
                                                >
                                                    <div className="notif-icon">
                                                        {n.type === 'MATRICULATION' ? '🎓' : '📢'}
                                                    </div>
                                                    <div className="notif-content">
                                                        <strong>{n.title}</strong>
                                                        <p>{n.message}</p>
                                                        <small>{new Date(n.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</small>
                                                    </div>
                                                    {!n.read && <span className="notif-dot"></span>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="user-profile">
                            <div className="user-info">
                                <span className="user-name">{session?.user?.name || 'Aluno'}</span>
                                <span className="user-role">MATRÍCULA ATIVA</span>
                            </div>
                            <div className="avatar">
                                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-inner">
                    {children}
                </div>
            </main>

            <style jsx>{`
                .portal-container {
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    min-height: 100vh;
                    background-color: #f8fafc;
                    font-family: 'Inter', sans-serif;
                }

                .portal-sidebar {
                    position: fixed;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 260px;
                    background-color: #0f172a;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 4px 0 10px rgba(0,0,0,0.1);
                    z-index: 100;
                }

                .sidebar-inner {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .sidebar-header {
                    padding: 2rem 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .logo-box {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .logo-icon {
                    font-size: 1.8rem;
                    background: var(--sand-gold, #eab308);
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                }

                .logo-text h1 {
                    font-size: 1.1rem;
                    margin: 0;
                    letter-spacing: 0.5px;
                    color: white;
                    font-weight: 800;
                }

                .logo-text span {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: rgba(255,255,255,0.5);
                    font-weight: 600;
                }

                .sidebar-nav {
                    flex: 1;
                    padding: 1.5rem 0;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255,255,255,0.1) transparent;
                }

                .sidebar-nav::-webkit-scrollbar {
                    width: 4px;
                }

                .sidebar-nav::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }

                .nav-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .nav-label {
                    padding: 0 1.5rem 0.75rem;
                    font-size: 0.6rem;
                    font-weight: 700;
                    color: rgba(255,255,255,0.3);
                    letter-spacing: 1.2px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 0.85rem 1.5rem;
                    color: rgba(255,255,255,0.6);
                    text-decoration: none;
                    transition: all 0.2s ease;
                    position: relative;
                    font-weight: 500;
                    border-left: 3px solid transparent;
                }

                .nav-icon {
                    margin-right: 1rem;
                    font-size: 1.1rem;
                    width: 24px;
                    text-align: center;
                }

                .nav-text {
                    font-size: 0.9rem;
                }

                .nav-item:hover {
                    color: white;
                    background-color: rgba(255,255,255,0.05);
                }

                .nav-item.active {
                    color: white;
                    background-color: rgba(59, 130, 246, 0.1);
                    border-left-color: #3b82f6;
                    font-weight: 600;
                }

                .active-indicator {
                    position: absolute;
                    right: 0;
                    width: 3px;
                    height: 18px;
                    background-color: #3b82f6;
                    border-radius: 4px 0 0 4px;
                }

                .sidebar-footer {
                    padding: 1.5rem 0;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }

                .nav-item.secondary {
                    font-size: 0.85rem;
                    opacity: 0.7;
                    padding: 0.75rem 1.5rem;
                    margin: 0.25rem 1.25rem;
                    border-radius: 10px;
                    transition: all 0.2s ease;
                }

                .nav-item.secondary:hover {
                    opacity: 1;
                    background-color: rgba(255,255,255,0.05);
                }

                .logout-btn {
                    width: calc(100% - 2.5rem);
                    margin: 0.5rem 1.25rem 1.5rem;
                    border: none;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white !important;
                    cursor: pointer;
                    text-align: left;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: flex;
                    align-items: center;
                    font-weight: 700;
                }

                .logout-btn:hover {
                    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%) !important;
                    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
                    transform: translateY(-2px) scale(1.02);
                    color: white !important;
                }

                /* Content Area */
                .portal-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .portal-header {
                    height: 70px;
                    background-color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 2rem;
                    border-bottom: 1px solid #e2e8f0;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }

                .breadcrumb {
                    font-size: 0.8rem;
                    color: #64748b;
                    font-weight: 600;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                /* Notification Bell */
                .notif-wrapper {
                    position: relative;
                }

                .notif-bell {
                    position: relative;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .notif-bell:hover { background: #e2e8f0; }

                .notif-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #ef4444;
                    color: white;
                    font-size: 0.6rem;
                    font-weight: 800;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid white;
                    animation: pulse-badge 2s ease-in-out infinite;
                }

                @keyframes pulse-badge {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }

                .notif-dropdown {
                    position: absolute;
                    top: calc(100% + 10px);
                    right: 0;
                    width: 360px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 50px -10px rgba(0,0,0,0.2);
                    border: 1px solid #e2e8f0;
                    z-index: 200;
                    overflow: hidden;
                    animation: dropIn 0.2s ease-out;
                }

                @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .notif-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #f1f5f9;
                    background: #f8fafc;
                }

                .notif-title {
                    font-weight: 800;
                    font-size: 0.9rem;
                    color: #0f172a;
                }

                .mark-all-btn {
                    background: none;
                    border: none;
                    color: #3b82f6;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    transition: 0.2s;
                }
                .mark-all-btn:hover { background: #eff6ff; }

                .notif-list {
                    max-height: 360px;
                    overflow-y: auto;
                }

                .notif-empty {
                    padding: 2rem;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 0.88rem;
                }

                .notif-item {
                    display: flex;
                    gap: 0.875rem;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid #f8fafc;
                    cursor: pointer;
                    transition: background 0.15s;
                    position: relative;
                }

                .notif-item:last-child { border-bottom: none; }
                .notif-item:hover { background: #f8fafc; }
                .notif-item.unread { background: #eff6ff; }
                .notif-item.unread:hover { background: #dbeafe; }

                .notif-icon {
                    font-size: 1.4rem;
                    flex-shrink: 0;
                    width: 36px;
                    height: 36px;
                    background: white;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
                }

                .notif-content { flex: 1; min-width: 0; }
                .notif-content strong { display: block; font-size: 0.85rem; color: #0f172a; margin-bottom: 0.2rem; }
                .notif-content p { font-size: 0.78rem; color: #64748b; margin: 0 0 0.25rem; line-height: 1.4; }
                .notif-content small { font-size: 0.7rem; color: #94a3b8; }

                .notif-dot {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #3b82f6;
                    flex-shrink: 0;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                .user-name {
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: #0f172a;
                }

                .user-role {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: #3b82f6;
                    letter-spacing: 0.5px;
                }

                .avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #0f172a, #3b82f6);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1rem;
                }

                .content-inner {
                    padding: 2rem;
                    flex: 1;
                }

                @media (max-width: 768px) {
                    .portal-sidebar { width: 70px; }
                    .nav-text, .nav-label, .logo-text, .user-info { display: none; }
                    .sidebar-header, .nav-item { justify-content: center; padding: 1rem; }
                    .nav-icon { margin: 0; }
                    .notif-dropdown { right: -80px; width: 300px; }
                }
            `}</style>
        </div>
    );
}
