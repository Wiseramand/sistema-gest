'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const banners = [
  {
    image: '/assets/hero/banner1.png',
    tag: 'IMO & STCW Certified',
    title: 'Excelência em Formação Marítima & Offshore',
    subtitle: 'Capacitamos profissionais de elite para conduzir as operações marítimas mais exigentes com os mais altos padrões de segurança global.'
  },
  {
    image: '/assets/hero/banner2.png',
    tag: 'Tecnologia Avançada',
    title: 'Simuladores Náuticos de Última Geração',
    subtitle: 'Treine cenários reais de passadiço, casa de máquinas e navegação em simuladores certificados pelas principais autoridades de bandeira.'
  },
  {
    image: '/assets/hero/banner3.png',
    tag: 'Segurança Operacional',
    title: 'Treinamento Prático de Salvaguarda da Vida',
    subtitle: 'Cursos práticos de sobrevivência no mar, combate a incêndio avançado e primeiros socorros com instrutores oficiais de marinha.'
  },
  {
    image: '/assets/hero/banner4.png',
    tag: 'Reconhecimento Internacional',
    title: 'Certificações STCW com Validação Online',
    subtitle: 'Certificados emitidos com assinatura criptográfica e QR Code para verificação instantânea por armadores em qualquer porto do mundo.'
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-carousel">
      {banners.map((banner, idx) => (
        <div
          key={idx}
          className={`slide ${idx === current ? 'active' : ''}`}
          style={{ backgroundImage: `linear-gradient(rgba(45, 24, 15, 0.86), rgba(45, 24, 15, 0.65)), url(${banner.image})` }}
        >
          <div className="container slide-content">
            <div className="brand-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="5" r="3"/>
                <line x1="12" y1="8" x2="12" y2="21"/>
                <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
              </svg>
              <span>{banner.tag}</span>
            </div>
            
            <h1>{banner.title}</h1>
            <p className="hero-subtitle">{banner.subtitle}</p>

            <div className="hero-actions">
              <a href="#inscrever" className="hero-btn primary">
                Pré-Inscrição Online
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
              <Link href="/cursos" className="hero-btn secondary">
                Ver Catálogo de Cursos
              </Link>
            </div>

            {/* Micro stats banner */}
            <div className="hero-stats">
              <div className="stat-unit">
                <strong className="stat-value">500+</strong>
                <span className="stat-text">Marítimos Formados</span>
              </div>
              <div className="stat-sep"></div>
              <div className="stat-unit">
                <strong className="stat-value">98%</strong>
                <span className="stat-text">Taxa de Aprovação</span>
              </div>
              <div className="stat-sep"></div>
              <div className="stat-unit">
                <strong className="stat-value">IMO / STCW</strong>
                <span className="stat-text">Homologado</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="carousel-dots">
        {banners.map((_, idx) => (
          <button
            key={idx}
            className={`dot ${idx === current ? 'active' : ''}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Slide ${idx + 1}`}
          ></button>
        ))}
      </div>

      <style jsx>{`
        .hero-carousel {
          position: relative;
          min-height: 720px;
          overflow: hidden;
          background: #2D180F;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          display: flex;
          align-items: center;
        }
        .slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.2s ease-in-out, transform 8s linear;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          padding-top: 5rem;
          padding-bottom: 4rem;
          transform: scale(1.06);
        }
        .slide.active {
          opacity: 1;
          transform: scale(1);
        }
        .slide-content {
          max-width: 960px;
          color: white;
          z-index: 10;
        }
        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(230, 197, 168, 0.18);
          border: 1px solid rgba(230, 197, 168, 0.35);
          color: var(--color-sandstone, #E6C5A8);
          padding: 0.4rem 1.1rem;
          border-radius: 50px;
          font-size: 0.78rem;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(6px);
        }

        .slide-content h1 {
          font-family: var(--font-display, 'Outfit', sans-serif);
          color: white;
          font-size: 3.6rem;
          line-height: 1.12;
          margin-bottom: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          text-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
        }
        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 2.5rem;
          opacity: 0.92;
          max-width: 680px;
          line-height: 1.65;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          color: #F8F4EF;
        }
        .hero-actions {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }
        
        .hero-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2.2rem;
          border-radius: 10px;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          font-size: 1rem;
          transition: all 0.25s ease;
          text-decoration: none;
        }
        .hero-btn.primary {
          background: var(--color-accent, #EA580C);
          color: #ffffff;
          box-shadow: 0 8px 24px rgba(234, 88, 12, 0.42);
        }
        .hero-btn.primary:hover {
          background: var(--color-accent-hover, #C2410C);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(234, 88, 12, 0.52);
        }
        .hero-btn.secondary {
          background: rgba(230, 197, 168, 0.14);
          border: 1.5px solid rgba(230, 197, 168, 0.4);
          color: #ffffff;
          backdrop-filter: blur(8px);
        }
        .hero-btn.secondary:hover {
          background: rgba(230, 197, 168, 0.25);
          border-color: var(--color-sandstone, #E6C5A8);
          color: var(--color-sandstone, #E6C5A8);
          transform: translateY(-2px);
        }

        /* Micro stats */
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(230, 197, 168, 0.2);
          max-width: 650px;
        }
        .stat-unit {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 1.45rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        }
        .stat-text {
          font-size: 0.75rem;
          color: var(--color-sandstone, #E6C5A8);
          opacity: 0.85;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-top: 2px;
        }
        .stat-sep {
          width: 1px;
          height: 32px;
          background: rgba(230, 197, 168, 0.25);
        }

        .carousel-dots {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.75rem;
          z-index: 20;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .dot.active {
          background: var(--color-accent, #EA580C);
          width: 28px;
          border-radius: 10px;
          box-shadow: 0 0 14px rgba(234, 88, 12, 0.6);
        }

        @media (max-width: 992px) {
          .slide-content h1 { font-size: 2.8rem; }
          .hero-stats { gap: 1.5rem; }
        }
        @media (max-width: 768px) {
          .hero-carousel { min-height: 640px; }
          .slide-content h1 { font-size: 2.2rem; }
          .hero-subtitle { font-size: 1.05rem; }
          .hero-actions { flex-direction: column; gap: 0.85rem; }
          .hero-btn { width: 100%; justify-content: center; }
          .hero-stats { flex-wrap: wrap; gap: 1rem; }
          .stat-sep { display: none; }
        }
      `}</style>
    </section>
  );
}
