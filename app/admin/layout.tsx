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
          background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
          font-family: 'Outfit', 'Inter', sans-serif;
          padding: 1.5rem; /* The requested margin from screen edges */
          gap: 1.5rem;
        }

        /* Sidebar Styles (Floating) */
        .sidebar {
          width: 280px;
          background: rgba(0, 31, 63, 0.95); /* Deep Navy with Glass */
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
          border-bottom: 1px solid rgba(255,255,255,0.08);
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
          background: #eab308; /* Sand Gold */
          border: 3px solid #001f3f;
          color: #001f3f;
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 900;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          z-index: 1001;
        }

        .toggle-sidebar:hover {
          transform: translateY(-50%) scale(1.2);
          background: white;
        }

        .logo-icon {
          font-size: 1.8rem;
          background: #eab308;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          box-shadow: 0 8px 16px rgba(234, 179, 8, 0.25);
          flex-shrink: 0;
        }

        .logo-text h1 {
          font-size: 1.2rem;
          margin: 0;
          letter-spacing: 0.5px;
          color: white;
          font-weight: 800;
          white-space: nowrap;
        }

        .logo-text span {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.4);
          font-weight: 700;
          display: block;
          margin-top: 2px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 2rem 0.75rem;
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
          margin-bottom: 1.5rem;
        }

        .nav-label {
          padding: 0 1.25rem 0.75rem;
          font-size: 0.65rem;
          font-weight: 800;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.85rem 1.25rem;
          color: rgba(255,255,255,0.65);
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
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-text {
          white-space: nowrap;
          transition: opacity 0.3s;
        }

        .nav-item:hover {
          color: white;
          background-color: rgba(255,255,255,0.08);
          padding-left: 1.5rem;
        }

        .nav-item.active {
          color: #001f3f;
          background: #eab308;
          font-weight: 700;
          box-shadow: 0 8px 20px rgba(234, 179, 8, 0.3);
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
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .logout-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 30px rgba(239, 68, 68, 0.3);
        }

        /* Content Area (Floating Card) */
        .admin-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: white;
          border-radius: 28px;
          box-shadow: 0 15px 50px rgba(0,0,0,0.08);
          overflow: hidden;
          position: relative;
        }

        .admin-header {
          height: 85px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 3rem;
          border-bottom: 1px solid #f1f5f9;
          z-index: 99;
          position: sticky;
          top: 0;
        }

        .breadcrumb {
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: #f8fafc;
          padding: 0.6rem 1.2rem;
          border-radius: 50px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .user-profile:hover {
          background: #f1f5f9;
          transform: translateY(-2px);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-name {
          font-weight: 800;
          font-size: 0.95rem;
          color: #1e293b;
        }

        .user-role {
          font-size: 0.65rem;
          font-weight: 800;
          color: #eab308;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #001f3f, #0074d9);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }

        .content-inner {
          padding: 3rem;
          flex: 1;
          overflow-y: auto;
        }

        /* Access Denied */
        .access-denied {
          text-align: center;
          padding: 5rem 2rem;
        }

        .denied-icon { font-size: 4rem; margin-bottom: 1rem; }
        .back-btn {
          display: inline-block;
          margin-top: 2rem;
          background: #001f3f;
          color: white;
          padding: 1rem 2.5rem;
          border-radius: 16px;
          text-decoration: none;
          font-weight: 800;
          transition: 0.3s;
        }
        .back-btn:hover { background: #eab308; color: #001f3f; transform: translateY(-3px); }

        @media (max-width: 1024px) {
          .admin-container { padding: 1rem; }
          .admin-header { padding: 0 1.5rem; }
          .content-inner { padding: 2rem; }
        }

        @media (max-width: 768px) {
          .sidebar { width: 85px; }
          .nav-text, .nav-label, .logo-text, .user-info { display: none; }
          .toggle-sidebar { display: none; }
          .nav-icon { margin: 0; }
          .nav-item { justify-content: center; }
        }
      `}</style>
    </div>
  );
}
