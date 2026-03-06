'use client';

import { useState, useEffect } from 'react';

interface ActivityLog {
    id: string;
    userId: string;
    userName: string;
    role: string;
    action: string;
    details: string;
    targetType?: string;
    targetId?: string;
    timestamp: string;
}

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch('/api/activity-logs');
                if (response.ok) {
                    const data = await response.json();
                    // Sort by timestamp descending
                    setLogs(data.sort((a: any, b: any) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    ));
                }
            } catch (error) {
                console.error('Failed to fetch logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionBadgeClass = (action: string) => {
        if (action.includes('CREATE')) return 'badge-create';
        if (action.includes('UPDATE')) return 'badge-update';
        if (action.includes('DELETE')) return 'badge-delete';
        if (action.includes('APPROVE')) return 'badge-approve';
        if (action.includes('FEEDBACK')) return 'badge-feedback';
        if (action.includes('ATTENDANCE')) return 'badge-attendance';
        if (action.includes('UPLOAD')) return 'badge-upload';
        return 'badge-default';
    };

    const totalPages = Math.ceil(logs.length / itemsPerPage);
    const paginatedLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="activity-logs-container">
            <div className="page-header">
                <div>
                    <h1>Registo de Atividades</h1>
                    <p>Histórico completo de ações realizadas pelos administradores no sistema.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="print-btn"
                >
                    <span>🖨️</span> Imprimir Relatório
                </button>
            </div>

            <div className="card log-table-card">
                {loading ? (
                    <div className="loading-state">Carregando registos...</div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">Nenhum registo de atividade encontrado.</div>
                ) : (
                    <table className="log-table">
                        <thead>
                            <tr>
                                <th>Data e Hora</th>
                                <th>Usuário</th>
                                <th>Ação</th>
                                <th>Detalhes</th>
                                <th>Entidade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="timestamp">{formatDate(log.timestamp)}</td>
                                    <td>
                                        <div className="user-cell">
                                            <span className="user-name">{log.userName}</span>
                                            <span className="user-role">{log.role}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getActionBadgeClass(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="details">{log.details}</td>
                                    <td className="target">
                                        {log.targetType && (
                                            <span className="target-tag">
                                                {log.targetType} {log.targetId && `#${log.targetId.slice(-4)}`}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {totalPages > 1 && !loading && logs.length > 0 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                        Anterior
                    </button>
                    <span className="page-info">Página {currentPage} de {totalPages}</span>
                    <button
                        className="page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                        Próxima
                    </button>
                </div>
            )}

            <style jsx>{`
                .activity-logs-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .page-header h1 {
                    font-size: 1.75rem;
                    color: #001f3f;
                    margin: 0;
                }

                .page-header p {
                    color: #64748b;
                    margin: 0.25rem 0 0;
                }

                .print-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 0.6rem 1.2rem;
                    border-radius: 8px;
                    font-weight: 600;
                    color: #1e293b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .print-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .log-table-card {
                    padding: 0;
                    overflow: hidden;
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }

                .log-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }

                .log-table th {
                    background: #f8fafc;
                    padding: 1rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #64748b;
                    border-bottom: 1px solid #e2e8f0;
                }

                .log-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.9rem;
                    vertical-align: middle;
                }

                .timestamp {
                    white-space: nowrap;
                    font-family: monospace;
                    color: #64748b;
                }

                .user-cell {
                    display: flex;
                    flex-direction: column;
                }

                .user-name {
                    font-weight: 600;
                    color: #1e293b;
                }

                .user-role {
                    font-size: 0.7rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    font-weight: 700;
                }

                .badge {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                }

                .badge-create { background: #dcfce7; color: #166534; }
                .badge-update { background: #fef9c3; color: #854d0e; }
                .badge-delete { background: #fee2e2; color: #991b1b; }
                .badge-approve { background: #e0f2fe; color: #075985; }
                .badge-feedback { background: #fdf2f8; color: #be185d; }
                .badge-attendance { background: #ede9fe; color: #6d28d9; }
                .badge-upload { background: #f0fdfa; color: #0f766e; }
                .badge-default { background: #f1f5f9; color: #475569; }

                .details {
                    color: #334155;
                    line-height: 1.4;
                    max-width: 400px;
                }

                .target-tag {
                    font-size: 0.75rem;
                    padding: 0.2rem 0.4rem;
                    background: #f1f5f9;
                    color: #64748b;
                    border-radius: 4px;
                    border: 1px solid #e2e8f0;
                }

                .loading-state, .empty-state {
                    padding: 3rem;
                    text-align: center;
                    color: #94a3b8;
                }

                /* Pagination */
                .pagination { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: white; border-radius: 12px; border: 1px solid #e2e8f0; }
                .page-btn { padding: 0.5rem 1rem; border: 1px solid #cbd5e1; background: white; border-radius: 8px; font-weight: 600; font-size: 0.85rem; color: #475569; cursor: pointer; transition: 0.2s; }
                .page-btn:hover:not(:disabled) { background: #f1f5f9; color: var(--navy-deep); }
                .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .page-info { font-size: 0.85rem; color: #64748b; font-weight: 500; }

                @media print {
                    :global(.sidebar), :global(.admin-header), .print-btn {
                        display: none !important;
                    }
                    :global(.admin-content) {
                        padding: 0 !important;
                        background: white !important;
                        margin: 0 !important;
                    }
                    .activity-logs-container {
                        gap: 1rem;
                    }
                    .log-table-card {
                        border: none;
                    }
                    .log-table th {
                        background: #eee !important;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}
