'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    responsibilities: string[];
}

const ROLES = [
    { key: 'inscriptions', label: 'Inscrições', icon: '📝' },
    { key: 'matriculations', label: 'Matrículas', icon: '🖋️' },
    { key: 'trainers', label: 'Formadores', icon: '👨‍🏫' },
    { key: 'courses', label: 'Cursos', icon: '⚓' },
    { key: 'students', label: 'Alunos', icon: '👥' },
    { key: 'classes', label: 'Formações', icon: '🏫' },
    { key: 'classrooms', label: 'Salas de Aula', icon: '🏛️' },
    { key: 'reports', label: 'Relatórios', icon: '📈' },
    { key: 'companies', label: 'Clientes (Empresas)', icon: '🏢' },
    { key: 'certificates', label: 'Certificados', icon: '🎓' },
    { key: 'media', label: 'Hub de Média', icon: '📁' },
];

export default function UserTasksPage() {
    const { data: session } = useSession();
    const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/adminusers');
            const data = await res.json();
            setAdmins(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAdmins(); }, []);

    const toggleResponsibility = async (adminId: string, currentResp: string[], key: string) => {
        setUpdatingId(adminId);
        const newResp = currentResp.includes(key)
            ? currentResp.filter(r => r !== key)
            : [...currentResp, key];

        try {
            const res = await fetch(`/api/adminusers/${adminId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responsibilities: newResp })
            });

            if (res.ok) {
                setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, responsibilities: newResp } : a));
            }
        } catch (e) { console.error(e); }
        finally { setUpdatingId(null); }
    };

    if (!isSuperAdmin) {
        return <div className="p-8 text-center text-slate-500">Acesso exclusivo ao Super Administrador.</div>;
    }

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <h1>Tarefas & Delegação</h1>
                    <p>Distribua responsabilidades e delegue módulos específicos para a sua equipa administrativa.</p>
                </div>
            </div>

            <div className="delegation-grid">
                {loading ? <div className="loading">A carregar equipa...</div> : admins.filter(a => a.role !== 'SUPER_ADMIN').map(admin => (
                    <div key={admin.id} className={`admin-task-card ${updatingId === admin.id ? 'syncing' : ''}`}>
                        <div className="card-head">
                            <div className="avatar">{(admin.name || 'A').slice(0, 2).toUpperCase()}</div>
                            <div className="info">
                                <h3>{admin.name}</h3>
                                <p>{admin.email}</p>
                            </div>
                        </div>
                        
                        <div className="responsibilities-list">
                            <h4>Módulos Delegados</h4>
                            <div className="roles-grid">
                                {ROLES.map(role => (
                                    <label key={role.key} className={`role-item ${admin.responsibilities.includes(role.key) ? 'active' : ''}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={admin.responsibilities.includes(role.key)}
                                            onChange={() => toggleResponsibility(admin.id, admin.responsibilities, role.key)}
                                            disabled={updatingId === admin.id}
                                        />
                                        <span className="icon">{role.icon}</span>
                                        <span className="label text-ellipsis">{role.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .page-wrap { display: flex; flex-direction: column; gap: 2rem; }
                .page-header { background: #2D180F; padding: 2rem; border-radius: 16px; color: white; }
                .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 0 0 0.5rem; color: #E6C5A8; }
                .page-header p { color: #cbd5e1; font-size: 0.95rem; margin: 0; }

                .delegation-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.5rem; }
                .admin-task-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 1.5rem; transition: 0.2s; position: relative; }
                .admin-task-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); }
                .admin-task-card.syncing { opacity: 0.7; pointer-events: none; }

                .card-head { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 1rem; }
                .avatar { width: 44px; height: 44px; border-radius: 12px; background: #FDF2E9; color: #EA580C; display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: 'Outfit', sans-serif; }
                .info h3 { margin: 0; font-size: 1.05rem; color: #2D180F; font-weight: 700; }
                .info p { margin: 0; font-size: 0.8rem; color: #64748b; }

                .responsibilities-list h4 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 800; margin-bottom: 1rem; }
                .roles-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
                
                .role-item { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem; border-radius: 10px; background: #f8fafc; border: 1.5px solid transparent; cursor: pointer; transition: 0.2s; }
                .role-item:hover { background: #f1f5f9; }
                .role-item.active { background: #FDF2E9; border-color: #EA580C; }
                .role-item input { display: none; }
                .role-item .icon { font-size: 1.1rem; }
                .role-item .label { font-size: 0.85rem; font-weight: 600; color: #475569; }
                .role-item.active .label { color: #EA580C; }
                
                .loading { grid-column: 1 / -1; text-align: center; padding: 5rem; color: #94a3b8; font-weight: 600; }
                .text-ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            `}</style>
        </div>
    );
}
