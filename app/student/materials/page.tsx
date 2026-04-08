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

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/student/materials');
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recente';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT');
  };

  // Group materials by courseName
  const grouped = materials.reduce((acc: Record<string, Material[]>, mat) => {
    const course = mat.courseName || 'Outros Materiais';
    if (!acc[course]) acc[course] = [];
    acc[course].push(mat);
    return acc;
  }, {});

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Material de Apoio</h1>
        <p>Aceda aos manuais, vídeos e documentos oficiais dos seus cursos no Marítimo Training Center.</p>
      </div>

      {loading ? (
        <div className="loader">A carregar os seus materiais...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📂</span>
          <h3>Ainda sem materiais disponíveis</h3>
          <p>Assim que o administrador disponibilizar conteúdos para os seus cursos, eles aparecerão aqui.</p>
        </div>
      ) : (
        <div className="courses-list">
          {Object.entries(grouped).map(([courseName, courseMaterials]) => (
            <div key={courseName} className="course-section">
              <h2 className="course-title-header">{courseName}</h2>
              <div className="materials-grid">
                {courseMaterials.map(item => (
                  <div key={item.id} className="material-card card">
                    <div className="card-top">
                      <div className={`file-type ${getFileIcon(item.type).toLowerCase()}`}>
                        {getFileIcon(item.type)}
                      </div>
                      <span className="category-badge">{item.category}</span>
                    </div>
                    
                    <div className="card-body">
                      <h3>{item.name}</h3>
                      <div className="meta">
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button 
                        className="btn-view" 
                        onClick={() => openViewer(item)}
                      >
                        👁️ Abrir Conteúdo
                      </button>
                    </div>
                  </div>
                ))}
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
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; max-width: 1200px; margin: 0 auto; }
        .page-header { background: #0a2a5e; padding: 2.5rem; border-radius: 16px; color: white; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.1); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 2rem; margin-bottom: 0.5rem; color: #F5C518; }
        .page-header p { color: #e2e8f0; font-size: 1.1rem; opacity: 0.9; }

        .loader, .empty-state { text-align: center; padding: 5rem 2rem; background: white; border-radius: 16px; border: 1px dashed #e2e8f0; color: #64748b; }
        .empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
        .empty-state h3 { color: #0a2a5e; margin-bottom: 0.5rem; }

        .courses-list { display: flex; flex-direction: column; gap: 3rem; }
        .course-section { display: flex; flex-direction: column; gap: 1.5rem; }
        .course-title-header { font-family: 'Outfit', sans-serif; font-size: 1.5rem; color: #0a2a5e; border-left: 5px solid #F5C518; padding-left: 1rem; margin: 0; }

        .materials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; transition: all 0.3s ease; overflow: hidden; display: flex; flex-direction: column; }
        .card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.05); }

        .card-top { padding: 1.25rem 1.5rem 0.5rem; display: flex; justify-content: space-between; align-items: flex-start; }
        .file-type { width: 44px; height: 52px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; font-size: 0.7rem; font-weight: 800; }
        .file-type.pdf { color: #dc2626; border-color: #fecaca; }
        .file-type.word { color: #2563eb; border-color: #bfdbfe; }

        .category-badge { font-size: 0.65rem; font-weight: 800; color: #94a3b8; background: #f1f5f9; padding: 0.2rem 0.6rem; border-radius: 50px; text-transform: uppercase; }

        .card-body { padding: 1rem 1.5rem; flex: 1; }
        .card-body h3 { font-family: 'Outfit', sans-serif; font-size: 1rem; color: #0a2a5e; margin: 0; font-weight: 700; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; color: #94a3b8; margin-top: 0.5rem; }

        .card-actions { padding: 1.25rem 1.5rem; background: #fafbfc; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 0.5rem; }
        .btn-view { background: #0a2a5e; color: white; border: none; padding: 0.85rem; border-radius: 10px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
      `}</style>
    </div>
  );
}
