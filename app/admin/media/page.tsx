'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface MediaItem {
    id: string;
    name: string;
    description?: string;
    type?: string;
    url?: string;
    isFolder: boolean;
    parentId: string | null;
    targetRole?: string;
    size?: string;
    addedBy?: string;
    createdAt: string;
}

export default function MediaHubPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentFolder, setCurrentFolder] = useState<MediaItem | null>(null);
    const [navigationStack, setNavigationStack] = useState<MediaItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'FILE' | 'FOLDER'>('FILE');
    const [uploadMode, setUploadMode] = useState<'LINK' | 'FILE'>('FILE');
    const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '', description: '', url: '', targetRole: 'BOTH', type: 'PDF'
    });

    const fetchItems = useCallback(async (parentId: string | null = null) => {
        setLoading(true);
        try {
            const url = `/api/media?parentId=${parentId || ''}`;
            const res = await fetch(url);
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchItems(currentFolder?.id || null);
    }, [currentFolder, fetchItems]);

    const handleOpenFolder = (folder: MediaItem) => {
        setNavigationStack(prev => [...prev, folder]);
        setCurrentFolder(folder);
    };

    const handleGoBack = () => {
        const newStack = [...navigationStack];
        newStack.pop();
        setNavigationStack(newStack);
        setCurrentFolder(newStack.length > 0 ? newStack[newStack.length - 1] : null);
    };

    const handleResetNav = () => {
        setNavigationStack([]);
        setCurrentFolder(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const fData = new FormData();
            fData.append('name', formData.name);
            fData.append('description', formData.description);
            fData.append('targetRole', formData.targetRole);
            fData.append('isFolder', (modalType === 'FOLDER').toString());
            fData.append('parentId', currentFolder?.id || '');

            if (modalType === 'FOLDER') {
                fData.append('type', 'FOLDER');
            } else {
                fData.append('type', formData.type);
                if (uploadMode === 'FILE' && uploadFile) {
                    fData.append('file', uploadFile);
                } else {
                    fData.append('url', formData.url);
                }
            }

            const res = await fetch('/api/media', {
                method: editingItem ? 'PATCH' : 'POST',
                // Note: With FormData, do NOT set Content-Type header manually
                body: editingItem ? JSON.stringify({ ...formData, id: editingItem.id, isFolder: modalType === 'FOLDER', parentId: currentFolder?.id || null }) : fData
            });

            // Patch still uses JSON for simplicity as it's usually just metadata
            if (editingItem) {
                const patchRes = await fetch('/api/media', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, id: editingItem.id, isFolder: modalType === 'FOLDER', parentId: currentFolder?.id || null })
                });
                if (patchRes.ok) finalizeSave();
            } else {
                if (res.ok) finalizeSave();
                else alert('Erro ao salvar. Verifique se preencheu todos os campos.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão.');
        } finally {
            setIsSaving(false);
        }
    };

    const finalizeSave = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setUploadFile(null);
        fetchItems(currentFolder?.id || null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem a certeza que deseja eliminar este item e todo o seu conteúdo?')) return;
        const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
        if (res.ok) fetchItems(currentFolder?.id || null);
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div className="breadcrumb-nav">
                        <span className="bc-root" onClick={handleResetNav}>Hub de Média</span>
                        {navigationStack.map((folder, idx) => (
                            <span key={folder.id} className="bc-item">
                                <span className="bc-sep">/</span>
                                <span onClick={() => {
                                    const index = navigationStack.indexOf(folder);
                                    const newStack = navigationStack.slice(0, index + 1);
                                    setNavigationStack(newStack);
                                    setCurrentFolder(folder);
                                }}>{folder.name}</span>
                            </span>
                        ))}
                    </div>
                    <h1>{currentFolder ? currentFolder.name : 'Materiais & Ficheiros'}</h1>
                    <p>{currentFolder?.description || 'Gestão centralizada de conteúdos educativos.'}</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => { setModalType('FOLDER'); setEditingItem(null); setIsModalOpen(true); }}>📁 Nova Pasta</button>
                    <button className="btn-primary" onClick={() => { setModalType('FILE'); setEditingItem(null); setIsModalOpen(true); setUploadMode('FILE'); }}>📤 Carregar Material</button>
                </div>
            </div>

            <div className="media-controls card">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Pesquisar materiais..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="stats">
                    {loading ? 'A carregar...' : `${filteredItems.length} itens encontrados`}
                </div>
            </div>

            {loading ? <div className="loader-box">A processar ficheiros...</div> : (
                <div className="media-grid">
                    {currentFolder && (
                        <div className="item-card folder back" onClick={handleGoBack}>
                            <div className="item-icon">⬅️</div>
                            <div className="item-info">
                                <h3>Voltar</h3>
                                <p>Para a pasta anterior</p>
                            </div>
                        </div>
                    )}
                    
                    {filteredItems.map(item => (
                        <div key={item.id} className={`item-card ${item.isFolder ? 'folder' : 'file'}`} onClick={() => item.isFolder && handleOpenFolder(item)}>
                            <div className="item-icon">
                                {item.isFolder ? '📂' : (
                                    item.type === 'PDF' ? '📄' : 
                                    item.type === 'Vídeo' ? '🎥' : 
                                    item.type === 'WORD' ? '📝' : '📎'
                                )}
                            </div>
                            <div className="item-info">
                                <h3 title={item.name}>{item.name}</h3>
                                <p>{item.isFolder ? 'Pasta de ficheiros' : (item.description || 'Sem descrição')}</p>
                                <div className="item-meta">
                                    <span className={`tag ${item.targetRole?.toLowerCase()}`}>{item.targetRole}</span>
                                    {!item.isFolder && <span className="type-label">{item.type}</span>}
                                </div>
                            </div>
                            <div className="item-actions" onClick={e => e.stopPropagation()}>
                                {!item.isFolder && item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="act-btn download">⬇️</a>}
                                <button className="act-btn edit" onClick={() => {
                                    setEditingItem(item);
                                    setModalType(item.isFolder ? 'FOLDER' : 'FILE');
                                    setFormData({
                                        name: item.name,
                                        description: item.description || '',
                                        url: item.url || '',
                                        targetRole: item.targetRole || 'BOTH',
                                        type: item.type || 'PDF'
                                    });
                                    setIsModalOpen(true);
                                }}>✏️</button>
                                <button className="act-btn delete" onClick={() => handleDelete(item.id)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                    
                    {!loading && filteredItems.length === 0 && !currentFolder && (
                        <div className="empty-state">
                            <div className="empty-icon">☁️</div>
                            <h3>O seu Hub está vazio</h3>
                            <p>Comece por criar uma pasta ou carregar os seus primeiros manuais e vídeos.</p>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingItem ? 'Editar' : (modalType === 'FOLDER' ? 'Nova Pasta' : 'Novo Material')}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Nome do {modalType === 'FOLDER' ? 'Pasta' : 'Ficheiro'}</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={modalType === 'FOLDER' ? 'Ex: Manuais 2026' : 'Ex: Guia de Segurança'}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Descrição (opcional)</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Breve resumo do conteúdo..."
                                />
                            </div>

                            {modalType === 'FILE' && (
                                <>
                                    <div className="mode-toggle">
                                        <button type="button" className={uploadMode === 'FILE' ? 'active' : ''} onClick={() => setUploadMode('FILE')}>Arquivo Local</button>
                                        <button type="button" className={uploadMode === 'LINK' ? 'active' : ''} onClick={() => setUploadMode('LINK')}>Link Externo</button>
                                    </div>

                                    {uploadMode === 'FILE' ? (
                                        <div className="form-group">
                                            <label>Selecionar Arquivo</label>
                                            <input 
                                                type="file" 
                                                onChange={e => setUploadFile(e.target.files?.[0] || null)}
                                                className="file-input"
                                            />
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label>URL / Caminho</label>
                                            <input 
                                                type="text" 
                                                value={formData.url}
                                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                                placeholder="https://exemplo.com/doc.pdf"
                                            />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Tipo de Média</label>
                                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            <option value="PDF">PDF (Manual)</option>
                                            <option value="Vídeo">Vídeo (Aula)</option>
                                            <option value="WORD">Word (Exercício)</option>
                                            <option value="LINK">Link Externos</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label>Visibilidade / Designação</label>
                                <div className="role-selector">
                                    {['BOTH', 'STUDENT', 'TRAINER'].map(role => (
                                        <button 
                                            key={role}
                                            type="button"
                                            className={`role-btn ${formData.targetRole === role ? 'active' : ''}`}
                                            onClick={() => setFormData({ ...formData, targetRole: role })}
                                        >
                                            {role === 'BOTH' ? 'Todos' : role === 'STUDENT' ? 'Só Alunos' : 'Só Formadores'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-save" disabled={isSaving}>
                                    {isSaving ? 'A processar...' : (editingItem ? 'Guardar' : 'Criar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page-wrap { display: flex; flex-direction: column; gap: 1.5rem; }
                
                .page-header { background: #0a2a5e; padding: 2rem; border-radius: 16px; color: white; position: relative; overflow: hidden; }
                .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 0.5rem 0; color: #F5C518; }
                .page-header p { color: #cbd5e1; font-size: 0.95rem; margin: 0; }
                
                .breadcrumb-nav { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                .bc-root, .bc-item span { cursor: pointer; transition: 0.2s; }
                .bc-root:hover, .bc-item span:hover { color: #F5C518; }
                .bc-sep { color: #475569; }

                .header-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
                .btn-primary { background: #F5C518; color: #0a2a5e; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
                .btn-secondary { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }

                .media-controls { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; }
                .search-box { display: flex; align-items: center; background: #f1f5f9; padding: 0.5rem 1rem; border-radius: 10px; flex: 1; max-width: 400px; }
                .search-box input { background: none; border: none; padding: 0.25rem 0.5rem; outline: none; flex: 1; font-size: 0.9rem; }
                .stats { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }

                .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
                .item-card { background: white; padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; gap: 1rem; cursor: pointer; transition: 0.2s; position: relative; min-height: 100px; }
                .item-card:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,0.05); }
                .item-card.folder { border-left: 4px solid #F5C518; }
                .item-card.back { background: #f8fafc; border-style: dashed; }
                
                .item-icon { width: 48px; height: 48px; min-width: 48px; background: #f1f5f9; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
                .item-info { flex: 1; min-width: 0; }
                .item-info h3 { margin: 0; font-size: 0.95rem; color: #0a2a5e; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .item-info p { margin: 0.2rem 0 0.5rem; font-size: 0.75rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                
                .item-meta { display: flex; gap: 0.4rem; align-items: center; }
                .tag { font-size: 0.65rem; font-weight: 800; padding: 0.1rem 0.4rem; border-radius: 4px; text-transform: uppercase; }
                .tag.both { background: #e0f2fe; color: #0369a1; }
                .tag.student { background: #ecfdf5; color: #059669; }
                .tag.trainer { background: #fef2f2; color: #dc2626; }
                .type-label { font-size: 0.65rem; background: #f1f5f9; color: #64748b; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 700; }

                .item-actions { position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.25rem; opacity: 0; transition: 0.2s; }
                .item-card:hover .item-actions { opacity: 1; }
                .act-btn { background: white; border: 1px solid #e2e8f0; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; text-decoration: none; font-size: 0.8rem; }
                .act-btn:hover { background: #f1f5f9; }
                .act-btn.delete:hover { border-color: #fee2e2; color: #dc2626; }

                .empty-state { grid-column: 1 / -1; text-align: center; padding: 5rem 2rem; }
                .empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.3; }
                .loader-box { text-align: center; padding: 5rem; color: #94a3b8; font-weight: 600; }

                /* Modal */
                .modal-overlay { position: fixed; inset: 0; background: rgba(10,42,94,0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
                .modal-content { background: white; width: 100%; max-width: 500px; border-radius: 20px; padding: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .modal-header h2 { font-family: 'Outfit', sans-serif; font-size: 1.3rem; margin: 0; color: #0a2a5e; }
                .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }
                
                .form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-size: 0.85rem; font-weight: 700; color: #475569; }
                .form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-family: inherit; font-size: 0.9rem; }
                .form-group textarea { height: 80px; resize: none; }
                
                .mode-toggle { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; background: #f1f5f9; padding: 0.25rem; border-radius: 10px; }
                .mode-toggle button { flex: 1; border: none; padding: 0.5rem; border-radius: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: 0.2s; color: #64748b; background: none; }
                .mode-toggle button.active { background: white; color: #0a2a5e; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

                .role-selector { display: flex; gap: 0.5rem; }
                .role-btn { flex: 1; border: 1.5px solid #e2e8f0; background: white; padding: 0.5rem; border-radius: 8px; font-size: 0.8rem; font-weight: 700; color: #64748b; cursor: pointer; }
                .role-btn.active { border-color: #0a2a5e; color: #0a2a5e; background: #e0f2fe; }

                .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
                .btn-cancel { padding: 0.6rem 1.2rem; background: none; border: none; font-weight: 600; cursor: pointer; color: #94a3b8; }
                .btn-save { padding: 0.6rem 1.5rem; background: #0a2a5e; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
}
