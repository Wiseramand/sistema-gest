'use client';

import React, { useState } from 'react';

const quotes = [
  {
    id: 1,
    text: "A exigência militar combinada com a precisão comercial. O MTC preparou-me para operar sob pressão total.",
    author: "João Mateus",
    role: "Oficial de Náutica Pleno",
    company: "Cabgoc"
  },
  {
    id: 2,
    text: "Instalações imersivas que espelham perfeitamente a realidade em alto mar. Foi um divisor de águas na minha carreira offshore.",
    author: "Mariana Silva",
    role: "Engenheira Chefe",
    company: "Sonangol P&P"
  },
  {
    id: 3,
    text: "O rigor certificado pelo IMO transmite uma confiança ímpar aos recém-graduados. A melhor instituição marítima de Angola, sem dúvida.",
    author: "Fernando Costa",
    role: "Comandante",
    company: "Somoil"
  }
];

export default function Testimonials() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="testimonials-header">
          <span className="section-label">O que Dizem Sobre Nós</span>
          <h2>A Opinião dos Nossos Alunos</h2>
          <div className="header-line"></div>
        </div>

        <div className="testimonials-grid">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className={`testimonial-card ${hoveredId === quote.id ? 'focused' : hoveredId !== null ? 'dimmed' : ''}`}
              onMouseEnter={() => setHoveredId(quote.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="quote-icon">“</div>
              <p className="quote-text">{quote.text}</p>
              
              <div className="quote-author-wrap">
                <div className="author-details">
                  <span className="author-name">{quote.author}</span>
                  <span className="author-role">{quote.role} <span>@ {quote.company}</span></span>
                </div>
              </div>
              <div className="card-accent"></div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .testimonials-section {
          padding: 8rem 0;
          background-color: var(--color-white);
        }

        .testimonials-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .section-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 3px;
          color: var(--color-accent);
          display: block;
          margin-bottom: 1rem;
        }

        .testimonials-header h2 {
          font-family: var(--font-display);
          font-size: 3rem;
          color: var(--color-primary);
          margin-bottom: 1rem;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .header-line {
          width: 60px;
          height: 4px;
          background: var(--color-accent);
          margin: 0 auto;
          border-radius: 2px;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2.5rem;
          align-items: stretch;
        }

        .testimonial-card {
          background: var(--color-surface);
          padding: 3.5rem 2.5rem;
          border-radius: var(--radius-xl);
          position: relative;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          border: 1px solid transparent;
          display: flex;
          flex-direction: column;
          cursor: crosshair;
        }

        .testimonial-card.focused {
          background: var(--color-primary);
          color: white;
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 25px 50px rgba(10, 42, 94, 0.2);
          z-index: 10;
        }

        .testimonial-card.dimmed {
          opacity: 0.4;
          transform: scale(0.98);
        }

        .quote-icon {
          font-family: Georgia, serif;
          font-size: 6rem;
          line-height: 0;
          position: absolute;
          top: 3.5rem;
          left: 1.5rem;
          color: rgba(10, 42, 94, 0.05);
          transition: 0.4s;
        }

        .testimonial-card.focused .quote-icon {
          color: rgba(245, 197, 24, 0.2);
        }

        .quote-text {
          font-size: 1.35rem;
          line-height: 1.6;
          font-weight: 500;
          color: var(--color-text);
          margin-bottom: 3rem;
          position: relative;
          z-index: 2;
          transition: 0.4s;
        }

        .testimonial-card.focused .quote-text {
          color: white;
        }

        .quote-author-wrap {
          margin-top: auto;
          display: flex;
          align-items: center;
          border-top: 1px solid var(--color-border);
          padding-top: 1.5rem;
          transition: 0.4s;
        }

        .testimonial-card.focused .quote-author-wrap {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .author-details {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--color-primary);
          margin-bottom: 0.25rem;
          transition: 0.4s;
        }

        .testimonial-card.focused .author-name {
          color: var(--color-accent);
        }

        .author-role {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          transition: 0.4s;
        }

        .testimonial-card.focused .author-role {
          color: rgba(255, 255, 255, 0.8);
        }

        .author-role span {
          font-weight: 700;
        }

        .card-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 100%;
          background: var(--color-accent);
          transition: 0.4s ease-out;
          opacity: 0;
          border-radius: var(--radius-xl) 0 0 var(--radius-xl);
          z-index: 1;
        }

        .testimonial-card.focused .card-accent {
          width: 6px;
          opacity: 1;
        }

        @media (max-width: 992px) {
          .testimonials-header h2 { font-size: 2.5rem; }
          .quote-text { font-size: 1.15rem; }
        }

        @media (max-width: 768px) {
          .testimonials-section { padding: 4rem 1.5rem; }
          .testimonial-card { padding: 2.5rem 1.5rem; }
          .quote-icon { font-size: 4rem; top: 2.5rem; left: 1rem; }
        }
      `}</style>
    </section>
  );
}
