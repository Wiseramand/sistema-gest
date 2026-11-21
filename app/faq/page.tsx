'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface FAQ {
  q: string;
  a: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    category: 'Inscrições',
    q: 'Quais são os pré-requisitos para se inscrever nos cursos marítimos?',
    a: 'Os pré-requisitos variam conforme o módulo. Para cursos de nível básico como o STCW Regra VI/1, é necessário ter pelo menos 18 anos de idade e apresentar atestado médico de aptidão física. Para cursos técnicos avançados ou revalidações, exige-se comprovação de tempo de embarque ou certificações prévias correspondentes.'
  },
  {
    category: 'Certificados',
    q: 'Os certificados emitidos pelo MTC são reconhecidos internacionalmente?',
    a: 'Sim, integralmente. Os cursos do Marítimo Training Center seguem os padrões e currículos da IMO (International Maritime Organization) e são homologados pelas autoridades competentes, possuindo validade global em armadores signatários da convenção STCW 2010.'
  },
  {
    category: 'Certificados',
    q: 'Como funciona a validação pública de autenticidade do certificado?',
    a: 'Cada certificado oficial emitido possui um código hash SHA-256 e um QR Code criptográfico. Qualquer autoridade portuária ou empregador pode escanear o QR Code para acessar instantaneamente a página pública de verificação e confirmar a veracidade dos dados em tempo real.'
  },
  {
    category: 'Pagamentos',
    q: 'Quais são as modalidades e prazos de pagamento aceitos?',
    a: 'Aceitamos pagamentos por transferência bancária, depósito em conta e Multicaixa (com envio de comprovativo). Para empresas e armadores, disponibilizamos faturação proforma e contratos corporativos com condições especiais.'
  },
  {
    category: 'Certificados',
    q: 'Qual é a periodicidade da Revalidação Quinquenal STCW?',
    a: 'Conforme a regulamentação STCW 2010, os módulos de Segurança Básica e Combate a Incêndios devem ser atualizados a cada 5 anos. Recomendamos aos marítimos iniciar o processo com pelo menos 60 a 90 dias de antecedência da expiração para evitar interrupções no embarque.'
  },
  {
    category: 'Instalações',
    q: 'Existe alojamento ou suporte para formandos residentes fora de Luanda?',
    a: 'Sim, possuímos parcerias institucionais com acomodações conveniadas na área de Luanda com tarifas reduzidas para nossos formandos. É possível solicitar assistência logística de alojamento durante o preenchimento da pré-inscrição.'
  },
  {
    category: 'Instalações',
    q: 'Como são realizadas as aulas práticas de simulador e sobrevivência?',
    a: 'As aulas teóricas e práticas de simulador ocorrem nas nossas instalações na Ilha de Luanda, em passadiços de simulação de alta precisão. Os exercícios práticos de salvatagem e combate a incêndios são conduzidos em tanques e campos de manobra especializados sob supervisão de oficiais experientes.'
  }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = ['Todos', 'Inscrições', 'Certificados', 'Pagamentos', 'Instalações'];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || faq.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main style={{ paddingTop: '74px' }}>
      <Navbar />

      <div className="page-banner">
        <div className="container">
          <div className="banner-badge">Suporte & Esclarecimentos</div>
          <h1>Perguntas Frequentes</h1>
          <p>Tire suas dúvidas técnicas sobre certificação STCW, matrículas, homologações IMO e instalações.</p>
        </div>
      </div>

      <div className="faq-search-bar">
        <div className="container search-box-wrap">
          <div className="search-field">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Pesquisar perguntas (ex: STCW, certificado, pagamento, simulador)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-tags">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`tag-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="container faq-section">
        <div className="faq-content-wrap">
          <div className="faq-list">
            {filteredFaqs.length === 0 ? (
              <div className="empty-faq">
                <p>Nenhuma pergunta corresponde à sua busca.</p>
                <button className="btn-clean" onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); }}>
                  Ver todas as perguntas
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div key={idx} className={`faq-accordion-item ${isOpen ? 'is-open' : ''}`}>
                    <button
                      type="button"
                      className="accordion-trigger"
                      onClick={() => toggleAccordion(idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="question-text">{faq.q}</span>
                      <div className="chevron-box">
                        <svg className={`chevron ${isOpen ? 'rotated' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="accordion-body">
                        <p>{faq.a}</p>
                        <span className="faq-category-tag">{faq.category}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="faq-cta card">
            <div className="cta-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3>Não encontrou a resposta que procura?</h3>
            <p>Nossa equipe técnica e pedagógica está à disposição para esclarecer qualquer procedimento de qualificação ou revalidação.</p>
            <div className="cta-buttons">
              <Link href="/contacto" className="btn btn-primary">
                Contactar Secretaria
              </Link>
              <a href="https://wa.me/244900000000" target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                Atendimento WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .page-banner {
          padding: 4.5rem 1.5rem;
          background: linear-gradient(rgba(45, 24, 15, 0.9), rgba(45, 24, 15, 0.88)), url('/assets/hero/banner2.png');
          background-size: cover;
          background-position: center;
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
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }
        .page-banner p {
          font-size: 1.15rem;
          opacity: 0.9;
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .faq-search-bar {
          background: #ffffff;
          border-bottom: 1px solid #EAE3DC;
          padding: 1.25rem 0;
          box-shadow: 0 4px 16px rgba(45, 24, 15, 0.05);
        }
        .search-box-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .search-field {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 280px;
          max-width: 500px;
        }
        .search-field svg {
          position: absolute;
          left: 14px;
          color: #9CA3AF;
          pointer-events: none;
        }
        .search-field input {
          width: 100%;
          padding: 0.7rem 1rem 0.7rem 2.6rem;
          border: 1.5px solid #E0D6CD;
          border-radius: 8px;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          font-size: 0.925rem;
          color: #2D180F;
          outline: none;
          transition: all 0.2s ease;
        }
        .search-field input:focus {
          border-color: var(--color-accent, #EA580C);
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.14);
        }

        .category-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .tag-btn {
          background: #F8F4EF;
          border: 1px solid #E2D7CC;
          color: #5C4A3A;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tag-btn:hover {
          background: #EFE8DF;
          color: #2D180F;
        }
        .tag-btn.active {
          background: var(--color-accent, #EA580C);
          border-color: var(--color-accent, #EA580C);
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3);
        }

        .faq-section {
          padding: 3.5rem 1.5rem 6rem;
        }
        .faq-content-wrap {
          max-width: 860px;
          margin: 0 auto;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 3.5rem;
        }

        .faq-accordion-item {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #E6DDD4;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        .faq-accordion-item:hover {
          border-color: var(--color-accent, #EA580C);
        }
        .faq-accordion-item.is-open {
          border-color: var(--color-accent, #EA580C);
          box-shadow: 0 8px 24px rgba(45, 24, 15, 0.08);
        }

        .accordion-trigger {
          width: 100%;
          text-align: left;
          padding: 1.25rem 1.5rem;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          cursor: pointer;
        }
        .question-text {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          font-size: 1.1rem;
          color: #2D180F;
          line-height: 1.4;
        }
        .chevron-box {
          color: var(--color-accent, #EA580C);
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .chevron {
          transition: transform 0.25s ease;
        }
        .chevron.rotated {
          transform: rotate(180deg);
        }

        .accordion-body {
          padding: 0 1.5rem 1.35rem;
          border-top: 1px solid #F4EDE6;
          padding-top: 1rem;
        }
        .accordion-body p {
          font-size: 0.95rem;
          line-height: 1.65;
          color: #5C4A3A;
          margin-bottom: 0.85rem;
        }
        .faq-category-tag {
          display: inline-block;
          font-size: 0.72rem;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          background: #F8F4EF;
          color: #78685E;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
        }

        .faq-cta {
          background: linear-gradient(135deg, #2D180F 0%, #1A0D07 100%);
          color: white;
          padding: 3rem 2.5rem;
          border-radius: 18px;
          text-align: center;
          box-shadow: 0 16px 36px rgba(45, 24, 15, 0.2);
        }
        .cta-icon-box {
          color: var(--color-accent, #EA580C);
          margin-bottom: 1rem;
        }
        .faq-cta h3 {
          color: white;
          font-size: 1.6rem;
          margin-bottom: 0.75rem;
          font-weight: 800;
        }
        .faq-cta p {
          color: #E6C5A8;
          font-size: 1.05rem;
          max-width: 560px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }
        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-whatsapp {
          background: #15803D;
          color: white;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          transition: background 0.2s ease;
        }
        .btn-whatsapp:hover {
          background: #166534;
        }

        .empty-faq {
          text-align: center;
          padding: 3rem 1rem;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #E6DDD4;
        }
        .empty-faq p {
          color: #78685E;
          margin-bottom: 1rem;
        }
        .btn-clean {
          background: #2D180F;
          color: white;
          border: none;
          padding: 0.55rem 1.25rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .page-banner h1 { font-size: 2.2rem; }
          .search-box-wrap { flex-direction: column; align-items: stretch; }
          .search-field { max-width: 100%; }
        }
      `}</style>
    </main>
  );
}
