import { useState, useEffect } from 'react';

export default function PaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [payments, setPayments] = useState([
    { id: 'PAY-001', student: 'Rui Silva', course: 'Segurança Básica (STCW)', amount: '150.00', method: 'MBWay', date: '06-04-2026', status: 'Processado' },
    { id: 'PAY-002', student: 'Ana Pereira', course: 'Operador GMDSS', amount: '320.00', method: 'Multibanco', date: '05-04-2026', status: 'Processado' },
    { id: 'PAY-003', student: 'Carlos Costa', course: 'Mergulho Profissional', amount: '500.00', method: 'Transferência Bancária', date: '04-04-2026', status: 'Aguardando Validação' }
  ]);

  const [formData, setFormData] = useState({
    student: '',
    course: '',
    amount: '',
    method: 'Dinheiro',
    date: new Date().toISOString().split('T')[0]
  });

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newPay = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Processado',
      ...formData
    };
    setPayments([newPay, ...payments]);
    setIsManualModalOpen(false);
    setFormData({ student: '', course: '', amount: '', method: 'Dinheiro', date: new Date().toISOString().split('T')[0] });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-wrap">
      <div className="page-header no-print">
        <div>
          <h1>Gestão de Pagamentos</h1>
          <p>Validação de transferências e controlo detalhado de caixa com métodos de pagamento integrados.</p>
        </div>
        <div className="gateway-status">🟢 Gateway Stripe/SIBS: Ativo</div>
      </div>
      
      <div className="page-content card no-print">
        <div className="table-header">
          <h2>Últimos Pagamentos Recebidos</h2>
          <button className="btn-primary" onClick={() => setIsManualModalOpen(true)}>+ Registar Pagamento Manual</button>
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
            {payments.map((p, i) => (
              <tr key={i}>
                <td className="mono">{p.id}</td>
                <td className="bold">{p.student}</td>
                <td>{p.course}</td>
                <td>€{p.amount}</td>
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
                  <button className="action-btn view" onClick={() => setSelectedPayment(p)}>Ver Recibo</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual Payment Modal */}
      {isManualModalOpen && (
        <div className="modal-overlay no-print">
          <div className="modal-box small-modal">
            <div className="modal-top">
              <div>
                <h2>⚓ Pagamento Manual</h2>
                <p>Registe uma entrada de caixa física ou transferência.</p>
              </div>
              <button className="close-x" onClick={() => setIsManualModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleManualSave} className="modal-form">
              <div className="field">
                <label>Nome do Formando *</label>
                <input type="text" required value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})} placeholder="Ex: João Ratão" />
              </div>
              <div className="field">
                <label>Curso / Serviço *</label>
                <input type="text" required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} placeholder="Ex: Inscrição STCW" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Valor (€) *</label>
                  <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="field">
                  <label>Data *</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div className="field">
                <label>Método de Pagamento</label>
                <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                  <option value="Dinheiro">Dinheiro (Numerário)</option>
                  <option value="Transferência">Transferência Bancária</option>
                  <option value="TPA">Terminal Depósito/TPA</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-close" onClick={() => setIsManualModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-print" style={{ margin: 0 }}>✓ Gravar Pagamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Recibo */}
      {selectedPayment && (
        <div className="modal-overlay no-print" onClick={() => setSelectedPayment(null)}>
          <div className="modal-box receipt-box" onClick={e => e.stopPropagation()}>
            <div className="receipt-header">
              <div className="logo-placeholder">⚓ MTC</div>
              <div className="receipt-title">
                <h2>Recibo de Pagamento</h2>
                <span>MTC-REC-{selectedPayment.id.split('-')[1]}</span>
              </div>
            </div>

            <div className="receipt-body">
              <div className="info-row">
                <div className="col">
                  <label>Emitido para:</label>
                  <strong>{selectedPayment.student}</strong>
                </div>
                <div className="col align-right">
                  <label>Data de Emissão:</label>
                  <span>{selectedPayment.date}</span>
                </div>
              </div>

              <div className="course-detail">
                <div className="detail-row header">
                  <span>Descrição / Curso</span>
                  <span>Total</span>
                </div>
                <div className="detail-row">
                  <span>Inscrição: {selectedPayment.course}</span>
                  <strong>€{selectedPayment.amount}</strong>
                </div>
              </div>

              <div className="payment-meta">
                <div className="meta-item">
                  <label>Método:</label>
                  <span>{selectedPayment.method}</span>
                </div>
                <div className="meta-item">
                  <label>Estado:</label>
                  <span className="status-success">{selectedPayment.status}</span>
                </div>
              </div>

              <div className="total-box">
                <label>Pago na Totalidade</label>
                <div className="total-val">€{selectedPayment.amount}</div>
              </div>
            </div>

            <div className="receipt-footer">
               <button className="btn-print" onClick={handlePrint}>🖨️ Imprimir Recibo</button>
               <button className="btn-close" onClick={() => setSelectedPayment(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Print View Only */}
      {selectedPayment && (
        <div className="print-only">
          <div style={{ padding: '40px', border: '2px solid #000' }}>
            <h1>Marítimo Training Center</h1>
            <hr />
            <h2>RECIBO DE PAGAMENTO #{selectedPayment.id}</h2>
            <p><strong>Cliente:</strong> {selectedPayment.student}</p>
            <p><strong>Serviço:</strong> {selectedPayment.course}</p>
            <p><strong>Valor:</strong> €{selectedPayment.amount}</p>
            <p><strong>Data:</strong> {selectedPayment.date}</p>
            <p><strong>Método:</strong> {selectedPayment.method}</p>
            <br />
            <p>Este documento serve como prova de quitação do valor acima referido.</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; position: relative; }
        .page-header { background: linear-gradient(135deg, #0a2a5e 0%, #173b7d 100%); padding: 2rem; border-radius: 14px; color: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.15); }
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

        /* Modal Settings */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,20,50,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .receipt-box { background: white; width: 100%; max-width: 480px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; }
        
        .receipt-header { background: #f8fafc; padding: 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; }
        .logo-placeholder { background: #0a2a5e; color: #F5C518; padding: 8px 12px; border-radius: 8px; font-weight: 800; font-family: 'Outfit', sans-serif; }
        .receipt-title { text-align: right; }
        .receipt-title h2 { margin: 0; font-size: 1.1rem; color: #0a2a5e; font-family: 'Outfit', sans-serif; }
        .receipt-title span { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }

        .receipt-body { padding: 2rem; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 2rem; }
        .col label { display: block; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
        .col strong { font-size: 1rem; color: #0a2a5e; }
        .align-right { text-align: right; }

        .course-detail { background: #f8fafc; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid #f1f5f9; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.9rem; }
        .detail-row.header { font-size: 0.75rem; color: #94a3b8; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
        .detail-row strong { color: #0a2a5e; font-size: 1.1rem; font-family: 'Outfit', sans-serif; }

        .payment-meta { display: flex; gap: 2rem; margin-bottom: 2rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
        .meta-item label { display: block; font-size: 0.7rem; color: #94a3b8; font-weight: 600; margin-bottom: 2px; }
        .meta-item span { font-size: 0.85rem; font-weight: 700; color: #475569; }
        .status-success { color: #059669 !important; }

        .total-box { text-align: center; border-top: 2px solid #0a2a5e; padding-top: 1.5rem; }
        .total-box label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; }
        .total-val { font-size: 2.2rem; color: #0a2a5e; font-weight: 800; font-family: 'Outfit', sans-serif; margin-top: 5px; }

        .btn-print:hover { background: #173b7d; }
        .btn-close:hover { background: #cbd5e1; }

        .small-modal { max-width: 500px !important; }
        .modal-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 2rem; }
        .modal-top h2 { margin: 0; font-size: 1.4rem; color: #0a2a5e; font-weight: 800; font-family: 'Outfit', sans-serif;}
        .modal-top p { margin: 0.25rem 0 0; font-size: 0.85rem; color: #64748b; }
        .close-x { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1.4rem; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .close-x:hover { background: #e2e8f0; color: #0a2a5e; }

        .modal-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .field { display: flex; flex-direction: column; gap: 0.4rem; }
        .field label { font-weight: 700; font-size: 0.82rem; color: #475569; }
        .field input, .field select { padding: 0.8rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; background: #f8fafc; font-family: inherit; }
        .field input:focus, .field select:focus { border-color: #0a2a5e; outline: none; background: #fff; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        .print-only { display: none; }

        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>
    </div>
  );
}

