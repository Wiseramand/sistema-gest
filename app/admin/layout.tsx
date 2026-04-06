'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutContent>{children}</AdminLayoutContent>
  );
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  interface NavItem {
    name: string;
    href: string;
    icon: string;
    responsibility?: string;
    superOnly?: boolean;
  }

  const [isCollapsed, setIsCollapsed] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  if (status === 'loading' && !isLoginPage) return null;
  if (status === 'unauthenticated' && !isLoginPage) {
    router.push('/admin/login');
    return null;
  }

  // Brand Modules Organization
  const navGroups: { label: string; items: NavItem[] }[] = [
    {
      label: 'ALUNOS',
      items: [
        { name: 'Inscrições', href: '/admin/inscriptions', icon: '📝', responsibility: 'inscriptions' },
        { name: 'Alunos', href: '/admin/students', icon: '👥', responsibility: 'students' },
        { name: 'Matrículas', href: '/admin/matriculations', icon: '🖋️', responsibility: 'matriculations' },
        { name: 'Clientes', href: '/admin/companies', icon: '🏢', responsibility: 'companies' },
      ]
    },
    {
      label: 'CURSOS',
      items: [
        { name: 'Catálogo', href: '/admin/courses', icon: '⚓', responsibility: 'courses' },
        { name: 'Turmas', href: '/admin/classes', icon: '🏫', responsibility: 'classes' },
        { name: 'Salas de Aula', href: '/admin/classrooms', icon: '🏛️', responsibility: 'classrooms' },
      ]
    },
    {
      label: 'INSTRUTORES',
      items: [
        { name: 'Formadores', href: '/admin/trainers', icon: '👨‍🏫', responsibility: 'trainers' },
      ]
    },
    {
      label: 'CERTIFICADOS',
      items: [
        { name: 'Emissão / ISPS', href: '/admin/certificates', icon: '🎓', responsibility: 'certificates' },
      ]
    },
    {
      label: 'FINANCEIRO',
      items: [
        { name: 'Pagamentos', href: '/admin/matriculations', icon: '💰', responsibility: 'matriculations' },
      ]
    },
    {
      label: 'RELATÓRIOS',
      items: [
        { name: 'Desempenho', href: '/admin/reports', icon: '📈', responsibility: 'reports' },
        { name: 'Atividades', href: '/admin/activity-logs', icon: '📜', superOnly: true },
      ]
    },
    {
      label: 'CONFIGURAÇÕES',
      items: [
        { name: 'Utilizadores', href: '/admin/admin-users', icon: '🔐', superOnly: true },
        { name: 'Área de Media', href: '/admin/materials', icon: '📁' },
        { name: 'Feedbacks', href: '/admin/feedbacks', icon: '⭐' },
        { name: 'Mensagens', href: '/admin/chat', icon: '💬' },
      ]
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
  const isAuthorizedFinal = isLoginPage || (currentItem?.superOnly ? isSuper : (!currentItem?.responsibility || checkAccess(currentItem!)));

  if (isLoginPage) return <>{children}</>;

  return (
    <div className={`admin-container ${isCollapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <div className="logo-box">
              <div className="logo-icon">⚓</div>
              {!isCollapsed && (
                <div className="logo-text">
                  <h1>Marítimo</h1>
                  <span>Gestão de Formação</span>
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
                <div className="nav-icon-box">
                   <span className="nav-icon">{dashboardItem.icon}</span>
                </div>
                {!isCollapsed && <span className="nav-text">{dashboardItem.name}</span>}
              </Link>
            </div>

            {navGroups.map((group, gIdx) => {
               // Only show group if it has at least one accessible item
               const accessibleItems = group.items.filter(checkAccess);
               if (accessibleItems.length === 0) return null;

               return (
                <div key={gIdx} className="nav-group">
                  {!isCollapsed && <span className="nav-label">{group.label}</span>}
                  {isCollapsed && <div className="nav-divider"></div>}
                  {accessibleItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? item.name : ""}
                      >
                        <div className="nav-icon-box">
                           <span className="nav-icon">{item.icon}</span>
                        </div>
                        {!isCollapsed && <span className="nav-text">{item.name}</span>}
                      </Link>
                    )
                  })}
                </div>
               );
            })}
          </nav>

          <div className="sidebar-footer">
            <Link href="/" className="nav-item secondary" title={isCollapsed ? "Voltar ao Site" : ""}>
              <div className="nav-icon-box small">🏠</div>
              {!isCollapsed && <span className="nav-text">Ir para o Portão</span>}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="nav-item secondary logout-btn"
              title={isCollapsed ? "Sair do Sistema" : ""}
            >
              <div className="nav-icon-box small">🚪</div>
              {!isCollapsed && <span className="nav-text">Terminar Sessão</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <div className="header-left">
            <span className="breadcrumb-prefix">Gestão Marítima</span>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">{allItems.find(i => i.href === pathname)?.name || 'Consola'}</span>
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
              <h2>Acesso Reservado</h2>
              <p>O perfil atual não possui permissões para aceder a <strong>{allItems.find(i => i.href === pathname)?.name}</strong>.</p>
              <p>Contacte um administrador de sistema se acredita ser um erro.</p>
              <Link href="/admin/login" className="back-btn">Regressar ao Login</Link>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        /* ── Marítimo Training Center — Admin Portal ── */
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: #f4f7fb;
          font-family: 'DM Sans', 'Inter', sans-serif;
          padding: 1.25rem;
          gap: 1.25rem;
        }

        /* ── Navy Rail Sidebar ── */
        .sidebar {
          width: 280px;
          background: #0a2a5e;
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          z-index: 1000;
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          position: sticky;
          top: 1.25rem;
          height: calc(100vh - 2.5rem);
          box-shadow: 0 4px 24px rgba(10, 42, 94, 0.18);
          overflow: hidden;
        }

        .collapsed .sidebar {
          width: 85px;
        }

        .sidebar-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        /* ── Sidebar Header / Logo ── */
        .sidebar-header {
          padding: 2rem 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: relative;
          flex-shrink: 0;
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-icon {
          font-size: 1.45rem;
          background: #ffffff;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: #0a2a5e;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .logo-text h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          margin: 0;
          color: #ffffff;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .logo-text span {
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #F5C518;
          font-weight: 700;
          display: block;
          margin-top: 1px;
        }

        .toggle-sidebar {
          position: absolute;
          right: -10px;
          top: 50%;
          transform: translateY(-50%);
          background: #ffffff;
          border: 1px solid #dce6f0;
          color: #0a2a5e;
          cursor: pointer;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          z-index: 1001;
          font-weight: 800;
        }

        .toggle-sidebar:hover {
          background: #F5C518;
          border-color: #F5C518;
        }

        /* ── Navigation ── */
        .sidebar-nav {
          flex: 1;
          padding: 1.25rem 0.85rem;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .sidebar-nav::-webkit-scrollbar { display: none; }

        .nav-group {
          margin-bottom: 1.5rem;
        }

        .nav-label {
          display: block;
          padding: 0 0.85rem 0.5rem;
          font-size: 0.6rem;
          font-weight: 800;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .nav-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0.75rem 0.85rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.7rem 0.85rem;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 12px;
          margin-bottom: 4px;
          font-weight: 500;
          font-size: 0.9rem;
          border: none;
          background: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.9);
        }

        .nav-item.active {
          background: rgba(255,255,255,0.1);
          color: #ffffff;
          font-weight: 600;
        }

        .nav-icon-box {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: transparent;
          margin-right: 0.9rem;
          transition: all 0.25s;
          flex-shrink: 0;
        }

        .nav-item.active .nav-icon-box {
          background: #ffffff;
          color: #0a2a5e;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .collapsed .nav-item.active .nav-icon-box {
           background: #F5C518;
           color: #0a2a5e;
        }

        .nav-icon {
          font-size: 1.15rem;
          opacity: 0.8;
          transition: opacity 0.2s;
        }

        .nav-item.active .nav-icon {
          opacity: 1;
        }

        .nav-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Sidebar Footer ── */
        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }

        .nav-icon-box.small {
          width: 28px;
          height: 28px;
          margin-right: 0.85rem;
          font-size: 1rem;
          opacity: 0.6;
        }

        .nav-item.secondary {
          color: rgba(255,255,255,0.4);
        }

        .nav-item.secondary:hover {
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.05);
        }

        .logout-btn:hover {
          background: rgba(253, 232, 232, 0.1) !important;
          color: #ff8585 !important;
        }

        /* ── Content Area ── */
        .admin-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #dce6f0;
          overflow: hidden;
          min-width: 0;
          box-shadow: 0 4px 20px rgba(10, 42, 94, 0.04);
        }

        /* ── Top Header ── */
        .admin-header {
          height: 72px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          border-bottom: 1px solid #f0f4f8;
          flex-shrink: 0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .breadcrumb-prefix {
          font-size: 0.85rem;
          color: #6b7ea0;
          font-weight: 500;
        }

        .breadcrumb-sep {
          color: #dce6f0;
          font-size: 0.9rem;
        }

        .breadcrumb-current {
          font-size: 0.9rem;
          color: #0a2a5e;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.4rem 1rem 0.4rem 0.6rem;
          border-radius: 50px;
          background: #f8fafc;
          border: 1px solid #edf2f7;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-profile:hover {
          border-color: #cbd5e0;
          background: #f1f5f9;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.2;
        }

        .user-name {
          font-weight: 700;
          font-size: 0.88rem;
          color: #0f1e35;
        }

        .user-role {
          font-size: 0.62rem;
          font-weight: 800;
          color: #0a2a5e;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: #F5C518;
          padding: 0.1rem 0.45rem;
          border-radius: 4px;
          margin-top: 3px;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #0a2a5e;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1rem;
          font-family: 'Outfit', sans-serif;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(10, 42, 94, 0.2);
        }

        /* ── Page Content ── */
        .content-inner {
          padding: 2.5rem;
          flex: 1;
          overflow-y: auto;
        }

        /* ── Access Denied ── */
        .access-denied {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 450px;
          text-align: center;
          gap: 1.25rem;
        }

        .denied-icon {
          font-size: 4rem;
          margin-bottom: 0.5rem;
        }

        .access-denied h2 {
          color: #0a2a5e;
          font-family: 'Outfit', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
        }

        .access-denied p {
          color: #6b7ea0;
          max-width: 450px;
          line-height: 1.7;
          font-size: 1.05rem;
        }

        .back-btn {
          display: inline-block;
          margin-top: 0.75rem;
          background: #0a2a5e;
          color: white;
          padding: 0.85rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          transition: all 0.3s ease;
          font-family: 'DM Sans', sans-serif;
        }

        .back-btn:hover {
          background: #1a4fa0;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(10, 42, 94, 0.2);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .admin-container { padding: 0.75rem; gap: 0.75rem; }
          .sidebar { width: 85px; border-radius: 14px; }
          .nav-text, .nav-label, .logo-text, .user-info { display: none; }
          .nav-item { justify-content: center; padding: 0.75rem; }
          .nav-icon-box { margin-right: 0; }
          .admin-content { border-radius: 14px; }
          .admin-header { padding: 0 1.5rem; }
        }
      `}</style>
    </div>
  );
}
