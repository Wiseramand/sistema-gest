'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Trainer {
    id: string;
    name: string;
    fullName: string;
    email: string;
    phone: string;
    specialty: string;
    photo: string;
    idDocument: string;
    validity: string;
    nationality: string;
    address: string;
    status: string;
}

export default function TrainerDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/trainers/${id}`);
                const found = await res.json();
                setTrainer(found || null);

                // Fetch activity logs for this trainer
                const lRes = await fetch('/api/activity-logs');
                if (lRes.ok) {
                    const allLogs = await lRes.json();
                    setLogs(allLogs.filter((l: any) => l.targetId === id || l.userId === id).sort((a: any, b: any) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    ));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    if (loading) return <div className="loader">A carregar detalhes do formador...</div>;
    if (!trainer) return <div className="error">Formador não encontrado.</div>;

    return (
        <div className="profile-wrapper">
            <div className="profile-header card">
                <div className="profile-bg"></div>
                <div className="profile-top-content">
                    <div className="photo-container">
                        {trainer.photo ? (
                            <img src={trainer.photo} alt={trainer.name} className="profile-photo" />
                        ) : (
                            <div className="photo-placeholder">{trainer.name.charAt(0)}</div>
                        )}
                        <span className={`status-badge ${trainer.status?.toLowerCase()}`}>{trainer.status}</span>
                    </div>
                    <div className="profile-main-info">
                        <h1>{trainer.fullName || trainer.name}</h1>
                        <p className="specialty-text">⚓ {trainer.specialty}</p>
                        <div className="quick-stats">
                            <div className="stat">
                                <span className="stat-label">Email</span>
                                <span className="stat-val">{trainer.email || 'Não definido'}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Telefone</span>
                                <span className="stat-val">{trainer.phone || 'Não definido'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button onClick={() => window.print()} className="btn-print">🖨️ Imprimir Perfil</button>
                        <Link href="/admin/trainers" className="btn-back">← Voltar à Lista</Link>
                    </div>
                </div>
            </div>

            <div className="profile-grid">
                <div className="info-section card">
                    <div className="section-header">
                        <h3>📋 Informações Pessoais</h3>
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Nacionalidade</span>
                            <span className="val">{trainer.nationality || '---'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Documento de Identificação</span>
                            <span className="val">{trainer.idDocument || '---'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Validade do Documento</span>
                            <span className="val">{trainer.validity || '---'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Morada</span>
                            <span className="val">{trainer.address || '---'}</span>
                        </div>
                    </div>
                </div>

                <div className="info-section card secondary-section">
                    <div className="section-header">
                        <h3>🛠️ Especialidade & Atuação</h3>
                    </div>
                    <div className="specialty-details">
                        <div className="focus-area">
                            <span className="area-icon">🚢</span>
                            <div>
                                <h4>Área de Foco</h4>
                                <p>{trainer.specialty}</p>
                            </div>
                        </div>
                        <p className="specialty-desc">
                            Este formador está qualificado para ministrar cursos teóricos e práticos na área de {trainer.specialty},
                            cumprindo todos os requisitos de certificação exigidos pelo Marítimo Training Center.
                        </p>
                    </div>
                </div>

                <div className="info-section card">
                    <div className="section-header">
                        <h3>📜 Histórico de Atividades</h3>
                    </div>
                    <div className="logs-list">
                        {logs.length > 0 ? logs.map(log => (
                            <div key={log.id} className="log-item">
                                <div className="log-icon">{log.action === 'CREATE' ? '➕' : log.action === 'UPDATE' ? '📝' : '🗑️'}</div>
                                <div className="log-info">
                                    <p className="log-details">{log.details}</p>
                                    <span className="log-time">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">Nenhuma atividade registada para este formador.</div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-wrapper { padding: 1rem; max-width: 1200px; margin: 0 auto; }
                .card { background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 2rem; border: 1px solid #e2e8f0; }
                
                .profile-header { position: relative; }
                .profile-bg { height: 160px; background: linear-gradient(135deg, var(--navy-deep) 0%, var(--ocean-blue) 100%); }
                .profile-top-content { padding: 0 3rem 3rem; display: flex; align-items: flex-end; gap: 2.5rem; margin-top: -60px; position: relative; z-index: 2; }
                
                .photo-container { position: relative; }
                .profile-photo { width: 180px; height: 180px; border-radius: 50%; border: 6px solid white; object-fit: cover; box-shadow: 0 10px 25px rgba(0,0,0,0.1); background: white; }
                .photo-placeholder { width: 180px; height: 180px; border-radius: 50%; border: 6px solid white; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 5rem; font-weight: 800; color: #94a3b8; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
                
                .status-badge { position: absolute; bottom: 10px; right: 10px; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; border: 3px solid white; }
                .status-badge.ativo { background: #10b981; color: white; }
                .status-badge.inativo { background: #ef4444; color: white; }

                .profile-main-info { flex: 1; padding-bottom: 0.5rem; }
                .profile-main-info h1 { margin: 0; font-size: 2.2rem; color: var(--navy-deep); font-weight: 800; }
                .specialty-text { margin: 0.25rem 0 1.5rem; color: var(--ocean-blue); font-weight: 700; font-size: 1.1rem; }
                
                .quick-stats { display: flex; gap: 3rem; }
                .stat { display: flex; flex-direction: column; }
                .stat-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #94a3b8; letter-spacing: 1px; }
                .stat-val { font-size: 1rem; color: var(--navy-medium); font-weight: 600; }

                .header-actions { padding-bottom: 0.5rem; }
                .btn-back { background: #f8fafc; color: #64748b; padding: 0.75rem 1.5rem; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 0.9rem; transition: 0.2s; border: 1px solid #e2e8f0; }
                .btn-back:hover { background: white; color: var(--navy-deep); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

                .profile-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
                .section-header { padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; }
                .section-header h3 { margin: 0; color: var(--navy-deep); font-size: 1.1rem; font-weight: 800; }

                .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; padding: 2rem; }
                .info-item { display: flex; flex-direction: column; gap: 0.4rem; }
                .label { font-size: 0.8rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
                .val { font-weight: 700; color: var(--navy-deep); font-size: 1.05rem; }

                .secondary-section { background: #f8fafc; }
                .specialty-details { padding: 2rem; }
                .focus-area { display: flex; gap: 1.25rem; align-items: center; margin-bottom: 1.5rem; background: white; padding: 1.25rem; border-radius: 15px; border: 1px solid #e2e8f0; }
                .area-icon { font-size: 2rem; }
                .focus-area h4 { margin: 0; font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; }
                .focus-area p { margin: 0; font-weight: 800; color: var(--navy-deep); font-size: 1.1rem; }
                .specialty-desc { font-size: 0.9rem; line-height: 1.6; color: #64748b; font-weight: 500; }

                .loader { padding: 5rem; text-align: center; color: #94a3b8; font-weight: 600; }
                .error { padding: 5rem; text-align: center; color: #ef4444; font-weight: 700; }

                @media (max-width: 992px) {
                    .profile-top-content { flex-direction: column; align-items: center; text-align: center; margin-top: -90px; }
                    .quick-stats { justify-content: center; gap: 1.5rem; margin-top: 1rem; }
                    .profile-grid { grid-template-columns: 1fr; }
                    .info-grid { grid-template-columns: 1fr; gap: 1.5rem; }
                }

                .btn-print { background: var(--sand-gold); color: var(--navy-deep); padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; transition: 0.2s; border: none; cursor: pointer; margin-right: 1rem; }
                .btn-print:hover { background: #e5c35e; transform: translateY(-2px); }

                .logs-list { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
                .log-item { display: flex; gap: 1rem; align-items: flex-start; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
                .log-item:last-child { border-bottom: none; }
                .log-icon { font-size: 1.2rem; }
                .log-details { margin: 0; font-size: 0.9rem; color: var(--navy-medium); font-weight: 600; }
                .log-time { font-size: 0.75rem; color: #94a3b8; }
                .empty-state { padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.9rem; }

                @media print {
                    :global(.sidebar), :global(.admin-header), .btn-back, .btn-print, .profile-bg {
                        display: none !important;
                    }
                    :global(.admin-content) {
                        padding: 0 !important;
                        background: white !important;
                        margin: 0 !important;
                    }
                    .profile-wrapper { padding: 0; }
                    .card { border: none; box-shadow: none; margin-bottom: 1rem; }
                    .profile-top-content { margin-top: 0; padding-top: 2rem; border-bottom: 2px solid #eee; }
                    .profile-photo { border: 2px solid #eee; }
                }
            `}</style>
        </div>
    );
}
