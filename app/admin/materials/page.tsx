'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Material {
    id: string;
    title: string;
    type: 'FILE' | 'LINK';
    url: string;
    description: string;
    access: 'PROFESSORS' | 'STUDENTS' | 'ALL';
    uploadedByName: string;
    createdAt: string;
}
function getEmbedUrl(url: string) {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            if (urlObj.hostname === 'youtu.be') {
                return `https://www.youtube.com/embed${urlObj.pathname}`;
            }
            if (urlObj.pathname === '/watch') {
                const videoId = urlObj.searchParams.get('v');
                if (videoId) return `https://www.youtube.com/embed/${videoId}`;
            }
            if (urlObj.pathname.startsWith('/shorts/')) {
                const videoId = urlObj.pathname.split('/')[2];
                if (videoId) return `https://www.youtube.com/embed/${videoId}`;
            }
        }
        return url;
    } catch (e) {
        return url;
    }
}

export default function AdminMaterialsPage() {
    const { data: session } = useSession();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [readingMaterial, setReadingMaterial] = useState<Material | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'FILE' | 'LINK'>('FILE');
    const [url, setUrl] = useState('');
    const [access, setAccess] = useState<'PROFESSORS' | 'STUDENTS' | 'ALL'>('ALL');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchMaterials();
    }, []);

    async function fetchMaterials() {
        try {
            const res = await fetch('/api/materials');
            const data = await res.json();
            setMaterials(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleOpenEdit(m: Material) {
        setEditingMaterial(m);
        setTitle(m.title);
        setDescription(m.description || '');
        setType(m.type);
        setUrl(m.url);
        setAccess(m.access);
        setFile(null);
        setShowModal(true);
    }

    function handleOpenCreate() {
        setEditingMaterial(null);
        setTitle('');
        setDescription('');
        setType('FILE');
        setUrl('');
        setAccess('ALL');
        setFile(null);
        setShowModal(true);
    }

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        setUploading(true);

        try {
            let finalUrl = url;

            if (type === 'FILE' && file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const uploadData = await uploadRes.json();
                if (uploadData.url) {
                    finalUrl = uploadData.url;
                } else {
                    throw new Error('Upload failed');
                }
            }

            const res = await fetch(editingMaterial ? `/api/materials/${editingMaterial.id}` : '/api/materials', {
                method: editingMaterial ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    type,
                    url: finalUrl,
                    access,
                }),
            });

            if (res.ok) {
                setShowModal(false);
                setTitle('');
                setDescription('');
                setUrl('');
                setFile(null);
                fetchMaterials();
            }
        } catch (error) {
            alert('Erro ao guardar material');
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza que deseja apagar este material?')) return;

        try {
            const res = await fetch(`/api/materials/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchMaterials();
            }
        } catch (error) {
            alert('Erro ao apagar material');
        }
    }

    return (
        <div className="materials-container">
            <div className="header-actions">
                <h1>Gestão de Materiais e Media</h1>
                <button className="add-btn" onClick={handleOpenCreate}>+ Novo Conteúdo</button>
            </div>

            {loading ? (
                <div className="loading">Carregando materiais...</div>
            ) : (
                <div className="materials-grid">
                    {materials.map((m) => (
                        <div key={m.id} className="material-card">
                            <div className="card-icon">
                                {m.type === 'FILE' ? '📁' : '🔗'}
                            </div>
                            <div className="card-content">
                                <h3>{m.title}</h3>
                                <p className="desc">{m.description || 'Sem descrição'}</p>
                                <div className="badges">
                                    <span className={`badge ${m.access.toLowerCase()}`}>
                                        {m.access === 'ALL' ? 'Todos' : m.access === 'STUDENTS' ? 'Alunos' : 'Formadores'}
                                    </span>
                                </div>
                                <div className="meta">
                                    <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => setReadingMaterial(m)} className="view-btn">Ver</button>
                                        <button onClick={() => handleOpenEdit(m)} className="edit-btn">✏️</button>
                                        <button onClick={() => handleDelete(m.id)} className="delete-btn">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {materials.length === 0 && <p className="empty">Nenhum material carregado ainda.</p>}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{editingMaterial ? 'Editar Conteúdo' : 'Adicionar Novo Conteúdo'}</h2>
                        <form onSubmit={handleUpload}>
                            <div className="form-group">
                                <label>Título</label>
                                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Manual de Segurança" />
                            </div>
                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição..." />
                            </div>
                            <div className="form-group">
                                <label>Tipo</label>
                                <select value={type} onChange={(e) => setType(e.target.value as any)}>
                                    <option value="FILE">Ficheiro (PDF, Word, PPT)</option>
                                    <option value="LINK">Link Externo (Vídeo, Link)</option>
                                </select>
                            </div>

                            {type === 'FILE' ? (
                                <div className="form-group">
                                    <label>Ficheiro {editingMaterial && '(Deixe vazio para manter o atual)'}</label>
                                    <input type="file" required={!editingMaterial} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>URL do Link/Vídeo</label>
                                    <input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/..." />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Acesso</label>
                                <select value={access} onChange={(e) => setAccess(e.target.value as any)}>
                                    <option value="ALL">Para Todos</option>
                                    <option value="PROFESSORS">Apenas Formadores</option>
                                    <option value="STUDENTS">Apenas Alunos</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="save-btn" disabled={uploading}>
                                    {uploading ? 'A guardar...' : 'Guardar Conteúdo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {readingMaterial && (
                <div className="material-reader-overlay">
                    <div className="reader-modal">
                        <div className="reader-header">
                            <div>
                                <h3>Lendo: {readingMaterial.title}</h3>
                                <small>O download está desabilitado para este material.</small>
                            </div>
                            <button className="close-btn" onClick={() => setReadingMaterial(null)}>&times;</button>
                        </div>
                        <div className="reader-content">
                            <iframe src={getEmbedUrl(readingMaterial.url)} className="material-iframe" />
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .materials-container { padding: 1rem; }
                .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .add-btn { background: #0074d9; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .add-btn:hover { background: #0056b3; transform: translateY(-2px); }

                .materials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
                .material-card { background: white; border-radius: 12px; padding: 1.5rem; display: flex; gap: 1rem; border: 1px solid #e2e8f0; transition: 0.3s; }
                .material-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
                .card-icon { font-size: 2.5rem; }
                .card-content { flex: 1; }
                .card-content h3 { margin: 0 0 0.5rem; color: #1e293b; font-size: 1.1rem; }
                .desc { font-size: 0.85rem; color: #64748b; margin-bottom: 1rem; }
                
                .badges { margin-bottom: 1rem; }
                .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
                .badge.all { background: #e0f2fe; color: #0369a1; }
                .badge.professors { background: #fef3c7; color: #92400e; }
                .badge.students { background: #dcfce7; color: #166534; }

                .meta { display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: #94a3b8; }
                .view-btn { background: #f1f5f9; color: #334155; padding: 0.4rem 0.8rem; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.75rem; border: none; cursor: pointer; }
                .edit-btn { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0.2rem; filter: grayscale(1); transition: 0.2s; }
                .edit-btn:hover { filter: grayscale(0); transform: scale(1.1); }
                .delete-btn { background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0.2rem; filter: grayscale(1); transition: 0.2s; }
                .delete-btn:hover { filter: grayscale(0); transform: scale(1.1); }

                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal { background: white; padding: 2.5rem; border-radius: 20px; width: 100%; max-width: 500px; }
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; }
                .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-family: inherit; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
                .cancel-btn { background: #f3f4f6; color: #4b5563; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; }
                .save-btn { background: #0074d9; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
                .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

                .material-reader-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 2rem; }
                .reader-modal { background: #1e293b; width: 95%; max-width: 1200px; height: 90vh; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; text-align: left; }
                .reader-header { padding: 1rem 1.5rem; background: #0f172a; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; }
                .reader-header h3 { color: white; margin: 0 0 0.25rem; font-size: 1.1rem; }
                .reader-header small { color: #94a3b8; font-size: 0.8rem; }
                .reader-content { flex: 1; padding: 1rem; background: #1e293b; }
                .material-iframe { width: 100%; height: 100%; border: none; background: white; border-radius: 8px; }
                .close-btn { background: none; border: none; color: #94a3b8; font-size: 2rem; cursor: pointer; line-height: 1; }
                .close-btn:hover { color: white; }
            `}</style>
        </div>
    );
}
