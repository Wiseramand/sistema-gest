import Link from 'next/link';

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
                    <p className="brand-desc">Referência em treinamento marítimo e segurança offshore. Formando profissionais de elite para os desafios globais do setor náutico.</p>
                </div>

                <div className="footer-links">
                    <h4>Navegação</h4>
                    <ul>
                        <li><Link href="/">Início</Link></li>
                        <li><Link href="/cursos">Nossos Cursos</Link></li>
                        <li><Link href="/sobre">Sobre a Instituição</Link></li>
                        <li><Link href="/login">Portal do Aluno</Link></li>
                        <li><Link href="/professor/login">Portal do Formador</Link></li>
                    </ul>
                </div>

                <div className="footer-links">
                    <h4>Suporte</h4>
                    <ul>
                        <li><Link href="/faq">Perguntas Frequentes</Link></li>
                        <li><Link href="/privacidade">Política de Privacidade</Link></li>
                        <li><Link href="/termos">Termos de Uso</Link></li>
                        <li><Link href="/contacto">Contacto</Link></li>
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
                <div className="container bottom-flex">
                    <p>&copy; {new Date().getFullYear()} Marítimo Training Center. Todos os direitos reservados.</p>
                    <div className="social-links">
                      <span>Ref: STCW / ISPS Code Compliant</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .footer {
          background: var(--color-primary);
          color: white;
          padding: 5rem 0 0;
          margin-top: 6rem;
          font-family: var(--font-body);
          border-top: 2px solid var(--color-accent);
        }
        .grid-footer {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 4rem;
          padding-bottom: 4rem;
        }
        .footer-brand .logo-box {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 2rem;
        }
        .logo-icon {
          font-size: 1.4rem;
          background: var(--color-accent);
          color: #ffffff;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35);
        }
        .logo-text { display: flex; flex-direction: column; line-height: 1.1; }
        .logo-text .main { font-family: var(--font-display); font-weight: 800; font-size: 1.15rem; letter-spacing: 1px; color: #ffffff; }
        .logo-text .sub { font-family: var(--font-display); font-size: 0.65rem; opacity: 0.85; text-transform: uppercase; letter-spacing: 1.2px; color: var(--color-sandstone); }
        
        .brand-desc { font-size: 0.95rem; color: rgba(247, 236, 225, 0.75); line-height: 1.7; max-width: 320px; }
        
        .footer h4 { 
          color: var(--color-sandstone); 
          font-family: var(--font-display); 
          font-size: 1rem; 
          font-weight: 700; 
          margin-bottom: 2rem; 
          text-transform: uppercase; 
          letter-spacing: 1.5px; 
        }
        .footer ul { list-style: none; padding: 0; }
        .footer ul li { margin-bottom: 1rem; }
        .footer ul a { font-size: 0.95rem; color: rgba(247, 236, 225, 0.75); transition: all 0.25s ease; }
        .footer ul a:hover { color: var(--color-sandstone); padding-left: 8px; }

        .footer-contact p { font-size: 0.95rem; color: rgba(247, 236, 225, 0.75); margin-bottom: 1rem; line-height: 1.6; }

        .footer-bottom { 
          background: rgba(0, 0, 0, 0.25); 
          padding: 2rem 0; 
          border-top: 1px solid rgba(230, 197, 168, 0.1); 
        }
        .bottom-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-bottom p { font-size: 0.85rem; color: rgba(247, 236, 225, 0.55); margin: 0; }
        .social-links { font-size: 0.75rem; color: var(--color-sandstone); opacity: 0.7; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

        @media (max-width: 992px) {
          .grid-footer { grid-template-columns: 1fr 1fr; gap: 3rem; }
        }
        @media (max-width: 576px) {
          .grid-footer { grid-template-columns: 1fr; gap: 3rem; }
          .bottom-flex { flex-direction: column; text-align: center; gap: 1rem; }
        }
      `}</style>
        </footer>
    );
}
