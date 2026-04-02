'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function TrainerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TrainerLayoutContent>{children}</TrainerLayoutContent>
    );
}

function TrainerLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    const isLoginPage = pathname === '/professor/login';

    if (status === 'loading' && !isLoginPage) return null;
    if (status === 'unauthenticated' && !isLoginPage) {
        router.push('/professor/login');
        return null;
    }

    const user = session?.user as any;
    const isTrainer = user?.role === 'PROFESSOR' || user?.role === 'TRAINER';

    if (isLoginPage) return <>{children}</>;

    if (!isTrainer) {
        return (
            <div className="access-denied-container">
                <div className="denied-box">
                    <span className="icon">🚫</span>
                    <h1>Acesso Restrito</h1>
                    <p>Você não tem permissão de Formador para acessar esta área.</p>
                    <Link href="/professor/login" className="btn-back">Ir para o Login</Link>
                </div>
                <style jsx>{`
                    .access-denied-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: #f1f5f9; font-family: 'Inter', sans-serif; }
                    .denied-box { text-align: center; background: white; padding: 3rem; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 400px; }
                    .icon { font-size: 4rem; display: block; margin-bottom: 1.5rem; }
                    h1 { color: #1e293b; margin-bottom: 1rem; }
                    p { color: #64748b; margin-bottom: 2rem; }
                    .btn-back { background: #3b82f6; color: white; padding: 0.75rem 2rem; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; transition: 0.2s; }
                    .btn-back:hover { background: #2563eb; transform: translateY(-2px); }
                `}</style>
            </div>
        );
    }

    const navItems = [
        { name: 'Minhas Turmas', href: '/professor', icon: '👨‍🏫' },
        { name: 'Materiais de Apoio', href: '/professor/materials', icon: '📁' },
        { name: 'Suporte / Chat', href: '/professor/chat', icon: '💬' },
        { name: 'Perfil', href: '/professor/profile', icon: '👤' },
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
                                <span>Portal do Formador</span>
                            </div>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <div className="nav-group">
                            <span className="nav-label">OPÇÕES</span>
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
                            onClick={() => signOut({ callbackUrl: '/professor/login' })}
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
                        <span className="breadcrumb">Formador / {navItems.find(i => i.href === pathname)?.name || 'Turmas'}</span>
                    </div>

                    <div className="header-right">
                        <div className="user-profile">
                            <div className="user-info">
                                <span className="user-name">{session?.user?.name || 'Formador'}</span>
                                <span className="user-role">QUALIFICADO</span>
                            </div>
                            <div className="avatar">
                                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'T'}
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
          background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
          font-family: 'Outfit', 'Inter', sans-serif;
          padding: 1.5rem;
          gap: 1.5rem;
        }

        /* Sidebar Styles (Floating) */
        .portal-sidebar {
          width: 260px;
          background: rgba(30, 41, 59, 0.95); /* Deep Navy */
          backdrop-filter: blur(12px);
          color: white;
          display: flex;
          flex-direction: column;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          position: sticky;
          top: 1.5rem;
          height: calc(100vh - 3rem);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .sidebar-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-header {
          padding: 2.5rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-icon {
          font-size: 1.8rem;
          background: #eab308;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          box-shadow: 0 8px 16px rgba(234, 179, 8, 0.25);
        }

        .logo-text h1 {
          font-size: 1.15rem;
          margin: 0;
          letter-spacing: 0.5px;
          color: white;
          font-weight: 800;
        }

        .logo-text span {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.4);
          font-weight: 600;
        }

        .sidebar-nav {
          flex: 1;
          padding: 2rem 0.75rem;
          overflow-y: auto;
        }

        .nav-label {
          padding: 0 1.25rem 0.75rem;
          font-size: 0.65rem;
          font-weight: 800;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: all 0.2s ease;
          border-radius: 16px;
          margin-bottom: 4px;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .nav-icon {
          margin-right: 1.25rem;
          font-size: 1.2rem;
          width: 24px;
          text-align: center;
        }

        .nav-item:hover {
          color: white;
          background-color: rgba(255,255,255,0.08);
        }

        .nav-item.active {
          color: #1e293b;
          background: #eab308;
          font-weight: 800;
          box-shadow: 0 8px 16px rgba(234, 179, 8, 0.3);
        }

        .sidebar-footer {
          padding: 1.5rem 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .logout-btn {
          width: 100%;
          padding: 1rem;
          border: none;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          cursor: pointer;
          border-radius: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: 0.3s;
        }

        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);
        }

        /* Content Area (Card) */
        .portal-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 28px;
          box-shadow: 0 15px 50px rgba(0,0,0,0.08);
          overflow: hidden;
          position: relative;
        }

        .portal-header {
          height: 80px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .breadcrumb {
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-name { font-weight: 800; font-size: 0.9rem; color: #1e293b; }
        .user-role { font-size: 0.65rem; font-weight: 800; color: #3b82f6; text-transform: uppercase; }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1e293b, #3b82f6);
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
          .portal-sidebar { width: 80px; }
          .nav-text, .nav-label, .logo-text, .user-info { display: none; }
          .nav-item { justify-content: center; }
          .nav-icon { margin: 0; }
        }
      `}</style>
        </div>
    );
}
