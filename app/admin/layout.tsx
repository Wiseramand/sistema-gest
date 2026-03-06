'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import LoadingOverlay from '../components/LoadingOverlay';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Artificial delay to ensure a smooth transition and prevent layout flash
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  const isLoading = status === 'loading' || isAppLoading;

  interface NavItem {
    name: string;
    href: string;
    icon: string;
    responsibility?: string;
    superOnly?: boolean;
  }

  const [isCollapsed, setIsCollapsed] = useState(false);

  const navGroups: { label: string; items: NavItem[] }[] = [
    {
      label: 'GESTÃO ACADÉMICA',
      items: [
        { name: 'Inscrições', href: '/admin/inscriptions', icon: '📝', responsibility: 'inscriptions' },
        { name: 'Alunos', href: '/admin/students', icon: '👥', responsibility: 'students' },
        { name: 'Clientes', href: '/admin/companies', icon: '🏢', responsibility: 'companies' },
        { name: 'Matrículas', href: '/admin/matriculations', icon: '🖋️', responsibility: 'matriculations' },
      ]
    },
    {
      label: 'CURSOS E INFRAESTRUTURA',
      items: [
        { name: 'Cursos', href: '/admin/courses', icon: '⚓', responsibility: 'courses' },
        { name: 'Formações', href: '/admin/classes', icon: '🏫', responsibility: 'classes' },
        { name: 'Salas de Aula', href: '/admin/classrooms', icon: '🏛️', responsibility: 'classrooms' },
      ]
    },
    {
      label: 'DOCENTES',
      items: [
        { name: 'Formadores', href: '/admin/trainers', icon: '👨‍🏫', responsibility: 'trainers' },
      ]
    },
    {
      label: 'SISTEMA E RELATÓRIOS',
      items: [
        { name: 'Certificados', href: '/admin/certificates', icon: '🎓', responsibility: 'certificates' },
        { name: 'Área de Media', href: '/admin/materials', icon: '📁' },
        { name: 'Mensagens', href: '/admin/chat', icon: '💬' },
        { name: 'Registo de Atividades', href: '/admin/activity-logs', icon: '📜', superOnly: true },
        { name: 'Relatórios', href: '/admin/reports', icon: '📈', responsibility: 'reports' },
        { name: 'Feedbacks', href: '/admin/feedbacks', icon: '⭐' },
        { name: 'Gestão de Utilizador', href: '/admin/admin-users', icon: '🔐', superOnly: true },]
    }
  ];

  const dashboardItem: NavItem = { name: 'Dashboard', href: '/admin', icon: '📊', superOnly: false };

  const user = session?.user as any;
  const isSuper = user?.role === 'SUPER_ADMIN';
  const userResponsibilities = user?.responsibilities || [];

  const checkAccess = (item: NavItem) => {
    if (isSuper) return true;
    if (item.superOnly) return false;
    if (!item.responsibility) return true;
    return userResponsibilities.includes(item.responsibility);
  };

  const allItems: NavItem[] = [dashboardItem, ...navGroups.flatMap(g => g.items)];
  const currentItem = allItems.find(i => i.href === pathname);
  const isAuthorizedFinal = currentItem?.superOnly ? isSuper : (!currentItem?.responsibility || checkAccess(currentItem));

  return (
    <div className={`admin-container ${isCollapsed ? 'collapsed' : ''}`}>
      {isLoading && <LoadingOverlay />}
      <aside className="sidebar">
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <div className="logo-box">
              <span className="logo-icon">⚓</span>
              {!isCollapsed && (
                <div className="logo-text">
                  <h1>Maritimo</h1>
                  <span>Admin Center</span>
                </div>
              )}
            </div>
            <button
              className="toggle-sidebar"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
            >
              {isCollapsed ? '❯' : '❮'}
            </button>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-group">
              <Link
                href={dashboardItem.href}
                className={`nav-item ${pathname === dashboardItem.href ? 'active' : ''}`}
                title={isCollapsed ? dashboardItem.name : ""}
              >
                <span className="nav-icon">{dashboardItem.icon}</span>
                {!isCollapsed && <span className="nav-text">{dashboardItem.name}</span>}
                {pathname === dashboardItem.href && <span className="active-indicator"></span>}
              </Link>
            </div>

            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="nav-group">
                {!isCollapsed && <span className="nav-label">{group.label}</span>}
                {isCollapsed && <div className="nav-divider"></div>}
                {group.items.filter(checkAccess).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                    title={isCollapsed ? item.name : ""}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!isCollapsed && <span className="nav-text">{item.name}</span>}
                    {pathname === item.href && <span className="active-indicator"></span>}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <Link href="/" className="nav-item secondary" title={isCollapsed ? "Voltar ao Site" : ""}>
              <span className="nav-icon">🏠</span>
              {!isCollapsed && <span className="nav-text">Voltar ao Site</span>}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="nav-item secondary logout-btn"
              title={isCollapsed ? "Sair do Sistema" : ""}
            >
              <span className="nav-icon">🚪</span>
              {!isCollapsed && <span className="nav-text">Sair do Sistema</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <div className="header-left">
            <span className="breadcrumb">Administração / {allItems.find(i => i.href === pathname)?.name || 'Geral'}</span>
          </div>

          <div className="header-right">
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{session?.user?.name || 'Administrador'}</span>
                <span className="user-role">{(session?.user as any)?.role || 'Admin'}</span>
              </div>
              <div className="avatar">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="content-inner">
          {isAuthorizedFinal ? children : (
            <div className="access-denied">
              <div className="denied-icon">🚫</div>
              <h2>Acesso Restrito</h2>
              <p>Não tem as responsabilidades necessárias para aceder a esta secção (<strong>{allItems.find(i => i.href === pathname)?.name}</strong>).</p>
              <p>Contacte um Super Administrador para solicitar acesso.</p>
              <Link href="/admin" className="back-btn">Voltar ao Painel</Link>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background-color: #f4f7f9;
          font-family: 'Inter', sans-serif;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 280px;
          background-color: #001f3f; /* Deep Navy */
          color: white;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 10px rgba(0,0,0,0.1);
          z-index: 1000;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          height: 100vh;
          overflow: visible; /* To allow the arrow to overlap */
        }

        .collapsed .sidebar {
          width: 80px;
        }

        /* Sidebar Inner Content - This handles the sticky behavior */
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
          overflow: hidden;
        }

        .toggle-sidebar {
          position: absolute;
          right: -12px;
          top: 25px;
          background: #0074d9;
          border: 2px solid #001f3f;
          color: white;
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          z-index: 1001;
        }

        .toggle-sidebar:hover {
          background: var(--sand-gold);
          color: #001f3f;
          transform: scale(1.2);
        }

        .collapsed .sidebar-header {
           padding: 2rem 1rem;
           flex-direction: column;
           gap: 1.5rem;
        }

        .logo-icon {
          font-size: 2rem;
          background: var(--sand-gold);
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .logo-text h1 {
          font-size: 1.25rem;
          margin: 0;
          letter-spacing: 1px;
          color: white;
          font-weight: 800;
          white-space: nowrap;
        }

        .logo-text span {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.5);
          font-weight: 600;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0;
          overflow-y: auto;
          scrollbar-width: auto;
          scrollbar-color: rgba(255,255,255,0.2) transparent;
        }

        .sidebar-nav::-webkit-scrollbar {
          width: 8px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          border: 2px solid #001f3f;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.3);
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-label {
          padding: 1.5rem 1.5rem 0.5rem;
          font-size: 0.6rem;
          font-weight: 800;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          display: block;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.85rem 1.5rem;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          font-weight: 500;
          border-left: 4px solid transparent;
        }

        .nav-icon {
          margin-right: 1rem;
          font-size: 1.2rem;
          width: 24px;
          text-align: center;
        }

        .nav-text {
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.3s;
        }

        .nav-item:hover {
          color: white;
          background-color: rgba(255,255,255,0.1);
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .collapsed .nav-item:hover {
          transform: scale(1.1);
        }

        .collapsed .nav-item {
          justify-content: center;
          padding: 1rem;
          border-left-width: 0;
        }

        .collapsed .nav-icon {
          margin: 0;
        }

        .nav-divider {
            height: 1px;
            background: rgba(255,255,255,0.05);
            margin: 0.5rem 1.5rem;
        }

        .nav-item.active {
          color: white;
          background-color: rgba(0, 116, 217, 0.15);
          border-left-color: var(--ocean-blue);
          font-weight: 600;
        }

        .active-indicator {
          position: absolute;
          right: 0;
          width: 4px;
          height: 20px;
          background-color: var(--ocean-blue);
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
          overflow: hidden;
        }

        .collapsed .logout-btn {
          width: 45px;
          height: 45px;
          margin: 0.5rem auto;
          padding: 0;
          justify-content: center;
        }

        .logout-btn:hover {
          background: linear-gradient(135deg, #ff5a50 0%, #e64a45 100%) !important;
          box-shadow: 0 6px 16px rgba(255, 65, 54, 0.35);
          transform: translateY(-2px) scale(1.02);
          color: white !important;
        }

        .logout-btn:active {
          transform: translateY(0) scale(0.98);
        }

        /* Content Area */
        .admin-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          margin-left: 280px;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .collapsed .admin-content {
          margin-left: 80px;
        }

        .admin-header {
          height: 75px;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          box-shadow: 0 2px 5px rgba(0,0,0,0.02);
          z-index: 50;
        }

        .breadcrumb {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50px;
          transition: background 0.3s ease;
        }

        .user-profile:hover {
          background-color: #f8f9fa;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-name {
          font-weight: 700;
          font-size: 0.9rem;
          color: #1e293b;
        }

        .user-role {
          font-size: 0.7rem;
          font-weight: 700;
          color: #0ea5e9;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(45deg, #001f3f, #0074d9);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .content-inner {
          padding: 2.5rem;
          flex: 1;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .access-denied {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 5rem 2rem;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          margin-top: 2rem;
        }

        .denied-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .access-denied h2 {
          font-size: 2rem;
          color: var(--navy-deep);
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .access-denied p {
          color: #64748b;
          margin-bottom: 0.5rem;
          max-width: 400px;
        }

        .back-btn {
          margin-top: 2rem;
          background: var(--navy-deep);
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          transition: 0.2s;
        }

        .back-btn:hover {
          background: var(--ocean-blue);
          transform: translateY(-2px);
        }

        /* Tooltip Simulation for Collapsed Mode */
        .collapsed .nav-item[title]::after {
           content: attr(title);
           position: absolute;
           left: 100%;
           top: 50%;
           transform: translateY(-50%) translateX(20px);
           background: rgba(0, 31, 63, 0.95); /* Deep Navy */
           backdrop-filter: blur(8px);
           color: white;
           padding: 0.6rem 1rem;
           border-radius: 8px;
           font-size: 0.85rem;
           font-weight: 600;
           white-space: nowrap;
           opacity: 0;
           pointer-events: none;
           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
           z-index: 2000;
           box-shadow: 0 10px 25px rgba(0,0,0,0.3);
           border: 1px solid rgba(255,255,255,0.1);
        }

        .collapsed .nav-item:hover[title]::after {
           opacity: 1;
           transform: translateY(-50%) translateX(10px);
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 80px;
          }
          .nav-text, .nav-label, .logo-text, .user-info {
            display: none;
          }
          .sidebar-header, .nav-item {
            justify-content: center;
            padding: 1rem;
          }
          .nav-icon {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
