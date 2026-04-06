'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <TrainerLayoutContent>{children}</TrainerLayoutContent>;
}

function TrainerLayoutContent({ children }: { children: React.ReactNode }) {
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
      <div className="denied-screen">
        <div className="denied-card">
          <span className="denied-icon">🚫</span>
          <h1>Acesso Restrito</h1>
          <p>Esta área é exclusiva para o Corpo Docente (Formadores) do Marítimo Training Center.</p>
          <Link href="/professor/login" className="denied-btn">Ir para o Login</Link>
        </div>
        <style jsx>{`
          .denied-screen { height:100vh; display:flex; alignItems:center; justifyContent:center; background:#f4f7fb; font-family:'DM Sans',sans-serif; }
          .denied-card { textAlign:center; background:white; padding:3.5rem; borderRadius:20px; border:1px solid #dce6f0; maxWidth:440px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .denied-icon { fontSize:4rem; display:block; marginBottom:1.5rem; }
          h1 { color:#0a2a5e; fontFamily:'Outfit',sans-serif; marginBottom:1rem; font-weight: 800; }
          p { color:#6b7ea0; marginBottom:2rem; line-height: 1.6; }
          .denied-btn { background:#0a2a5e; color:white; padding:0.85rem 2.5rem; borderRadius:12px; fontWeight:700; display:inline-block; transition: all 0.3s ease; }
          .denied-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(10,42,94,0.2); }
        `}</style>
      </div>
    );
  }

  const navItems = [
    { name: 'Minhas Turmas', href: '/professor', icon: '👨‍🏫' },
    { name: 'Materiais de Apoio', href: '/professor/materials', icon: '📁' },
    { name: 'Suporte / Chat', href: '/professor/chat', icon: '💬' },
    { name: 'Meu Perfil', href: '/professor/profile', icon: '👤' },
  ];

  return (
    <div className="portal-wrap">
      <aside className="rail">
        <div className="rail-inner">
          <div className="rail-top">
            <div className="logo-icon">⚓</div>
            <div className="logo-text">
              <strong>Marítimo</strong>
              <span>Portal do Formador</span>
            </div>
          </div>

          <nav className="rail-nav">
            <p className="rail-label">Centro de Formação</p>
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={`rail-link${isActive ? ' active' : ''}`}>
                  <div className="nav-icon-box">
                    <span className="r-icon">{item.icon}</span>
                  </div>
                  <span className="r-text">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="rail-foot">
            <Link href="/" className="rail-link secondary">
              <div className="nav-icon-box small">🏠</div>
              <span className="r-text">Voltar ao Portão</span>
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/professor/login' })} className="rail-link secondary logout-btn">
              <div className="nav-icon-box small">🚪</div>
              <span className="r-text">Sair do Sistema</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-hdr">
          <div className="hdr-breadcrumb">
            <span className="bc-pre">Formador</span>
            <span className="bc-sep">›</span>
            <span className="bc-cur">{navItems.find(i => i.href === pathname)?.name || 'Dashboard'}</span>
          </div>
          <div className="hdr-user">
            <div className="u-info">
              <span className="u-name">{session?.user?.name || 'Formador'}</span>
              <span className="u-role">INSTRUTOR STCW</span>
            </div>
            <div className="u-avatar">{session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'F'}</div>
          </div>
        </header>

        <div className="portal-body">{children}</div>
      </main>

      <style jsx>{`
        .portal-wrap { display:flex; min-height:100vh; background:#f4f7fb; font-family:'DM Sans','Inter',sans-serif; padding:1.25rem; gap:1.25rem; }

        /* Rail */
        .rail { width:280px; background:#0a2a5e; border-radius:20px; flex-shrink:0; position:sticky; top:1.25rem; height:calc(100vh - 2.5rem); box-shadow:0 4px 24px rgba(10,42,94,0.18); overflow:hidden; }
        .rail-inner { height:100%; display:flex; flex-direction:column; }

        .rail-top { padding:2rem 1.5rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:1rem; flex-shrink:0; }
        .logo-icon { font-size:1.4rem; background:#ffffff; width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:12px; color:#0a2a5e; flex-shrink:0; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .logo-text strong { display:block; font-family:'Outfit',sans-serif; font-size:1.2rem; font-weight:700; color:#fff; letter-spacing:-0.02em; line-height:1.1; }
        .logo-text span { font-size:0.6rem; text-transform:uppercase; letter-spacing:0.12em; color:#F5C518; font-weight:700; display:block; margin-top:2px; }

        .rail-nav { flex:1; padding:1.5rem 0.85rem; overflow-y:auto; scrollbar-width:none; }
        .rail-nav::-webkit-scrollbar { display:none; }
        .rail-label { font-size:0.6rem; font-weight:800; color:rgba(255,255,255,0.3); letter-spacing:0.15em; text-transform:uppercase; padding:0 0.85rem 0.75rem; }

        .rail-link { display:flex; align-items:center; padding:0.7rem 0.85rem; color:rgba(255,255,255,0.5); text-decoration:none; transition:all 0.25s cubic-bezier(0.4, 0, 0.2, 1); border-radius:12px; margin-bottom:4px; font-weight:500; font-size:0.92rem; border:none; background:none; cursor:pointer; width:100%; text-align:left; }
        .rail-link:hover { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.9); }
        
        .nav-icon-box { width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:8px; background:transparent; margin-right:1rem; transition:all 0.25s; flex-shrink:0; }
        .nav-icon-box.small { width: 28px; height: 28px; margin-right: 0.85rem; opacity: 0.7; }

        .rail-link.active { background:rgba(255,255,255,0.1); color:#fff; font-weight:600; }
        .rail-link.active .nav-icon-box { background:#ffffff; color:#0a2a5e; box-shadow:0 4px 10px rgba(0,0,0,0.1); }
        
        .r-icon { font-size:1.15rem; opacity:0.8; transition:opacity 0.2s; }
        .rail-link.active .r-icon { opacity:1; }
        .r-text { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .rail-foot { padding:1rem; border-top:1px solid rgba(255,255,255,0.08); flex-shrink:0; }
        .rail-link.secondary { color:rgba(255,255,255,0.4); }
        .rail-link.secondary:hover { color:rgba(255,255,255,0.8); background:rgba(255,255,255,0.05); }
        .logout-btn:hover { background:rgba(253,232,232,0.12) !important; color:#ff8585 !important; }

        /* Main */
        .portal-main { flex:1; display:flex; flex-direction:column; background:#fff; border-radius:20px; border:1px solid #dce6f0; overflow:hidden; min-width:0; box-shadow: 0 4px 20px rgba(10, 42, 94, 0.04); }

        .portal-hdr { height:72px; display:flex; align-items:center; justify-content:space-between; padding:0 2.5rem; border-bottom:1px solid #f0f4f8; flex-shrink:0; }
        .hdr-breadcrumb { display:flex; align-items:center; gap:0.5rem; }
        .bc-pre { font-size:0.85rem; color:#6b7ea0; font-weight:500; }
        .bc-sep { color:#dce6f0; }
        .bc-cur { font-size:0.9rem; color:#0a2a5e; font-weight:700; }

        .hdr-user { display:flex; align-items:center; gap:0.85rem; padding:0.4rem 1rem 0.4rem 0.6rem; border-radius:50px; background:#f8fafc; border:1px solid #edf2f7; cursor:pointer; transition:all 0.2s; }
        .hdr-user:hover { border-color:#cbd5e0; background:#f1f5f9; }
        .u-info { display:flex; flex-direction:column; align-items:flex-end; line-height:1.2; }
        .u-name { font-weight:700; font-size:0.88rem; color:#0f1e35; }
        .u-role { font-size:0.62rem; font-weight:800; color:#0a2a5e; text-transform:uppercase; letter-spacing:0.1em; background:#F5C518; padding:0.1rem 0.45rem; border-radius:4px; margin-top:3px; }
        .u-avatar { width:36px; height:36px; border-radius:50%; background:#0a2a5e; color:white; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1rem; font-family:'Outfit',sans-serif; flex-shrink:0; box-shadow: 0 2px 6px rgba(10,42,94,0.2); }

        .portal-body { padding:2.5rem; flex:1; overflow-y:auto; }

        @media (max-width:1024px) {
          .portal-wrap { padding:0.75rem; gap:0.75rem; }
          .rail { width:85px; border-radius:14px; }
          .portal-main { border-radius:14px; }
          .r-text, .rail-label, .logo-text, .u-info { display:none; }
          .rail-link { justify-content:center; padding:0.75rem; }
          .rail-link.active { border-left:none; border-bottom:3px solid #F5C518; padding-left:0.75rem; }
          .nav-icon-box { margin-right:0; }
        }
      `}</style>
    </div>
  );
}
