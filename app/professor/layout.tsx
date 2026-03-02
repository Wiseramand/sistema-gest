'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function TrainerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div className="loading-portal">A carregar portal...</div>;
    }

    const user = session?.user as any;
    const isTrainer = user?.role === 'PROFESSOR' || user?.role === 'TRAINER';

    if (!isTrainer) {
        return (
            <div className="access-denied-container">
                <div className="denied-box">
                    <span className="icon">🚫</span>
                    <h1>Acesso Restrito</h1>
                    <p>Você não tem permissão de Formador para acessar esta área.</p>
                    <Link href="/login" className="btn-back">Ir para o Login</Link>
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
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    min-height: 100vh;
                    background-color: #f1f5f9;
                    font-family: 'Inter', sans-serif;
                }

                .portal-sidebar {
                    position: fixed;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 260px;
                    background-color: #1e293b;
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
                    background: #3b82f6;
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
                    color: rgba(255,255,255,0.4);
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
                    color: rgba(255,255,255,0.25);
                    letter-spacing: 1.2px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 0.85rem 1.5rem;
                    color: rgba(255,255,255,0.5);
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
                    background-color: rgba(59, 130, 246, 0.15);
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
                    background: linear-gradient(135deg, #ff4136 0%, #d43f3a 100%);
                    color: white !important;
                    cursor: pointer;
                    text-align: left;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(255, 65, 54, 0.2);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    display: flex;
                    align-items: center;
                    font-weight: 700;
                }

                .logout-btn:hover {
                    background: linear-gradient(135deg, #ff5a50 0%, #e64a45 100%) !important;
                    box-shadow: 0 6px 16px rgba(255, 65, 54, 0.35);
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
                }

                .breadcrumb {
                    font-size: 0.8rem;
                    color: #64748b;
                    font-weight: 600;
                }

                .header-right {
                    display: flex;
                    align-items: center;
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
                    color: #1e293b;
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
                    background: linear-gradient(135deg, #1e293b, #3b82f6);
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
                }
            `}</style>
        </div>
    );
}
