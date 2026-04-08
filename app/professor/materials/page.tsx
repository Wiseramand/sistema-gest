'use client';

import { useState, useEffect } from 'react';
import MaterialViewer from '../../components/MaterialViewer';

interface Material {
  id: string;
  name: string;
  type: string;
  url: string;
  category: string;
  courseName: string;
  createdAt?: string;
}

export default function ProfessorMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/trainer/materials');
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      }
    } catch (error) {
      console.error('Error fetching trainer materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const openViewer = (material: Material) => {
    setSelectedMaterial(material);
    setViewerOpen(true);
  };

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('pdf')) return 'PDF';
    if (t.includes('vídeo') || t.includes('video')) return '📽️';
    if (t.includes('word') || t.includes('doc')) return 'DOC';
    return '📄';
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Centro de Conhecimento</h1>
        <p>Aceda e verifique os materiais didáticos associados aos seus cursos no Marítimo Training Center.</p>
      </div>

      {loading ? (
        <div className="loader">A carregar conteúdos pedagógicos...</div>
      ) : materials.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📂</span>
          <h3>Sem materiais no momento</h3>
          <p>Os materiais que carregar ou que lhe forem atribuídos pelo administrador aparecerão aqui.</p>
        </div>
      ) : (
        <div className="materials-grid">
          {materials.map(item => (
            <div key={item.id} className="material-card card">
              <div className="card-top">
                <div className={`file-type ${getFileIcon(item.type).toLowerCase()}`}>
                  {getFileIcon(item.type)}
                </div>
                <span className="category-badge">{item.category}</span>
              </div>
              
              <div className="card-body">
                <h3>{item.name}</h3>
                <p className="course-name">{item.courseName}</p>
                <div className="meta">
                  <span>Adicionado em {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recente'}</span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-view" 
                  onClick={() => openViewer(item)}
                >
                  👁️ Visualizar Material
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MaterialViewer 
        isOpen={viewerOpen} 
        onClose={() => setViewerOpen(false)} 
        material={selectedMaterial} 
      />

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; max-width: 1200px; margin: 0 auto; padding: 0.5rem; }
        .page-header { background: #0a2a5e; padding: 2.5rem; border-radius: 20px; color: white; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.1); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 2.2rem; margin-bottom: 0.5rem; color: #F5C518; font-weight: 800; }
        .page-header p { color: #cbd5e1; font-size: 1.1rem; opacity: 0.9; }

        .loader, .empty-state { text-align: center; padding: 5rem 2rem; background: white; border-radius: 20px; border: 1px dashed #e2e8f0; color: #64748b; font-weight: 500; }
        .empty-icon { font-size: 3.5rem; display: block; margin-bottom: 1.5rem; filter: grayscale(1); opacity: 0.5; }
        .empty-state h3 { color: #0a2a5e; margin-bottom: 0.5rem; font-size: 1.3rem; }

        .materials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; display: flex; flex-direction: column; position: relative; }
        .card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(10, 42, 94, 0.08); border-color: #F5C518; }

        .card-top { padding: 1.5rem 1.5rem 0.5rem; display: flex; justify-content: space-between; align-items: flex-start; }
        .file-type { width: 48px; height: 60px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; font-size: 0.65rem; font-weight: 900; }
        .file-type.pdf { color: #dc2626; border-color: #fecaca; background: #fff1f2; }
        .file-type.doc { color: #2563eb; border-color: #bfdbfe; background: #eff6ff; }
        .file-type.📽️ { border: none; background: transparent; font-size: 1.8rem; }

        .category-badge { font-size: 0.6rem; font-weight: 900; color: #475569; background: #e2e8f0; padding: 0.35rem 0.85rem; border-radius: 50px; text-transform: uppercase; letter-spacing: 0.05em; }

        .card-body { padding: 1rem 1.5rem; flex: 1; }
        .card-body h3 { font-family: 'Outfit', sans-serif; font-size: 1.1rem; color: #0a2a5e; margin: 0; font-weight: 800; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .course-name { font-size: 0.8rem; color: #64748b; font-weight: 700; margin: 0.75rem 0; background: #f1f5f9; display: inline-block; padding: 0.1rem 0.5rem; border-radius: 4px; }
        .meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem; font-weight: 500; }

        .card-actions { padding: 1.5rem; background: #fdfdfe; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; }
        .btn-view { background: #0a2a5e; color: white; border: none; padding: 1rem; border-radius: 12px; font-size: 0.9rem; font-weight: 800; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-view:hover { background: #173b7d; box-shadow: 0 10px 20px -5px rgba(10, 42, 94, 0.3); }
      `}</style>
    </div>
  );
}
