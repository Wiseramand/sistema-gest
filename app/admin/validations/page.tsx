'use client';

export default function ValidationsPage() {
  const dummyValidations = [
    { stcw: 'STCW-A-VI/1', student: 'Tiago Santos', type: 'Atestado Médico Marítimo', date: '05-04-2026', validation: 'Pendente Análise Visual' },
    { stcw: 'STCW-VI/4', student: 'Mafalda Loureiro', type: 'Registo de Horas de Embarque', date: '04-04-2026', validation: 'Concluída' }
  ];

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Avaliação e Validação STCW</h1>
          <p>O centro formador precisará de aprovar visual ou digitalmente a submissão de relatórios e documentação legal (médica, tempo de embarque).</p>
        </div>
      </div>
      
      <div className="page-content card">
        <div className="table-header">
          <h2>Fila de Documentos para Aprovação STCW</h2>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Norma STCW</th>
              <th>Formando</th>
              <th>Tipo de Documento Legal</th>
              <th>Data de Submissão</th>
              <th>Estado da Validação</th>
              <th>Ações de Avaliação</th>
            </tr>
          </thead>
          <tbody>
            {dummyValidations.map((p, i) => (
              <tr key={i}>
                <td className="bold">{p.stcw}</td>
                <td>{p.student}</td>
                <td>{p.type}</td>
                <td>{p.date}</td>
                <td>
                  <span className={`status-badge ${p.validation === 'Concluída' ? 'success' : 'warning'}`}>
                    {p.validation}
                  </span>
                </td>
                <td>
                   {p.validation !== 'Concluída' ? (
                      <div style={{display:'flex', gap:'5px'}}>
                        <button className="action-btn success">✓ Aprovar Digitalmente</button>
                        <button className="action-btn view">👁️ Ver PDF</button>
                      </div>
                   ) : <span style={{fontSize:'0.8rem', color:'#059669', fontWeight:600}}>✓ Aprovado e validado</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; position: relative; }
        .page-header { position: sticky; top: -10px; z-index: 10; background: linear-gradient(135deg, #0a2a5e 0%, #173b7d 100%); padding: 2rem; border-radius: 14px; color: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.15); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #F5C518; }
        .page-header p { color: #e2e8f0; max-width: 800px; }
        
        .card { background: #ffffff; border-radius: 14px; padding: 2rem; border: 1px solid #e2e8f0; }
        
        .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; }
        .table-header h2 { color: #0a2a5e; font-family: 'Outfit', sans-serif; font-size: 1.25rem; }

        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 1rem; background: #f8fafc; color: #475569; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #0f1e35; }
        .bold { font-weight: 800; color: #0a2a5e; }

        .status-badge { padding: 0.2rem 0.6rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
        .status-badge.success { background: #ecfdf5; color: #059669; }
        .status-badge.warning { background: #fffbeb; color: #d97706; }

        .action-btn { border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; transition:0.2s;}
        .action-btn.success { background: #ecfdf5; color: #059669; }
        .action-btn.success:hover { background: #d1fae5; }
        .action-btn.view { background: #f0f9ff; color: #0a2a5e; }
        .action-btn.view:hover { background: #e0f2fe; }
      `}</style>
    </div>
  );
}
