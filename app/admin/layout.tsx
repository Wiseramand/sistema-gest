'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

// ── SVG Icons ────────────────────────────────────────────────
function IconDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor"/>
    </svg>
  );
}
function IconAlunos() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6" r="3.5" fill="currentColor"/>
      <path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconCursos() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="7" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="13" x2="10" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconCertificados() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L11.8 7.2H17.2L12.7 10.4L14.5 15.6L10 12.4L5.5 15.6L7.3 10.4L2.8 7.2H8.2L10 2Z" fill="currentColor"/>
    </svg>
  );
}
function IconFinanceiro() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="10" y1="6" x2="10" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 8.5c0-.828.672-1.5 1.5-1.5h1c.828 0 1.5.672 1.5 1.5s-.672 1-1.5 1H9.5c-.828 0-1.5.422-1.5 1.25S8.672 12.5 9.5 12.5h1c.828 0 1.5-.672 1.5-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function IconRelatorios() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="10" width="3" height="7" rx="1" fill="currentColor"/>
      <rect x="8.5" y="6" width="3" height="11" rx="1" fill="currentColor"/>
      <rect x="14" y="3" width="3" height="14" rx="1" fill="currentColor"/>
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.1 4.1l1.06 1.06M14.84 14.84l1.06 1.06M4.1 15.9l1.06-1.06M14.84 5.16l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconAnchor() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="2.5" stroke="#0a2a5e" strokeWidth="2"/>
      <line x1="12" y1="7.5" x2="12" y2="19" stroke="#0a2a5e" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 12H5a7 7 0 0014 0h-2" stroke="#0a2a5e" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="8.5" x2="16" y2="8.5" stroke="#0a2a5e" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function IconSignOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
      <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3M13 14l4-4m0 0l-4-4m4 4H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconHome() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
      <path d="M10 3L3 10h2v7h4v-4h2v4h4v-7h2L10 3z" fill="currentColor"/>
    </svg>
  );
}
function IconSquare() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2" fill="currentColor" fillOpacity="0.6"/>
    </svg>
  );
}
function IconGridMini() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor"/>
    </svg>
  );
}

// ── Types ────────────────────────────────────────────────────
interface FlyoutItem {
  name: string;
  href: string;
  responsibility?: string;
  superOnly?: boolean;
  badge?: string | null;
  badgeAlert?: string;
}
interface FlyoutGroup {
  label: string;
  items: FlyoutItem[];
}

// ── Rail Module Data ─────────────────────────────────────────
const TOP_MODULES = [
  'dashboard', 'alunos', 'cursos', 'certificados'
];
const BOTTOM_MODULES = ['financeiro', 'relatorios'];

