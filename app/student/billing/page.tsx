'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function StudentBillingPage() {
    const { data: session } = useSession();
    const [totalDue, setTotalDue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        const fetchDue = async () => {
            if (!session?.user) return;
            setLoading(true);
            try {
                const userId = (session.user as any).id;
                const [resM, resI] = await Promise.all([
                    fetch('/api/matriculations'),
                    fetch(`/api/invoices?studentId=${userId}`)
                ]);
                const data = await resM.json();
                const invData = await resI.json();
                
                const myMatrics = data.filter((m: any) => m.studentId === userId);
                const due = myMatrics.reduce((acc: number, curr: any) => acc + (curr.amountDue || 0), 0);
                setTotalDue(due);
                
                if (Array.isArray(invData)) {
                    setInvoices(invData.filter(inv => inv.status !== 'Paga'));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchDue();
    }, [session]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setUploadedFile(data.url);
                alert('Comprovativo carregado com sucesso! A nossa equipa financeira irá validar o pagamento em breve.');
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao carregar ficheiro.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="billing-page container">
            <div className="page-header">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Regularizar Dívidas</h1>
                    <p>Siga as instruções abaixo para liquidar os montantes em aberto e carregar o seu comprovativo.</p>
                </div>
            </div>

            <div className="billing-layout">
                <div className="billing-main">
                    <div className="due-card card shadow-sm">
                        <span className="due-lbl">Total Base em Aberto (Cursos)</span>
                        <h2 className="due-val">{totalDue.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</h2>
                        <p className="due-note">Este valor refere-se ao somatório de todas as propinas e taxas de exames pendentes das suas matrículas.</p>
                    </div>

                    {invoices.length > 0 && (
                        <div className="invoices-card card shadow-sm">
                            <h3>Faturas Pendentes</h3>
                            <div className="invoices-list">
                                {invoices.map(inv => (
                                    <div key={inv.id} className="invoice-item">
                                        <div className="inv-left">
                                            <span className="inv-num">{inv.invoiceNumber || 'Nova Fatura'}</span>
                                            <span className="inv-date">Vencimento: {inv.dueDate || inv.date || inv.createdAt.split('T')[0]}</span>
                                        </div>
                                        <div className="inv-right">
                                            <span className="inv-amount">€{Number(inv.amount).toFixed(2)}</span>
                                            <span className="inv-status">{inv.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bank-info card shadow-sm">
                        <h3>🏦 Dados para Transferência Bancária</h3>
                        <div className="bank-details">
                            <div className="bank-row"><span>Banco:</span> <strong>Millennium BIM</strong></div>
                            <div className="bank-row"><span>Titular:</span> <strong>Marítimo Training Center, Lda.</strong></div>
                            <div className="bank-row"><span>NIB:</span> <strong>0003 0000 1234 5678 9012 3</strong></div>
                            <div className="bank-row"><span>IBAN:</span> <strong>MZ59 0003 0000 1234 5678 9012 3</strong></div>
                        </div>
                        <div className="bank-instructions">
                            <strong>Importante:</strong> Use o seu Nome Completo ou ID de Aluno como referência na transferência para que possamos identificar o seu pagamento rapidamente.
                        </div>
                    </div>
                </div>

                <div className="billing-sidebar">
                    <div className="upload-card card shadow-sm">
                        <div className="upload-hdr">
                            <span className="upload-icon">📄</span>
                            <h3>Enviar Comprovativo</h3>
                        </div>
                        <p>Já realizou o pagamento? Carregue aqui o ficheiro (PDF ou Foto) para acelerar a validação.</p>
                        
                        <label className={`upload-btn ${uploading ? 'uploading' : ''}`}>
                            <input type="file" onChange={handleUpload} accept="image/*,application/pdf" hidden disabled={uploading} />
                            {uploading ? 'A carregar...' : '📁 Selecionar Ficheiro'}
                        </label>

                        {uploadedFile && (
                            <div className="upload-success">
                                <span className="check">✅</span>
                                <div>
                                    <strong>Documento Enviado</strong>
                                    <p>O seu comprovativo está em análise.</p>
                                </div>
                            </div>
                        )}

                        {!uploadedFile && (
                            <div className="upload-empty">
                                <p>Nenhum ficheiro selecionado.</p>
                            </div>
                        )}
                    </div>

                    <div className="support-card card shadow-sm">
                        <h4>Dúvidas Financeiras?</h4>
                        <p>Pode contactar a nossa tesouraria através do email <strong>financeiro@maritimo.co.mz</strong> ou pelo WhatsApp <strong>+258 84 123 4567</strong>.</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .billing-page { padding: 1rem 0; }
                .page-header { margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 1.8rem; color: #2D180F; margin-top: 0.5rem; }
                
                .billing-layout { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: start; }
                
                .due-card { padding: 2.5rem; background: linear-gradient(135deg, #2D180F 0%, #1a4fa0 100%); color: white; border: none; border-radius: 24px; position: relative; overflow: hidden; margin-bottom: 2rem; }
                .due-card::after { content: '⚓'; position: absolute; right: -20px; top: -20px; font-size: 8rem; opacity: 0.1; transform: rotate(15deg); }
                .due-lbl { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 0.5rem; }
                .due-val { font-size: 2.5rem; font-weight: 900; font-family: 'Outfit', sans-serif; letter-spacing: -0.02em; margin: 0; }
                .due-note { font-size: 0.85rem; color: #94a3b8; font-weight: 500; margin-top: 1.5rem; }
                
                .invoices-card { padding: 2.5rem; margin-bottom: 2rem; border-left: 6px solid #ef4444; }
                .invoices-card h3 { margin-top: 0; margin-bottom: 1.5rem; color: #2D180F; }
                .invoices-list { display: flex; flex-direction: column; gap: 1rem; }
                .invoice-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
                .inv-left { display: flex; flex-direction: column; gap: 0.25rem; }
                .inv-num { font-weight: 800; color: #0f172a; }
                .inv-date { font-size: 0.8rem; color: #64748b; }
                .inv-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
                .inv-amount { font-weight: 800; color: #dc2626; }
                .inv-status { font-size: 0.7rem; text-transform: uppercase; padding: 0.2rem 0.5rem; background: #fee2e2; color: #991b1b; border-radius: 4px; font-weight: 700; }
                
                .bank-info { padding: 2.5rem; border-left: 6px solid #E6C5A8; }
                .bank-info h3 { margin-top: 0; color: #2D180F; font-size: 1.25rem; font-weight: 800; margin-bottom: 2rem; }
                .bank-details { display: flex; flex-direction: column; gap: 1.25rem; background: #f8fafc; padding: 1.5rem; border-radius: 16px; border: 1px solid #edf2f7; }
                .bank-row { display: flex; justify-content: space-between; font-size: 0.95rem; }
                .bank-row span { color: #64748b; font-weight: 600; }
                .bank-row strong { color: #0f172a; font-weight: 800; font-family: 'Outfit', sans-serif; }
                .bank-instructions { margin-top: 2rem; padding: 1.25rem; background: #F7ECE1; border-radius: 12px; border: 1px solid #F7ECE1; color: #9A3412; font-size: 0.85rem; line-height: 1.5; }
                
                .upload-card { padding: 2rem; border-radius: 20px; text-align: center; }
                .upload-hdr { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
                .upload-icon { font-size: 2rem; }
                .upload-hdr h3 { margin: 0; color: #2D180F; font-weight: 800; }
                .upload-card p { font-size: 0.85rem; color: #64748b; line-height: 1.5; margin-bottom: 1.5rem; }
                
                .upload-btn { background: #2D180F; color: white; border: none; padding: 1rem; border-radius: 12px; font-weight: 800; display: block; width: 100%; cursor: pointer; transition: 0.2s; }
                .upload-btn:hover { background: #EA580C; transform: translateY(-2px); }
                .upload-btn.uploading { background: #94a3b8; cursor: not-allowed; }
                
                .upload-success { margin-top: 1.5rem; display: flex; gap: 1rem; align-items: center; text-align: left; padding: 1rem; background: #ecfdf5; border-radius: 12px; border: 1px solid #d1fae5; }
                .upload-success .check { font-size: 1.5rem; }
                .upload-success strong { display: block; color: #065f46; font-size: 0.85rem; font-weight: 800; }
                .upload-success p { margin: 0; color: #059669; font-size: 0.75rem; font-weight: 500; line-height: 1.2; }
                
                .upload-empty { margin-top: 1rem; color: #cbd5e1; font-size: 0.75rem; font-weight: 600; font-style: italic; }
                
                .support-card { padding: 1.5rem; background: #f8fafc; border: 1px dashed #cbd5e1; }
                .support-card h4 { margin-top: 0; color: #64748b; font-size: 0.8rem; text-transform: uppercase; font-weight: 800; margin-bottom: 0.75rem; }
                .support-card p { font-size: 0.75rem; color: #475569; line-height: 1.6; margin: 0; }
                .support-card strong { color: #2D180F; }
            `}</style>
        </div>
    );
}
