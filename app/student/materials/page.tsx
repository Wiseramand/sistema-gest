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

export default function StudentMaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

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
            <h1>Materiais de Estudo</h1>

            {loading ? (
                <div className="loading">A carregar conteúdos...</div>
            ) : (
                <div className="materials-grid">
                    {materials.map((m) => (
                        <div key={m.id} className="material-card">
                            <div className="card-icon">{m.type === 'FILE' ? '📒' : '🎬'}</div>
                            <div className="card-content">
                                <h3>{m.title}</h3>
                                <p className="desc">{m.description || 'Consulta o material para a tua formação.'}</p>
                                <div className="meta">
                                    <span>Partilhado em {new Date(m.createdAt).toLocaleDateString()}</span>
                                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="view-btn">Estudar</a>
                                </div>
                            </div>
                        </div>
                    ))}
                    {materials.length === 0 && <p className="empty">A administração ainda não partilhou materiais contigo.</p>}
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
                .view-btn { background: #059669; color: white; padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 700; transition: 0.2s; }
                .view-btn:hover { background: #047857; transform: scale(1.05); }
                .empty { color: #64748b; font-style: italic; }
            `}</style>
        </div>
    );
}
