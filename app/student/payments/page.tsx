'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface PaymentRecord {
    id: string;
    course: string;
    amount: number;
    amountPaid: number;
    amountDue: number;
    status: string;
    paymentStatus: string;
    startDate: string;
}

export default function StudentPaymentsPage() {
    const { data: session } = useSession();
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [actualPayments, setActualPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            if (!session?.user) return;
            setLoading(true);
            try {
                const userId = (session.user as any).id;
                const [resM, resP] = await Promise.all([
                    fetch('/api/matriculations'),
                    fetch(`/api/payments?studentId=${userId}`)
                ]);
                const data = await resM.json();
                const pays = await resP.json();
                
                if (Array.isArray(pays)) {
                    setActualPayments(pays);
                }
                
                // Filter student's matriculations to show financial status
                const myMatrics = data.filter((m: any) => m.studentId === userId);
                
                const list = myMatrics.map((m: any) => ({
                    id: m.id,
                    course: m.course,
                    amount: m.amount || 0,
                    amountPaid: (m.amount || 0) - (m.amountDue || 0),
                    amountDue: m.amountDue || 0,
                    status: m.status,
                    paymentStatus: m.paymentStatus || 'Pendente',
                    startDate: m.startDate || 'N/A'
                }));
                
                setPayments(list);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, [session]);

    const totalPaid = payments.reduce((acc, curr) => acc + curr.amountPaid, 0);
    const totalDue = payments.reduce((acc, curr) => acc + curr.amountDue, 0);

    return (
        <div className="payments-page container">
            <div className="page-header">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Histórico de Faturas</h1>
                    <p>Consulte o estado financeiro das suas formações e os pagamentos já realizados.</p>
                </div>
            </div>

            <div className="financial-summary">
                <div className="stat-box card shadow-sm paid">
                    <span className="stat-lbl">Total Liquidado</span>
                    <h2 className="stat-val">{totalPaid.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</h2>
                </div>
                <div className="stat-box card shadow-sm pending">
                    <span className="stat-lbl">Total em Dívida</span>
                    <h2 className="stat-val">{totalDue.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</h2>
                </div>
            </div>

            <div className="payments-table-card card shadow-sm">
                <h3>Detalhamento por Formação</h3>
                <div className="table-wrapper">
                    <table className="payments-table">
                        <thead>
                            <tr>
                                <th>Formação / Curso</th>
                                <th>Custo Total</th>
                                <th>Valor Pago</th>
                                <th>Valor em Dívida</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id}>
                                    <td className="course-name">{p.course}</td>
                                    <td>{p.amount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</td>
                                    <td className="paid-val">{p.amountPaid.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</td>
                                    <td className={p.amountDue > 0 ? 'due-val' : ''}>{p.amountDue.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</td>
                                    <td>
                                        <span className={`status-badge ${p.paymentStatus.replace(' ', '').toLowerCase()}`}>
                                            {p.paymentStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && !loading && (
                                <tr><td colSpan={5} className="empty-msg">Não foram encontrados registos financeiros.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="payments-table-card card shadow-sm" style={{ marginTop: '2rem' }}>
                <h3>Recibos de Pagamento</h3>
                <div className="table-wrapper">
                    <table className="payments-table">
                        <thead>
                            <tr>
                                <th>Nº Recibo</th>
                                <th>Formação / Serviço</th>
                                <th>Valor</th>
                                <th>Método</th>
                                <th>Data</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actualPayments.map(p => (
                                <tr key={p.id}>
                                    <td className="mono">{p.receiptNumber || p.id}</td>
                                    <td className="course-name">{p.courseTitle}</td>
                                    <td className="paid-val">€{Number(p.amount).toFixed(2)}</td>
                                    <td>{p.method}</td>
                                    <td>{p.date}</td>
                                    <td>
                                        <span className={`status-badge ${p.status === 'Processado' ? 'pagototal' : 'pendente'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {actualPayments.length === 0 && !loading && (
                                <tr><td colSpan={6} className="empty-msg">Nenhum recibo de pagamento emitido.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                .payments-page { padding: 1rem 0; }
                .page-header { margin-bottom: 2rem; }
                .page-header h1 { font-size: 1.8rem; color: #2D180F; margin-top: 0.5rem; }
                
                .financial-summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
                .stat-box { padding: 2rem; border-left: 6px solid #e2e8f0; }
                .stat-box.paid { border-left-color: #10b981; background: #ecfdf5; }
                .stat-box.pending { border-left-color: #ef4444; background: #fff1f2; }
                .stat-lbl { font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.1em; display: block; margin-bottom: 0.5rem; }
                .stat-val { font-size: 1.8rem; font-weight: 800; color: #0f172a; font-family: 'Outfit', sans-serif; letter-spacing: -0.02em; }
                .stat-box.paid .stat-val { color: #065f46; }
                .stat-box.pending .stat-val { color: #991b1b; }
                
                .payments-table-card { padding: 2rem; }
                .payments-table-card h3 { margin-top: 0; color: #2D180F; font-size: 1.1rem; margin-bottom: 1.5rem; font-weight: 800; }
                
                .table-wrapper { overflow-x: auto; }
                .payments-table { width: 100%; border-collapse: collapse; min-width: 800px; }
                .payments-table th { text-align: left; padding: 1rem; background: #f8fafc; border-bottom: 2px solid #edf2f7; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; font-weight: 800; }
                .payments-table td { padding: 1.25rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; font-weight: 600; color: #475569; }
                .mono { font-family: monospace; font-size: 0.85rem; color: #64748b; }
                
                .course-name { color: #2D180F; font-weight: 800; }
                .paid-val { color: #059669; }
                .due-val { color: #dc2626; }
                
                .status-badge { padding: 0.4rem 0.85rem; border-radius: 50px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
                .status-badge.pagototal { background: #d1fae5; color: #065f46; }
                .status-badge.pendente { background: #fee2e2; color: #991b1b; }
                .status-badge.parcial { background: #F7ECE1; color: #9A3412; }
                
                .empty-msg { text-align: center; color: #94a3b8; padding: 4rem; font-style: italic; }
            `}</style>
        </div>
    );
}
