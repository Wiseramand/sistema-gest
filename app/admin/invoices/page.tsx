'use client';

export default function InvoicesPage() {
  const dummyInvoices = [
    { nif: '504123456', client: 'Marítima Global Lda', type: 'Fatura Agrupada Empresa', amount: '€1,500.00', date: '06-04-2026', method: 'Transferência', status: 'Emitida' },
    { nif: '210000000', client: 'Joaquim Silva', type: 'Proforma Individual', amount: '€150.00', date: '06-04-2026', method: 'Referência MB', status: 'Aguardando Pagamento' }
  ];

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Emissão de Faturas</h1>
          <p>Área que alberga a lista de faturas geradas, faturas proforma e exportação de dados (SAF-T).</p>
        </div>
      </div>
      
      <div className="page-content card">
        <div className="table-header">
          <h2>Lista de Documentos Fiscais Emitidos</h2>
          <button className="btn-primary">⬇️ Exportar Tabela SAF-T</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>NIF</th>
              <th>Entidade / Aluno</th>
              <th>Tipo de Documento</th>
              <th>Valor Total</th>
              <th>Data</th>
              <th>Método Predefinido</th>
              <th>Estado do Documento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dummyInvoices.map((p, i) => (
              <tr key={i}>
                <td className="mono">{p.nif}</td>
                <td className="bold">{p.client}</td>
                <td>{p.type}</td>
                <td style={{fontWeight: 700}}>{p.amount}</td>
                <td>{p.date}</td>
                <td>{p.method}</td>
                <td>
                  <span className={`status-badge ${p.status === 'Emitida' ? 'success' : 'warning'}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn download">⬇️ PDF</button>
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
        .btn-primary { background: #0a2a5e; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { background: #173b7d; }

        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 1rem; background: #f8fafc; color: #475569; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #0f1e35; }
        .mono { font-family: monospace; font-size: 0.85rem; color: #64748b; }
        .bold { font-weight: 700; color: #0a2a5e; }

        .status-badge { padding: 0.2rem 0.6rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
        .status-badge.success { background: #ecfdf5; color: #059669; }
        .status-badge.warning { background: #fffbeb; color: #d97706; }

        .action-btn.download { background: #f0f9ff; color: #0a2a5e; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; }
        .action-btn.download:hover { background: #e0f2fe; }
      `}</style>
    </div>
  );
}
