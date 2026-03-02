'use client';

import { useState, useEffect } from 'react';

interface Material {
  name: string;
  url: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  students: number;
  status: string;
  materials: Material[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    status: 'Inscrições Abertas',
    materialName: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description || '',
        duration: course.duration,
        status: course.status,
        materialName: ''
      });
    } else {
      setEditingCourse(null);
      setFormData({ title: '', description: '', duration: '', status: 'Inscrições Abertas', materialName: '' });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
    const method = editingCourse ? 'PATCH' : 'POST';
    let finalMaterials = [...(editingCourse?.materials || [])];

    if (formData.materialName && selectedFile) {
      setUploading(true);
      try {
        const upData = new FormData();
        upData.set('file', selectedFile);
        const resUp = await fetch('/api/upload', { method: 'POST', body: upData });
        if (resUp.ok) {
          const { url: fileUrl } = await resUp.json();
          finalMaterials.push({ name: formData.materialName, url: fileUrl });
        }
      } catch (err) {
        console.error('Upload error:', err);
      } finally {
        setUploading(false);
      }
    }

    const courseData = { ...formData, students: editingCourse?.students || 0, materials: finalMaterials };

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(courseData) });
      if (res.ok) { setIsModalOpen(false); fetchData(); }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este curso?')) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const removeMaterial = async (index: number) => {
    if (!editingCourse) return;
    const updatedMaterials = editingCourse.materials.filter((_, i) => i !== index);
    try {
      const res = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materials: updatedMaterials })
      });
      if (res.ok) { setEditingCourse({ ...editingCourse, materials: updatedMaterials }); fetchData(); }
    } catch (error) {
      console.error('Error removing material:', error);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-top">
        <div>
          <div className="maritime-accent"></div>
          <h1>Gestão de Cursos</h1>
          <p>Administre o catálogo de formações e materiais didáticos.</p>
        </div>
        <button className="new-btn" onClick={() => handleOpenModal()}>+ Novo Curso</button>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="loader">A carregar cursos...</div>
      ) : (
        <div className="courses-grid">
          {courses.length === 0 && <div className="empty">Nenhum curso cadastrado. Comece criando um novo!</div>}
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="card-top">
                <span className={`badge ${course.status === 'Inscrições Abertas' ? 'badge-open' : course.status === 'Em andamento' ? 'badge-progress' : 'badge-done'}`}>
                  {course.status}
                </span>
              </div>
              <h3 className="card-title">{course.title}</h3>
              <p className="card-desc">{course.description || 'Sem descrição cadastrada.'}</p>
              <div className="card-meta">
                <div className="meta-item"><span className="meta-icon">⏱</span><span><strong>Duração:</strong> {course.duration}</span></div>
                <div className="meta-item"><span className="meta-icon">📚</span><span><strong>Materiais:</strong> {course.materials?.length || 0} ficheiros</span></div>
                <div className="meta-item"><span className="meta-icon">⚓</span><span><strong>Tipo:</strong> Formação Técnica</span></div>
              </div>
              <div className="card-actions">
                <button
                  className="action-print"
                  onClick={() => window.open(`/print/attendance?course=${encodeURIComponent(course.title)}`, '_blank')}
                  title="Imprimir Lista de Presença"
                >🖨️ Presença</button>
                <button className="action-edit" onClick={() => handleOpenModal(course)}>✎ Editar</button>
                <button className="action-delete" onClick={() => handleDelete(course.id)}>🗑 Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="overlay">
          <div className="modal-box">
            <div className="modal-top">
              <div>
                <h2>{editingCourse ? '✎ Editar Curso' : '+ Novo Curso'}</h2>
                <p>{editingCourse ? 'Atualize as informações do curso' : 'Preencha os dados para criar um novo curso'}</p>
              </div>
              <button className="close-x" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              {/* Section 1 */}
              <div className="form-col">
                <div className="section-label">1. Informações Gerais</div>

                <div className="field">
                  <label>Título do Curso *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Segurança Marítima Básica"
                    required
                  />
                </div>

                <div className="field">
                  <label>Descrição / Ementa</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Objetivos, conteúdo programático, requisitos..."
                    rows={5}
                  ></textarea>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label>Duração *</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="Ex: 3 meses"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="Inscrições Abertas">Inscrições Abertas</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="form-col">
                <div className="section-label">2. Materiais de Estudo</div>

                <div className="materials-box">
                  <p className="materials-hint">Adicione documentos PDF ou Word para os alunos consultarem.</p>

                  <div className="field">
                    <label>Nome do Material</label>
                    <input
                      type="text"
                      value={formData.materialName}
                      onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                      placeholder="Ex: Manual de Segurança Cap. 1"
                    />
                  </div>
                  <div className="field">
                    <label>Ficheiro (PDF/Word)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="file-input"
                    />
                    {uploading && <small className="upload-status">⏳ A enviar ficheiro...</small>}
                  </div>

                  {editingCourse?.materials && editingCourse.materials.length > 0 && (
                    <div className="materials-list">
                      <p className="materials-list-label">Materiais Existentes:</p>
                      {editingCourse.materials.map((m, i) => (
                        <div key={i} className="material-row">
                          <span>📄 {m.name}</span>
                          <button type="button" className="remove-mat" onClick={() => removeMaterial(i)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save">
                  {editingCourse ? '✓ Guardar Alterações' : '⚓ Criar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        /* ===== Page Layout ===== */
        .page-wrapper { padding: 0.5rem; }
        .page-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2.5rem;
        }
        .page-top h1 { font-size: 1.8rem; color: var(--navy-deep); margin: 0.25rem 0; font-weight: 800; }
        .page-top p { color: #64748b; margin: 0; font-size: 0.95rem; }

        .new-btn {
          background: var(--navy-deep);
          color: white;
          border: none;
          padding: 0.85rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: 0.3s;
          white-space: nowrap;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);
        }
        .new-btn:hover { background: var(--ocean-blue); transform: translateY(-2px); }

        .loader, .empty {
          text-align: center;
          padding: 4rem 2rem;
          color: #94a3b8;
          font-weight: 500;
          background: white;
          border-radius: 16px;
          border: 1px dashed #e2e8f0;
        }

        /* ===== Course Grid ===== */
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 2rem;
        }

        .course-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .course-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px -8px rgba(0,0,0,0.1); }

        .card-top { display: flex; }
        .badge {
          padding: 0.3rem 0.85rem;
          border-radius: 50px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge-open { background: #ecfdf5; color: #059669; }
        .badge-progress { background: #eff6ff; color: #1e40af; }
        .badge-done { background: #f1f5f9; color: #64748b; }

        .card-title { font-size: 1.1rem; font-weight: 800; color: var(--navy-deep); margin: 0; line-height: 1.3; }
        .card-desc {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .card-meta { display: flex; flex-direction: column; gap: 0.6rem; }
        .meta-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.875rem; color: #475569; }
        .meta-icon { font-size: 1rem; width: 1.5rem; text-align: center; }

        .card-actions { display: flex; gap: 0.5rem; border-top: 1px solid #f1f5f9; padding-top: 1.25rem; }
        .action-print, .action-edit, .action-delete {
          flex: 1;
          padding: 0.65rem 0.25rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.75rem;
          cursor: pointer;
          border: none;
          transition: 0.2s;
        }
        .action-print { background: #fef3c7; color: #92400e; }
        .action-print:hover { background: #fde68a; }
        .action-edit { background: #f1f5f9; color: var(--navy-deep); }
        .action-edit:hover { background: #e2e8f0; }
        .action-delete { background: #fef2f2; color: #dc2626; }
        .action-delete:hover { background: #fee2e2; }

        /* ===== Modal ===== */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 20, 50, 0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-box {
          background: white;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 25px 60px -10px rgba(0,0,0,0.3);
        }

        .modal-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
        }
        .modal-top h2 { margin: 0; font-size: 1.4rem; color: var(--navy-deep); font-weight: 800; }
        .modal-top p { margin: 0.25rem 0 0; font-size: 0.875rem; color: #64748b; }

        .close-x {
          background: #f1f5f9;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 1.4rem;
          line-height: 1;
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: 0.2s;
        }
        .close-x:hover { background: #e2e8f0; color: var(--navy-deep); }

        .modal-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .form-col { display: flex; flex-direction: column; gap: 0; }

        .section-label {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--ocean-blue);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .field { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.45rem; }
        .field label { font-weight: 700; font-size: 0.82rem; color: #475569; }
        .field input, .field select, .field textarea {
          padding: 0.8rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          background: #f8fafc;
          color: var(--navy-deep);
          font-family: inherit;
          transition: all 0.2s;
        }
        .field input:focus, .field select:focus, .field textarea:focus {
          outline: none;
          background: white;
          border-color: var(--ocean-blue);
          box-shadow: 0 0 0 3px rgba(0, 116, 217, 0.12);
        }
        .field textarea { resize: vertical; min-height: 120px; }
        .file-input { cursor: pointer; }
        .upload-status { color: var(--ocean-blue); font-size: 0.8rem; font-weight: 600; }

        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

        /* Materials Box */
        .materials-box {
          background: #f8fafc;
          border: 1.5px dashed #cbd5e0;
          border-radius: 12px;
          padding: 1.25rem;
          flex: 1;
        }
        .materials-hint { font-size: 0.82rem; color: #94a3b8; margin: 0 0 1.25rem; }

        .materials-list { margin-top: 1rem; }
        .materials-list-label { font-size: 0.8rem; font-weight: 700; color: #64748b; margin-bottom: 0.5rem; }
        .material-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.6rem 0.85rem;
          margin-bottom: 0.4rem;
          font-size: 0.85rem;
          color: #475569;
        }
        .remove-mat {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* Modal Footer */
        .modal-footer {
          grid-column: span 2;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 2px solid #f1f5f9;
          margin-top: 0.5rem;
        }
        .btn-cancel {
          padding: 0.85rem 1.75rem;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: white;
          color: #64748b;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-cancel:hover { background: #f8fafc; border-color: #cbd5e0; }
        .btn-save {
          padding: 0.85rem 2rem;
          border-radius: 12px;
          border: none;
          background: var(--navy-deep);
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: 0.3s;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);
        }
        .btn-save:hover { background: var(--ocean-blue); transform: translateY(-2px); }

        @media (max-width: 768px) {
          .modal-form { grid-template-columns: 1fr; }
          .modal-footer { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
