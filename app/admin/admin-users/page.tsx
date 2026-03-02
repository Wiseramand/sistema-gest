'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AdminUser {
    id: string; name: string; email: string; role: string;
    responsibilities: string[]; createdAt: string;
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
];

export default function AdminUsersPage() {
    const { data: session } = useSession();
    const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
    const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string; password: string; loading?: boolean } | null>(null);
    const [formData, setFormData] = useState({
        name: '', email: '', responsibilities: [] as string[]
    });

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

    const toggleResponsibility = (key: string) => {
        setFormData(prev => ({
            ...prev,
            responsibilities: prev.responsibilities.includes(key)
                ? prev.responsibilities.filter(r => r !== key)
                : [...prev.responsibilities, key]
        }));
    };

    const handleOpenModal = (admin?: AdminUser) => {
        if (admin) {
            setEditingAdmin(admin);
            setFormData({ name: admin.name, email: admin.email, responsibilities: admin.responsibilities || [] });
        } else {
            setEditingAdmin(null);
            setFormData({ name: '', email: '', responsibilities: [] });
        }
        setGeneratedCredentials(null);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingAdmin) {
            // Update responsibilities only
            await fetch(`/api/adminusers/${editingAdmin.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responsibilities: formData.responsibilities })
            });
            fetchAdmins();
            setIsModalOpen(false);
        } else {
            // Create new admin + generate credentials
            setGeneratedCredentials({ username: '', password: '', loading: true });
            const res = await fetch('/api/adminusers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role: 'ADMIN' })
            });
            if (res.ok) {
                const created = await res.json();
                setGeneratedCredentials({ username: created.username, password: created.plainPassword, loading: false });
                fetchAdmins();
            } else {
                setGeneratedCredentials(null);
                alert('Erro ao criar administrador.');
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remover este administrador?')) return;
        await fetch(`/api/adminusers/${id}`, { method: 'DELETE' });
        fetchAdmins();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copiado para a área de transferência!');
    };

    const shareWhatsApp = (name: string, user: string, pass: string) => {
        const link = `${window.location.origin}/login`;
        const message = `⚓ *Credenciais de Acesso Administrativo*\n\nOlá *${name}*,\n\nAqui estão as suas credenciais de administrador:\n\n👤 *Utilizador:* ${user}\n🔑 *Senha:* ${pass}\n🔗 *Link:* ${link}\n\nBom trabalho na gestão!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const shareEmail = (email: string, name: string, user: string, pass: string) => {
        const link = `${window.location.origin}/login`;
        const subject = encodeURIComponent('Suas Credenciais Administrativas - Marítimo Training Center');
        const body = encodeURIComponent(`Olá ${name},\n\nAqui estão as suas credenciais de acesso como administrador:\n\nUtilizador: ${user}\nSenha: ${pass}\nLink: ${link}\n\nAtenciosamente,\nEquipa Marítimo.`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    };

    if (!isSuperAdmin) {
        return (
            <div className="page-wrapper">
                <div className="access-denied">
                    <div className="denied-icon">🔒</div>
                    <h2>Acesso Restrito</h2>
                    <p>Esta área é exclusiva para o Super Administrador.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="page-top">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Gestão de Administradores</h1>
                    <p>Crie admins e atribua responsabilidades específicas no sistema.</p>
                </div>
                <button className="new-btn" onClick={() => handleOpenModal()}>+ Novo Admin</button>
            </div>

            {/* Role Legend */}
            <div className="role-legend">
                {ROLES.map(r => (
                    <div key={r.key} className="role-chip">
                        <span>{r.icon}</span><span>{r.label}</span>
                    </div>
                ))}
                <div className="role-chip super"><span>⭐</span><span>Super Admin (aprovações)</span></div>
            </div>

            {loading ? <div className="loader">A carregar...</div> : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr><th>Administrador</th><th>E-mail</th><th>Responsabilidades</th><th>Criado em</th><th className="align-right">Ações</th></tr>
                        </thead>
                        <tbody>
                            {admins.map(a => (
                                <tr key={a.id}>
                                    <td>
                                        <div className="admin-cell">
                                            <div className="admin-avatar">{a.name?.[0] || '?'}</div>
                                            <div>
                                                <span className="bold">{a.name}</span>
                                                <span className="sub-text">{a.role === 'SUPER_ADMIN' ? '⭐ Super Admin' : 'Admin'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{a.email}</td>
                                    <td>
                                        <div className="resp-chips">
                                            {(a.responsibilities || []).length === 0
                                                ? <span className="no-resp">Sem responsabilidades</span>
                                                : (a.responsibilities || []).map(r => {
                                                    const role = ROLES.find(rl => rl.key === r);
                                                    return <span key={r} className="resp-chip">{role?.icon} {role?.label}</span>;
                                                })
                                            }
                                        </div>
                                    </td>
                                    <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                                    <td className="align-right">
                                        <div className="row-actions">
                                            <button className="row-btn edit" onClick={() => handleOpenModal(a)}>Editar</button>
                                            <button className="row-btn delete" onClick={() => handleDelete(a.id)}>Remover</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {admins.length === 0 && <tr><td colSpan={5} className="empty">Nenhum administrador criado ainda.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="overlay">
                    <div className="modal-box">
                        {generatedCredentials ? (
                            <div className="creds-box">
                                <div className="creds-icon">{generatedCredentials.loading ? '⏳' : '✅'}</div>
                                <h2>{generatedCredentials.loading ? 'A criar administrador...' : 'Administrador Criado!'}</h2>
                                <p>{generatedCredentials.loading ? 'A processar as credenciais de segurança...' : 'Partilhe estas credenciais com o novo administrador. A senha não pode ser recuperada.'}</p>

                                <div className="cred-field">
                                    <label>Username</label>
                                    <div className={`cred-value ${generatedCredentials.loading ? 'skeleton' : ''}`}>
                                        {generatedCredentials.loading ? 'a processar...' : generatedCredentials.username}
                                    </div>
                                </div>
                                <div className="cred-field">
                                    <label>Senha (copie agora!)</label>
                                    <div className={`cred-value senha ${generatedCredentials.loading ? 'skeleton' : ''}`}>
                                        {generatedCredentials.loading ? '••••••••' : generatedCredentials.password}
                                    </div>
                                </div>
                                <div className="cred-info">🔗 Link de acesso: <strong>{typeof window !== 'undefined' ? window.location.origin : ''}/login</strong></div>

                                <div className={`sharing-actions ${generatedCredentials.loading ? 'disabled' : ''}`}>
                                    <button className="share-btn copy" disabled={generatedCredentials.loading} onClick={() => copyToClipboard(`Utilizador: ${generatedCredentials.username}\nSenha: ${generatedCredentials.password}\nLink: ${window.location.origin}/login`)}>
                                        📋 Copiar Tudo
                                    </button>
                                    <button className="share-btn whatsapp" disabled={generatedCredentials.loading} onClick={() => shareWhatsApp(formData.name, generatedCredentials.username, generatedCredentials.password)}>
                                        🟢 WhatsApp
                                    </button>
                                    <button className="share-btn email" disabled={generatedCredentials.loading} onClick={() => shareEmail(formData.email, formData.name, generatedCredentials.username, generatedCredentials.password)}>
                                        📧 E-mail
                                    </button>
                                </div>
                                <button className="btn-save" style={{ width: '100%' }} disabled={generatedCredentials.loading} onClick={() => { setIsModalOpen(false); setGeneratedCredentials(null); }}>✓ Concluído</button>
                            </div>
                        ) : (
                            <>
                                <div className="modal-top">
                                    <div>
                                        <h2>{editingAdmin ? '✎ Editar Admin' : '+ Novo Administrador'}</h2>
                                        <p>{editingAdmin ? 'Ajuste as responsabilidades atribuídas' : 'Crie um novo administrador com acesso ao sistema'}</p>
                                    </div>
                                    <button className="close-x" onClick={() => setIsModalOpen(false)}>×</button>
                                </div>
                                <form onSubmit={handleSave}>
                                    {!editingAdmin && (
                                        <div className="form-row-2">
                                            <div className="field">
                                                <label>Nome Completo *</label>
                                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nome do administrador" />
                                            </div>
                                            <div className="field">
                                                <label>E-mail *</label>
                                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="admin@centro.com" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="resp-section">
                                        <div className="section-label">Responsabilidades Atribuídas</div>
                                        <div className="resp-grid">
                                            {ROLES.map(r => (
                                                <div key={r.key} className={`resp-toggle ${formData.responsibilities.includes(r.key) ? 'selected' : ''}`} onClick={() => toggleResponsibility(r.key)}>
                                                    <span className="resp-icon">{r.icon}</span>
                                                    <span className="resp-label">{r.label}</span>
                                                    <span className="resp-check">{formData.responsibilities.includes(r.key) ? '✓' : ''}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                        <button type="submit" className="btn-save">
                                            {editingAdmin ? '✓ Guardar Alterações' : '🔑 Criar e Gerar Credenciais'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .page-wrapper { padding: 0.5rem; }
                .page-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .page-top h1 { font-size: 1.8rem; color: var(--navy-deep); margin: 0.25rem 0; font-weight: 800; }
                .page-top p { color: #64748b; margin: 0; }

                .new-btn { background: var(--navy-deep); color: white; border: none; padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15); }
                .new-btn:hover { background: var(--ocean-blue); transform: translateY(-2px); }

                .role-legend { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 2rem; }
                .role-chip { display: flex; align-items: center; gap: 0.4rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 50px; padding: 0.35rem 0.85rem; font-size: 0.8rem; font-weight: 600; color: #475569; }
                .role-chip.super { background: #fffbeb; border-color: #fde68a; color: #92400e; }

                .access-denied { text-align: center; padding: 6rem 2rem; }
                .denied-icon { font-size: 4rem; margin-bottom: 1rem; }
                .access-denied h2 { font-size: 1.5rem; color: var(--navy-deep); }
                .access-denied p { color: #64748b; }

                .loader { padding: 3rem; text-align: center; color: #94a3b8; }
                .table-wrap { background: white; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th { background: #f8fafc; padding: 1rem 1.5rem; font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; border-bottom: 1px solid #e2e8f0; text-align: left; }
                .data-table td { padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; vertical-align: middle; }
                .data-table tr:last-child td { border-bottom: none; }
                .bold { font-weight: 700; color: var(--navy-deep); display: block; }
                .sub-text { font-size: 0.75rem; color: #94a3b8; display: block; }
                .empty { text-align: center; color: #94a3b8; padding: 3rem !important; }

                .admin-cell { display: flex; align-items: center; gap: 0.75rem; }
                .admin-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--navy-deep), var(--ocean-blue)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }

                .resp-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; }
                .resp-chip { background: #eff6ff; color: #1e40af; padding: 0.2rem 0.6rem; border-radius: 50px; font-size: 0.72rem; font-weight: 700; }
                .no-resp { color: #94a3b8; font-size: 0.82rem; }

                .align-right { text-align: right; }
                .row-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
                .row-btn { background: none; border: none; cursor: pointer; font-weight: 700; font-size: 0.82rem; padding: 0.35rem 0.65rem; border-radius: 6px; transition: 0.2s; }
                .row-btn.edit { color: var(--ocean-blue); }
                .row-btn.edit:hover { background: #eff6ff; }
                .row-btn.delete { color: #dc2626; }
                .row-btn.delete:hover { background: #fef2f2; }

                .overlay { position: fixed; inset: 0; background: rgba(0,20,50,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
                .modal-box { background: white; width: 100%; max-width: 620px; border-radius: 20px; padding: 2.5rem; box-shadow: 0 25px 60px rgba(0,0,0,0.25); }
                .modal-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; }
                .modal-top h2 { margin: 0; font-size: 1.3rem; color: var(--navy-deep); font-weight: 800; }
                .modal-top p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.875rem; }
                .close-x { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1.4rem; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .close-x:hover { background: #e2e8f0; }

                .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
                .field { display: flex; flex-direction: column; gap: 0.4rem; }
                .field label { font-weight: 700; font-size: 0.82rem; color: #475569; }
                .field input { padding: 0.8rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; background: #f8fafc; font-family: inherit; transition: 0.2s; }
                .field input:focus { outline: none; background: white; border-color: var(--ocean-blue); box-shadow: 0 0 0 3px rgba(0,116,217,0.12); }

                .resp-section { margin-bottom: 1.5rem; }
                .section-label { font-size: 0.8rem; font-weight: 800; color: var(--ocean-blue); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; }
                .resp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
                .resp-toggle { border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; transition: 0.2s; background: #f8fafc; }
                .resp-toggle:hover { border-color: var(--ocean-blue); background: #eff6ff; }
                .resp-toggle.selected { border-color: var(--ocean-blue); background: #eff6ff; }
                .resp-icon { font-size: 1.25rem; }
                .resp-label { flex: 1; font-weight: 600; font-size: 0.88rem; color: #475569; }
                .resp-check { width: 20px; height: 20px; border-radius: 50%; background: var(--ocean-blue); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; opacity: 0; transition: 0.2s; }
                .resp-toggle.selected .resp-check { opacity: 1; }

                .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #f1f5f9; }
                .btn-cancel { padding: 0.85rem 1.5rem; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; cursor: pointer; }
                .btn-save { padding: 0.85rem 1.75rem; border-radius: 12px; border: none; background: var(--navy-deep); color: white; font-weight: 700; cursor: pointer; transition: 0.3s; }
                .btn-save:hover { background: var(--ocean-blue); }

                /* Credentials Box */
                .creds-box { text-align: center; }
                .creds-icon { font-size: 3rem; margin-bottom: 1rem; }
                .creds-box h2 { font-size: 1.4rem; color: var(--navy-deep); margin: 0 0 0.5rem; }
                .creds-box p { color: #64748b; font-size: 0.9rem; margin: 0 0 2rem; }
                .cred-field { text-align: left; margin-bottom: 1.25rem; }
                .cred-field label { font-size: 0.8rem; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 0.35rem; }
                .cred-value { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0.85rem 1rem; font-size: 1rem; font-weight: 700; letter-spacing: 0.05em; color: var(--navy-deep); }
                .cred-value.senha { background: #fffbeb; border-color: #fde68a; color: #92400e; letter-spacing: 0.12em; font-size: 1.1rem; }
                .cred-info { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 0.85rem 1rem; font-size: 0.88rem; color: #1e40af; margin-bottom: 1.5rem; text-align: left; }

                .sharing-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
                .share-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem; border-radius: 12px; border: none; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
                .share-btn.copy { background: #f1f5f9; color: #475569; }
                .share-btn.whatsapp { background: #dcfce7; color: #166534; }
                .share-btn.email { background: #e0f2fe; color: #0369a1; }
                .share-btn:hover { transform: translateY(-2px); filter: brightness(0.95); }
                .sharing-actions.disabled { opacity: 0.5; pointer-events: none; }

                .cred-value.skeleton { color: #cbd5e0 !important; font-style: italic; background: #f1f5f9; position: relative; overflow: hidden; }
                .cred-value.skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent); animation: shimer 1.5s infinite; }
                @keyframes shimer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
            `}</style>
        </div>
    );
}
