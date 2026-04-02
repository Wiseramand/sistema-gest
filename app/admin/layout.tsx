'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

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
  const isAuthorizedFinal = isLoginPage || (currentItem?.superOnly ? isSuper : (!currentItem?.responsibility || checkAccess(currentItem!)));

  if (isLoginPage) return <>{children}</>;

  return (
    <div className={`admin-container ${isCollapsed ? 'collapsed' : ''}`}>
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
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
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
              <Link href="/admin/login" className="back-btn">Ir para o Login</Link>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-family: 'Outfit', 'Inter', sans-serif;
          padding: 1.5rem;
          gap: 1.5rem;
        }

        /* Modern White Sidebar */
        .sidebar {
          width: 280px;
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

        .collapsed .sidebar {
          width: 85px;
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
          position: relative;
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .toggle-sidebar {
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #64748b;
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          z-index: 1001;
        }

        .toggle-sidebar:hover {
          background: #f8fafc;
          color: #001f3f;
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
          font-size: 1.2rem;
          margin: 0;
          color: #001f3f;
          font-weight: 800;
        }

        .logo-text span {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
          font-weight: 700;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0.75rem;
          overflow-y: auto;
        }

        .nav-group {
          margin-bottom: 1.25rem;
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
          font-size: 1.25rem;
          width: 24px;
          text-align: center;
          opacity: 0.7;
        }

        .nav-item:hover {
          background-color: #f8fafc;
          color: #001f3f;
        }

        .nav-item.active {
          color: #ca8a04;
          background: #fefce8;
          font-weight: 700;
          border-left-color: #eab308;
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
          background: #fef2f2;
          color: #ef4444;
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
          background: #fee2e2;
          transform: translateY(-2px);
        }

        /* Content Area (Clean White Card) */
        .admin-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 28px;
          box-shadow: 0 4px 30px rgba(0,0,0,0.02);
          border: 1px solid #f1f5f9;
          overflow: hidden;
        }

        .admin-header {
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
        .user-role { font-size: 0.65rem; font-weight: 700; color: #eab308; text-transform: uppercase; }

        .avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #001f3f;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
        }

        .content-inner {
          padding: 2.5rem;
          flex: 1;
          overflow-y: auto;
        }

        @media (max-width: 1024px) {
          .admin-container { padding: 1rem; }
          .admin-content { border-radius: 20px; }
          .sidebar { width: 85px; }
          .nav-text, .nav-label, .logo-text, .user-info { display: none; }
          .nav-item { justify-content: center; }
          .nav-icon { margin: 0; }
        }
      `}</style>
    </div>
  );
}
