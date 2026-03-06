'use client';

import Link from 'next/link';
import InscriptionForm from './components/InscriptionForm';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroCarousel from './components/HeroCarousel';

export default function Home() {
  return (
    <main>
      <Navbar />

      {/* Hero Section with Carousel */}
      <HeroCarousel />

      {/* Features/Info Section */}
      <section className="info-section container">
        <div className="grid-auto">
          <div className="card shadow-premium">
            <div className="card-icon">⚓</div>
            <h3>Cursos Certificados</h3>
            <p>Programas de formação reconhecidos internacionalmente para marinheiros e oficiais.</p>
          </div>
          <div className="card shadow-premium">
            <div className="card-icon">👨‍🏫</div>
            <h3>Instrutores Experientes</h3>
            <p>Equipe formada por profissionais com décadas de experiência real em navegação.</p>
          </div>
          <div className="card shadow-premium">
            <div className="card-icon">🏛️</div>
            <h3>Infraestrutura Moderna</h3>
            <p>Salas de aula equipadas e tecnologia de ponta para simulação marítima.</p>
          </div>
        </div>
      </section>

      {/* Inscription Form Section */}
      <section id="inscrever" className="inscription-section container">
        <div className="form-wrapper card shadow-premium">
          <div className="form-header">
            <div className="maritime-accent-center"></div>
            <h2>Ficha de Pré-Inscrição</h2>
            <p>Inicie sua jornada hoje mesmo. Preencha seus dados para entrar em contato.</p>
          </div>
          <InscriptionForm />
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .info-section {
          padding: 6rem 0;
          margin-top: -5rem;
          position: relative;
          z-index: 30;
        }

        .card-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .shadow-premium {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .inscription-section {
          padding: 6rem 0 10rem;
          background: #f8fafc;
          margin-top: 4rem;
        }

        .form-wrapper {
          max-width: 650px;
          margin: 0 auto;
          background: white;
          padding: 3rem;
          border-radius: 20px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .form-header h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .maritime-accent-center {
          width: 40px;
          height: 4px;
          background: var(--coral-accent);
          margin: 0 auto 1.5rem;
          border-radius: 2px;
        }

        @media (max-width: 768px) {
          .info-section { margin-top: 2rem; padding: 4rem 0; }
          .form-wrapper { padding: 1.5rem; }
        }
      `}</style>
    </main>
  );
}
