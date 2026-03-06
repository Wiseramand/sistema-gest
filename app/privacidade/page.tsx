'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacidadePage() {
    return (
        <main style={{ paddingTop: '80px' }}>
            <Navbar />

            <section className="container legal-content">
                <div className="card shadow-premium legal-wrapper">
                    <h1>Política de Privacidade</h1>
                    <p className="last-update">Última atualização: Julho de 2024</p>

                    <div className="legal-section">
                        <h2>1. Introdução</h2>
                        <p>O Marítimo Training Center está comprometido em proteger a sua privacidade. Esta Política de Privacidade explica como coletamos, usamos e protegemos as suas informações pessoais ao utilizar os nossos serviços.</p>
                    </div>

                    <div className="legal-section">
                        <h2>2. Dados Coletados</h2>
                        <p>Coletamos informações que você nos fornece diretamente ao se inscrever em cursos, como nome completo, CPF/NIF, data de nascimento, endereço, e-mail e telefone.</p>
                    </div>

                    <div className="legal-section">
                        <h2>3. Uso das Informações</h2>
                        <p>Os seus dados são utilizados para processar matrículas, emitir certificados oficiais, comunicar atualizações de cursos e cumprir requisitos legais das autoridades marítimas.</p>
                    </div>

                    <div className="legal-section">
                        <h2>4. Compartilhamento</h2>
                        <p>Não vendemos os seus dados. Compartilhamos informações apenas com autoridades governamentais e órgãos reguladores marítimos para a validação oficial das suas certificações.</p>
                    </div>

                    <div className="legal-section">
                        <h2>5. Segurança</h2>
                        <p>Implementamos medidas técnicas e organizacionais de ponta para proteger os seus dados contra acesso não autorizado, alteração ou destruição.</p>
                    </div>
                </div>
            </section>

            <Footer />

            <style jsx>{`
        .legal-content { padding: 6rem 1.5rem; max-width: 1000px; }
        .legal-wrapper { padding: 4rem; }
        
        h1 { font-size: 3rem; margin-bottom: 1rem; color: var(--navy-deep); border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; }
        .last-update { color: #94a3b8; font-size: 0.9rem; margin-bottom: 4rem; }
        
        .legal-section { margin-bottom: 3rem; }
        .legal-section h2 { font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--navy-medium); }
        .legal-section p { font-size: 1.1rem; color: #64748b; line-height: 1.8; }

        .shadow-premium { box-shadow: 0 10px 30px rgba(0,0,0,0.05); }

        @media (max-width: 768px) {
          .legal-wrapper { padding: 2rem; }
          h1 { font-size: 2rem; }
        }
      `}</style>
        </main>
    );
}
