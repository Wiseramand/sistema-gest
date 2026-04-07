'use client';

import { useState } from 'react';

const ArchiveDetailModal = ({ item, onClose }: { item: any, onClose: () => void }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-card" onClick={e => e.stopPropagation()}>
      <div className="modal-close" onClick={onClose}>×</div>
      <div className="archive-detail">
        <div className="detail-header">
          <span className="badge-id">{item.id}</span>
          <h2>Detalhes do Registo Histórico</h2>
        </div>
        
        <div className="detail-grid">
          <div className="detail-section">
            <h3>Informações do Formando</h3>
            <div className="field"><label>Nome Completo:</label> <span>{item.student}</span></div>
            <div className="field"><label>Curso Realizado:</label> <span>{item.course}</span></div>
            <div className="field"><label>Data de Emissão:</label> <span>{item.issueDate}</span></div>
          </div>
          
          <div className="detail-section">
            <h3>Auditoria de Arquivo</h3>
            <div className="field"><label>Tipo de Registo:</label> <span>{item.type}</span></div>
            <div className="field"><label>Validado por:</label> <span>{item.validatedBy}</span></div>
            <div className="field"><label>Estado Atual:</label> <span className="status-badge success">{item.status}</span></div>
          </div>
        </div>

        <div className="hash-box">
          <label>Assinatura Digital de Arquivo (SHA-256):</label>
          <code>{item.hash}ed02937d5bd0c43c1ede23ee37df5c61</code>
        </div>

        <div className="actions-footer">
          <button className="btn-primary" onClick={() => window.print()}>🖨️ Imprimir Ficha de Arquivo</button>
          <button className="btn-outline" onClick={onClose}>Fechar Consulta</button>
        </div>
      </div>
    </div>
    <style jsx>{`
      .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(10, 42, 94, 0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
      .modal-card { background: white; border-radius: 20px; width: 90%; max-width: 700px; padding: 2.5rem; position: relative; animation: slideUp 0.3s ease; }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .modal-close { position: absolute; top: 1rem; right: 1.5rem; font-size: 2rem; cursor: pointer; color: #94a3b8; }

      .detail-header { margin-bottom: 2rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; }
      .badge-id { font-size: 0.7rem; font-weight: 800; background: #0a2a5e; color: white; padding: 0.2rem 0.6rem; border-radius: 4px; margin-bottom: 0.5rem; display: inline-block; }
      .detail-header h2 { font-family: 'Outfit', sans-serif; font-size: 1.4rem; color: #0a2a5e; margin: 0; }

      .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
      .detail-section h3 { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; }
      .field { margin-bottom: 1rem; }
      .field label { display: block; font-size: 0.75rem; color: #64748b; margin-bottom: 0.2rem; }
      .field span { font-weight: 700; color: #0a2a5e; font-size: 1rem; }

      .hash-box { background: #f8fafc; padding: 1.25rem; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 2rem; }
      .hash-box label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; display: block; margin-bottom: 0.5rem; }
      .hash-box code { font-family: monospace; font-size: 0.8rem; color: #0a2a5e; }

      .actions-footer { display: flex; gap: 1rem; justify-content: center; }
      .btn-primary { background: #0a2a5e; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
      .btn-outline { background: white; color: #64748b; border: 1px solid #e2e8f0; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
    `}</style>
  </div>
);

export default function ArchivePage() {
  const dummyArchive = [
    { id: 'ARC-2023-001', student: 'Carlos Mendes', course: 'Segurança Básica', issueDate: '12-05-2023', type: 'Digitalizado', status: 'Arquivado', validatedBy: 'Ricardo', hash: '8f3e2a...9b' },
    { id: 'ARC-2024-045', student: 'Sofia Bento', course: 'GMDSS Especialista', issueDate: '20-01-2024', type: 'Nativo Sistema', status: 'Arquivado', validatedBy: 'Admin Super', hash: '1a2b3c...4d' }
  ];

  const [selectedItem, setSelectedItem] = useState<any>(null);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Arquivo de Certificados</h1>
        <p>Repositório seguro de regulamentos marítimos passados e licenças vitalícias arquivadas.</p>
      </div>

      {selectedItem && <ArchiveDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      
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
                  <button 
                    className="action-btn view" 
                    onClick={() => setSelectedItem(p)}
                  >
                    👁️ Consultar
                  </button>
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
