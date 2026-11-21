'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [portalDropdown, setPortalDropdown] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link href="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <div className="logo-icon-box" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="3"/>
              <line x1="12" y1="8" x2="12" y2="21"/>
              <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
            </svg>
          </div>
          <div className="logo-text">
            <span className="main">MARÍTIMO</span>
            <span className="sub">Training Center</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-links" aria-label="Navegação principal">
          <Link href="/cursos" className={`nav-item ${isActive('/cursos') ? 'active' : ''}`}>
            Cursos
          </Link>
          <Link href="/sobre" className={`nav-item ${isActive('/sobre') ? 'active' : ''}`}>
            Sobre Nós
          </Link>
          <Link href="/contacto" className={`nav-item ${isActive('/contacto') ? 'active' : ''}`}>
            Contacto
          </Link>
          <Link href="/faq" className={`nav-item ${isActive('/faq') ? 'active' : ''}`}>
            FAQ
          </Link>

          <div className="nav-divider"></div>

          {/* Portais Dropdown */}
          <div 
            className="portal-dropdown-wrapper"
            onMouseEnter={() => setPortalDropdown(true)}
            onMouseLeave={() => setPortalDropdown(false)}
          >
            <button 
              type="button" 
              className="btn-dropdown-trigger"
              onClick={() => setPortalDropdown(!portalDropdown)}
              aria-expanded={portalDropdown}
            >
              <span>Áreas de Acesso</span>
              <svg className={`chevron ${portalDropdown ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {portalDropdown && (
              <div className="dropdown-menu-card">
                <Link href="/login" className="dropdown-item" onClick={() => setPortalDropdown(false)}>
                  <div className="dropdown-icon student">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <strong className="item-title">Portal do Aluno</strong>
                    <span className="item-desc">Matrículas, certificados e notas</span>
                  </div>
                </Link>

                <Link href="/professor/login" className="dropdown-item" onClick={() => setPortalDropdown(false)}>
                  <div className="dropdown-icon trainer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div>
                    <strong className="item-title">Portal do Formador</strong>
                    <span className="item-desc">Turmas, presenças e avaliações</span>
                  </div>
                </Link>

                <div className="dropdown-separator"></div>

                <Link href="/admin/login" className="dropdown-item admin" onClick={() => setPortalDropdown(false)}>
                  <div className="dropdown-icon admin">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <div>
                    <strong className="item-title">Centro Administrativo</strong>
                    <span className="item-desc">Gestão institucional e auditoria</span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link href="/login" className="btn-portal-primary">
            Portal do Aluno
          </Link>
        </nav>

        {/* Mobile Toggle Button */}
        <button 
          className="mobile-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="logo-icon-box small">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="5" r="3"/>
              <line x1="12" y1="8" x2="12" y2="21"/>
              <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
            </svg>
          </div>
          <span className="drawer-title">Marítimo Training Center</span>
        </div>

        <nav className="drawer-nav">
          <Link href="/cursos" onClick={() => setIsOpen(false)} className={`drawer-link ${isActive('/cursos') ? 'active' : ''}`}>
            Cursos & Certificações
          </Link>
          <Link href="/sobre" onClick={() => setIsOpen(false)} className={`drawer-link ${isActive('/sobre') ? 'active' : ''}`}>
            Sobre Nós
          </Link>
          <Link href="/contacto" onClick={() => setIsOpen(false)} className={`drawer-link ${isActive('/contacto') ? 'active' : ''}`}>
            Contacto & Localização
          </Link>
          <Link href="/faq" onClick={() => setIsOpen(false)} className={`drawer-link ${isActive('/faq') ? 'active' : ''}`}>
            Perguntas Frequentes
          </Link>

          <div className="drawer-divider"></div>

          <div className="drawer-portals">
            <span className="portal-label">Portais de Acesso</span>
            <Link href="/login" onClick={() => setIsOpen(false)} className="drawer-btn primary">
              Portal do Aluno
            </Link>
            <Link href="/professor/login" onClick={() => setIsOpen(false)} className="drawer-btn secondary">
              Portal do Formador
            </Link>
            <Link href="/admin/login" onClick={() => setIsOpen(false)} className="drawer-btn dark">
              Centro Administrativo
            </Link>
          </div>
        </nav>
      </div>

      {isOpen && <div className="drawer-backdrop" onClick={() => setIsOpen(false)}></div>}

      <style jsx>{`
        .navbar {
          background: rgba(45, 24, 15, 0.94);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          color: white;
          padding: 0.85rem 0;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 2000;
          box-shadow: 0 4px 20px rgba(45, 24, 15, 0.25);
          border-bottom: 1px solid rgba(230, 197, 168, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .navbar.scrolled {
          background: rgba(45, 24, 15, 0.98);
          padding: 0.65rem 0;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
          border-bottom-color: rgba(230, 197, 168, 0.25);
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          z-index: 2001;
          text-decoration: none;
        }

        .logo-icon-box {
          background: var(--color-accent, #EA580C);
          color: #ffffff;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
          transition: transform 0.25s ease;
        }
        .nav-logo:hover .logo-icon-box {
          transform: translateY(-2px) scale(1.04);
        }
        .logo-icon-box.small {
          width: 32px;
          height: 32px;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .logo-text .main {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 800;
          letter-spacing: 1px;
          font-size: 1.18rem;
          color: #ffffff;
        }
        .logo-text .sub {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.65rem;
          text-transform: uppercase;
          opacity: 0.85;
          letter-spacing: 1.4px;
          color: var(--color-sandstone, #E6C5A8);
          margin-top: 1px;
        }

        /* Desktop links */
        .desktop-links {
          display: flex;
          align-items: center;
          gap: 1.35rem;
        }
        .nav-item {
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 0.925rem;
          font-weight: 600;
          color: #ffffff;
          opacity: 0.82;
          position: relative;
          padding: 0.35rem 0.2rem;
          transition: all 0.2s ease;
        }
        .nav-item:hover, .nav-item.active {
          opacity: 1;
          color: var(--color-sandstone, #E6C5A8);
        }
        .nav-item::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-accent, #EA580C);
          border-radius: 2px;
          transform: scaleX(0);
          transition: transform 0.2s ease;
        }
        .nav-item.active::after, .nav-item:hover::after {
          transform: scaleX(1);
        }

        .nav-divider {
          width: 1px;
          height: 22px;
          background: rgba(230, 197, 168, 0.25);
          margin: 0 0.35rem;
        }

        /* Portal dropdown */
        .portal-dropdown-wrapper {
          position: relative;
        }
        .btn-dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(230, 197, 168, 0.12);
          border: 1px solid rgba(230, 197, 168, 0.28);
          color: #ffffff;
          padding: 0.55rem 0.95rem;
          border-radius: 8px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-dropdown-trigger:hover {
          background: rgba(230, 197, 168, 0.22);
          border-color: var(--color-sandstone, #E6C5A8);
        }
        .chevron {
          transition: transform 0.25s ease;
        }
        .chevron.open {
          transform: rotate(180deg);
        }

        .dropdown-menu-card {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 280px;
          background: #ffffff;
          border-radius: 12px;
          padding: 0.5rem;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(45, 24, 15, 0.1);
          animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 2010;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.75rem;
          border-radius: 8px;
          color: var(--color-primary, #2D180F);
          text-decoration: none;
          transition: background 0.15s ease;
        }
        .dropdown-item:hover {
          background: var(--color-surface, #F8F4EF);
        }
        .dropdown-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dropdown-icon.student { background: rgba(234, 88, 12, 0.12); color: #EA580C; }
        .dropdown-icon.trainer { background: rgba(30, 58, 95, 0.12); color: #1E3A5F; }
        .dropdown-icon.admin   { background: rgba(45, 24, 15, 0.12); color: #2D180F; }

        .item-title {
          display: block;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--color-primary, #2D180F);
        }
        .item-desc {
          display: block;
          font-size: 0.75rem;
          color: #78685E;
          margin-top: 1px;
        }
        .dropdown-separator {
          height: 1px;
          background: #EAE3DC;
          margin: 0.4rem 0.5rem;
        }

        .btn-portal-primary {
          background: var(--color-accent, #EA580C);
          color: #ffffff;
          padding: 0.55rem 1.15rem;
          font-size: 0.875rem;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35);
          transition: all 0.25s ease;
          text-decoration: none;
        }
        .btn-portal-primary:hover {
          background: var(--color-accent-hover, #C2410C);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(234, 88, 12, 0.45);
        }

        /* Mobile Toggle */
        .mobile-toggle {
          display: none;
          background: rgba(230, 197, 168, 0.12);
          border: 1px solid rgba(230, 197, 168, 0.25);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2002;
          transition: background 0.2s ease;
        }
        .mobile-toggle:hover {
          background: rgba(230, 197, 168, 0.22);
        }

        /* Mobile Drawer */
        .mobile-drawer {
          position: fixed;
          top: 0;
          right: -320px;
          width: 300px;
          height: 100vh;
          background: #2D180F;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.45);
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 2005;
          overflow-y: auto;
        }
        .mobile-drawer.open {
          right: 0;
        }
        .drawer-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(230, 197, 168, 0.18);
          margin-bottom: 1.5rem;
        }
        .drawer-title {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          font-size: 0.95rem;
          color: #ffffff;
        }
        .drawer-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .drawer-link {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-weight: 600;
          font-size: 1rem;
          color: #ffffff;
          opacity: 0.88;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .drawer-link:hover, .drawer-link.active {
          opacity: 1;
          background: rgba(230, 197, 168, 0.14);
          color: var(--color-sandstone, #E6C5A8);
        }
        .drawer-divider {
          height: 1px;
          background: rgba(230, 197, 168, 0.18);
          margin: 1.25rem 0;
        }
        .drawer-portals {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .portal-label {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.725rem;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--color-sandstone, #E6C5A8);
          opacity: 0.75;
          margin-bottom: 0.25rem;
        }
        .drawer-btn {
          padding: 0.8rem 1rem;
          border-radius: 8px;
          text-align: center;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .drawer-btn.primary {
          background: var(--color-accent, #EA580C);
          color: #ffffff;
        }
        .drawer-btn.secondary {
          background: rgba(230, 197, 168, 0.14);
          color: #ffffff;
          border: 1px solid rgba(230, 197, 168, 0.3);
        }
        .drawer-btn.dark {
          background: rgba(0, 0, 0, 0.3);
          color: #E6C5A8;
          border: 1px solid rgba(230, 197, 168, 0.15);
        }

        .drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          z-index: 2004;
        }

        /* Responsive Breakpoints */
        @media (max-width: 860px) {
          .desktop-links {
            display: none;
          }
          .mobile-toggle {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
}
