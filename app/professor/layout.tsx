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
const TOP_MODULES = ['turmas'];
const BOTTOM_MODULES = ['chat', 'perfil'];

const MODULE_FLYOUTS: Record<string, { label: string; groups: FlyoutGroup[] }> = {
  turmas: {
    label: 'Aulas & Materiais',
    groups: [
      {
        label: 'ENSINO',
        items: [
          { name: 'Minhas Turmas', href: '/professor' },
          { name: 'Materiais de Apoio', href: '/professor/materials' },
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
          h1 { color:#0a2a5e; font-family:'Outfit',sans-serif; margin-bottom:1rem; font-weight: 800; }
          p { color:#6b7ea0; margin-bottom:2rem; line-height: 1.6; }
          .denied-btn { background:#0a2a5e; color:white; padding:0.85rem 2.5rem; border-radius:12px; font-weight:700; display:inline-block; transition: all 0.3s ease; }
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
    chat: <IconChat />,
    perfil: <IconProfile />,
  };

  return (
    <div className="admin-wrap">

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

        <div className="rail-footer">
          <div className="rail-avatar" title={session?.user?.name || 'Formador'}>
            {(session?.user?.name || 'FO').slice(0, 2).toUpperCase()}
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
                >
                  <div className="flyout-icon"><IconSquare /></div>
                  <span className="flyout-label">{item.name}</span>
                  {item.badge && <span className="flyout-badge">{item.badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="flyout-foot">
          <button
            onClick={() => signOut({ callbackUrl: '/professor/login' })}
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
        .admin-wrap { display: flex; min-height: 100vh; background: #f4f7fb; font-family: 'DM Sans', sans-serif; padding: 1.25rem; gap: 0; }

        /* ── Rail ── */
        .rail { width: 58px; background: #0a2a5e; border-radius: 14px 0 0 14px; display: flex; flex-direction: column; align-items: center; padding: 14px 0; flex-shrink: 0; position: sticky; top: 1.25rem; height: calc(100vh - 2.5rem); }
        .rail-logo { width: 34px; height: 34px; background: #F5C518; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; flex-shrink: 0; }
        .rail-modules { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%; padding: 0 10px; }
        .rail-btn { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer; color: rgba(255, 255, 255, 0.6); transition: all 0.2s ease; }
        .rail-btn:hover { background: rgba(255, 255, 255, 0.10); color: rgba(255, 255, 255, 0.9); }
        .rail-btn.active { background: #ffffff; color: #0a2a5e; }
        .rail-sep { width: 24px; height: 0.5px; background: rgba(255, 255, 255, 0.12); margin: 8px 0; flex-shrink: 0; }
        .rail-footer { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 0 10px; flex-shrink: 0; }
        .rail-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #0ea5e9, #1a4fa0); color: #ffffff; font-size: 10px; font-weight: 600; font-family: 'Outfit', sans-serif; display: flex; align-items: center; justify-content: center; cursor: default; letter-spacing: 0.5px; }

        /* ── Flyout ── */
        .flyout { width: 200px; background: #ffffff; border-right: 0.5px solid rgba(0, 0, 0, 0.07); display: flex; flex-direction: column; flex-shrink: 0; position: sticky; top: 1.25rem; height: calc(100vh - 2.5rem); overflow: hidden; }
        .flyout-hdr { padding: 16px; border-bottom: 0.5px solid rgba(0, 0, 0, 0.06); flex-shrink: 0; }
        .flyout-pre { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; margin-bottom: 4px; font-weight: 500; }
        .flyout-title { display: block; font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600; color: #0a2a5e; letter-spacing: -0.02em; }
        .flyout-nav { flex: 1; overflow-y: auto; padding: 12px 8px; scrollbar-width: none; }
        .flyout-nav::-webkit-scrollbar { display: none; }
        .flyout-group { margin-bottom: 16px; }
        .flyout-group-lbl { display: block; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.10em; color: #c0c8d4; font-weight: 600; padding: 0 8px 6px; }
        .flyout-item { display: flex; align-items: center; gap: 9px; padding: 8px; border-radius: 7px; text-decoration: none; transition: background 0.15s; margin-bottom: 1px; width: 100%; cursor: pointer; }
        .flyout-item:hover { background: #f8fafc; }
        .flyout-item.active { background: #e8f0fb; }
        .flyout-item.active .flyout-label { color: #0a2a5e; font-weight: 500; }
        .flyout-item.active .flyout-icon { background: #0a2a5e; color: #ffffff; }
        .flyout-icon { width: 24px; height: 24px; border-radius: 6px; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #64748b; flex-shrink: 0; transition: all 0.15s; }
        .flyout-label { font-size: 13px; color: #475569; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1; }
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
        .user-badge { font-size: 9px; font-weight: 600; color: #0a2a5e; background: #F5C518; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.05em; }
        .content-body { flex: 1; overflow-y: auto; padding: 20px; }

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
