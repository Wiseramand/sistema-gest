'use client';

import { useState, useEffect } from 'react';

const banners = [
  {
    image: '/assets/hero/banner1.png',
    title: 'Excelência em Formação Marítima',
    subtitle: 'Liderando o caminho para uma navegação segura e profissional em águas globais.'
  },
  {
    image: '/assets/hero/banner2.png',
    title: 'Simuladores de Alta Tecnologia',
    subtitle: 'Treine em ambientes controlados com a tecnologia mais avançada do mercado.'
  },
  {
    image: '/assets/hero/banner3.png',
    title: 'Segurança em Primeiro Lugar',
    subtitle: 'Cursos práticos de sobrevivência e combate a incêndios com instrutores de elite.'
  },
  {
    image: '/assets/hero/banner4.png',
    title: 'Certificações STCW / ISPS',
    subtitle: 'Sua carreira sem fronteiras. Diplomas reconhecidos internacionalmente.'
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-carousel">
      {banners.map((banner, idx) => (
        <div
          key={idx}
          className={`slide ${idx === current ? 'active' : ''}`}
          style={{ backgroundImage: `linear-gradient(rgba(10, 42, 94, 0.7), rgba(10, 42, 94, 0.4)), url(${banner.image})` }}
        >
          <div className="container slide-content">
            <div className="brand-badge">⚓ Marítimo Training Center</div>
            <h1>{banner.title}</h1>
            <p className="hero-subtitle">{banner.subtitle}</p>
            <div className="hero-actions">
              <a href="#inscrever" className="hero-btn primary">Inscrever-se agora</a>
              <a href="/cursos" className="hero-btn secondary">Conhecer Cursos</a>
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
          height: 700px;
          overflow: hidden;
          background: #0a2a5e;
          font-family: 'DM Sans', sans-serif;
        }
        .slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.2s ease-in-out, transform 10s linear;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          transform: scale(1.1);
        }
        .slide.active {
          opacity: 1;
          transform: scale(1);
        }
        .slide-content {
          max-width: 900px;
          color: white;
          z-index: 10;
        }
        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #F5C518;
          color: #0a2a5e;
          padding: 0.4rem 1rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .slide-content h1 {
          font-family: 'Outfit', sans-serif;
          color: white;
          font-size: 4rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          text-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .hero-subtitle {
          font-size: 1.35rem;
          margin-bottom: 3rem;
          opacity: 0.9;
          max-width: 600px;
          line-height: 1.6;
          text-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .hero-actions {
          display: flex;
          gap: 1.5rem;
        }
        
        .hero-btn {
          padding: 1.1rem 2.5rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .hero-btn.primary {
          background: #F5C518;
          color: #0a2a5e;
          box-shadow: 0 10px 20px rgba(245, 197, 24, 0.2);
        }
        .hero-btn.primary:hover {
          background: #ffffff;
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(245, 197, 24, 0.3);
        }
        .hero-btn.secondary {
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.4);
          color: white;
          backdrop-filter: blur(5px);
        }
        .hero-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
          transform: translateY(-3px);
        }

        .carousel-dots {
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1rem;
          z-index: 20;
        }
        .dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          border: none;
          cursor: pointer;
          transition: all 0.4s ease;
        }
        .dot.active {
          background: #F5C518;
          transform: scale(1.4);
          box-shadow: 0 0 15px rgba(245, 197, 24, 0.5);
        }

        @media (max-width: 992px) {
          .slide-content h1 { font-size: 3rem; }
        }
        @media (max-width: 768px) {
          .hero-carousel { height: 600px; }
          .slide-content h1 { font-size: 2.5rem; }
          .hero-subtitle { font-size: 1.1rem; }
          .hero-actions { flex-direction: column; gap: 1rem; }
          .hero-btn { width: 100%; text-align: center; }
        }
      `}</style>
    </section>
  );
}
