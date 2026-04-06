'use client';

export default function PaymentsPage() {
  const dummyPayments = [
    { id: 'PAY-001', student: 'Rui Silva', course: 'Segurança Básica (STCW)', amount: '€150.00', method: 'MBWay', date: '06-04-2026', status: 'Processado' },
    { id: 'PAY-002', student: 'Ana Pereira', course: 'Operador GMDSS', amount: '€320.00', method: 'Multibanco', date: '05-04-2026', status: 'Processado' },
    { id: 'PAY-003', student: 'Carlos Costa', course: 'Mergulho Profissional', amount: '€500.00', method: 'Transferência Bancária', date: '04-04-2026', status: 'Aguardando Validação' }
  ];

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Gestão de Pagamentos</h1>
          <p>Validação de transferências e controlo detalhado de caixa com métodos de pagamento integrados.</p>
        </div>
        <div className="gateway-status">🟢 Gateway Stripe/SIBS: Ativo</div>
      </div>
      
      <div className="page-content card">
        <div className="table-header">
          <h2>Últimos Pagamentos Recebidos</h2>
          <button className="btn-primary">+ Registar Pagamento Manual</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Formando</th>
              <th>Curso</th>
              <th>Valor</th>
              <th>Método</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dummyPayments.map((p, i) => (
              <tr key={i}>
                <td className="mono">{p.id}</td>
                <td className="bold">{p.student}</td>
                <td>{p.course}</td>
                <td>{p.amount}</td>
                <td>
                  <span className="method-badge">{p.method}</span>
                </td>
                <td>{p.date}</td>
                <td>
                  <span className={`status-badge ${p.status === 'Processado' ? 'success' : 'warning'}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn view">Ver Recibo</button>
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
        .page-header p { color: #e2e8f0; }
        .gateway-status { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 50px; font-weight: 700; font-size: 0.85rem;}
        
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

        .method-badge { background: #e0f2fe; color: #0284c7; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
        .status-badge { padding: 0.2rem 0.6rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
        .status-badge.success { background: #ecfdf5; color: #059669; }
        .status-badge.warning { background: #fffbeb; color: #d97706; }

        .action-btn.view { background: #f0f9ff; color: #0a2a5e; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; }
        .action-btn.view:hover { background: #e0f2fe; }
      `}</style>
    </div>
  );
}
