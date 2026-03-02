'use client';

import { useState, useEffect } from 'react';

interface Inscription {
    id: string;
    name: string;
    email: string;
    phone: string;
    course: string;
    message: string;
    status: string;
    createdAt: string;
}

export default function InscriptionsPage() {
    const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInscriptions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/inscriptions');
            const data = await res.json();
            // Filter only pending if needed, or show all
            setInscriptions(data);
        } catch (error) {
            console.error('Error fetching inscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInscriptions();
    }, []);

    const handleApprove = async (inscription: Inscription) => {
        if (!confirm(`Deseja aprovar a inscrição de ${inscription.name}? O candidato será listado como aluno ativo.`)) return;

        try {
            // 1. Create student
            const resStudent = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: inscription.name,
                    email: inscription.email,
                    phone: inscription.phone,
                    course: inscription.course,
                    status: 'Ativo',
                    idDocument: '',
                    validity: '',
                    nationality: '',
                    photo: ''
                })
            });

            if (resStudent.ok) {
                // 2. Remove inscription
                await fetch(`/api/inscriptions/${inscription.id}`, { method: 'DELETE' });
                fetchInscriptions();
                alert('Inscrição aprovada com sucesso!');
            }
        } catch (error) {
            console.error('Error approving inscription:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja recusar esta inscrição? Os dados serão removidos permanentemente.')) return;

        try {
            const res = await fetch(`/api/inscriptions/${id}`, { method: 'DELETE' });
            if (res.ok) fetchInscriptions();
        } catch (error) {
            console.error('Error deleting inscription:', error);
        }
    };

    return (
        <div className="inscriptions-content">
            <div className="page-header">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Inscrições Recebidas</h1>
                    <p>Avalie os candidatos e confirme as matrículas no sistema.</p>
                </div>
            </div>

            {loading ? (
                <div className="loading-box">Buscando novas inscrições...</div>
            ) : (
                <div className="card table-card shadow-sm">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Recebido em</th>
                                <th>Candidato</th>
                                <th>Curso Pretendido</th>
                                <th>Mensagem / Observações</th>
                                <th className="text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inscriptions.map((insc) => (
                                <tr key={insc.id}>
                                    <td className="date-cell">
                                        <span className="date-badge">
                                            {new Date(insc.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="candidate-box">
                                            <span className="font-bold">{insc.name}</span>
                                            <span className="candidate-email">{insc.email}</span>
                                            <span className="candidate-phone">{insc.phone}</span>
                                        </div>
                                    </td>
                                    <td><span className="course-chip">{insc.course}</span></td>
                                    <td className="msg-cell" title={insc.message}>
                                        <p className="message-text">{insc.message || 'Sem mensagem adicional.'}</p>
                                    </td>
                                    <td className="actions text-right">
                                        <button className="btn btn-sm btn-success" onClick={() => handleApprove(insc)}>Aprovar</button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(insc.id)}>Recusar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {inscriptions.length === 0 && <div className="empty-state">Nenhuma nova inscrição pendente no momento.</div>}
                </div>
            )}

            <style jsx>{`
                .page-header { margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 1.85rem; color: var(--navy-deep); }
                .page-header p { color: var(--gray-medium); }

                .table-card { padding: 0; overflow: hidden; border-radius: 12px; }
                .admin-table { width: 100%; border-collapse: collapse; text-align: left; }

                .admin-table th {
                    background-color: #f8fafc;
                    padding: 1.25rem 1.5rem;
                    font-size: 0.75rem;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-weight: 700;
                    border-bottom: 1px solid #edf2f7;
                }

                .admin-table td {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #edf2f7;
                    font-size: 0.95rem;
                    vertical-align: middle;
                }

                .date-badge {
                    background-color: #f1f5f9;
                    color: #475569;
                    padding: 0.35rem 0.65rem;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .candidate-box { display: flex; flex-direction: column; gap: 0.1rem; }
                .candidate-email { font-size: 0.85rem; color: var(--gray-medium); }
                .candidate-phone { font-size: 0.8rem; color: var(--ocean-blue); font-weight: 500; }
                .font-bold { font-weight: 700; color: var(--navy-deep); }

                .course-chip {
                    display: inline-block;
                    background-color: #e0f2fe;
                    color: #0369a1;
                    padding: 0.25rem 0.75rem;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .msg-cell { max-width: 300px; }
                .message-text {
                    font-size: 0.85rem;
                    color: #64748b;
                    font-style: italic;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .text-right { text-align: right; }
                
                .actions {
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                }

                .btn-sm { font-size: 0.75rem; padding: 0.4rem 0.8rem; }
                .btn-success { background-color: #10b981; color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
                .btn-outline-danger { background: none; border: 1px solid #ef4444; color: #ef4444; border-radius: 6px; font-weight: 700; cursor: pointer; }
                .btn-success:hover { background-color: #059669; }
                .btn-outline-danger:hover { background-color: #fef2f2; }

                .loading-box, .empty-state {
                    padding: 3rem;
                    text-align: center;
                    color: #94a3b8;
                    font-weight: 500;
                    background: white;
                }
            `}</style>
        </div>
    );
}
