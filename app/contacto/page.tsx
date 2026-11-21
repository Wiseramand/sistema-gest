'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Informações sobre Cursos STCW',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Envio via endpoint de contato/inscrições ou fallback simulado
      const res = await fetch('/api/inscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          course: formData.subject,
          message: formData.message
        })
      });

      if (res.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Informações sobre Cursos STCW',
          message: ''
        });
        setTimeout(() => setStatus('idle'), 6000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setStatus('error');
    }
  };

  return (
    <main style={{ paddingTop: '74px' }}>
      <Navbar />

      <div className="page-banner">
        <div className="container">
          <div className="banner-badge">Atendimento & Apoio Técnico</div>
          <h1>Fale Connosco</h1>
          <p>Estamos prontos para orientar o seu percurso na economia azul com consultoria personalizada de formação marítima.</p>
        </div>
      </div>

      <section className="container contact-section">
        <div className="contact-grid">
          {/* Informações de Contacto */}
          <div className="contact-info-col">
            <div className="contact-info card">
              <h2>Informações Institucionais</h2>
              <p className="contact-lead">Visite a nossa sede operacional em Luanda ou entre em contacto com a nossa secretaria.</p>

              <div className="info-item">
                <div className="icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <h4>Localização</h4>
                  <p>Avenida da Independência, Edifício Maritime, Ilha de Luanda, Angola</p>
                  <span className="badge-loc">Zona Portuária & de Simulação</span>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <h4>Telefones Directos</h4>
                  <p><a href="tel:+244923000000">+244 923 000 000</a> (Geral)</p>
                  <p><a href="tel:+244990000000">+244 990 000 000</a> (Secretaria Pedagógica)</p>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <h4>E-mails Oficiais</h4>
                  <p><a href="mailto:secretaria@maritimo-training.com">secretaria@maritimo-training.com</a></p>
                  <p><a href="mailto:pedagogico@maritimo-training.com">pedagogico@maritimo-training.com</a></p>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <h4>Horário de Atendimento</h4>
                  <p>Segunda a Sexta: <strong>08h00 às 17h00</strong></p>
                  <p>Sábados: <strong>08h30 às 13h00</strong> (Aulas práticas e secretaria)</p>
                </div>
              </div>
            </div>

            {/* Localização Badge */}
            <div className="location-card card">
              <div className="loc-head">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                  <line x1="9" y1="3" x2="9" y2="18"></line>
                  <line x1="15" y1="6" x2="15" y2="21"></line>
                </svg>
                <strong>Luanda · Baía e Complexo Portuário</strong>
              </div>
              <p>Instalações equipadas com simulador de passadiço homologado e acesso rápido às instalações de treino prático de água.</p>
            </div>
          </div>

          {/* Formulário de Contacto */}
          <div className="contact-form-wrap">
            <div className="contact-form card shadow-premium">
              <h2>Envie uma Mensagem Directa</h2>
              <p className="form-sub">Preencha o formulário e um dos nossos consultores de formação marítima entrará em contacto num prazo máximo de 24 horas úteis.</p>

              {status === 'success' && (
                <div className="status-alert success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div>
                    <strong>Mensagem registada com sucesso!</strong>
                    <p>Agradecemos o seu contacto. A nossa equipa entrará em contacto brevemente.</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="status-alert error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <div>
                    <strong>Erro no envio.</strong>
                    <p>Por favor, verifique os seus dados ou contacte-nos directamente via telefone ou WhatsApp.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="contact-name">Nome Completo</label>
                  <input
                    type="text"
                    id="contact-name"
                    required
                    placeholder="Ex: Manuel António"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={status === 'loading'}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="contact-email">E-mail</label>
                    <input
                      type="email"
                      id="contact-email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={status === 'loading'}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-phone">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      id="contact-phone"
                      placeholder="+244 9XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={status === 'loading'}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-subject">Assunto de Interesse</label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    disabled={status === 'loading'}
                  >
                    <option value="Informações sobre Cursos STCW">Informações sobre Cursos STCW</option>
                    <option value="Revalidação Quinquenal de Certificados">Revalidação Quinquenal de Certificados</option>
                    <option value="Formação Offshore e BOSIET">Formação Offshore e BOSIET</option>
                    <option value="Contratos Corporativos para Armadores">Contratos Corporativos para Armadores</option>
                    <option value="Outros Esclarecimentos">Outros Esclarecimentos</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message">Mensagem ou Dúvida Específica</label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    placeholder="Descreva a sua experiência marítima anterior ou as datas pretendidas..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    disabled={status === 'loading'}
                  ></textarea>
                </div>

                <button type="submit" className="btn-send-message" disabled={status === 'loading'}>
                  {status === 'loading' ? 'A enviar mensagem...' : 'Enviar Mensagem Agora'}
                </button>
              </form>
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
          background-image: linear-gradient(rgba(45, 24, 15, 0.88), rgba(45, 24, 15, 0.85)), url('/assets/hero/banner3.png');
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

        .contact-section {
          padding: 4.5rem 1.5rem 6rem;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 2.5rem;
        }

        .contact-info-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-info {
          padding: 2.5rem;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #E6DDD4;
        }
        .contact-info h2 {
          font-size: 1.65rem;
          font-weight: 800;
          color: #2D180F;
          margin-bottom: 0.5rem;
        }
        .contact-lead {
          font-size: 0.95rem;
          color: #78685E;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .info-item {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 1.75rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #F1ECE6;
        }
        .info-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(234, 88, 12, 0.12);
          color: var(--color-accent, #EA580C);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-item h4 {
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.85rem;
          color: #2D180F;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 0.25rem;
        }
        .info-item p {
          color: #5C4A3A;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .info-item p a {
          color: #2D180F;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .info-item p a:hover {
          color: var(--color-accent, #EA580C);
        }

        .badge-loc {
          display: inline-block;
          margin-top: 0.35rem;
          font-size: 0.72rem;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          background: #F8F4EF;
          color: #78685E;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
        }

        .location-card {
          background: #2D180F;
          color: white;
          padding: 1.75rem;
          border-radius: 14px;
        }
        .loc-head {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          color: var(--color-sandstone, #E6C5A8);
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 0.95rem;
          margin-bottom: 0.65rem;
        }
        .location-card p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.88rem;
          line-height: 1.55;
        }

        /* Form Card */
        .contact-form {
          padding: 2.75rem;
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #E6DDD4;
          box-shadow: 0 16px 40px rgba(45, 24, 15, 0.08);
        }
        .contact-form h2 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #2D180F;
          margin-bottom: 0.35rem;
        }
        .form-sub {
          font-size: 0.95rem;
          color: #78685E;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .status-alert {
          display: flex;
          gap: 0.85rem;
          padding: 1rem 1.25rem;
          border-radius: 10px;
          margin-bottom: 1.75rem;
          font-size: 0.9rem;
        }
        .status-alert.success {
          background: #F0FDF4;
          color: #15803D;
          border: 1px solid #BBF7D0;
        }
        .status-alert.error {
          background: #FEF2F2;
          color: #B91C1C;
          border: 1px solid #FECACA;
        }
        .status-alert svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .form-group {
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .form-group label {
          font-size: 0.86rem;
          font-weight: 700;
          color: #2D180F;
          font-family: var(--font-display, 'Outfit', sans-serif);
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 1.5px solid #E0D6CD;
          border-radius: 8px;
          font-size: 0.95rem;
          background: #ffffff;
          outline: none;
          transition: all 0.2s ease;
          font-family: var(--font-body, 'DM Sans', sans-serif);
          color: #1A0D07;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--color-accent, #EA580C);
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.14);
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .btn-send-message {
          width: 100%;
          padding: 1.05rem 1.5rem;
          background: var(--color-accent, #EA580C);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-family: var(--font-display, 'Outfit', sans-serif);
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(234, 88, 12, 0.35);
          transition: all 0.25s ease;
          margin-top: 0.5rem;
        }
        .btn-send-message:hover:not(:disabled) {
          background: var(--color-accent-hover, #C2410C);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(234, 88, 12, 0.45);
        }
        .btn-send-message:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        @media (max-width: 960px) {
          .contact-grid { grid-template-columns: 1fr; }
          .page-banner h1 { font-size: 2.2rem; }
          .form-row-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
