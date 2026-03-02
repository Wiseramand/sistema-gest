'use client';

import { useState, useEffect } from 'react';

interface Material {
    id: string;
    title: string;
    type: 'FILE' | 'LINK';
    url: string;
    description: string;
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

export default function ProfessorMaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [readingMaterial, setReadingMaterial] = useState<Material | null>(null);

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

    return (
        <div className="materials-container">
            <h1>Materiais de Apoio</h1>

            {loading ? (
                <div className="loading">Carregando conteúdos...</div>
            ) : (
                <div className="materials-grid">
                    {materials.map((m) => (
                        <div key={m.id} className="material-card">
                            <div className="card-icon">{m.type === 'FILE' ? '📁' : '🔗'}</div>
                            <div className="card-content">
                                <h3>{m.title}</h3>
                                <p className="desc">{m.description || 'Sem descrição adicional'}</p>
                                <div className="meta">
                                    <span>Publicado em {new Date(m.createdAt).toLocaleDateString()}</span>
                                    <button onClick={() => setReadingMaterial(m)} className="view-btn">Ler no Sistema</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {materials.length === 0 && <p className="empty">Nenhum material disponível de momento.</p>}
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
                h1 { color: #1e293b; margin-bottom: 2rem; font-weight: 800; }
                
                .materials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
                .material-card { background: white; border-radius: 12px; padding: 1.5rem; display: flex; gap: 1rem; border: 1px solid #e2e8f0; transition: 0.3s; }
                .material-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
                .card-icon { font-size: 2.5rem; }
                .card-content { flex: 1; }
                .card-content h3 { margin: 0 0 0.5rem; color: #1e293b; font-size: 1.1rem; }
                .desc { font-size: 0.85rem; color: #64748b; margin-bottom: 1rem; }
                
                .meta { display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: #94a3b8; }
                .view-btn { background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 700; transition: 0.2s; }
                .view-btn:hover { background: #2563eb; transform: scale(1.05); }
                .empty { color: #64748b; font-style: italic; }

                .material-reader-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 2rem; }
                .reader-modal { background: #1e293b; width: 95%; max-width: 1200px; height: 90vh; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
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
