'use client';

export default function ValidationsPage() {
  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Avaliação e Validação STCW</h1>
        <p>Validação da documentação legal (médica, tempo de embarque e requisitos técnicos).</p>
      </div>
      
      <div className="page-content card">
        <div className="empty-state">
          <span className="icon">🛡️</span>
          <h2>Validação de Documentos</h2>
          <p>O centro formador precisará de aprovar visual ou digitalmente a submissão de relatórios e testes de capacidade STCW submetidos pelos alunos antes da emissão do Diploma definitivo.</p>
        </div>
      </div>

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; }
        .page-header { background: linear-gradient(135deg, #0a2a5e 0%, #173b7d 100%); padding: 2rem; border-radius: 14px; color: white; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.15); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #F5C518; }
        .page-header p { color: #e2e8f0; }
        
        .card { background: #ffffff; border-radius: 14px; padding: 4rem 2rem; border: 1px solid #e2e8f0; text-align: center; }
        .icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
        .empty-state h2 { color: #0a2a5e; font-family: 'Outfit', sans-serif; margin-bottom: 1rem; }
        .empty-state p { color: #64748b; max-width: 600px; margin: 0 auto; line-height: 1.6; }
      `}</style>
    </div>
  );
}
