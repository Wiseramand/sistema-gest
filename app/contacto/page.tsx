'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactoPage() {
    return (
        <main style={{ paddingTop: '80px' }}>
            <Navbar />

            <div className="page-banner" style={{ backgroundImage: "linear-gradient(rgba(0, 31, 63, 0.7), rgba(0, 31, 63, 0.7)), url('/assets/hero/banner3.png')" }}>
                <div className="container">
                    <h1>Contacto</h1>
                    <p>Estamos prontos para esclarecer suas dúvidas e iniciar sua jornada no mar.</p>
                </div>
            </div>

            <section className="container contact-section">
                <div className="contact-grid">
                    <div className="contact-info card">
                        <h2>Informações de Contacto</h2>
                        <div className="info-item">
                            <span className="icon">📍</span>
                            <div>
                                <h4>Endereço</h4>
                                <p>Avenida da Independência, Edifício Maritime, Luanda, Angola</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="icon">📞</span>
                            <div>
                                <h4>Telefone</h4>
                                <p>+244 9XX XXX XXX / +244 2XX XXX XXX</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="icon">✉️</span>
                            <div>
                                <h4>Email</h4>
                                <p>contacto@maritimo-training.com</p>
                                <p>secretaria@maritimo-training.com</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="icon">⏰</span>
                            <div>
                                <h4>Horário de Atendimento</h4>
                                <p>Segunda - Sexta: 08:00 - 17:00</p>
                                <p>Sábado: 09:00 - 13:00</p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form card shadow-premium">
                        <h2>Envie uma Mensagem</h2>
                        <form>
                            <div className="form-group">
                                <label>Nome Completo</label>
                                <input type="text" placeholder="Seu nome" />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="seu@email.com" />
                            </div>
                            <div className="form-group">
                                <label>Assunto</label>
                                <select>
                                    <option>Informações sobre Cursos</option>
                                    <option>Matrículas e Pagamentos</option>
                                    <option>Parcerias Corporativas</option>
                                    <option>Outros Assuntos</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Mensagem</label>
                                <textarea rows={5} placeholder="Como podemos ajudar?"></textarea>
                            </div>
                            <button type="button" className="btn btn-primary w-full">Enviar Mensagem</button>
                        </form>
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

        .contact-section { padding: 6rem 1.5rem; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 3rem; }
        
        .contact-info h2, .contact-form h2 { font-size: 1.75rem; margin-bottom: 2rem; color: var(--navy-deep); }
        
        .info-item { display: flex; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .info-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .info-item .icon { font-size: 1.5rem; background: #f0f7ff; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .info-item h4 { font-size: 0.9rem; color: var(--navy-medium); margin-bottom: 0.25rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-item p { color: #64748b; font-size: 1rem; margin-bottom: 0.25rem; }

        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.85rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 1rem; background: #f8fafc; outline: none; transition: 0.2s; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--ocean-blue); background: white; }
        
        .w-full { width: 100%; padding: 1rem; }
        .shadow-premium { box-shadow: 0 20px 40px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.02); }

        @media (max-width: 1024px) {
          .contact-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .page-banner h1 { font-size: 2rem; }
        }
      `}</style>
        </main>
    );
}
