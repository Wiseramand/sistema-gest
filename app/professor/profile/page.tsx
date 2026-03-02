'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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

export default function TrainerProfilePage() {
    const { data: session } = useSession();
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrainer = async () => {
            const userId = (session?.user as any)?.id;
            if (!userId) return;

            try {
                const res = await fetch(`/api/trainers/${userId}`);
                const found = await res.json();
                setTrainer(found || null);
            } catch (error) {
                console.error('Error fetching trainer:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrainer();
    }, [session]);

    if (loading) return <div className="loader">A carregar o seu perfil...</div>;
    if (!trainer) return <div className="error">Dados do perfil não encontrados. Por favor, contacte o administrador.</div>;

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
                                <span className="stat-label">Email Profissional</span>
                                <span className="stat-val">{trainer.email || 'Não definido'}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Contacto Móvel</span>
                                <span className="stat-val">{trainer.phone || 'Não definido'}</span>
                            </div>
                        </div>
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
                        <h3>🛠️ Qualificação & Atuação</h3>
                    </div>
                    <div className="specialty-details">
                        <div className="focus-area">
                            <span className="area-icon">🚢</span>
                            <div>
                                <h4>Área de Especialidade</h4>
                                <p>{trainer.specialty}</p>
                            </div>
                        </div>
                        <p className="specialty-desc">
                            Como formador do Marítimo Training Center, a sua conta está habilitada para gerir turmas e pautas relacionadas com a sua área de especialidade em {trainer.specialty}.
                        </p>
                        <button className="btn-update-cv">Submeter Novo CV</button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-wrapper { padding: 0; max-width: 1200px; margin: 0 auto; animation: fadeUp 0.5s ease-out; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .card { background: white; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 2rem; border: 1px solid #e2e8f0; }
                
                .profile-header { position: relative; }
                .profile-bg { height: 160px; background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%); }
                .profile-top-content { padding: 0 3rem 3rem; display: flex; align-items: flex-end; gap: 2.5rem; margin-top: -60px; position: relative; z-index: 2; }
                
                .photo-container { position: relative; }
                .profile-photo { width: 180px; height: 180px; border-radius: 50%; border: 6px solid white; object-fit: cover; box-shadow: 0 10px 25px rgba(0,0,0,0.1); background: white; }
                .photo-placeholder { width: 180px; height: 180px; border-radius: 50%; border: 6px solid white; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 5rem; font-weight: 800; color: #94a3b8; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
                
                .status-badge { position: absolute; bottom: 10px; right: 10px; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; border: 3px solid white; }
                .status-badge.ativo { background: #10b981; color: white; }
                .status-badge.inativo { background: #ef4444; color: white; }

                .profile-main-info { flex: 1; padding-bottom: 0.5rem; }
                .profile-main-info h1 { margin: 0; font-size: 2.2rem; color: #1e293b; font-weight: 800; }
                .specialty-text { margin: 0.25rem 0 1.5rem; color: #3b82f6; font-weight: 700; font-size: 1.1rem; }
                
                .quick-stats { display: flex; gap: 3rem; }
                .stat { display: flex; flex-direction: column; }
                .stat-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #94a3b8; letter-spacing: 1px; }
                .stat-val { font-size: 1rem; color: #475569; font-weight: 600; }

                .profile-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
                .section-header { padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; }
                .section-header h3 { margin: 0; color: #1e293b; font-size: 1.1rem; font-weight: 800; }

                .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; padding: 2rem; }
                .info-item { display: flex; flex-direction: column; gap: 0.4rem; }
                .label { font-size: 0.8rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
                .val { font-weight: 700; color: #1e293b; font-size: 1.05rem; }

                .secondary-section { background: #f8fafc; }
                .specialty-details { padding: 2rem; }
                .focus-area { display: flex; gap: 1.25rem; align-items: center; margin-bottom: 1.5rem; background: white; padding: 1.25rem; border-radius: 15px; border: 1px solid #e2e8f0; }
                .area-icon { font-size: 2rem; }
                .focus-area h4 { margin: 0; font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; }
                .focus-area p { margin: 0; font-weight: 800; color: #1e293b; font-size: 1.1rem; }
                .specialty-desc { font-size: 0.9rem; line-height: 1.6; color: #64748b; font-weight: 500; margin-bottom: 1.5rem; }
                
                .btn-update-cv { width: 100%; padding: 0.8rem; border-radius: 12px; background: #1e293b; color: white; font-weight: 700; border: none; cursor: pointer; transition: 0.2s; }
                .btn-update-cv:hover { background: #334155; transform: scale(1.02); }

                .loader { padding: 5rem; text-align: center; color: #94a3b8; font-weight: 600; }
                .error { padding: 5rem; text-align: center; color: #ef4444; font-weight: 700; }

                @media (max-width: 992px) {
                    .profile-top-content { flex-direction: column; align-items: center; text-align: center; margin-top: -90px; }
                    .quick-stats { justify-content: center; gap: 1.5rem; margin-top: 1rem; }
                    .profile-grid { grid-template-columns: 1fr; }
                    .info-grid { grid-template-columns: 1fr; gap: 1.5rem; }
                }
            `}</style>
        </div>
    );
}
