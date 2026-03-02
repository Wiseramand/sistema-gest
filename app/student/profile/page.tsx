'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    photo: string;
    idDocument: string;
    validity: string;
    nationality: string;
    clientType: string;
    companyId: string;
    createdAt: string;
}

interface Company {
    id: string;
    name: string;
}

interface Matriculation {
    id: string;
    course: string;
    startDate: string;
    paymentStatus: string;
}

export default function StudentProfilePage() {
    const { data: session } = useSession();
    const [student, setStudent] = useState<Student | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [matriculations, setMatriculations] = useState<Matriculation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const userId = (session?.user as any)?.id;
            if (!userId) return;

            try {
                const [sRes, mRes] = await Promise.all([
                    fetch(`/api/students/${userId}`),
                    fetch('/api/matriculations')
                ]);

                const studentData = await sRes.json();
                setStudent(studentData || null);

                if (studentData?.companyId) {
                    const cRes = await fetch(`/api/companies/${studentData.companyId}`);
                    const companyData = await cRes.json();
                    setCompany(companyData || null);
                }

                const allMatriculations = await mRes.json();
                setMatriculations(allMatriculations.filter((m: any) => m.studentId === userId));

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [session]);

    if (loading) return <div className="loader">A carregar o seu perfil...</div>;
    if (!student) return <div className="error">Dados do perfil não encontrados. Por favor, contacte o administrador.</div>;

    return (
        <div className="profile-wrapper">
            <div className="profile-header card">
                <div className="profile-bg"></div>
                <div className="profile-top-content">
                    <div className="photo-container">
                        {student.photo ? (
                            <img src={student.photo} alt={student.name} className="profile-photo" />
                        ) : (
                            <div className="photo-placeholder">{student.name.charAt(0)}</div>
                        )}
                        <span className={`status-badge ${student.status?.toLowerCase()}`}>{student.status}</span>
                    </div>
                    <div className="profile-main-info">
                        <h1>{student.name}</h1>
                        <p className="profile-type">
                            {student.clientType === 'Empresa' ? (
                                <span className="badge corporate">🏢 Aluno Corporativo</span>
                            ) : (
                                <span className="badge personal">👤 Aluno Particular</span>
                            )}
                        </p>
                        <div className="quick-stats">
                            <div className="stat">
                                <span className="stat-label">O seu Email</span>
                                <span className="stat-val">{student.email || 'Não definido'}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">O seu Telefone</span>
                                <span className="stat-val">{student.phone || 'Não definido'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-grid">
                <div className="main-info-col">
                    <div className="info-section card">
                        <div className="section-header">
                            <h3>📋 Os Meus Dados Pessoais</h3>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">Nacionalidade</span>
                                <span className="val">{student.nationality || '---'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Documento de Identificação</span>
                                <span className="val">{student.idDocument || '---'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Validade do Documento</span>
                                <span className="val">{student.validity || '---'}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Data de Registo</span>
                                <span className="val">{new Date(student.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-section card">
                        <div className="section-header">
                            <h3>📜 As Minhas Matrículas</h3>
                        </div>
                        <div className="enrollment-list">
                            {matriculations.length > 0 ? matriculations.map(m => (
                                <div key={m.id} className="enrollment-item">
                                    <div className="enrollment-info">
                                        <h4>{m.course}</h4>
                                        <p>Início em: {new Date(m.startDate).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <span className={`pay-badge ${m.paymentStatus?.replace(' ', '').toLowerCase()}`}>
                                        {m.paymentStatus}
                                    </span>
                                </div>
                            )) : (
                                <div className="empty-state">Ainda não possui matrículas registadas.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sidebar-info-col">
                    {student.clientType === 'Empresa' && (
                        <div className="info-section card client-card">
                            <div className="section-header">
                                <h3>🏢 Vínculo Corporativo</h3>
                            </div>
                            <div className="company-details">
                                <div className="company-icon">🏢</div>
                                <h4>{company?.name || 'Vínculo à Empresa'}</h4>
                                <p>O seu acesso é gerido pela sua entidade empregadora.</p>
                            </div>
                        </div>
                    )}

                    <div className="info-section card support-card">
                        <div className="section-header">
                            <h3>⚓ Centro de Apoio</h3>
                        </div>
                        <div className="notes-box">
                            <p>Se precisar de atualizar algum dado pessoal ou tiver questões sobre as suas matrículas, por favor dirija-se à secretaria ou contacte o administrador do sistema.</p>
                            <button className="btn-support">Contactar Suporte</button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-wrapper { padding: 0; max-width: 1200px; margin: 0 auto; animation: fadeUp 0.5s ease-out; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                .card { background: white; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); overflow: hidden; margin-bottom: 2rem; border: 1px solid #f1f5f9; }
                
                .profile-header { position: relative; }
                .profile-bg { height: 160px; background: linear-gradient(135deg, #0f172a 0%, #3b82f6 100%); }
                .profile-top-content { padding: 0 3rem 3rem; display: flex; align-items: flex-end; gap: 2.5rem; margin-top: -60px; position: relative; z-index: 2; }
                
                .photo-container { position: relative; }
                .profile-photo { width: 180px; height: 180px; border-radius: 50%; border: 6px solid white; object-fit: cover; box-shadow: 0 10px 25px rgba(0,0,0,0.1); background: white; }
                .photo-placeholder { width: 180px; height: 180px; border-radius: 50%; border: 6px solid white; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 5rem; font-weight: 800; color: #cbd5e0; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
                
                .status-badge { position: absolute; bottom: 10px; right: 10px; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; border: 3px solid white; }
                .status-badge.ativo { background: #10b981; color: white; }
                .status-badge.inativo { background: #ef4444; color: white; }

                .profile-main-info { flex: 1; padding-bottom: 0.5rem; }
                .profile-main-info h1 { margin: 0; font-size: 2.2rem; color: #0f172a; font-weight: 800; }
                .profile-type { margin: 0.5rem 0 1.5rem; }
                .badge { padding: 0.4rem 1rem; border-radius: 50px; font-size: 0.8rem; font-weight: 700; }
                .corporate { background: #eff6ff; color: #2563eb; }
                .personal { background: #f0fdf4; color: #16a34a; }
                
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
                .val { font-weight: 700; color: #0f172a; font-size: 1.05rem; }

                .enrollment-list { padding: 1rem; }
                .enrollment-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: #f8fafc; border-radius: 12px; margin-bottom: 1rem; border: 1px solid #e2e8f0; }
                .enrollment-info h4 { margin: 0; color: #0f172a; font-size: 1rem; }
                .enrollment-info p { margin: 0.25rem 0 0; font-size: 0.8rem; color: #64748b; font-weight: 600; }
                
                .pay-badge { padding: 0.4rem 0.85rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
                .pay-badge.pagototal { background: #ecfdf5; color: #059669; }
                .pay-badge.pendente { background: #fff7ed; color: #c2410c; }

                .client-card { background: linear-gradient(to bottom, white 0%, #f0f9ff 100%); text-align: center; }
                .company-details { padding: 2.5rem; display: flex; flex-direction: column; align-items: center; }
                .company-icon { font-size: 3rem; margin-bottom: 1rem; }
                .company-details h4 { margin: 0 0 0.5rem; font-size: 1.25rem; color: #0f172a; }
                .company-details p { font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; }

                .notes-box { padding: 2rem; }
                .notes-box p { font-size: 0.9rem; color: #64748b; line-height: 1.6; margin-bottom: 1.5rem; }
                .btn-support { width: 100%; padding: 0.8rem; border-radius: 12px; border: 2px solid #3b82f6; background: transparent; color: #3b82f6; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-support:hover { background: #3b82f6; color: white; }

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
