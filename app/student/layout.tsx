'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentLayoutContent>{children}</StudentLayoutContent>;
}

function StudentLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const user = session?.user as any;
  const userId = user?.id;
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  useEffect(() => {
    if (!userId) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?studentId=${userId}`);
        if (res.ok) { 
          const data = await res.json(); 
          setNotifications(Array.isArray(data) ? data : []); 
        }
      } catch (e) { console.error(e); }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { 
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false); 
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ read: true }) 
      });
      setNotifications(prev => prev.map((n: any) => n.id === id ? { ...n, read: true } : n));
    } catch (e) { console.error(e); }
  };

  const handleMarkAllRead = async () => { 
    for (const n of notifications.filter((n: any) => !n.read)) { 
      await handleMarkRead(n.id); 
    } 
  };

  if (status === 'loading') return null;
  if (status === 'unauthenticated') { router.push('/login'); return null; }

  const isStudent = user?.role === 'STUDENT';
  if (!isStudent) {
    return (
      <div className="denied-screen">
        <div className="denied-card">
          <span className="denied-icon">🚫</span>
          <h1>Acesso Restrito</h1>
          <p>Não possui permissões de Aluno para aceder a esta área.</p>
          <Link href="/login" className="denied-btn">Ir para o Login</Link>
        </div>
        <style jsx>{`
          .denied-screen { height:100vh; display:flex; align-items:center; justify-content:center; background:#f4f7fb; font-family:'DM Sans',sans-serif; }
          .denied-card { text-align:center; background:white; padding:3rem; border-radius:20px; border:1px solid #dce6f0; max-width:400px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .denied-icon { font-size:3.5rem; display:block; margin-bottom:1.25rem; }
          h1 { color:#0a2a5e; font-family:'Outfit',sans-serif; margin-bottom:0.75rem; font-weight: 800; }
          p { color:#6b7ea0; margin-bottom:1.75rem; }
          .denied-btn { background:#0a2a5e; color:white; padding:0.7rem 2rem; border-radius:10px; font-weight:600; display:inline-block; }
        `}</style>
      </div>
    );
  }

  const navItems = [
    { name: 'Geral / Dashboard', href: '/student', icon: '📊' },
    { name: 'Cursos / Materiais', href: '/student/materials', icon: '📁' },
    { name: 'Suporte Online', href: '/student/chat', icon: '💬' },
    { name: 'Avaliações', href: '/student/feedback', icon: '⭐' },
    { name: 'Perfil do Aluno', href: '/student/profile', icon: '👤' },
  ];

  return (
    <div className="portal-wrap">
      <aside className="rail">
        <div className="rail-inner">
          <div className="rail-top">
            <div className="logo-icon">⚓</div>
            <div className="logo-text">
              <strong>Marítimo</strong>
              <span>Portal do Aluno</span>
            </div>
          </div>

          <nav className="rail-nav">
            <p className="rail-label">Área Pessoal</p>
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
              <span className="r-text">Sair para o Site</span>
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="rail-link secondary logout-btn">
              <div className="nav-icon-box small">🚪</div>
              <span className="r-text">Encerrar Sessão</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-hdr">
          <div className="hdr-breadcrumb">
            <span className="bc-pre">Aluno</span>
            <span className="bc-sep">›</span>
            <span className="bc-cur">{navItems.find(i => i.href === pathname)?.name || 'Consola'}</span>
          </div>

          <div className="hdr-right">
            {/* Notification Bell */}
            <div className="notif-wrap" ref={notifRef}>
              <button className="notif-bell" onClick={() => setNotifOpen(o => !o)} title="Notificações">
                🔔
                {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {notifOpen && (
                <div className="notif-dropdown shadow-premium">
                  <div className="notif-hdr">
                    <span className="notif-title">Centro de Notificações</span>
                    {unreadCount > 0 && <button className="mark-all" onClick={handleMarkAllRead}>Lidas</button>}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">Sem notificações no momento.</div>
                    ) : (
                      notifications.map((n: any) => (
                        <div key={n.id} className={`notif-item${n.read ? ' read' : ' unread'}`} onClick={() => !n.read && handleMarkRead(n.id)}>
                          <div className="ni-icon">{n.type === 'MATRICULATION' ? '🎓' : '📢'}</div>
                          <div className="ni-body">
                            <strong>{n.title}</strong>
                            <p>{n.message}</p>
                            <small>{new Date(n.createdAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })}</small>
                          </div>
                          {!n.read && <span className="ni-dot"></span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hdr-user">
              <div className="u-info">
                <span className="u-name">{session?.user?.name || 'Aluno'}</span>
                <span className="u-role">ESTUDANTE ATIVO</span>
              </div>
              <div className="u-avatar">{session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'A'}</div>
            </div>
          </div>
        </header>

        <div className="portal-body">{children}</div>
      </main>

      <style jsx>{`
        .portal-wrap { display:flex; min-height:100vh; background:#f4f7fb; font-family:'DM Sans','Inter',sans-serif; padding:1.25rem; gap:1.25rem; }

        /* Rail */
        .rail { width:280px; background:#0a2a5e; border-radius:20px; flex-shrink:0; position:sticky; top:1.25rem; height:calc(100vh - 2.5rem); box-shadow:0 4px 24px rgba(10,42,94,0.18); overflow:hidden; }
        .rail-inner { height:100%; display:flex; flex-direction:column; }

        .rail-top { padding:2.5rem 1.75rem 1.75rem; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:1rem; flex-shrink:0; }
        .logo-icon { font-size:1.4rem; background:#ffffff; width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:12px; color:#0a2a5e; flex-shrink:0; box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
        .logo-text strong { display:block; font-family:'Outfit',sans-serif; font-size:1.2rem; font-weight:700; color:#fff; letter-spacing:-0.02em; line-height:1.1; }
        .logo-text span { font-size:0.58rem; text-transform:uppercase; letter-spacing:0.12em; color:#F5C518; font-weight:700; display:block; margin-top:2px; }

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
        .portal-main { flex:1; display:flex; flex-direction:column; background:#fff; border-radius:24px; border:1px solid #dce6f0; overflow:hidden; min-width:0; box-shadow: 0 4px 20px rgba(10, 42, 94, 0.04); }

        .portal-hdr { height:72px; display:flex; align-items:center; justify-content:space-between; padding:0 2.5rem; border-bottom:1px solid #f0f4f8; flex-shrink:0; }
        .hdr-breadcrumb { display:flex; align-items:center; gap:0.5rem; }
        .bc-pre { font-size:0.85rem; color:#6b7ea0; font-weight:500; }
        .bc-sep { color:#dce6f0; }
        .bc-cur { font-size:0.9rem; color:#0a2a5e; font-weight:700; }

        .hdr-right { display:flex; align-items:center; gap:1.25rem; }

        /* Notifications */
        .notif-wrap { position:relative; }
        .notif-bell { position:relative; background:#f4f7fb; border:1px solid #edf2f7; border-radius:50%; width:44px; height:44px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; cursor:pointer; transition:all 0.2s; color:#0a2a5e; }
        .notif-bell:hover { background:#e8f0fb; border-color:#0a2a5e; transform: scale(1.05); }
        .notif-badge { position:absolute; top:-2px; right:-2px; background:#F5C518; color:#0a2a5e; font-size:0.65rem; font-weight:800; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2.5px solid #fff; }
        
        .notif-dropdown { position:absolute; right:0; top:calc(100% + 12px); width:360px; background:#fff; border:1px solid #dce6f0; border-radius:18px; box-shadow:0 15px 40px rgba(10,42,94,0.15); z-index:2000; overflow:hidden; animation: slideDown 0.3s ease-out; }
        @keyframes slideDown { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform: translateY(0); } }

        .notif-hdr { display:flex; align-items:center; justify-content:space-between; padding:1.25rem; border-bottom:1px solid #f0faf8; background: #fafbfc; }
        .notif-title { font-weight:800; font-size:0.95rem; color:#0a2a5e; font-family:'Outfit',sans-serif; }
        .mark-all { font-size:0.75rem; color:#0a2a5e; background:#F5C518; border:none; cursor:pointer; font-weight:700; padding: 0.25rem 0.75rem; border-radius: 50px; }
        
        .notif-list { max-height:350px; overflow-y:auto; }
        .notif-empty { padding:3rem 2rem; text-align:center; color:#94a3b8; font-size:0.9rem; }
        .notif-item { display:flex; align-items:flex-start; gap:1rem; padding:1.25rem; cursor:pointer; transition:all 0.15s; border-bottom:1px solid #f8fafc; }
        .notif-item.unread { background:#fff9e620; border-left: 4px solid #F5C518; }
        .notif-item:hover { background:#f4f7fb; }
        .ni-icon { font-size:1.4rem; flex-shrink:0; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #f0f4f8; border-radius: 10px; }
        .ni-body { flex:1; min-width:0; }
        .ni-body strong { display:block; font-size:0.9rem; color:#0f1e35; font-weight:700; margin-bottom:2px; }
        .ni-body p { font-size:0.8rem; color:#64748b; line-height:1.5; margin:0 0 6px; }
        .ni-body small { font-size:0.7rem; color:#94a3b8; font-weight: 600; }
        .ni-dot { width:8px; height:8px; background:#F5C518; border-radius:50%; flex-shrink:0; margin-top:6px; box-shadow: 0 0 8px rgba(245, 197, 24, 0.5); }

        /* User */
        .hdr-user { display:flex; align-items:center; gap:0.85rem; padding:0.4rem 1rem 0.4rem 0.6rem; border-radius:50px; background:#f8fafc; border:1px solid #edf2f7; cursor:pointer; transition:all 0.2s; }
        .hdr-user:hover { border-color:#cbd5e0; background:#f1f5f9; }
        .u-info { display:flex; flex-direction:column; align-items:flex-end; line-height:1.2; }
        .u-name { font-weight: 700; font-size: 0.88rem; color: #0f1e35; }
        .u-role { font-size:0.62rem; font-weight:800; color:#0a2a5e; text-transform:uppercase; letter-spacing:0.1em; background:#F5C518; padding:0.1rem 0.45rem; border-radius:4px; margin-top:3px; }
        .u-avatar { width:36px; height:36px; border-radius:50%; background:#0a2a5e; color:white; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1rem; font-family:'Outfit',sans-serif; flex-shrink:0; box-shadow: 0 2px 6px rgba(10, 42, 94, 0.2); }

        .portal-body { padding:2.5rem; flex:1; overflow-y:auto; }

        @media (max-width:1024px) {
          .portal-wrap { padding:0.75rem; gap:0.75rem; }
          .rail { width:85px; border-radius:14px; }
          .portal-main { border-radius:20px; }
          .r-text, .rail-label, .logo-text, .u-info { display:none; }
          .rail-link { justify-content:center; padding:0.75rem; }
          .rail-link.active { border-left:none; border-bottom:3px solid #F5C518; padding-left:0.75rem; }
          .nav-icon-box { margin-right:0; }
        }
      `}</style>
    </div>
  );
}
