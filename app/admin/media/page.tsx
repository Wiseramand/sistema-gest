'use client';

import { useState } from 'react';

export default function MediaHubPage() {
  const [files, setFiles] = useState([
    { id: '1', name: 'Manual STCW Básico 2026.pdf', type: 'PDF', size: '4.5 MB', category: 'Documentação', course: 'STCW Básico', addedBy: 'Ricardo' },
    { id: '2', name: 'Procedimentos de Emergência.mp4', type: 'Vídeo', size: '120 MB', category: 'Aulas Vídeo', course: 'Segurança Marítima', addedBy: 'Ricardo' },
    { id: '3', name: 'Modelo de Exame Final.docx', type: 'WORD', size: '850 KB', category: 'Modelos', course: 'Todos', addedBy: 'Super Admin' },
    { id: '4', name: 'Guia de Navegação Eletrónica.pdf', type: 'PDF', size: '2.1 MB', category: 'Documentação', course: 'GMDSS', addedBy: 'Ricardo' },
  ]);

  const [categoryFilter, setCategoryFilter] = useState('Todos');

  const filteredFiles = categoryFilter === 'Todos' 
    ? files 
    : files.filter(f => f.category === categoryFilter);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Hub de Média & Materiais</h1>
          <p>Gestão centralizada de conteúdos educativos para formadores e alunos.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">📁 Nova Pasta</button>
          <button className="btn-primary">📤 Carregar Ficheiro</button>
        </div>
      </div>

      <div className="media-controls card">
        <div className="filters">
          {['Todos', 'Documentação', 'Aulas Vídeo', 'Modelos'].map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="search-box">
          <input type="text" placeholder="Pesquisar por nome ou curso..." />
        </div>
      </div>

      <div className="files-grid">
        {filteredFiles.map(file => (
          <div key={file.id} className="file-card card">
            <div className="file-icon">
              {file.type === 'PDF' && <span className="pdf">PDF</span>}
              {file.type === 'Vídeo' && <span className="video">🎥</span>}
              {file.type === 'WORD' && <span className="word">W</span>}
            </div>
            <div className="file-info">
              <h3 title={file.name}>{file.name}</h3>
              <p className="file-course">{file.course}</p>
              <div className="file-meta">
                <span>{file.size}</span>
                <span className="dot"></span>
                <span>{file.addedBy}</span>
              </div>
            </div>
            <div className="file-actions">
              <button className="icon-btn" title="Descarregar">⬇️</button>
              <button className="icon-btn edit" title="Editar">✏️</button>
              <button className="icon-btn delete" title="Apagar">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { background: linear-gradient(135deg, #0a2a5e 0%, #173b7d 100%); padding: 2rem; border-radius: 14px; color: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.15); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #F5C518; }
        .page-header p { color: #e2e8f0; opacity: 0.8; font-size: 0.95rem; }

        .header-actions { display: flex; gap: 0.75rem; }
        .btn-primary { background: #F5C518; color: #0a2a5e; border: none; padding: 0.7rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
        .btn-secondary { background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.2); padding: 0.7rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
        
        .media-controls { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; }
        .filters { display: flex; gap: 0.5rem; }
        .filter-btn { background: #f1f5f9; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; color: #475569; cursor: pointer; transition: 0.2s; }
        .filter-btn.active { background: #0a2a5e; color: white; }
        
        .search-box input { border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; width: 300px; font-family: inherit; font-size: 0.85rem; }

        .files-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .card { background: white; border-radius: 14px; border: 1px solid #e2e8f0; transition: 0.2s; }
        .file-card { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; position: relative; }
        .file-card:hover { transform: translateY(-3px); box-shadow: 0 12px 20px rgba(0,0,0,0.05); }

        .file-icon { width: 44px; height: 54px; background: #f8fafc; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 0.7rem; border: 1px solid #edf2f7; position: relative; }
        .pdf { color: #dc2626; border: 1.5px solid #dc2626; padding: 2px 4px; border-radius: 4px; }
        .word { color: #2563eb; border: 1.5px solid #2563eb; padding: 2px 4px; border-radius: 4px; }
        .video { font-size: 1.5rem; }

        .file-info h3 { font-size: 0.95rem; color: #0a2a5e; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-course { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin: 0.25rem 0 0.5rem; }
        .file-meta { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; color: #94a3b8; }
        .dot { width: 3px; height: 3px; background: #cbd5e1; border-radius: 50%; }

        .file-actions { display: flex; border-top: 1px solid #f1f5f9; padding-top: 1rem; gap: 0.5rem; }
        .icon-btn { flex: 1; height: 32px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer; transition: 0.2s; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; }
        .icon-btn:hover { background: #f8fafc; }
        .icon-btn.edit:hover { background: #f0f9ff; color: #0369a1; border-color: #bae6fd; }
        .icon-btn.delete:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
      `}</style>
    </div>
  );
}
