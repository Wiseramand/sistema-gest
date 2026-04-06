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
          <div className="nav-divider"></div>
          <Link href="/login" className="btn-portal">Portal do Aluno</Link>
          <Link href="/professor/login" className="btn-trainer">Portal Formador</Link>
        </div>
      </div>
      <style jsx>{`
        .navbar {
          background: #0a2a5e;
          color: white;
          padding: 1.25rem 0;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(10, 42, 94, 0.15);
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
        }
        .logo-icon {
          font-size: 1.5rem;
          background: #F5C518;
          color: #0a2a5e;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }
        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .logo-text .main {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          letter-spacing: 1px;
          font-size: 1.15rem;
          color: #ffffff;
        }
        .logo-text .sub {
          font-family: 'Outfit', sans-serif;
          font-size: 0.65rem;
          text-transform: uppercase;
          opacity: 0.8;
          letter-spacing: 1.2px;
          color: #ffffff;
          margin-top: 1px;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-links a {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.25s ease;
          color: #ffffff;
          opacity: 0.85;
        }
        .nav-links a:hover {
          opacity: 1;
          color: #F5C518;
        }
        .nav-divider {
          width: 1px;
          height: 20px;
          background: rgba(255, 255, 255, 0.2);
          margin: 0 0.5rem;
        }
        .btn-portal {
          background: #ffffff;
          color: #0a2a5e !important;
          padding: 0.6rem 1.25rem;
          font-size: 0.85rem;
          border-radius: 8px;
          opacity: 1 !important;
          font-weight: 700 !important;
        }
        .btn-portal:hover {
          background: #F5C518 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .btn-trainer {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff !important;
          padding: 0.6rem 1.25rem;
          font-size: 0.85rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          opacity: 1 !important;
        }
        .btn-trainer:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          border-color: #ffffff;
        }

        @media (max-width: 992px) {
           .nav-links a:not(.btn-portal):not(.btn-trainer) { display: none; }
           .nav-divider { display: none; }
        }
      `}</style>
    </nav>
  );
}
