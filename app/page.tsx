'use client';

import Link from 'next/link';
import InscriptionForm from './components/InscriptionForm';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="maritime-accent"></div>
            <h1>Centro de Formação Marítimo</h1>
            <p className="hero-subtitle">Excelência em educação náutica e segurança marítima. Prepare-se para o futuro nos mares.</p>
            <div className="hero-actions">
              <a href="#inscrever" className="btn btn-primary">Inscreva-se Agora</a>
              <Link href="/login" className="btn btn-outline">Portal do Aluno</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Info Section */}
      <section className="info-section container">
        <div className="grid-auto">
          <div className="card">
            <h3>Cursos Certificados</h3>
            <p>Programas de formação reconhecidos internacionalmente para marinheiros e oficiais.</p>
          </div>
          <div className="card">
            <h3>Instrutores Experientes</h3>
            <p>Equipe formada por profissionais com décadas de experiência real em navegação.</p>
          </div>
          <div className="card">
            <h3>Infraestrutura Moderna</h3>
            <p>Salas de aula equipadas e tecnologia de ponta para simulação marítima.</p>
          </div>
        </div>
      </section>

      {/* Inscription Form Section */}
      <section id="inscrever" className="inscription-section container">
        <div className="form-wrapper card">
          <div className="form-header">
            <h2>Pré-Inscrição</h2>
            <p>Preencha os dados abaixo para iniciar seu processo de formação.</p>
          </div>
          <InscriptionForm />
        </div>
      </section>

      <style jsx>{`
        .hero {
          background: linear-gradient(rgba(0, 31, 63, 0.8), rgba(0, 31, 63, 0.8)), url('https://images.unsplash.com/photo-1524522173746-f628baad3644?q=80&w=2000&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          color: white;
          padding: 8rem 0;
          text-align: left;
        }

        .hero h1 {
          color: white;
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
          max-width: 700px;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          max-width: 600px;
          opacity: 0.9;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
        }

        .info-section {
          padding: 4rem 0;
          margin-top: -4rem;
        }

        .inscription-section {
          padding: 4rem 0 8rem;
        }

        .form-wrapper {
          max-width: 600px;
          margin: 0 auto;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.5rem;
          }
          .hero-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
