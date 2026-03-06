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
        title: 'Certificação Internacional',
        subtitle: 'Sua carreira sem fronteiras. Diplomas reconhecidos por instituições mundiais.'
    }
];

export default function HeroCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="hero-carousel">
            {banners.map((banner, idx) => (
                <div
                    key={idx}
                    className={`slide ${idx === current ? 'active' : ''}`}
                    style={{ backgroundImage: `linear-gradient(rgba(0, 31, 63, 0.6), rgba(0, 31, 63, 0.6)), url(${banner.image})` }}
                >
                    <div className="container slide-content">
                        <div className="maritime-accent"></div>
                        <h1>{banner.title}</h1>
                        <p className="hero-subtitle">{banner.subtitle}</p>
                        <div className="hero-actions">
                            <a href="#inscrever" className="btn btn-primary">Inscreva-se Agora</a>
                            <a href="/cursos" className="btn btn-outline-white">Conheça Nossos Cursos</a>
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
                    ></button>
                ))}
            </div>

            <style jsx>{`
        .hero-carousel {
          position: relative;
          height: 600px;
          overflow: hidden;
          background: #001f3f;
        }
        .slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1s ease-in-out, transform 8s linear;
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
          max-width: 800px;
          color: white;
          z-index: 10;
        }
        .slide-content h1 {
          color: white;
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          text-shadow: 0 4px 10px rgba(0,0,0,0.3);
          animation: fadeInUp 0.8s ease forwards;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 2.5rem;
          opacity: 0.9;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          animation: fadeInUp 0.8s ease 0.2s forwards;
        }
        .hero-actions {
          display: flex;
          gap: 1.5rem;
          animation: fadeInUp 0.8s ease 0.4s forwards;
        }
        
        .btn-outline-white {
          background: transparent;
          border: 2px solid white;
          color: white;
        }
        .btn-outline-white:hover {
          background: white;
          color: var(--navy-deep);
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
          background: rgba(255,255,255,0.3);
          border: none;
          cursor: pointer;
          transition: 0.3s;
        }
        .dot.active {
          background: var(--sand-gold);
          transform: scale(1.3);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .hero-carousel { height: 500px; }
          .slide-content h1 { font-size: 2.2rem; }
          .hero-actions { flex-direction: column; gap: 1rem; }
        }
      `}</style>
        </section>
    );
}
