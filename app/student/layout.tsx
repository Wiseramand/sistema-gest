'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StudentLayoutContent>{children}</StudentLayoutContent>
    );
}

function StudentLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
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

    if (status === 'loading') return null;

    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
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
                            onClick={() => signOut({ callbackUrl: '/login' })}
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
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-family: 'Outfit', 'Inter', sans-serif;
          padding: 1.5rem;
          gap: 1.5rem;
        }

        /* Modern White Sidebar */
        .portal-sidebar {
          width: 260px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          position: sticky;
          top: 1.5rem;
          height: calc(100vh - 3rem);
        }

        .sidebar-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-header {
          padding: 2.5rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-icon {
          font-size: 1.8rem;
          background: #001f3f;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: white;
        }

        .logo-text h1 {
          font-size: 1.15rem;
          margin: 0;
          color: #001f3f;
          font-weight: 800;
        }

        .logo-text span {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
          font-weight: 600;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0.75rem;
          overflow-y: auto;
        }

        .nav-label {
          padding: 0 1.25rem 0.5rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.8rem 1.25rem;
          color: #64748b;
          text-decoration: none;
          transition: all 0.2s;
          border-radius: 12px;
          margin-bottom: 2px;
          font-weight: 500;
          font-size: 0.95rem;
          border-left: 3px solid transparent;
        }

        .nav-icon {
          margin-right: 1.25rem;
          font-size: 1.2rem;
          width: 24px;
          text-align: center;
          opacity: 0.7;
        }

        .nav-item:hover {
          background-color: #f8fafc;
          color: #001f3f;
        }

        .nav-item.active {
          color: #2563eb;
          background: #eff6ff;
          font-weight: 700;
          border-left-color: #3b82f6;
        }

        .nav-item.active .nav-icon {
          opacity: 1;
        }

        .sidebar-footer {
          padding: 1rem 0.75rem 2rem;
          border-top: 1px solid #f1f5f9;
        }

        .logout-btn {
          width: 100%;
          padding: 0.85rem;
          border: none;
          background: #eff6ff;
          color: #3b82f6;
          cursor: pointer;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: 0.2s;
        }

        .logout-btn:hover {
          background: #dbeafe;
          transform: translateY(-2px);
        }

        /* Content Area (Clean White Card) */
        .portal-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 28px;
          box-shadow: 0 4px 30px rgba(0,0,0,0.02);
          border: 1px solid #f1f5f9;
          overflow: hidden;
        }

        .portal-header {
          height: 80px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .breadcrumb {
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .notif-bell {
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 50%;
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            cursor: pointer;
            transition: 0.2s;
            color: #64748b;
        }
        .notif-bell:hover { background: #f1f5f9; color: #001f3f; }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
        }

        .user-name { font-weight: 700; font-size: 0.9rem; color: #1e293b; }
        .user-role { font-size: 0.65rem; font-weight: 700; color: #3b82f6; text-transform: uppercase; }

        .avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #0f172a;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .content-inner {
          padding: 2.5rem;
          flex: 1;
          overflow-y: auto;
        }

        @media (max-width: 1024px) {
          .portal-container { padding: 1rem; }
          .portal-content { border-radius: 20px; }
          .portal-sidebar { width: 80px; }
          .nav-text, .nav-label, .logo-text, .user-info { display: none; }
          .nav-item { justify-content: center; }
          .nav-icon { margin: 0; }
        }
      `}</style>
        </div>
    );
}
