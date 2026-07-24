'use client';

import { useState, useEffect } from 'react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const handleSendEmail = async (invoice: any) => {
    setSendingEmail(invoice.client);
    try {
      const res = await fetch('/api/admin/emails/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: 'aluno@exemplo.com', // In a real app, this comes from the invoice record
          studentName: invoice.studentName || invoice.client,
          amount: invoice.amount,
          invoiceId: invoice.invoiceNumber || invoice.id
        })
      });
      if (res.ok) alert('Fatura enviada com sucesso para ' + invoice.client);
      else alert('Erro ao enviar fatura.');
    } catch (e) {
      alert('Erro de conexão ao enviar email.');
    } finally {
      setSendingEmail(null);
    }
  };

  const InvoiceModal = ({ invoice, onClose }: { invoice: any, onClose: () => void }) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-close" onClick={onClose}>×</div>
        <div className="invoice-doc">
          <div className="inv-header">
            <div className="inv-logo">⚓ MTC</div>
            <div className="inv-title">
              <h1>FATURA PROFORMA</h1>
              <p>Nº {invoice.nif}-2026</p>
            </div>
          </div>
          
          <div className="inv-info">
            <div className="inv-from">
              <strong>De:</strong>
              <p>Marítimo Training Center</p>
              <p>Luanda, Angola</p>
              <p>NIF: 5000123456</p>
            </div>
            <div className="inv-to">
              <strong>Para:</strong>
              <p>{invoice.studentName || invoice.client}</p>
              <p>NIF: {invoice.nif || 'Consumidor Final'}</p>
              <p>Data: {invoice.dueDate || invoice.date || 'N/A'}</p>
            </div>
          </div>

          <table className="inv-table">
            <thead>
              <tr>
                <th>Descrição do Serviço</th>
                <th>Qtd</th>
                <th>Preço Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{invoice.type || 'Serviços de Formação'} - Formação Profissional Marítima</td>
                <td>1</td>
                <td>{Number(invoice.amount).toFixed(2)}</td>
                <td>{Number(invoice.amount).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="inv-summary">
            <div className="summary-row"><span>Subtotal:</span> <span>{Number(invoice.amount).toFixed(2)}</span></div>
            <div className="summary-row"><span>IVA (14%):</span> <span>Inc.</span></div>
            <div className="summary-row total"><span>TOTAL A PAGAR:</span> <span>{Number(invoice.amount).toFixed(2)}</span></div>
          </div>

          <div className="inv-footer">
            <p>Método de Pagamento Predefinido: <strong>{invoice.method || 'Transferência Bancária'}</strong></p>
            <p>Obrigado pela sua preferência. Bons Ventos!</p>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-print" onClick={() => window.print()}>🖨️ Descarregar / Imprimir</button>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(10, 42, 94, 0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
        .modal-card { background: white; border-radius: 20px; width: 90%; max-width: 800px; padding: 3rem; position: relative; animation: zoomIn 0.3s ease; }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .modal-close { position: absolute; top: 1rem; right: 1.5rem; font-size: 2rem; cursor: pointer; color: #94a3b8; }

        .invoice-doc { color: #2D180F; font-family: 'Inter', sans-serif; }
        .inv-header { display: flex; justify-content: space-between; border-bottom: 2px solid #E6C5A8; padding-bottom: 2rem; margin-bottom: 2rem; }
        .inv-logo { font-size: 2rem; font-weight: 900; color: #2D180F; }
        .inv-title { text-align: right; }
        .inv-title h1 { font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin: 0; }
        
        .inv-info { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-bottom: 3rem; }
        .inv-info strong { display: block; font-size: 0.8rem; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem; }
        .inv-info p { margin: 0; font-size: 0.95rem; line-height: 1.5; }

        .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
        .inv-table th { text-align: left; background: #f8fafc; padding: 1rem; font-size: 0.8rem; text-transform: uppercase; color: #64748b; }
        .inv-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; }

        .inv-summary { margin-left: auto; width: 250px; }
        .summary-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.95rem; }
        .summary-row.total { border-top: 2px solid #2D180F; margin-top: 0.5rem; padding-top: 1rem; font-weight: 900; font-size: 1.1rem; }

        .inv-footer { margin-top: 4rem; padding-top: 2rem; border-top: 1px dashed #e2e8f0; font-size: 0.85rem; color: #64748b; }
        
        .modal-actions { margin-top: 3rem; display: flex; justify-content: center; }
        .btn-print { background: #2D180F; color: white; border: none; padding: 0.75rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-print:hover { background: #173b7d; }

        @media print {
          .modal-overlay { background: white; position: absolute; }
          .modal-close, .modal-actions { display: none; }
          .modal-card { width: 100%; max-width: 100%; padding: 0; box-shadow: none; }
        }
      `}</style>
    </div>
  );

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Emissão de Faturas</h1>
          <p>Área que alberga a lista de faturas geradas, faturas proforma e exportação de dados (SAF-T).</p>
        </div>
      </div>

      {selectedInvoice && <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
      
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
            {invoices.map((p, i) => (
              <tr key={i}>
                <td className="mono">{p.nif || 'N/A'}</td>
                <td className="bold">{p.studentName || p.client}</td>
                <td>{p.type || 'Fatura Proforma'}</td>
                <td style={{fontWeight: 700}}>€{Number(p.amount).toFixed(2)}</td>
                <td>{p.dueDate || p.date || p.createdAt?.split('T')[0]}</td>
                <td>{p.method || 'Transferência Bancária'}</td>
                <td>
                  <span className={`status-badge ${p.status === 'Emitida' || p.status === 'Paga' ? 'success' : 'warning'}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <div style={{display:'flex', gap:'5px'}}>
                    <button 
                      className="action-btn download" 
                      onClick={() => setSelectedInvoice(p)}
                      title="Descarregar PDF"
                    >
                      ⬇️ PDF
                    </button>
                    <button 
                      className="action-btn email-mini" 
                      onClick={() => handleSendEmail(p)} 
                      disabled={sendingEmail === p.client}
                      title="Enviar por Email"
                    >
                      {sendingEmail === p.client ? '⏳...' : '✉️ Email'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; position: relative; }
        .page-header { position: sticky; top: -10px; z-index: 10; background: linear-gradient(135deg, #2D180F 0%, #173b7d 100%); padding: 2rem; border-radius: 14px; color: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.15); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #E6C5A8; }
        .page-header p { color: #e2e8f0; max-width: 800px; }
        
        .card { background: #ffffff; border-radius: 14px; padding: 2rem; border: 1px solid #e2e8f0; }
        
        .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; }
        .table-header h2 { color: #2D180F; font-family: 'Outfit', sans-serif; font-size: 1.25rem; }
        .btn-primary { background: #2D180F; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { background: #173b7d; }

        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 1rem; background: #f8fafc; color: #475569; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #0f1e35; }
        .mono { font-family: monospace; font-size: 0.85rem; color: #64748b; }
        .bold { font-weight: 700; color: #2D180F; }

        .status-badge { padding: 0.2rem 0.6rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
        .status-badge.success { background: #ecfdf5; color: #059669; }
        .status-badge.warning { background: #F7ECE1; color: #9A3412; }

        .action-btn.download { background: #FDF2E9; color: #2D180F; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; }
        .action-btn.download:hover { background: #FDF2E9; }

        .action-btn.email-mini { background: #ecfdf5; color: #059669; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; }
        .action-btn.email-mini:hover { background: #d1fae5; }
      `}</style>
    </div>
  );
}
