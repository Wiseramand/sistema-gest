'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Trainer {
  id: string;
  name: string;
  specialty: string;
  students: number;
  status: string;
  idDocument: string;
  validity: string;
  photo: string;
  address: string;
  nationality: string;
  phone: string;
  email: string;
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [accessModal, setAccessModal] = useState<{ name: string; username: string; password: string; loading?: boolean } | null>(null);
  const [formData, setFormData] = useState({
    name: '', specialty: '', idDocument: '', validity: '', photo: '',
    address: '', nationality: '', phone: '', email: '', status: 'Ativo'
  });
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trainers');
      const data = await res.json();
      setTrainers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrainers(); }, []);

  const handleOpenModal = (trainer?: Trainer) => {
    if (trainer) {
      setEditingTrainer(trainer);
      setFormData({
        name: trainer.name, specialty: trainer.specialty, idDocument: trainer.idDocument || '',
        validity: trainer.validity || '', photo: trainer.photo || '', address: trainer.address || '',
        nationality: trainer.nationality || '', phone: trainer.phone || '', email: trainer.email || '',
        status: trainer.status || 'Ativo'
      });
    } else {
      setEditingTrainer(null);
      setFormData({ name: '', specialty: '', idDocument: '', validity: '', photo: '', address: '', nationality: '', phone: '', email: '', status: 'Ativo' });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingTrainer ? `/api/trainers/${editingTrainer.id}` : '/api/trainers';
    const method = editingTrainer ? 'PATCH' : 'POST';

    let photoUrl = formData.photo;
    if (selectedFile) {
      setUploading(true);
      try {
        const upData = new FormData();
        upData.set('file', selectedFile);
        const resUp = await fetch('/api/upload', { method: 'POST', body: upData });
        if (resUp.ok) { const d = await resUp.json(); photoUrl = d.url; }
      } catch (err) {
        console.error('Upload error:', err);
      } finally {
        setUploading(false);
      }
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, photo: photoUrl, students: editingTrainer?.students || 0 })
      });
      if (res.ok) { setIsModalOpen(false); fetchTrainers(); setSelectedFile(null); }
    } catch (error) {
      console.error('Error saving trainer:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este formador?')) return;
    await fetch(`/api/trainers/${id}`, { method: 'DELETE' });
    fetchTrainers();
  };

  const handleGenerateAccess = async (trainer: Trainer) => {
    console.log('Generating access for trainer:', trainer.name);
    setGeneratingId(trainer.id);
    setAccessModal({ name: trainer.name, username: '', password: '', loading: true });
    try {
      const res = await fetch('/api/generate-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'trainer', id: trainer.id })
      });
      if (res.ok) {
        const data = await res.json();
        setAccessModal({ name: trainer.name, username: data.username, password: data.password, loading: false });
      } else {
        const err = await res.json();
        alert(`Erro: ${err.error || 'Não foi possível gerar o acesso.'}`);
        setAccessModal(null);
      }
    } catch (error) {
      console.error(error);
      alert('Erro de rede ao gerar acesso.');
      setAccessModal(null);
    } finally {
      setGeneratingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  const shareWhatsApp = (name: string, user: string, pass: string) => {
    const link = `${window.location.origin}/login`;
    const message = `⚓ *Credenciais de Acesso - Marítimo Training Center*\n\nOlá *${name}*,\n\nAqui estão as suas credenciais de acesso ao portal do formador:\n\n👤 *Utilizador:* ${user}\n🔑 *Senha:* ${pass}\n🔗 *Link:* ${link}\n\nBom trabalho!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareEmail = (email: string, name: string, user: string, pass: string) => {
    const link = `${window.location.origin}/login`;
    const subject = encodeURIComponent('Suas Credenciais de Acesso - Marítimo Training Center');
    const body = encodeURIComponent(`Olá ${name},\n\nAqui estão as suas credenciais de acesso ao portal do formador:\n\nUtilizador: ${user}\nSenha: ${pass}\nLink: ${link}\n\nAtenciosamente,\nEquipa Marítimo.`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-top">
        <div>
          <div className="maritime-accent"></div>
          <h1>Gestão de Formadores</h1>
          <p>Corpo docente e instrutores da formação marítima.</p>
        </div>
        <div className="header-actions">
          <button className="print-btn" onClick={() => window.print()}>🖨️ Imprimir Lista</button>
          <button className="new-btn" onClick={() => handleOpenModal()}>+ Novo Formador</button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loader">A carregar formadores...</div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Formador</th>
                <th>Especialidade</th>
                <th>Nacionalidade</th>
                <th>Alunos</th>
                <th>Status</th>
                <th className="align-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="trainer-cell">
                      {t.photo
                        ? <img src={t.photo} className="avatar" alt={t.name} />
                        : <div className="avatar-placeholder">{t.name?.[0] || '?'}</div>
                      }
                      <div>
                        <Link href={`/admin/trainers/${t.id}`} className="trainer-name-link">
                          <span className="trainer-name">{t.name}</span>
                        </Link>
                        <span className="trainer-contact">{t.email || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td>{t.specialty}</td>
                  <td>
                    {t.nationality
                      ? <span className="country-tag">{t.nationality}</span>
                      : '—'
                    }
                  </td>
                  <td><span className="count-badge">{t.students || 0}</span></td>
                  <td>
                    <span className={`status-pill ${t.status === 'Ativo' ? 'active' : 'inactive'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="align-right">
                    <div className="row-actions">
                      <button
                        className={`row-btn access ${generatingId === t.id ? 'loading' : ''}`}
                        disabled={generatingId !== null}
                        title="Gerar Acesso"
                        onClick={() => handleGenerateAccess(t)}
                      >
                        {generatingId === t.id ? '⌛' : '🔑'}
                      </button>
                      <button className="row-btn edit" onClick={() => handleOpenModal(t)}>Editar</button>
                      <button className="row-btn delete" onClick={() => handleDelete(t.id)}>Remover</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {trainers.length === 0 && <div className="empty-state">Nenhum formador registado ainda.</div>}
        </div>
      )}

      {/* Access Credentials Modal */}
      {accessModal && (
        <div className="overlay">
          <div className="modal-box credentials-modal">
            <div className="modal-top">
              <div>
                <h2>{accessModal.loading ? '⏳ A processar...' : '🔐 Acesso Ativado'}</h2>
                <p>{accessModal.loading ? 'A preparar as credenciais do formador...' : `Acesso para o formador ${accessModal.name}`}</p>
              </div>
              <button className="close-x" onClick={() => setAccessModal(null)}>×</button>
            </div>

            <div className="credentials-box">
              <div className="cred-item">
                <span className="cred-label">Utilizador</span>
                <span className={`cred-val ${accessModal.loading ? 'skeleton-text' : ''}`}>
                  {accessModal.loading ? 'a carregar...' : accessModal.username}
                </span>
              </div>
              <div className="cred-item">
                <span className="cred-label">Palavra-passe Temporária</span>
                <div className={`cred-value password ${accessModal.loading ? 'skeleton-text' : ''}`}>
                  {accessModal.loading ? '••••••••' : accessModal.password}
                </div>
              </div>
            </div>

            <div className="cred-info">🔗 Link de acesso: <strong>{typeof window !== 'undefined' ? window.location.origin : ''}/login</strong></div>

            <div className={`sharing-actions ${accessModal.loading ? 'disabled' : ''}`}>
              <button className="share-btn copy" disabled={accessModal.loading} onClick={() => copyToClipboard(`Utilizador: ${accessModal.username}\nSenha: ${accessModal.password}\nLink: ${typeof window !== 'undefined' ? window.location.origin : ''}/login`)}>
                📋 Copiar Tudo
              </button>
              <button className="share-btn whatsapp" disabled={accessModal.loading} onClick={() => shareWhatsApp(accessModal.name, accessModal.username, accessModal.password)}>
                🟢 WhatsApp
              </button>
              <button className="share-btn email" disabled={accessModal.loading} onClick={() => {
                const tFound = trainers.find(t => t.name === accessModal.name);
                shareEmail(tFound?.email || '', accessModal.name, accessModal.username, accessModal.password);
              }}>
                📧 E-mail
              </button>
            </div>

            <div className="warning-note">
              <strong>⚠️ IMPORTANTE:</strong> Partilhe estas credenciais de forma segura. A palavra-passe só será mostrada esta vez e não poderá ser recuperada.
            </div>

            <div className="modal-footer">
              <button className="btn-save" onClick={() => setAccessModal(null)}>✓ Entendido, fechar</button>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="overlay">
          <div className="modal-box">
            <div className="modal-top">
              <div>
                <h2>{editingTrainer ? '✎ Editar Formador' : '+ Novo Formador'}</h2>
                <p>{editingTrainer ? 'Atualize os dados do instrutor' : 'Registe um novo elemento do corpo docente'}</p>
              </div>
              <button className="close-x" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              {/* Column 1 */}
              <div className="form-col">
                <div className="section-label">Identidade e Perfil</div>

                <div className="field">
                  <label>Nome Completo *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome completo do formador" required />
                </div>
                <div className="field">
                  <label>Fotografia Profissional</label>
                  <div className="upload-box">
                    <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    {uploading && <span className="upload-status">⏳ A enviar...</span>}
                    {formData.photo && !selectedFile && <span className="photo-ok">✓ Foto atual mantida</span>}
                  </div>
                </div>
                <div className="field">
                  <label>Especialidade *</label>
                  <input type="text" value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} placeholder="Ex: Navegação Marítima" required />
                </div>
                <div className="field">
                  <label>Nacionalidade</label>
                  <input type="text" value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} placeholder="Ex: Angolana" />
                </div>
                <div className="field">
                  <label>Status Operacional</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Ativo">Ativo</option>
                    <option value="Em férias">Em férias</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Column 2 */}
              <div className="form-col">
                <div className="section-label">Documentação e Contacto</div>

                <div className="field">
                  <label>Documento de ID</label>
                  <input type="text" value={formData.idDocument} onChange={(e) => setFormData({ ...formData, idDocument: e.target.value })} placeholder="BI / NIF / Passaporte" />
                </div>
                <div className="field">
                  <label>Validade do Documento</label>
                  <input type="date" value={formData.validity} onChange={(e) => setFormData({ ...formData, validity: e.target.value })} />
                </div>
                <div className="field">
                  <label>E-mail Profissional</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="formador@centro.com" />
                </div>
                <div className="field">
                  <label>Telefone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+244 9xx xxx xxx" />
                </div>
                <div className="field">
                  <label>Morada / Residência</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Endereço de residência" />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save">{editingTrainer ? '✓ Guardar Alterações' : '⚓ Registar Formador'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
                .page-wrapper { padding: 0.5rem; }
                .page-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }
                .page-top h1 { font-size: 1.8rem; color: var(--navy-deep); margin: 0.25rem 0; font-weight: 800; }
                .page-top p { color: #64748b; margin: 0; font-size: 0.95rem; }

                .new-btn { background: var(--navy-deep); color: white; border: none; padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.3s; white-space: nowrap; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15); }
                .new-btn:hover { background: var(--ocean-blue); transform: translateY(-2px); }

                .loader { text-align: center; padding: 4rem 2rem; color: #94a3b8; font-weight: 500; }
                .empty-state { text-align: center; padding: 3rem; color: #94a3b8; font-weight: 500; }

                .table-wrap { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th { background: #f8fafc; padding: 1rem 1.5rem; font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; border-bottom: 1px solid #e2e8f0; text-align: left; }
                .data-table td { padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 0.9rem; }
                .data-table tr:last-child td { border-bottom: none; }
                .data-table tr:hover td { background: #fafbfc; }

                .trainer-cell { display: flex; align-items: center; gap: 0.85rem; }
                .avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--sand-gold); flex-shrink: 0; }
                .avatar-placeholder { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, var(--ocean-blue), var(--navy-deep)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
                .trainer-name { display: block; font-weight: 700; color: var(--navy-deep); }
                .trainer-name-link { text-decoration: none; display: block; transition: 0.2s; }
                .trainer-name-link:hover .trainer-name { color: var(--ocean-blue); }
                .trainer-contact { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 0.1rem; }

                .country-tag { background: #f1f5f9; color: #475569; padding: 0.25rem 0.65rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
                .count-badge { background: var(--navy-deep); color: white; padding: 0.25rem 0.65rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }

                .status-pill { padding: 0.3rem 0.75rem; border-radius: 50px; font-size: 0.7rem; font-weight: 800; }
                .status-pill.active { background: #ecfdf5; color: #059669; }
                .status-pill.inactive { background: #f1f5f9; color: #64748b; }

                .align-right { text-align: right; }
                .row-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
                .row-btn { background: none; border: none; cursor: pointer; font-weight: 700; font-size: 0.82rem; padding: 0.35rem 0.65rem; border-radius: 6px; transition: 0.2s; }
                .row-btn.edit { color: var(--ocean-blue); }
                .row-btn.edit:hover { background: #eff6ff; }
                .row-btn.access { color: var(--ocean-blue); font-size: 1.1rem; }
                .row-btn.access:hover { background: #f0f9ff; }
                .row-btn.access.loading { opacity: 0.5; cursor: wait; filter: grayscale(1); }
                .row-btn.delete { color: #dc2626; }
                .row-btn.delete:hover { background: #fef2f2; }

                /* Credentials Modal */
                .credentials-modal { max-width: 500px !important; }
                .credentials-box { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
                .cred-item { display: flex; flex-direction: column; gap: 0.35rem; }
                .cred-label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
                .cred-val { font-size: 1.15rem; font-weight: 700; color: var(--navy-deep); font-family: monospace; }
                .cred-value.password { color: var(--ocean-blue); letter-spacing: 1.5px; }
                .cred-info { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 1rem; font-size: 0.9rem; color: #0369a1; text-align: left; margin-bottom: 2rem; }
                
                .sharing-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
                .share-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem; border-radius: 12px; border: none; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
                .share-btn.copy { background: #f1f5f9; color: #475569; }
                .share-btn.whatsapp { background: #dcfce7; color: #166534; }
                .share-btn.email { background: #e0f2fe; color: #0369a1; }
                .share-btn:hover { transform: translateY(-2px); filter: brightness(0.95); }
                .sharing-actions.disabled { opacity: 0.5; pointer-events: none; }

                .skeleton-text { color: #cbd5e0 !important; font-style: italic; background: #f1f5f9; position: relative; overflow: hidden; border-radius: 4px; padding: 0 4px; }
                .skeleton-text::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: shimer 1.5s infinite; }
                @keyframes shimer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

                .warning-note { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 1rem; border-radius: 12px; font-size: 0.82rem; line-height: 1.5; text-align: left; margin-bottom: 1rem; }

                .overlay { position: fixed; inset: 0; background: rgba(0,20,50,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
                .modal-box { background: white; width: 100%; max-width: 850px; max-height: 90vh; overflow-y: auto; border-radius: 20px; padding: 2.5rem; box-shadow: 0 25px 60px -10px rgba(0,0,0,0.3); }
                .modal-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.5rem; margin-bottom: 2rem; }
                .modal-top h2 { margin: 0; font-size: 1.4rem; color: var(--navy-deep); font-weight: 800; }
                .modal-top p { margin: 0.25rem 0 0; font-size: 0.875rem; color: #64748b; }
                .close-x { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1.4rem; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: 0.2s; }
                .close-x:hover { background: #e2e8f0; color: var(--navy-deep); }

                .modal-form { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .form-col { display: flex; flex-direction: column; }
                .section-label { font-size: 0.8rem; font-weight: 800; color: var(--ocean-blue); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; }
                .field { margin-bottom: 1.2rem; display: flex; flex-direction: column; gap: 0.4rem; }
                .field label { font-weight: 700; font-size: 0.82rem; color: #475569; }
                .field input, .field select { padding: 0.8rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; background: #f8fafc; color: var(--navy-deep); font-family: inherit; transition: all 0.2s; }
                .field input:focus, .field select:focus { outline: none; background: white; border-color: var(--ocean-blue); box-shadow: 0 0 0 3px rgba(0,116,217,0.12); }

                .upload-box { background: #f8fafc; border: 1.5px dashed #cbd5e0; border-radius: 10px; padding: 0.85rem 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
                .upload-box input { border: none; padding: 0; background: transparent; font-size: 0.85rem; }
                .upload-status { font-size: 0.8rem; color: var(--ocean-blue); font-weight: 600; }
                .photo-ok { font-size: 0.8rem; color: #059669; font-weight: 600; }

                .modal-footer { grid-column: span 2; display: flex; justify-content: flex-end; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #f1f5f9; }
                .btn-cancel { padding: 0.85rem 1.75rem; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
                .btn-cancel:hover { background: #f8fafc; }
                .btn-save { padding: 0.85rem 2rem; border-radius: 12px; border: none; background: var(--navy-deep); color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15); }
                .btn-save:hover { background: var(--ocean-blue); transform: translateY(-2px); }

                @media (max-width: 768px) { .modal-form { grid-template-columns: 1fr; } .modal-footer { grid-column: span 1; } }

                .header-actions { display: flex; gap: 1rem; }
                .print-btn { background: white; color: #1e293b; border: 1px solid #e2e8f0; padding: 0.85rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 0.5rem; }
                .print-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

                @media print {
                    :global(.sidebar), :global(.admin-header), .header-actions, .row-actions, .maritime-accent {
                        display: none !important;
                    }
                    :global(.admin-content) {
                        padding: 0 !important;
                        background: white !important;
                        margin: 0 !important;
                    }
                    .page-wrapper { padding: 0; }
                    .table-wrap { border: none; }
                    .data-table th { background: #eee !important; -webkit-print-color-adjust: exact; }
                }
            `}</style>
    </div>
  );
}
