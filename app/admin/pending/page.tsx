'use client';

export default function PendingPage() {
  const dummyPending = [
    { id: 'INSC-101', student: 'Miguel Oliveira', course: 'STCW Básico', deadline: '01-04-2026', total: '€150.00', paid: '€0.00', status: 'Crítico', method: 'A Aguardar MBWay' },
    { id: 'INSC-102', student: 'Joana Martins', course: 'Operador GMDSS', deadline: '05-04-2026', total: '€320.00', paid: '€100.00', status: 'Em Dívida', method: 'Prestação Multibanco' }
  ];

  const handleBulkEmail = async () => {
    const confirm = window.confirm('Deseja enviar alertas de cobrança para todos os formandos pendentes?');
    if (!confirm) return;
    alert('Disparando emails de cobrança via API Resend...');
  };

  const handleRowEmail = async (studentName: string) => {
    alert(`Enviando lembrete de pagamento para: ${studentName}`);
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Regularização de Inscrições</h1>
          <p>Módulo de gestão de alertas financeiros. Visualize rapidamente que formandos necessitam concluir pagamentos antes da atribuição de certificados.</p>
        </div>
      </div>
      
      <div className="page-content card">
        <div className="table-header">
          <h2>Formandos com Valores Pendentes</h2>
          <button className="btn-primary" onClick={handleBulkEmail}>Enviar Alertas por Email</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID Inscrição</th>
              <th>Formando</th>
              <th>Curso</th>
              <th>Prazo Limite</th>
              <th>Total do Curso</th>
              <th>Valor Pago</th>
              <th>Status Financeiro</th>
              <th>Método Escolhido</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dummyPending.map((p, i) => (
              <tr key={i}>
                <td className="mono">{p.id}</td>
                <td className="bold">{p.student}</td>
                <td>{p.course}</td>
                <td><span className="deadline">{p.deadline}</span></td>
                <td>{p.total}</td>
                <td style={{color: '#059669', fontWeight: 700}}>{p.paid}</td>
                <td>
                  <span className={`status-badge ${p.status === 'Crítico' ? 'danger' : 'warning'}`}>
                    {p.status}
                  </span>
                </td>
                <td>{p.method}</td>
                <td>
                  <div style={{display:'flex', gap:'5px'}}>
                    <button className="action-btn email-mini" onClick={() => handleRowEmail(p.student)}>✉️ Notificar</button>
                    <button className="action-btn lock">🔒 Bloquear</button>
                  </div>
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
        .btn-primary { background: #F5C518; color: #0a2a5e; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { background: #d97706; color: white; }

        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 1rem; background: #f8fafc; color: #475569; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #0f1e35; }
        .mono { font-family: monospace; font-size: 0.85rem; color: #64748b; }
        .bold { font-weight: 700; color: #0a2a5e; }
        .deadline { color: #dc2626; font-weight: 700; }

        .status-badge { padding: 0.2rem 0.6rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
        .status-badge.danger { background: #fef2f2; color: #dc2626; }
        .status-badge.warning { background: #fffbeb; color: #d97706; }

        .action-btn.lock { background: #fee2e2; color: #dc2626; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; }
        .action-btn.lock:hover { background: #fca5a5; }

        .action-btn.email-mini { background: #f0f9ff; color: #0a2a5e; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; }
        .action-btn.email-mini:hover { background: #e0f2fe; }
      `}</style>
    </div>
  );
}
