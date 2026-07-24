'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

// ── SVG Icons ────────────────────────────────────────────────
function IconClass() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M16 10c0 3.866-3.582 7-8 7l-4 2 1-3.5C2.866 14 1 12.163 1 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconProfile() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6" r="3.5" fill="currentColor"/>
      <path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconAnchor() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="2.5" stroke="#2D180F" strokeWidth="2"/>
      <line x1="12" y1="7.5" x2="12" y2="19" stroke="#2D180F" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 12H5a7 7 0 0014 0h-2" stroke="#2D180F" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="8.5" x2="16" y2="8.5" stroke="#2D180F" strokeWidth="2" strokeLinecap="round"/>
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  );
}

function getFlyoutIcon(itemName: string) {
  const name = itemName.toLowerCase();
  
  if (name.includes('inscri')) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
  }
  if (name.includes('aluno')) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  }
  if (name.includes('matríc') || name.includes('matric')) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
  }
  if (name.includes('client') || name.includes('empres')) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
  }
  if (name.includes('turma') || name.includes('formador') || name.includes('instrutor')) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
  }
  if (name.includes('calend') || name.includes('curso')) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  }
  if (name.includes('sala')) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
  }
  if (name.includes('frequ') || name.includes('pend')) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  }
  if (name.includes('certif') || name.includes('stcw') || name.includes('arquiv')) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15l-2 5l9-9l-9-9l2 5l-9 9z" transform="rotate(-45 12 12)"/></svg>;
  }
  if (name.includes('pagament') || name.includes('fat') || name.includes('finan')) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
  }
  if (name.includes('desemp') || name.includes('relat') || name.includes('ativ') || name.includes('avali')) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
  }
  if (name.includes('utiliz') || name.includes('config') || name.includes('media') || name.includes('mensag') || name.includes('feed') || name.includes('materiais') || name.includes('detalh') || name.includes('chat') || name.includes('suport') || name.includes('conta')) {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
  }
  
  return <IconSquare />;
}

// ── Types ────────────────────────────────────────────────────
interface FlyoutItem {
  name: string;
  href: string;
  badge?: string | null;
}
interface FlyoutGroup {
  label: string;
  items: FlyoutItem[];
}

// ── Rail Module Data ─────────────────────────────────────────
const TOP_MODULES = ['turmas', 'sumarios', 'avaliacoes'];
const BOTTOM_MODULES = ['chat', 'perfil'];

const MODULE_FLYOUTS: Record<string, { label: string; groups: FlyoutGroup[] }> = {
  turmas: {
    label: 'Ensino STCW',
    groups: [
      {
        label: 'TURMAS',
        items: [
          { name: 'Minhas Turmas', href: '/professor' },
          { name: 'Agenda Semanal', href: '/professor/calendar' },
          { name: 'Materiais de Apoio', href: '/professor/materials' },
        ],
      },
    ],
  },
  sumarios: {
    label: 'Registos',
    groups: [
      {
        label: 'DIÁRIO',
        items: [
          { name: 'Folha de Presenças', href: '/professor/attendance' },
          { name: 'Registos de Sumário', href: '/professor/summaries' },
        ],
      },
    ],
  },
  avaliacoes: {
    label: 'Qualidade',
    groups: [
      {
        label: 'ACADÉMICO',
        items: [
          { name: 'Lançar Notas', href: '/professor/grades' },
          { name: 'Feedback de Alunos', href: '/professor/feedback' },
        ],
      },
    ],
  },
  chat: {
    label: 'Comunicação',
    groups: [
      {
        label: 'SUPORTE',
        items: [
          { name: 'Suporte / Chat', href: '/professor/chat' },
        ],
      },
    ],
  },
  perfil: {
    label: 'Meu Perfil',
    groups: [
      {
        label: 'CONTA',
        items: [
          { name: 'Detalhes da Conta', href: '/professor/profile' },
        ],
      },
    ],
  },
};

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <TrainerLayoutContent>{children}</TrainerLayoutContent>;
}

function TrainerLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeModule, setActiveModule] = useState('turmas');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
      <div className="denied-screen">
        <div className="denied-card">
          <span className="denied-icon">🚫</span>
          <h1>Acesso Restrito</h1>
          <p>Esta área é exclusiva para o Corpo Docente (Formadores) do Marítimo Training Center.</p>
          <Link href="/professor/login" className="denied-btn">Ir para o Login</Link>
        </div>
        <style jsx>{`
          .denied-screen { height:100vh; display:flex; align-items:center; justify-content:center; background:#f4f7fb; font-family:'DM Sans',sans-serif; }
          .denied-card { text-align:center; background:white; padding:3.5rem; border-radius:20px; border:1px solid #dce6f0; max-width:440px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .denied-icon { font-size:4rem; display:block; margin-bottom:1.5rem; }
          h1 { color:#2D180F; font-family:'Outfit',sans-serif; margin-bottom:1rem; font-weight: 800; }
          p { color:#6b7ea0; margin-bottom:2rem; line-height: 1.6; }
          .denied-btn { background:#2D180F; color:white; padding:0.85rem 2.5rem; border-radius:12px; font-weight:700; display:inline-block; transition: all 0.3s ease; }
          .denied-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(10,42,94,0.2); }
        `}</style>
      </div>
    );
  }

  const currentFlyout = MODULE_FLYOUTS[activeModule] || MODULE_FLYOUTS['turmas'];
  const flyoutGroups = currentFlyout.groups;

  // Breadcrumb
  let currentPageName = '';
  for (const mod of Object.values(MODULE_FLYOUTS)) {
    for (const grp of mod.groups) {
      const found = grp.items.find(i => i.href === pathname);
      if (found) { currentPageName = found.name; break; }
    }
    if (currentPageName) break;
  }

  const railIconMap: Record<string, React.ReactNode> = {
    turmas: <IconClass />,
    sumarios: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    avaliacoes: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    chat: <IconChat />,
    perfil: <IconProfile />,
  };

  return (
    <div className={`admin-wrap ${showMobileMenu ? 'mobile-open' : ''}`}>
      {/* Mobile Fixed Toggle */}
      <button 
        className="mobile-toggle-fixed" 
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        aria-label="Toggle Menu"
      >
        {showMobileMenu ? '✕' : '☰'}
      </button>

      {/* Backdrop */}
      {showMobileMenu && (
        <div className="mobile-backdrop" onClick={() => setShowMobileMenu(false)} />
      )}

      {/* ── RAIL (58px) ─────────────────────────────── */}
      <div className="rail">
        <div className="rail-logo">
          <IconAnchor />
        </div>

        <div className="rail-modules">
          {TOP_MODULES.map(id => (
            <button
              key={id}
              className={`rail-btn${activeModule === id ? ' active' : ''}`}
              onClick={() => { setActiveModule(id); setShowMobileMenu(false); }}
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
              onClick={() => { setActiveModule(id); setShowMobileMenu(false); }}
              title={MODULE_FLYOUTS[id]?.label}
            >
              {railIconMap[id]}
            </button>
          ))}
        </div>

        <div className="rail-footer">
          <div className="rail-avatar-container" title={session?.user?.name || 'Formador'}>
            {(session?.user as any)?.photo ? (
              <img src={(session?.user as any).photo} className="rail-photo" alt="Avatar" />
            ) : (
              <div className="rail-avatar">
                {(session?.user?.name || 'FO').slice(0, 2).toUpperCase()}
              </div>
            )}
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
          {flyoutGroups.map((group, gi) => (
            <div key={gi} className="flyout-group">
              <span className="flyout-group-lbl">{group.label}</span>
              {group.items.map((item, ii) => (
                <Link
                  key={ii}
                  href={item.href}
                  className={`flyout-item${pathname === item.href ? ' active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className="flyout-icon">{getFlyoutIcon(item.name)}</div>
                  <span className="flyout-label">{item.name}</span>
                  {item.badge && <span className="flyout-badge">{item.badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="flyout-foot">
          <button
            onClick={() => { signOut({ callbackUrl: '/professor/login' }); setShowMobileMenu(false); }}
            className="flyout-action"
          >
            <IconSignOut /> Sair
          </button>
          <Link href="/" className="flyout-action" onClick={() => setShowMobileMenu(false)}>
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
            <span className="user-name">{session?.user?.name || 'Equipa Docente'}</span>
            <span className="user-badge">FORMADOR</span>
          </div>
        </div>

        <div className="content-body">
          {children}
        </div>
      </main>

      <style jsx>{`
        /* ── Container ── */
        .admin-wrap { display: flex; height: 100vh; overflow: hidden; background: #f4f7fb; font-family: 'DM Sans', sans-serif; padding: 1.25rem; gap: 0; transition: 0.3s; }

        .mobile-toggle-fixed {
          display: none;
          position: fixed;
          top: 0.75rem;
          left: 0.75rem;
          width: 42px;
          height: 42px;
          background: #E6C5A8;
          color: #2D180F;
          border: none;
          border-radius: 10px;
          font-size: 1.25rem;
          font-weight: 800;
          cursor: pointer;
          z-index: 20000;
          box-shadow: 0 4px 15px rgba(245, 197, 24, 0.4);
          align-items: center;
          justify-content: center;
          transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* ── Rail ── */
        .rail { width: 72px; background: #2D180F; border-radius: 14px 0 0 14px; display: flex; flex-direction: column; align-items: center; padding: 16px 0; flex-shrink: 0; height: calc(100vh - 2.5rem); }
        .rail-logo { width: 34px; height: 34px; background: #E6C5A8; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; flex-shrink: 0; }
        .rail-modules { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%; padding: 0 10px; overflow-y: auto; scrollbar-width: none; }
        .rail-modules::-webkit-scrollbar { display: none; }
        .rail-btn { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer; color: rgba(255, 255, 255, 0.6); transition: all 0.2s ease; }
        .rail-btn:hover { background: rgba(255, 255, 255, 0.10); color: rgba(255, 255, 255, 0.9); }
        .rail-btn.active { background: #ffffff; color: #2D180F; }
        .rail-sep { width: 24px; height: 0.5px; background: rgba(255, 255, 255, 0.12); margin: 8px 0; flex-shrink: 0; }
        .rail-footer { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 0 10px; flex-shrink: 0; }
        .rail-avatar-container { width: 30px; height: 30px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.2); overflow: hidden; display: flex; align-items: center; justify-content: center; background: #1a4fa0; }
        .rail-photo { width: 100%; height: 100%; object-fit: cover; }
        .rail-avatar { width: 100%; height: 100%; color: #ffffff; font-size: 10px; font-weight: 600; font-family: 'Outfit', sans-serif; display: flex; align-items: center; justify-content: center; cursor: default; letter-spacing: 0.5px; }

        /* ── Flyout ── */
        .flyout { width: 200px; background: #ffffff; border-right: 0.5px solid rgba(0, 0, 0, 0.07); display: flex; flex-direction: column; flex-shrink: 0; height: calc(100vh - 2.5rem); }
        .flyout-hdr { padding: 16px; border-bottom: 0.5px solid rgba(0, 0, 0, 0.06); flex-shrink: 0; }
        .flyout-pre { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; margin-bottom: 4px; font-weight: 500; }
        .flyout-title { display: block; font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600; color: #2D180F; letter-spacing: -0.02em; }
        .flyout-nav { flex: 1; overflow-y: auto; padding: 12px 8px; scrollbar-width: none; }
        .flyout-nav::-webkit-scrollbar { display: none; }
        .flyout-group { margin-bottom: 16px; }
        .flyout-group-lbl { display: block; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.10em; color: #c0c8d4; font-weight: 600; padding: 0 8px 6px; }
        .flyout-item { display: flex; align-items: center; gap: 9px; padding: 8px; border-radius: 7px; text-decoration: none; transition: background 0.15s; margin-bottom: 1px; width: 100%; cursor: pointer; }
        .flyout-item:hover { background: #f8fafc; }
        .flyout-item.active { background: #e8f0fb; }
        .flyout-item.active .flyout-label { color: #2D180F; font-weight: 500; }
        .flyout-item.active .flyout-icon { background: #2D180F; color: #ffffff; }
        .flyout-icon { width: 24px; height: 24px; border-radius: 6px; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #64748b; flex-shrink: 0; transition: all 0.15s; }
        .flyout-label { font-size: 13px; color: #2D180F; font-weight: 500; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1; }
        .flyout-badge { font-size: 10px; background: #f1f5f9; color: #94a3b8; padding: 2px 5px; border-radius: 4px; font-weight: 500; flex-shrink: 0; }
        .flyout-foot { padding: 10px 8px; border-top: 0.5px solid rgba(0, 0, 0, 0.06); display: flex; flex-direction: column; gap: 2px; flex-shrink: 0; }
        .flyout-action { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 7px; font-size: 12px; color: #94a3b8; background: none; border: none; cursor: pointer; text-decoration: none; width: 100%; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
        .flyout-action:hover { background: #f8fafc; color: #475569; }

        /* ── Content ── */
        .content { flex: 1; display: flex; flex-direction: column; background: #f4f7fb; border-radius: 0 14px 14px 0; overflow: hidden; min-width: 0; }
        .content-hdr { background: #ffffff; border-bottom: 0.5px solid rgba(0, 0, 0, 0.06); padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; }
        .bc-sep { color: #dce6f0; }
        .bc-active { color: #334155; font-weight: 500; }
        .hdr-user { display: flex; align-items: center; gap: 8px; }
        .user-name { font-size: 13px; font-weight: 500; color: #0f1e35; }
        .user-badge { font-size: 9px; font-weight: 600; color: #2D180F; background: #E6C5A8; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.05em; }
        .content-body { flex: 1; overflow-y: auto; padding: 20px; }

        @media (max-width: 1024px) {
          .admin-wrap { padding: 0.75rem; }
          .flyout { width: 160px; }
        }

        @media (max-width: 768px) {
          .admin-wrap { padding: 0.25rem; }
          .mobile-toggle-fixed { display: flex; }
          .rail {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 72px;
            z-index: 10005;
            transform: translateX(-352px);
            transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 0;
            background: #2D180F;
          }
          .flyout {
            position: fixed;
            left: 72px;
            top: 0;
            bottom: 0;
            width: 250px;
            z-index: 10004;
            transform: translateX(-352px);
            transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 0;
            box-shadow: 10px 0 30px rgba(0,0,0,0.2);
            background: white;
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .admin-wrap.mobile-open .rail,
          .admin-wrap.mobile-open .flyout { 
            transform: translateX(0); 
          }
          .content { 
            width: 100%; 
            margin-left: 0; 
            padding: 5.5rem 1rem 1rem; 
            overflow-x: hidden; 
            transition: filter 0.3s;
          }
          .admin-wrap.mobile-open .content {
            filter: blur(2px);
            pointer-events: none;
          }
          .content-hdr { padding: 0.5rem 0; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; }
          .mobile-toggle { display: none; }
          .user-info-text { display: none; }
          .hdr-user { gap: 0.5rem; }
          .breadcrumb span { font-size: 0.9rem; }
          .mobile-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(10, 42, 94, 0.4);
            backdrop-filter: blur(4px);
            z-index: 1000;
            animation: fadeIn 0.3s;
          }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
