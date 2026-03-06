export default function Footer() {
    return (
        <footer className="footer">
            <div className="container grid-footer">
                <div className="footer-brand">
                    <div className="logo-box">
                        <span className="logo-icon">⚓</span>
                        <div className="logo-text">
                            <span className="main">MARÍTIMO</span>
                            <span className="sub">Training Center</span>
                        </div>
                    </div>
                    <p className="brand-desc">Referência em treinamento marítimo e segurança offshore. Formando profissionais de elite para os desafios globais.</p>
                </div>

                <div className="footer-links">
                    <h4>Navegação</h4>
                    <ul>
                        <li><a href="/">Início</a></li>
                        <li><a href="/cursos">Nossos Cursos</a></li>
                        <li><a href="/sobre">Sobre a Instituição</a></li>
                        <li><a href="/login">Portal do Aluno</a></li>
                    </ul>
                </div>

                <div className="footer-links">
                    <h4>Suporte</h4>
                    <ul>
                        <li><a href="/faq">Perguntas Frequentes</a></li>
                        <li><a href="/privacidade">Política de Privacidade</a></li>
                        <li><a href="/termos">Termos de Uso</a></li>
                        <li><a href="/contacto">Contacto</a></li>
                    </ul>
                </div>

                <div className="footer-contact">
                    <h4>Localização</h4>
                    <p>Avenida da Independência, Luanda, Angola</p>
                    <p>Email: contacto@maritimo-training.com</p>
                    <p>Tel: +244 9XX XXX XXX</p>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Marítimo Training Center. Todos os direitos reservados.</p>
                </div>
            </div>

            <style jsx>{`
        .footer {
          background: var(--navy-deep);
          color: white;
          padding: 4rem 0 0;
          margin-top: 4rem;
        }
        .grid-footer {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 3rem;
          padding-bottom: 3rem;
        }
        .footer-brand .logo-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .logo-icon {
          font-size: 1.5rem;
          background: var(--sand-gold);
          color: var(--navy-deep);
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
        }
        .logo-text { display: flex; flex-direction: column; }
        .logo-text .main { font-weight: 900; font-size: 1rem; }
        .logo-text .sub { font-size: 0.6rem; opacity: 0.7; text-transform: uppercase; }
        
        .brand-desc { font-size: 0.9rem; color: rgba(255,255,255,0.7); line-height: 1.6; max-width: 300px; }
        
        .footer h4 { color: var(--sand-gold); font-size: 1.1rem; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 1px; }
        .footer ul { list-style: none; }
        .footer ul li { margin-bottom: 0.75rem; }
        .footer ul a { font-size: 0.9rem; color: rgba(255,255,255,0.7); transition: 0.2s; }
        .footer ul a:hover { color: white; padding-left: 5px; }

        .footer-contact p { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 0.75rem; }

        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding: 1.5rem 0; text-align: center; }
        .footer-bottom p { font-size: 0.8rem; color: rgba(255,255,255,0.5); }

        @media (max-width: 768px) {
          .grid-footer { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>
        </footer>
    );
}
