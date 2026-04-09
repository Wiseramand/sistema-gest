'use client';

import Link from 'next/link';
import InscriptionForm from './components/InscriptionForm';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroCarousel from './components/HeroCarousel';
import CompanyMarquee from './components/CompanyMarquee';
import Testimonials from './components/Testimonials';

const partnersData = [
  { name: 'Sonangol', icon: '⛽' },
  { name: 'Cabgoc', icon: '⚓' },
  { name: 'TotalEnergies', icon: '⚡' },
  { name: 'Angola LNG', icon: '❄️' }
];

const clientsData = [
  { name: 'Somoil', icon: '🛢️' },
  { name: 'BPAngola', icon: '🚢' },
  { name: 'Eni Angola', icon: '🌊' },
  { name: 'Sodiba', icon: '🏭' },
];

export default function Home() {
  return (
    <main className="landing-main">
      <Navbar />

      {/* Hero Section with Carousel */}
      <HeroCarousel />

      {/* Features/Info Section */}
      <section className="features-section container">
        <div className="features-grid">
          <div className="feature-card">
            <div className="card-top">
              <span className="card-icon">⚓</span>
              <span className="card-badge">Certificado</span>
            </div>
            <h3>Formação Marítima STCW</h3>
            <p>Programas de formação teórica e prática em conformidade com as normas internacionais da IMO.</p>
            <div className="card-accent"></div>
          </div>
          
          <div className="feature-card highlighted">
            <div className="card-top">
              <span className="card-icon">👨‍🏫</span>
              <span className="card-badge gold">Elite</span>
            </div>
            <h3>Instrutores Qualificados</h3>
            <p>Corpo docente constituído por oficiais e marinheiros com vasta experiência em operações reais.</p>
            <div className="card-accent"></div>
          </div>
          
          <div className="feature-card">
            <div className="card-top">
              <span className="card-icon">🏛️</span>
              <span className="card-badge">Especializado</span>
            </div>
            <h3>Infraestrutura de Ponta</h3>
            <p>Salas equipadas com tecnologia de simulação náutica avançada para um aprendizado imersivo.</p>
            <div className="card-accent"></div>
          </div>
        </div>
      </section>

      {/* Partners & Clients Section */}
      <section style={{ backgroundColor: '#f8fafc', padding: '1rem 0' }}>
        <CompanyMarquee title="Parceiros Institucionais" companies={partnersData} />
        <CompanyMarquee title="Clientes de Excelência" companies={clientsData} reverse={true} />
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Call to Action Section */}
      <section className="cta-banner">
        <div className="container cta-content">
          <div className="cta-left">
            <h2>Pronto para iniciar sua carreira no mar?</h2>
            <p>Junte-se a centenas de profissionais formados por nossa instituição e reconhecidos globalmente.</p>
          </div>
          <div className="cta-right">
            <a href="#inscrever" className="cta-btn">Solicitar Informação <span>→</span></a>
          </div>
        </div>
      </section>

      {/* Inscription Form Section */}
      <section id="inscrever" className="inscription-section">
        <div className="container">
          <div className="inscription-container card-premium">
            <div className="form-header">
              <span className="header-label">Candidatura Online</span>
              <h2>Ficha de Pré-Inscrição</h2>
              <div className="header-line"></div>
              <p>Inicie sua jornada hoje mesmo. Preencha seus dados e um de nossos especialistas entrará em contato.</p>
            </div>
            <InscriptionForm />
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .landing-main {
          padding-top: 80px;
          background-color: var(--color-white);
          font-family: var(--font-body);
        }

        /* Features Section */
        .features-section {
          padding: 6rem 1.5rem;
          margin-top: -5rem;
          position: relative;
          z-index: 50;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: var(--color-white);
          padding: 3rem 2.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-md);
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: var(--color-primary-mid);
        }

        .feature-card.highlighted {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .feature-card.highlighted h3 { color: white; }
        .feature-card.highlighted p { opacity: 0.8; color: white; }
        .feature-card.highlighted .card-badge { background: rgba(255, 255, 255, 0.1); color: white; border-color: rgba(255, 255, 255, 0.2); }
        .feature-card.highlighted .card-badge.gold { background: var(--color-accent); color: var(--color-primary); }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .card-icon {
          font-size: 2.2rem;
          display: block;
        }

        .card-badge {
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 0.35rem 0.8rem;
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: 50px;
          border: 1px solid rgba(10, 42, 94, 0.1);
        }

        .feature-card h3 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .feature-card p {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--color-text-muted);
          margin-bottom: 1rem;
        }

        .card-accent {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 4px;
          background: var(--color-accent);
          transition: var(--transition);
        }

        .feature-card:hover .card-accent {
          width: 100%;
        }

        /* CTA Banner */
        .cta-banner {
          background: #0a2a5e;
          padding: 5rem 1.5rem;
          color: white;
          margin: 4rem 0;
          position: relative;
          overflow: hidden;
        }

        .cta-banner::after {
          content: '⚓';
          position: absolute;
          right: -50px;
          bottom: -50px;
          font-size: 15rem;
          opacity: 0.03;
          transform: rotate(-15deg);
        }

        .cta-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 3rem;
          position: relative;
          z-index: 10;
        }

        .cta-left h2 {
          font-family: var(--font-display);
          font-size: 2.5rem;
          color: white;
          margin-bottom: 1rem;
          font-weight: 800;
        }

        .cta-left p {
          font-size: 1.15rem;
          opacity: 0.8;
          max-width: 600px;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 2.5rem;
          background: var(--color-accent);
          color: var(--color-primary);
          border-radius: var(--radius-md);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: var(--transition);
          box-shadow: 0 10px 20px rgba(245, 197, 24, 0.2);
        }

        .cta-btn:hover {
          background: white;
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        }

        .cta-btn span { font-size: 1.2rem; }

        /* Inscription Section */
        .inscription-section {
          padding: 8rem 1.5rem;
          background: var(--color-surface);
        }

        .inscription-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 4.5rem;
          border-radius: var(--radius-xl);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-lg);
        }

        .form-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .header-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--color-primary-mid);
          display: block;
          margin-bottom: 1rem;
        }

        .form-header h2 {
          font-family: var(--font-display);
          font-size: 2.8rem;
          margin-bottom: 0.5rem;
          color: var(--color-primary);
          font-weight: 800;
          letter-spacing: -1px;
        }

        .header-line {
          width: 50px;
          height: 4px;
          background: var(--color-accent);
          margin: 1.5rem auto;
          border-radius: 2px;
        }

        .form-header p {
          color: var(--color-text-muted);
          font-size: 1.1rem;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }

        @media (max-width: 992px) {
          .cta-content { flex-direction: column; text-align: center; }
          .cta-left h2 { font-size: 2rem; }
          .inscription-container { padding: 3rem 2rem; }
          .form-header h2 { font-size: 2rem; }
        }

        @media (max-width: 768px) {
          .features-section { margin-top: 2rem; padding: 4rem 1.5rem; }
          .features-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
