'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link href="/" className="nav-logo">
          <span className="logo-icon">⚓</span>
          <div className="logo-text">
            <span className="main">MARÍTIMO</span>
            <span className="sub">Training Center</span>
          </div>
        </Link>
        <div className="nav-links">
          <Link href="/cursos">Cursos</Link>
          <Link href="/sobre">Sobre Nós</Link>
          <Link href="/contacto">Contacto</Link>
          <Link href="/login" className="btn btn-portal">Portal do Aluno</Link>
        </div>
      </div>
      <style jsx>{`
        .navbar {
          background: var(--navy-deep);
          color: white;
          padding: 1rem 0;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          box-shadow: var(--shadow-md);
        }
        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logo-icon {
          font-size: 1.8rem;
          background: var(--sand-gold);
          color: var(--navy-deep);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }
        .logo-text {
          display: flex;
          flex-direction: column;
        }
        .logo-text .main {
          font-weight: 900;
          letter-spacing: 1px;
          font-size: 1.1rem;
        }
        .logo-text .sub {
          font-size: 0.65rem;
          text-transform: uppercase;
          opacity: 0.7;
          letter-spacing: 1px;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .nav-links a {
          font-size: 0.9rem;
          font-weight: 600;
          transition: var(--transition);
          opacity: 0.8;
        }
        .nav-links a:hover {
          opacity: 1;
          color: var(--sand-gold);
        }
        .btn-portal {
          background: white;
          color: var(--navy-deep);
          padding: 0.5rem 1.25rem;
          font-size: 0.85rem;
          border-radius: 50px;
        }
        .btn-portal:hover {
          background: var(--sand-gold);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
        }
      `}</style>
    </nav>
  );
}
