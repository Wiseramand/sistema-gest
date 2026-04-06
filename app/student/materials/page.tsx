'use client';

import { useState } from 'react';

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState([
    { id: '1', name: 'Manual STCW Básico 2026.pdf', type: 'PDF', size: '4.5 MB', category: 'Documentação', course: 'STCW Básico', date: '06-04-2026' },
    { id: '2', name: 'Procedimentos de Emergência.mp4', type: 'Vídeo', size: '120 MB', category: 'Aulas Vídeo', course: 'Segurança Marítima', date: '05-04-2026' },
    { id: '3', name: 'Guia de Navegação Eletrónica.pdf', type: 'PDF', size: '2.1 MB', category: 'Documentação', course: 'GMDSS', date: '01-04-2026' },
    { id: '4', name: 'Modelo de Exame Mock.docx', type: 'WORD', size: '120 KB', category: 'Modelos', course: 'Todos', date: '06-04-2026' },
  ]);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Materiais de Apoio</h1>
        <p>Aceda aos manuais, vídeos e documentos oficiais do seu curso no Marítimo Training Center.</p>
      </div>

      <div className="materials-grid">
        {materials.map(item => (
          <div key={item.id} className="material-card card">
            <div className="card-top">
              <div className={`file-type ${item.type.toLowerCase()}`}>
                {item.type === 'PDF' && 'PDF'}
                {item.type === 'Vídeo' && '📽️'}
                {item.type === 'WORD' && 'W'}
              </div>
              <span className="category-badge">{item.category}</span>
            </div>
            
            <div className="card-body">
              <h3>{item.name}</h3>
              <p className="course-name">{item.course}</p>
              <div className="meta">
                <span>{item.size}</span>
                <span className="dot"></span>
                <span>{item.date}</span>
              </div>
            </div>

            <div className="card-actions">
              <button className="btn-download">⬇️ Descarregar Ficheiro</button>
              {item.type === 'Vídeo' && <button className="btn-view">👁️ Ver Aula</button>}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; max-width: 1200px; margin: 0 auto; }
        .page-header { background: linear-gradient(135deg, #0a2a5e 0%, #173b7d 100%); padding: 2.5rem; border-radius: 16px; color: white; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.1); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 2rem; margin-bottom: 0.5rem; color: #F5C518; }
        .page-header p { color: #e2e8f0; font-size: 1.1rem; opacity: 0.9; }

        .materials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; transition: all 0.3s ease; overflow: hidden; display: flex; flex-direction: column; }
        .card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.05); }

        .card-top { padding: 1.25rem 1.5rem 0.5rem; display: flex; justify-content: space-between; align-items: flex-start; }
        .file-type { width: 44px; height: 52px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; font-size: 0.7rem; font-weight: 800; }
        .file-type.pdf { color: #dc2626; border-color: #fecaca; }
        .file-type.word { color: #2563eb; border-color: #bfdbfe; }
        .file-type.vídeo { font-size: 1.5rem; border: none; background: transparent; }

        .category-badge { font-size: 0.65rem; font-weight: 800; color: #94a3b8; background: #f1f5f9; padding: 0.2rem 0.6rem; border-radius: 50px; text-transform: uppercase; }

        .card-body { padding: 1rem 1.5rem; flex: 1; }
        .card-body h3 { font-family: 'Outfit', sans-serif; font-size: 1rem; color: #0a2a5e; margin: 0; font-weight: 700; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .course-name { font-size: 0.75rem; color: #64748b; font-weight: 600; margin: 0.5rem 0; }
        .meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; color: #94a3b8; }
        .dot { width: 3px; height: 3px; background: #cbd5e1; border-radius: 50%; }

        .card-actions { padding: 1.25rem 1.5rem; background: #fafbfc; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 0.5rem; }
        .btn-download { background: #0a2a5e; color: white; border: none; padding: 0.6rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-view { background: #F5C518; color: #0a2a5e; border: none; padding: 0.6rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-download:hover { background: #173b7d; }
        .btn-view:hover { background: #eab308; }
      `}</style>
    </div>
  );
}