const MODULE_FLYOUTS: Record<string, { label: string; groups: FlyoutGroup[] }> = {
  dashboard: { label: 'Dashboard', groups: [] },
  alunos: {
    label: 'Alunos',
    groups: [
      {
        label: 'GESTÃO',
        items: [
          { name: 'Inscrições', href: '/admin/inscriptions', responsibility: 'inscriptions' },
          { name: 'Lista de Alunos', href: '/admin/students', responsibility: 'students' },
          { name: 'Matrículas', href: '/admin/matriculations', responsibility: 'matriculations' },
        ],
      },
      {
        label: 'EMPRESAS',
        items: [
          { name: 'Clientes', href: '/admin/companies', responsibility: 'companies' },
        ],
      },
    ],
  },
  cursos: {
    label: 'Cursos',
    groups: [
      {
        label: 'GESTÃO',
        items: [
          { name: 'Turmas ativas', href: '/admin/classes', badge: '12', responsibility: 'classes' },
          { name: 'Calendário', href: '/admin/courses', responsibility: 'courses' },
          { name: 'Salas de Aula', href: '/admin/classrooms', responsibility: 'classrooms' },
        ],
      },
      {
        label: 'ALUNOS',
        items: [
          { name: 'Matrículas', href: '/admin/matriculations', badge: '47', responsibility: 'matriculations' },
          { name: 'Frequência', href: '/admin/matriculations', responsibility: 'matriculations' },
          { name: 'Pendências', href: '/admin/inscriptions', badgeAlert: '3', responsibility: 'inscriptions' },
        ],
      },
      {
        label: 'INSTRUTORES',
        items: [
          { name: 'Formadores', href: '/admin/trainers', responsibility: 'trainers' },
        ],
      },
    ],
  },
  certificados: {
    label: 'Certificados',
    groups: [
      {
        label: 'CERTIFICAÇÃO',
        items: [
          { name: 'Emitir certificado', href: '/admin/certificates', responsibility: 'certificates' },
          { name: 'Validar STCW', href: '/admin/certificates', responsibility: 'certificates' },
          { name: 'Arquivo', href: '/admin/certificates', responsibility: 'certificates' },
        ],
      },
    ],
  },
  financeiro: {
    label: 'Financeiro',
    groups: [
      {
        label: 'FINANCEIRO',
        items: [
          { name: 'Pagamentos', href: '/admin/matriculations', responsibility: 'matriculations' },
          { name: 'Faturas', href: '/admin/matriculations', responsibility: 'matriculations' },
          { name: 'Pendentes', href: '/admin/inscriptions', responsibility: 'inscriptions' },
        ],
      },
    ],
  },
  relatorios: {
    label: 'Relatórios',
    groups: [
      {
        label: 'RELATÓRIOS',
        items: [
          { name: 'Desempenho', href: '/admin/reports', responsibility: 'reports' },
          { name: 'Atividades', href: '/admin/activity-logs', superOnly: true },
        ],
      },
    ],
  },
  config: {
    label: 'Configurações',
    groups: [
      {
        label: 'SISTEMA',
        items: [
          { name: 'Utilizadores', href: '/admin/admin-users', superOnly: true },
          { name: 'Área de Media', href: '/admin/materials' },
          { name: 'Feedbacks', href: '/admin/feedbacks' },
          { name: 'Mensagens', href: '/admin/chat' },
        ],
      },
    ],
  },
};

