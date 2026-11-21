'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SobrePage() {
  return (
    <main style={{ paddingTop: '74px' }}>
      <Navbar />

      <div className="page-banner">
        <div className="container">
          <div className="banner-badge">Institucional & Tradição</div>
          <h1>Sobre o Marítimo Training Center</h1>
          <p>Liderança e rigor técnico na formação de profissionais para a economia azul e indústria offshore de Angola.</p>
        </div>
      </div>

      <section className="container about-section">
        <div className="about-grid">
          <div className="about-text">
            <span className="section-label">A Nossa Trajetória</span>
            <h2>Compromisso com os Padrões Mais Exigentes da Navegação Mundial</h2>
            <p className="lead">
              Fundado para responder às exigências estratégicas da economia marítima e petrolífera em Angola, o <strong>Marítimo Training Center (MTC)</strong> consolidou-se como um centro de referência nacional e internacional.
            </p>
            <p>
              Preparamos oficiais, marinheiros e tripulações offshore com rigor operacional, promovendo a cultura de salvaguarda da vida humana no mar, proteção do ambiente marinho e excelência técnica em simuladores de alta precisão.
            </p>

            <div className="pillars-grid">
              <div className="pillar-card">
                <div className="pillar-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h4>Segurança Absoluta</h4>
                <p>Cultura de tolerância zero a incidentes em conformidade com o código ISM e convenção SOLAS.</p>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                </div>
                <h4>Conformidade IMO</h4>
                <p>Currículos homologados que cumprem integralmente as emendas de Manila da convenção STCW 2010.</p>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <h4>Simulação Avançada</h4>
                <p>Treinamento prático em passadiço virtual, manobra de emergência e radar ARPA.</p>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h4>Corpo Docente de Elite</h4>
                <p>Comandantes e oficiais da marinha mercante com décadas de experiência prática comprovada.</p>
              </div>
            </div>
          </div>

          <div className="about-visual-col">
            <div className="about-image card shadow-premium" style={{ backgroundImage: "url('/assets/hero/banner4.png')" }}>
              <div className="visual-overlay">
                <div className="badge-float">
                  <strong>+15 Anos</strong>
                  <span>De Tradição Marítima</span>
                </div>
              </div>
            </div>

            <div className="cert-panel card">
              <h4>Homologações & Credenciamentos</h4>
              <div className="cert-tags">
                <span className="cert-pill">IMO STCW 2010</span>
                <span className="cert-pill">Código ISPS</span>
                <span className="cert-pill">IMPA Angola</span>
                <span className="cert-pill">Flag State Approved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .page-banner {
          padding: 4.5rem 1.5rem;
          background-size: cover;
          background-position: center;
          background-image: linear-gradient(rgba(45, 24, 15, 0.88), rgba(45, 24, 15, 0.85)), url('/assets/hero/banner2.png');
          color: white;
          text-align: center;
        }
        .banner-badge {
          display: inline-block;
          background: rgba(230, 197, 168, 0.16);
          border: 1px solid rgba(230, 197, 168, 0.35);
          color: var(--color-sandstone, #E6C5A8);
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          padding: 0.35rem 0.95rem;
          border-radius: 50px;
          margin-bottom: 1rem;
        }
        .page-banner h1 {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .page-banner p {
          font-size: 1.15rem;
          opacity: 0.9;
          max-width: 640px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .about-section {
          padding: 5rem 1.5rem 6rem;
        }
        .about-grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        .section-label {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--color-accent, #EA580C);
          display: block;
          margin-bottom: 0.65rem;
        }
        .about-text h2 {
          font-size: 2.35rem;
          font-weight: 800;
          color: #2D180F;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }
        .lead {
          font-size: 1.15rem;
          color: #2D180F;
          font-weight: 500;
          line-height: 1.7;
          margin-bottom: 1.25rem;
        }
        .about-text p {
          font-size: 1rem;
          color: #64748B;
          line-height: 1.75;
          margin-bottom: 2rem;
        }

        .pillars-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .pillar-card {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #E6DDD4;
          box-shadow: 0 4px 16px rgba(45, 24, 15, 0.05);
          transition: all 0.25s ease;
        }
        .pillar-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-accent, #EA580C);
          box-shadow: 0 8px 24px rgba(45, 24, 15, 0.1);
        }
        .pillar-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: rgba(234, 88, 12, 0.12);
          color: var(--color-accent, #EA580C);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .pillar-card h4 {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 1.05rem;
          font-weight: 700;
          color: #2D180F;
          margin-bottom: 0.45rem;
        }
        .pillar-card p {
          font-size: 0.88rem;
          color: #78685E;
          line-height: 1.55;
          margin-bottom: 0;
        }

        .about-visual-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .about-image {
          height: 440px;
          background-size: cover;
          background-position: center;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }
        .visual-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(45, 24, 15, 0.7) 0%, transparent 50%);
          display: flex;
          align-items: flex-end;
          padding: 2rem;
        }
        .badge-float {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          padding: 1rem 1.5rem;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
        }
        .badge-float strong {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--color-accent, #EA580C);
          line-height: 1;
        }
        .badge-float span {
          font-size: 0.75rem;
          font-weight: 700;
          color: #2D180F;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-top: 4px;
        }

        .cert-panel {
          background: #2D180F;
          color: white;
          padding: 1.75rem;
          border-radius: 16px;
        }
        .cert-panel h4 {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.95rem;
          color: var(--color-sandstone, #E6C5A8);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }
        .cert-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .cert-pill {
          background: rgba(230, 197, 168, 0.16);
          border: 1px solid rgba(230, 197, 168, 0.35);
          color: white;
          font-size: 0.78rem;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 600;
          padding: 0.35rem 0.85rem;
          border-radius: 6px;
        }

        .shadow-premium {
          box-shadow: 0 20px 40px rgba(45, 24, 15, 0.12);
        }

        @media (max-width: 1024px) {
          .about-grid { grid-template-columns: 1fr; gap: 3rem; }
          .about-image { height: 320px; }
        }
        @media (max-width: 768px) {
          .page-banner h1 { font-size: 2.2rem; }
          .pillars-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
