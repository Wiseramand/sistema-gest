'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SobrePage() {
    return (
        <main style={{ paddingTop: '80px' }}>
            <Navbar />

            <div className="page-banner" style={{ backgroundImage: "linear-gradient(rgba(0, 31, 63, 0.7), rgba(0, 31, 63, 0.7)), url('/assets/hero/banner2.png')" }}>
                <div className="container">
                    <h1>Sobre a Instituição</h1>
                    <p>Liderança e tradição na formação de profissionais para a economia azul.</p>
                </div>
            </div>

            <section className="container about-section">
                <div className="about-grid">
                    <div className="about-text">
                        <h2>Nossa História</h2>
                        <p>Fundado com o objetivo de elevar os padrões da educação marítima em Angola, o Marítimo Training Center tornou-se uma referência nacional e regional.</p>
                        <p>Com instalações modernas e um corpo docente altamente qualificado, preparamos nossos alunos para os desafios reais da vida no mar, garantindo segurança, competência e ética profissional.</p>

                        <div className="values-grid">
                            <div className="value-card">
                                <span className="icon">🛡️</span>
                                <h4>Segurança</h4>
                                <p>O pilar fundamental de todo o nosso treinamento.</p>
                            </div>
                            <div className="value-card">
                                <span className="icon">⚓</span>
                                <h4>Excelência</h4>
                                <p>Buscamos os mais altos padrões de ensino técnico.</p>
                            </div>
                        </div>
                    </div>
                    <div className="about-image card shadow-premium" style={{ backgroundImage: "url('/assets/hero/banner4.png')" }}>
                    </div>
                </div>
            </section>

            <Footer />

            <style jsx>{`
        .page-banner {
          height: 300px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          color: white;
          text-align: center;
        }
        .page-banner h1 { color: white; font-size: 3rem; margin-bottom: 1rem; }
        .page-banner p { font-size: 1.2rem; opacity: 0.9; max-width: 600px; margin: 0 auto; }

        .about-section { padding: 6rem 1.5rem; }
        .about-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 4rem; align-items: center; }
        
        .about-text h2 { font-size: 2.25rem; margin-bottom: 1.5rem; }
        .about-text p { font-size: 1.1rem; color: #64748b; line-height: 1.8; margin-bottom: 2rem; }

        .values-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 3rem; }
        .value-card { background: #f8fafc; padding: 1.5rem; border-radius: 12px; }
        .value-card .icon { font-size: 2rem; display: block; margin-bottom: 1rem; }
        .value-card h4 { margin-bottom: 0.5rem; color: var(--navy-deep); }
        .value-card p { font-size: 0.9rem; margin-bottom: 0; line-height: 1.5; }

        .about-image { height: 500px; background-size: cover; background-position: center; border-radius: 20px; }

        .shadow-premium { box-shadow: 0 20px 40px rgba(0,0,0,0.1); }

        @media (max-width: 1024px) {
          .about-grid { grid-template-columns: 1fr; gap: 3rem; }
          .about-image { height: 300px; order: -1; }
        }

        @media (max-width: 768px) {
          .page-banner h1 { font-size: 2rem; }
          .values-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </main>
    );
}