// ── Main Export ──────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeModule, setActiveModule] = useState('cursos');

  const isLoginPage = pathname === '/admin/login';

  if (status === 'loading' && !isLoginPage) return null;
  if (status === 'unauthenticated' && !isLoginPage) {
    router.push('/admin/login');
    return null;
  }
  if (isLoginPage) return <>{children}</>;

  const user = session?.user as any;
  const isSuper = user?.role === 'SUPER_ADMIN';
  const userResponsibilities: string[] = user?.responsibilities || [];

  const checkAccess = (item: FlyoutItem) => {
    if (isSuper) return true;
    if (item.superOnly) return false;
    if (!item.responsibility) return true;
    return userResponsibilities.includes(item.responsibility);
  };

  const currentFlyout = MODULE_FLYOUTS[activeModule] ?? MODULE_FLYOUTS['cursos'];
  const flyoutGroups = currentFlyout.groups;

  // Breadcrumb: find active page name in flyouts
  let currentPageName = '';
  for (const mod of Object.values(MODULE_FLYOUTS)) {
    for (const grp of mod.groups) {
      const found = grp.items.find(i => i.href === pathname);
      if (found) { currentPageName = found.name; break; }
    }
    if (currentPageName) break;
  }

  const railIconMap: Record<string, React.ReactNode> = {
    dashboard: <IconDashboard />,
    alunos: <IconAlunos />,
    cursos: <IconCursos />,
    certificados: <IconCertificados />,
    financeiro: <IconFinanceiro />,
    relatorios: <IconRelatorios />,
  };

  return (
    <div className="admin-wrap">

      {/* ── RAIL (58px) ─────────────────────────────── */}
      <div className="rail">
        {/* Logo */}
        <div className="rail-logo">
          <IconAnchor />
        </div>

        {/* Top modules */}
        <div className="rail-modules">
          {TOP_MODULES.map(id => (
            <button
              key={id}
              className={`rail-btn${activeModule === id ? ' active' : ''}`}
              onClick={() => setActiveModule(id)}
              title={MODULE_FLYOUTS[id]?.label}
            >
              {railIconMap[id]}
            </button>
          ))}

          <div className="rail-sep" />

          {BOTTOM_MODULES.map(id => (
            <button
              key={id}
              className={`rail-btn${activeModule === id ? ' active' : ''}`}
              onClick={() => setActiveModule(id)}
              title={MODULE_FLYOUTS[id]?.label}
            >
              {railIconMap[id]}
            </button>
          ))}
        </div>

        {/* Rail Footer */}
        <div className="rail-footer">
          <button
            className={`rail-btn secondary${activeModule === 'config' ? ' active' : ''}`}
            onClick={() => setActiveModule('config')}
            title="Configurações"
          >
            <IconSettings />
          </button>
          <div className="rail-avatar" title={session?.user?.name || 'Admin'}>
            {(session?.user?.name || 'AM').slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── FLYOUT (200px) ──────────────────────────── */}
      <div className="flyout">
        <div className="flyout-hdr">
          <span className="flyout-pre">Módulo</span>
          <span className="flyout-title">{currentFlyout.label}</span>
        </div>

        <nav className="flyout-nav">
          {activeModule === 'dashboard' ? (
            <Link
              href="/admin"
              className={`flyout-item${pathname === '/admin' ? ' active' : ''}`}
            >
              <div className="flyout-icon"><IconGridMini /></div>
              <span className="flyout-label">Visão Geral</span>
            </Link>
          ) : (
            flyoutGroups.map((group, gi) => (
              <div key={gi} className="flyout-group">
                <span className="flyout-group-lbl">{group.label}</span>
                {group.items.filter(checkAccess).map((item, ii) => (
                  <Link
                    key={ii}
                    href={item.href}
                    className={`flyout-item${pathname === item.href ? ' active' : ''}`}
                  >
                    <div className="flyout-icon"><IconSquare /></div>
                    <span className="flyout-label">{item.name}</span>
                    {item.badge && <span className="flyout-badge">{item.badge}</span>}
                    {item.badgeAlert && <span className="flyout-badge alert">{item.badgeAlert}</span>}
                  </Link>
                ))}
              </div>
            ))
          )}
        </nav>

        <div className="flyout-foot">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flyout-action"
          >
            <IconSignOut /> Sair
          </button>
          <Link href="/" className="flyout-action">
            <IconHome /> Site
          </Link>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────── */}
      <main className="content">
        <div className="content-hdr">
          <div className="breadcrumb">
            <span>{currentFlyout.label}</span>
            {currentPageName && (
              <>
                <span className="bc-sep">›</span>
                <span className="bc-active">{currentPageName}</span>
              </>
            )}
          </div>
          <div className="hdr-user">
            <span className="user-name">{session?.user?.name || 'Administrador'}</span>
            <span className="user-badge">{isSuper ? 'SUPER ADMIN' : 'ADMIN'}</span>
          </div>
        </div>

        <div className="content-body">
          {children}
        </div>
      </main>

      <style jsx>{`
        /* ── Container ─────────────────────────────────── */
        .admin-wrap {
          display: flex;
          min-height: 100vh;
          background: #f4f7fb;
          font-family: 'DM Sans', 'Inter', sans-serif;
          padding: 1.25rem;
          gap: 0;
        }

        /* ── Rail (58px) ───────────────────────────────── */
        .rail {
          width: 58px;
          background: #0a2a5e;
          border-radius: 14px 0 0 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 14px 0;
          flex-shrink: 0;
          position: sticky;
          top: 1.25rem;
          height: calc(100vh - 2.5rem);
        }

        .rail-logo {
          width: 34px;
          height: 34px;
          background: #F5C518;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          flex-shrink: 0;
        }

        .rail-modules {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 100%;
          padding: 0 10px;
        }

        .rail-btn {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.2s ease;
        }

        .rail-btn:hover {
          background: rgba(255, 255, 255, 0.10);
          color: rgba(255, 255, 255, 0.9);
        }

        .rail-btn.active {
          background: #ffffff;
          color: #0a2a5e;
        }

        .rail-btn.secondary {
          color: rgba(255, 255, 255, 0.4);
        }

        .rail-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.07);
          color: rgba(255, 255, 255, 0.7);
        }

        .rail-btn.secondary.active {
          background: #ffffff;
          color: #0a2a5e;
        }

        .rail-sep {
          width: 24px;
          height: 0.5px;
          background: rgba(255, 255, 255, 0.12);
          margin: 8px 0;
          flex-shrink: 0;
        }

        .rail-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          flex-shrink: 0;
        }

        .rail-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0ea5e9, #1a4fa0);
          color: #ffffff;
          font-size: 10px;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: default;
          letter-spacing: 0.5px;
        }

        /* ── Flyout (200px) ────────────────────────────── */
        .flyout {
          width: 200px;
          background: #ffffff;
          border-right: 0.5px solid rgba(0, 0, 0, 0.07);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: sticky;
          top: 1.25rem;
          height: calc(100vh - 2.5rem);
          overflow: hidden;
        }

        .flyout-hdr {
          padding: 16px;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
          flex-shrink: 0;
        }

        .flyout-pre {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #94a3b8;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .flyout-title {
          display: block;
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #0a2a5e;
          letter-spacing: -0.02em;
        }

        .flyout-nav {
          flex: 1;
          overflow-y: auto;
          padding: 12px 8px;
          scrollbar-width: none;
        }

        .flyout-nav::-webkit-scrollbar { display: none; }

        .flyout-group {
          margin-bottom: 16px;
        }

        .flyout-group-lbl {
          display: block;
          font-size: 9.5px;
          text-transform: uppercase;
          letter-spacing: 0.10em;
          color: #c0c8d4;
          font-weight: 600;
          padding: 0 8px 6px;
        }

        .flyout-item {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px;
          border-radius: 7px;
          text-decoration: none;
          transition: background 0.15s;
          margin-bottom: 1px;
          width: 100%;
          cursor: pointer;
        }

        .flyout-item:hover { background: #f8fafc; }

        .flyout-item.active { background: #e8f0fb; }

        .flyout-item.active .flyout-label {
          color: #0a2a5e;
          font-weight: 500;
        }

        .flyout-item.active .flyout-icon {
          background: #0a2a5e;
          color: #ffffff;
        }

        .flyout-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .flyout-label {
          font-size: 13px;
          color: #475569;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1;
        }

        .flyout-badge {
          font-size: 10px;
          background: #f1f5f9;
          color: #94a3b8;
          padding: 2px 5px;
          border-radius: 4px;
          font-weight: 500;
          flex-shrink: 0;
        }

        .flyout-badge.alert {
          background: #fef2f2;
          color: #dc2626;
        }

        .flyout-foot {
          padding: 10px 8px;
          border-top: 0.5px solid rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex-shrink: 0;
        }

        .flyout-action {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 7px;
          font-size: 12px;
          color: #94a3b8;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: none;
          width: 100%;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .flyout-action:hover {
          background: #f8fafc;
          color: #475569;
        }

        /* ── Content ───────────────────────────────────── */
        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #f4f7fb;
          border-radius: 0 14px 14px 0;
          overflow: hidden;
          min-width: 0;
        }

        .content-hdr {
          background: #ffffff;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #94a3b8;
        }

        .bc-sep { color: #dce6f0; }

        .bc-active {
          color: #334155;
          font-weight: 500;
        }

        .hdr-user {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-name {
          font-size: 13px;
          font-weight: 500;
          color: #0f1e35;
        }

        .user-badge {
          font-size: 9px;
          font-weight: 600;
          color: #0a2a5e;
          background: #F5C518;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .content-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        /* ── Responsive ────────────────────────────────── */
        @media (max-width: 1024px) {
          .admin-wrap { padding: 0.75rem; }
          .flyout { width: 160px; }
        }

        @media (max-width: 768px) {
          .flyout { display: none; }
          .rail { border-radius: 14px; }
          .content { border-radius: 14px; }
        }
      `}</style>
    </div>
  );
}
