'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={`navbar ${isOpen ? 'is-open' : ''}`}>
      <div className="container nav-container">
        <Link href="/" className="nav-logo">
          <span className="logo-icon">⚓</span>
          <div className="logo-text">
            <span className="main">MARÍTIMO</span>
            <span className="sub">Training Center</span>
          </div>
        </Link>

        {/* Hamburger Toggle */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link href="/cursos" onClick={() => setIsOpen(false)}>Cursos</Link>
          <Link href="/sobre" onClick={() => setIsOpen(false)}>Sobre Nós</Link>
          <div className="nav-divider"></div>
          <Link href="/login" className="btn-portal" onClick={() => setIsOpen(false)}>Portal do Aluno</Link>
          <Link href="/professor/login" className="btn-trainer" onClick={() => setIsOpen(false)}>Portal Formador</Link>
        </div>
      </div>
      <style jsx>{`
        .navbar {
          background: var(--color-primary);
          color: white;
          padding: 1rem 0;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 2000;
          box-shadow: 0 4px 20px rgba(45, 24, 15, 0.25);
          border-bottom: 1px solid rgba(230, 197, 168, 0.15);
          transition: 0.3s;
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
        }
        .logo-icon {
          font-size: 1.5rem;
          background: var(--color-accent);
          color: #ffffff;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3);
        }
        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .logo-text .main {
          font-family: var(--font-display);
          font-weight: 800;
          letter-spacing: 1px;
          font-size: 1.15rem;
          color: #ffffff;
        }
        .logo-text .sub {
          font-family: var(--font-display);
          font-size: 0.65rem;
          text-transform: uppercase;
          opacity: 0.85;
          letter-spacing: 1.2px;
          color: var(--color-sandstone);
          margin-top: 1px;
        }

        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 1.8rem;
          cursor: pointer;
          z-index: 2001;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-links a {
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.25s ease;
          color: #ffffff;
          opacity: 0.88;
        }
        .nav-links a:hover {
          opacity: 1;
          color: var(--color-sandstone);
        }
        .nav-divider {
          width: 1px;
          height: 20px;
          background: rgba(230, 197, 168, 0.25);
          margin: 0 0.5rem;
        }
        .btn-portal {
          background: var(--color-accent);
          color: #ffffff !important;
          padding: 0.6rem 1.25rem;
          font-size: 0.85rem;
          border-radius: 8px;
          opacity: 1 !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
          transition: var(--transition);
        }
        .btn-portal:hover {
          background: var(--color-accent-hover) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(234, 88, 12, 0.4);
        }
        .btn-trainer {
          background: rgba(230, 197, 168, 0.12);
          color: var(--color-sandstone) !important;
          padding: 0.6rem 1.25rem;
          font-size: 0.85rem;
          border-radius: 8px;
          border: 1px solid rgba(230, 197, 168, 0.3);
          opacity: 1 !important;
          transition: var(--transition);
        }
        .btn-trainer:hover {
          background: rgba(230, 197, 168, 0.25);
          border-color: var(--color-sandstone);
        }

        @media (max-width: 992px) {
          .mobile-toggle { display: block; }

          .nav-links {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            height: 100vh;
            background: var(--color-primary);
            flex-direction: column;
            justify-content: center;
            padding: 2rem;
            transition: 0.3s ease-in-out;
            box-shadow: -10px 0 30px rgba(0,0,0,0.4);
            z-index: 2000;
          }

          .nav-links.active {
            right: 0;
          }

          .nav-links a {
            font-size: 1.4rem;
            width: 100%;
            text-align: center;
            padding: 1rem 0;
          }

          .nav-divider { display: none; }
          
          .btn-portal, .btn-trainer {
            width: 100%;
            padding: 1.2rem;
            font-size: 1.1rem;
            margin-top: 1rem;
          }
        }
      `}</style>
    </nav>
  );
}
