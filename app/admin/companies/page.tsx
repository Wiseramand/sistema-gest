'use client';

import { useState, useEffect } from 'react';

interface Company {
    id: string;
    name: string;
    nif: string;
    address: string;
    contactPerson: string;
    phone: string;
    email: string;
    logo: string;
    createdAt: string;
}

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', nif: '', address: '', contactPerson: '', phone: '', email: '', logo: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/companies');
            const data = await res.json();
            setCompanies(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenModal = (company?: Company) => {
        if (company) {
            setEditingCompany(company);
            setFormData({
                name: company.name, nif: company.nif, address: company.address,
                contactPerson: company.contactPerson, phone: company.phone,
                email: company.email, logo: company.logo
            });
        } else {
            setEditingCompany(null);
            setFormData({ name: '', nif: '', address: '', contactPerson: '', phone: '', email: '', logo: '' });
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingCompany ? `/api/companies/${editingCompany.id}` : '/api/companies';
        const method = editingCompany ? 'PATCH' : 'POST';

        let logoUrl = formData.logo;
        if (selectedFile) {
            setUploading(true);
            try {
                const upData = new FormData();
                upData.set('file', selectedFile);
                const resUp = await fetch('/api/upload', { method: 'POST', body: upData });
                if (resUp.ok) { const d = await resUp.json(); logoUrl = d.url; }
            } catch (err) {
                console.error('Upload Error:', err);
            } finally {
                setUploading(false);
            }
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, logo: logoUrl })
            });
            if (res.ok) { setIsModalOpen(false); fetchData(); }
        } catch (error) {
            console.error('Error saving company:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remover esta empresa e todos os seus vínculos?')) return;
        await fetch(`/api/companies/${id}`, { method: 'DELETE' });
        fetchData();
    };

    return (
        <div className="page-wrapper">
            <div className="page-top">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Gestão de Clientes (Empresas)</h1>
                    <p>Registe e gerencie as empresas parceiras e clientes corporativos.</p>
                </div>
                <button className="new-btn" onClick={() => handleOpenModal()}>+ Nova Empresa</button>
            </div>

            {loading ? (
                <div className="loader">A carregar empresas...</div>
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th>NIF / Contacto</th>
                                <th>Responsável</th>
                                <th>Localização</th>
                                <th className="align-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map((c) => (
                                <tr key={c.id}>
                                    <td>
                                        <div className="company-cell">
                                            {c.logo
                                                ? <img src={c.logo} className="avatar" alt={c.name} />
                                                : <div className="avatar-placeholder">{c.name?.[0] || '?'}</div>
                                            }
                                            <div>
                                                <span className="company-name">{c.name}</span>
                                                <span className="company-date">Desde {new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="info-cell">
                                            <span className="info-bold">{c.nif}</span>
                                            <span className="sub">{c.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="info-cell">
                                            <span>{c.contactPerson}</span>
                                            <span className="sub">{c.phone}</span>
                                        </div>
                                    </td>
                                    <td>{c.address}</td>
                                    <td className="align-right">
                                        <div className="row-actions">
                                            <button className="row-btn edit" onClick={() => handleOpenModal(c)}>Editar</button>
                                            <button className="row-btn delete" onClick={() => handleDelete(c.id)}>Remover</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {companies.length === 0 && <div className="empty-state">Nenhuma empresa registada.</div>}
                </div>
            )}

            {isModalOpen && (
                <div className="overlay">
                    <div className="modal-box">
                        <div className="modal-top">
                            <div>
                                <h2>{editingCompany ? '✎ Editar Empresa' : '+ Nova Empresa'}</h2>
                                <p>Preencha os dados corporativos do cliente</p>
                            </div>
                            <button className="close-x" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-col">
                                <div className="section-label">Dados Corporativos</div>
                                <div className="field">
                                    <label>Nome da Empresa *</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome oficial" required />
                                </div>
                                <div className="field">
                                    <label>NIF *</label>
                                    <input type="text" value={formData.nif} onChange={(e) => setFormData({ ...formData, nif: e.target.value })} placeholder="Número de Identificação Fiscal" required />
                                </div>
                                <div className="field">
                                    <label>Endereço Completo</label>
                                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Rua, Cidade, Província" />
                                </div>
                                <div className="field">
                                    <label>Logótipo da Empresa</label>
                                    <div className="upload-box">
                                        <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                                        {uploading && <span className="upload-status">⏳ A enviar...</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="form-col">
                                <div className="section-label">Contacto Responsável (Formação)</div>
                                <div className="field">
                                    <label>Nome do Contacto *</label>
                                    <input type="text" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} placeholder="Pessoa responsável pela formação" required />
                                </div>
                                <div className="field">
                                    <label>E-mail Corporativo *</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@empresa.com" required />
                                </div>
                                <div className="field">
                                    <label>Telefone de Contacto</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+244 ..." />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-save">{editingCompany ? '✓ Guardar Alterações' : '+ Registar Empresa'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page-wrapper { padding: 0.5rem; }
                .page-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }
                .page-top h1 { font-size: 1.8rem; color: #001f3f; margin: 0.25rem 0; font-weight: 800; }
                .page-top p { color: #64748b; margin: 0; font-size: 0.95rem; }

                .maritime-accent { width: 40px; height: 4px; background: #ff4136; border-radius: 2px; margin-bottom: 0.5rem; }
                .new-btn { background: #001f3f; color: white; border: none; padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
                .new-btn:hover { background: #0074d9; transform: translateY(-2px); }

                .table-wrap { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th { background: #f8fafc; padding: 1rem 1.5rem; font-size: 0.72rem; color: #64748b; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #e2e8f0; text-align: left; }
                .data-table td { padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 0.9rem; }
                
                .company-cell { display: flex; align-items: center; gap: 0.85rem; }
                .avatar { width: 40px; height: 40px; border-radius: 10px; object-fit: contain; background: #f8fafc; border: 1px solid #e2e8f0; }
                .avatar-placeholder { width: 40px; height: 40px; border-radius: 10px; background: #001f3f; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; }
                .company-name { display: block; font-weight: 700; color: #001f3f; }
                .company-date { display: block; font-size: 0.75rem; color: #94a3b8; }

                .info-cell { display: flex; flex-direction: column; gap: 0.1rem; }
                .info-bold { font-weight: 600; color: #1e293b; }
                .sub { font-size: 0.78rem; color: #94a3b8; }

                .align-right { text-align: right; }
                .row-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
                .row-btn { background: none; border: none; cursor: pointer; font-weight: 700; font-size: 0.82rem; padding: 0.35rem 0.65rem; border-radius: 6px; transition: 0.2s; }
                .row-btn.edit { color: #0074d9; }
                .row-btn.edit:hover { background: #eff6ff; }
                .row-btn.delete { color: #dc2626; }
                .row-btn.delete:hover { background: #fef2f2; }

                .overlay { position: fixed; inset: 0; background: rgba(0,20,50,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
                .modal-box { background: white; width: 100%; max-width: 820px; border-radius: 20px; padding: 2.5rem; }
                .modal-top { display: flex; justify-content: space-between; margin-bottom: 2rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; }
                .modal-top h2 { margin: 0; font-size: 1.4rem; color: #001f3f; font-weight: 800; }
                .close-x { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; }

                .modal-form { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .section-label { font-size: 0.7rem; font-weight: 800; color: #0074d9; text-transform: uppercase; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
                .field { margin-bottom: 1.2rem; display: flex; flex-direction: column; gap: 0.4rem; }
                .field label { font-weight: 700; font-size: 0.82rem; color: #475569; }
                .field input { padding: 0.8rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; background: #f8fafc; }

                .upload-box { background: #f8fafc; border: 1.5px dashed #cbd5e0; border-radius: 10px; padding: 0.8rem; }
                .modal-footer { grid-column: span 2; display: flex; justify-content: flex-end; gap: 1rem; border-top: 2px solid #f1f5f9; padding-top: 1.5rem; }
                .btn-cancel { padding: 0.85rem 1.75rem; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; font-weight: 700; cursor: pointer; }
                .btn-save { padding: 0.85rem 2rem; border-radius: 12px; border: none; background: #001f3f; color: white; font-weight: 700; cursor: pointer; transition: 0.3s; }
                .btn-save:hover { background: #0074d9; transform: translateY(-2px); }

                .loader, .empty-state { text-align: center; padding: 4rem; color: #94a3b8; }

                @media (max-width: 768px) { .modal-form { grid-template-columns: 1fr; } .modal-footer { grid-column: span 1; } }
            `}</style>
        </div>
    );
}
