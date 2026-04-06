'use client';

export default function AttendancePage() {
  const dummyAttendance = [
    { student: 'Gonçalo Alves', course: 'Segurança Básica', presence: '95%', absences: '1', status: 'Conforme' },
    { student: 'Marta Rebelo', course: 'Operador GMDSS', presence: '80%', absences: '4', status: 'Aviso (Limite 20%)' }
  ];

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Frequência a Aulas / Presenças</h1>
        <p>Monitoramento estrito de assiduidade exigida pelos regulamentos marítimos.</p>
      </div>
      
      <div className="page-content card">
        <div className="table-header">
          <h2>Taxas de Frequência por Formando</h2>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Nome do Aluno</th>
              <th>Curso / Turma</th>
              <th>Presença %</th>
              <th>Total de Ausências</th>
              <th>Estado Compliance</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dummyAttendance.map((p, i) => (
              <tr key={i}>
                <td className="bold">{p.student}</td>
                <td>{p.course}</td>
                <td className="bold">{p.presence}</td>
                <td>{p.absences} sessões</td>
                <td>
                  <span className={`status-badge ${p.status === 'Conforme' ? 'success' : 'warning'}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn view">👁️ Histórico</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; position: relative; }
        .page-header { position: sticky; top: -10px; z-index: 10; background: linear-gradient(135deg, #0a2a5e 0%, #173b7d 100%); padding: 2rem; border-radius: 14px; color: white; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.15); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #F5C518; }
        .page-header p { color: #e2e8f0; }
        
        .card { background: #ffffff; border-radius: 14px; padding: 2rem; border: 1px solid #e2e8f0; }
        
        .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; }
        .table-header h2 { color: #0a2a5e; font-family: 'Outfit', sans-serif; font-size: 1.25rem; margin: 0; }

        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 1rem; background: #f8fafc; color: #475569; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #0f1e35; }
        .bold { font-weight: 700; color: #0a2a5e; }

        .status-badge { padding: 0.2rem 0.6rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
        .status-badge.success { background: #ecfdf5; color: #059669; }
        .status-badge.warning { background: #fffbeb; color: #d97706; }

        .action-btn.view { background: #f0f9ff; color: #0a2a5e; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; }
        .action-btn.view:hover { background: #e0f2fe; }
      `}</style>
    </div>
  );
}
