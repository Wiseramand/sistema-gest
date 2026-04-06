'use client';

export default function ArchivePage() {
  const dummyArchive = [
    { id: 'ARC-2023-001', student: 'Carlos Mendes', course: 'Segurança Básica', issueDate: '12-05-2023', type: 'Digitalizado', status: 'Arquivado' },
    { id: 'ARC-2024-045', student: 'Sofia Bento', course: 'GMDSS Especialista', issueDate: '20-01-2024', type: 'Nativo Sistema', status: 'Arquivado' }
  ];

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Arquivo de Certificados</h1>
        <p>Repositório seguro de regulamentos marítimos passados e licenças vitalícias arquivadas.</p>
      </div>
      
      <div className="page-content card">
        <div className="table-header">
          <h2>Registos Históricos</h2>
          <div className="search-box">
             <input type="text" placeholder="Pesquisar por nome ou ID..." />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID Arquivo</th>
              <th>Formando</th>
              <th>Curso / Certificação</th>
              <th>Data Emissão</th>
              <th>Tipo Registo</th>
              <th>Estado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dummyArchive.map((p, i) => (
              <tr key={i}>
                <td className="mono">{p.id}</td>
                <td className="bold">{p.student}</td>
                <td>{p.course}</td>
                <td>{p.issueDate}</td>
                <td>{p.type}</td>
                <td><span className="status-badge success">{p.status}</span></td>
                <td>
                  <button className="action-btn view">👁️ Consultar</button>
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
        
        .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .table-header h2 { color: #0a2a5e; font-family: 'Outfit', sans-serif; font-size: 1.25rem; margin: 0; }
        .search-box input { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; width: 250px; font-family: 'Outfit', sans-serif; }

        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 1rem; background: #f8fafc; color: #475569; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #0f1e35; }
        .mono { font-family: monospace; font-size: 0.85rem; color: #64748b; }
        .bold { font-weight: 700; color: #0a2a5e; }

        .status-badge { padding: 0.2rem 0.6rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; background: #ecfdf5; color: #059669; }

        .action-btn.view { background: #f0f9ff; color: #0a2a5e; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; }
        .action-btn.view:hover { background: #e0f2fe; }
      `}</style>
    </div>
  );
}
