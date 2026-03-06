'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermosPage() {
    return (
        <main style={{ paddingTop: '80px' }}>
            <Navbar />

            <section className="container legal-content">
                <div className="card shadow-premium legal-wrapper">
                    <h1>Termos de Uso</h1>
                    <p className="last-update">Última atualização: Julho de 2024</p>

                    <div className="legal-section">
                        <h2>1. Aceitação dos Termos</h2>
                        <p>Ao se inscrever em qualquer curso ou utilizar este sistema, você concorda com os termos e condições aqui estabelecidos pelo Marítimo Training Center.</p>
                    </div>

                    <div className="legal-section">
                        <h2>2. Responsabilidades do Aluno</h2>
                        <p>O aluno é responsável pela veracidade dos dados informados, pela frequência mínima exigida nas aulas (normalmente 90%) e pelo cumprimento das normas de segurança e conduta do centro.</p>
                    </div>

                    <div className="legal-section">
                        <h2>3. Cancelamentos e Reembolsos</h2>
                        <p>Cancelamentos solicitados com até 15 dias de antecedência do início do curso dão direito a reembolso total. Após esse prazo, taxas administrativas podem ser aplicadas conforme o contrato de serviço assinado no ato da matrícula.</p>
                    </div>

                    <div className="legal-section">
                        <h2>4. Propriedade Intelectual</h2>
                        <p>Todo o material didático fornecido (apostilas, vídeos e manuais) é de propriedade exclusiva da instituição e não pode ser reproduzido sem autorização expressa.</p>
                    </div>

                    <div className="legal-section">
                        <h2>5. Certificações</h2>
                        <p>A emissão do certificado está estritamente vinculada ao aproveitamento acadêmico e à aprovação em exames teóricos e práticos obrigatórios.</p>
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
