'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const faqs = [
    {
        q: 'Quais são os pré-requisitos para se inscrever nos cursos?',
        a: 'Os pré-requisitos variam conforme o curso. Para cursos de nível básico como o STCW, é necessário ter pelo menos 18 anos e estar fisicamente apto. Para cursos técnicos avançados, pode ser exigida experiência prévia documentada ou certificados anteriores.'
    },
    {
        q: 'Os certificados emitidos são reconhecidos internacionalmente?',
        a: 'Sim. Nossos cursos seguem os padrões da IMO (International Maritime Organization) e são homologados pelas autoridades marítimas competentes, garantindo validade internacional conforme a convenção STCW.'
    },
    {
        q: 'Como funcionam os pagamentos?',
        a: 'Aceitamos pagamentos via transferência bancária, depósito e multicaixa. Para alguns cursos de longa duração, oferecemos planos de parcelamento. Entre em contato com nossa secretaria para detalhes específicos.'
    },
    {
        q: 'Existe alojamento para alunos que moram fora de Luanda?',
        a: 'Sim, temos parcerias com residências próximas ao centro que oferecem tarifas especiais para nossos alunos. Recomendamos solicitar informações sobre alojamento no ato da pré-inscrição.'
    },
    {
        q: 'Como posso validar meu certificado online?',
        a: 'Todos os nossos certificados possuem um QR Code único. Você pode usar a ferramenta de verificação em nosso site na aba "Validar Certificado" para confirmar a autenticidade do documento em tempo real.'
    }
];

export default function FAQPage() {
    return (
        <main style={{ paddingTop: '80px' }}>
            <Navbar />

            <div className="page-banner" style={{ backgroundImage: "linear-gradient(rgba(0, 31, 63, 0.7), rgba(0, 31, 63, 0.7)), url('/assets/hero/banner4.png')" }}>
                <div className="container">
                    <h1>Perguntas Frequentes</h1>
                    <p>Tire suas dúvidas sobre nossos cursos, processos e certificações.</p>
                </div>
            </div>

            <section className="container faq-section">
                <div className="faq-list">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="faq-item card">
                            <h3>{faq.q}</h3>
                            <p>{faq.a}</p>
                        </div>
                    ))}
                </div>

                <div className="faq-cta card shadow-premium">
                    <h3>Ainda tem dúvidas?</h3>
                    <p>Nossa equipe está disponível para conversar e ajudar você a escolher o melhor caminho para sua carreira.</p>
                    <a href="/contacto" className="btn btn-primary">Fale Conosco agora</a>
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

        .faq-section { padding: 6rem 1.5rem; max-width: 900px; }
        .faq-list { display: flex; flex-direction: column; gap: 2rem; margin-bottom: 4rem; }
        
        .faq-item { padding: 2.5rem; border-left: 6px solid var(--ocean-blue); transition: 0.3s; }
        .faq-item:hover { transform: translateX(10px); background: #f0f7ff; }
        .faq-item h3 { font-size: 1.3rem; margin-bottom: 1rem; color: var(--navy-deep); }
        .faq-item p { color: #64748b; font-size: 1.1rem; line-height: 1.7; margin-bottom: 0; }

        .faq-cta { text-align: center; padding: 4rem; background: var(--navy-deep); color: white; border-radius: 24px; }
        .faq-cta h3 { color: var(--sand-gold); font-size: 2rem; margin-bottom: 1rem; }
        .faq-cta p { font-size: 1.1rem; opacity: 0.8; margin-bottom: 2.5rem; }

        .shadow-premium { box-shadow: 0 30px 60px rgba(0, 31, 63, 0.2); }

        @media (max-width: 768px) {
          .page-banner h1 { font-size: 2rem; }
          .faq-cta { padding: 2rem; }
          .faq-cta h3 { font-size: 1.5rem; }
        }
      `}</style>
        </main>
    );
}
