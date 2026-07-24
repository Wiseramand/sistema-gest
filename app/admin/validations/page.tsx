'use client';

import { useState } from 'react';

const CertificateModal = ({ doc, onClose }: { doc: any, onClose: () => void }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-card" onClick={e => e.stopPropagation()}>
      <div className="modal-close" onClick={onClose}>×</div>
      <div className="certificate-page">
        <div className="cert-border">
          <div className="cert-header">
            <div className="mtc-logo">⚓</div>
            <h2>MARÍTIMO TRAINING CENTER</h2>
            <p>REPÚBLICA DE ANGOLA</p>
          </div>
          <div className="cert-body">
            <h3>CERTIFICADO DE COMPETÊNCIA</h3>
            <p className="cert-intro">Certifica-se que para os devidos efeitos de conformidade com a Convenção STCW 78/95, conforme emendada:</p>
            <div className="student-name">{doc.student}</div>
            <p className="cert-course">Concluiu com aproveitamento o curso de:</p>
            <div className="course-name">{doc.type}</div>
            <div className="cert-grid">
              <div className="grid-item"><span>Norma:</span> <strong>{doc.stcw}</strong></div>
              <div className="grid-item"><span>Data de Emissão:</span> <strong>{doc.date}</strong></div>
              <div className="grid-item"><span>Certificado Nº:</span> <strong>MTC-2026-0042</strong></div>
            </div>
          </div>
          <div className="cert-footer">
            <div className="seal">🛡️ SELO OFICIAL</div>
            <div className="signature">
              <div className="sig-line"></div>
              <span>Diretor do Centro</span>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn-print" onClick={() => window.print()}>🖨️ Imprimir / Guardar PDF</button>
      </div>
    </div>
    <style jsx>{`
      .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(10, 42, 94, 0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
      .modal-card { background: white; border-radius: 20px; width: 90%; max-width: 800px; padding: 2rem; position: relative; animation: zoomIn 0.3s ease; }
      @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      .modal-close { position: absolute; top: 1rem; right: 1.5rem; font-size: 2rem; cursor: pointer; color: #94a3b8; }
      
      .certificate-page { background: #fffcf0; border: 2px solid #e2e8f0; padding: 1rem; perspective: 1000px; }
      .cert-border { border: 15px double #2D180F; padding: 3rem; text-align: center; color: #2D180F; }
      
      .mtc-logo { font-size: 3rem; margin-bottom: 1rem; color: #E6C5A8; }
      .cert-header h2 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin: 0; letter-spacing: 2px; }
      .cert-header p { font-weight: 800; font-size: 0.9rem; letter-spacing: 4px; margin: 0.5rem 0 2rem; color: #64748b; }
      
      .cert-body h3 { font-family: 'Outfit', sans-serif; font-size: 1.4rem; color: #E6C5A8; text-decoration: underline; margin-bottom: 1.5rem; }
      .cert-intro { font-size: 0.9rem; font-style: italic; color: #475569; }
      .student-name { font-size: 2.2rem; font-weight: 900; margin: 1.5rem 0; font-family: 'Outfit', sans-serif; border-bottom: 2px solid #E6C5A8; display: inline-block; padding: 0 2rem; }
      .cert-course { font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
      .course-name { font-size: 1.4rem; font-weight: 800; margin: 0.5rem 0 2rem; }
      
      .cert-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: left; background: #ffffff50; padding: 1rem; border-radius: 8px; font-size: 0.75rem; }
      .grid-item span { display: block; color: #94a3b8; margin-bottom: 2px; }
      
      .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 3rem; }
      .seal { font-size: 0.8rem; font-weight: 800; border: 2px solid #E6C5A8; color: #E6C5A8; padding: 0.5rem; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; transform: rotate(-15deg); }
      .signature { text-align: center; }
      .sig-line { width: 150px; border-top: 2px solid #2D180F; margin-bottom: 0.5rem; }
      .signature span { font-size: 0.75rem; font-weight: 700; color: #64748b; }

      .modal-actions { margin-top: 2rem; display: flex; justify-content: center; }
      .btn-print { background: #2D180F; color: white; border: none; padding: 0.75rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
      .btn-print:hover { background: #173b7d; }

      @media print {
        .modal-overlay { background: white; position: absolute; }
        .modal-close, .modal-actions { display: none; }
        .modal-card { width: 100%; max-width: 100%; padding: 0; box-shadow: none; }
      }
    `}</style>
  </div>
);

export default function ValidationsPage() {
  const dummyValidations = [
    { stcw: 'STCW-A-VI/1', student: 'Tiago Santos', type: 'Atestado Médico Marítimo', date: '05-04-2026', validation: 'Pendente Análise Visual' },
    { stcw: 'STCW-VI/4', student: 'Mafalda Loureiro', type: 'Registo de Horas de Embarque', date: '04-04-2026', validation: 'Concluída' }
  ];

  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Avaliação e Validação STCW</h1>
          <p>O centro formador precisará de aprovar visual ou digitalmente a submissão de relatórios e documentação legal (médica, tempo de embarque).</p>
        </div>
      </div>
      
      {selectedDoc && <CertificateModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}

      <div className="page-content card">
        <div className="table-header">
          <h2>Fila de Documentos para Aprovação STCW</h2>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Norma STCW</th>
              <th>Formando</th>
              <th>Tipo de Documento Legal</th>
              <th>Data de Submissão</th>
              <th>Estado da Validação</th>
              <th>Ações de Avaliação</th>
            </tr>
          </thead>
          <tbody>
            {dummyValidations.map((p, i) => (
              <tr key={i}>
                <td className="bold">{p.stcw}</td>
                <td>{p.student}</td>
                <td>{p.type}</td>
                <td>{p.date}</td>
                <td>
                  <span className={`status-badge ${p.validation === 'Concluída' ? 'success' : 'warning'}`}>
                    {p.validation}
                  </span>
                </td>
                <td>
                   {p.validation !== 'Concluída' ? (
                      <div style={{display:'flex', gap:'5px'}}>
                        <button className="action-btn success">✓ Aprovar Digitalmente</button>
                        <button 
                          className="action-btn view" 
                          onClick={() => setSelectedDoc(p)}
                        >
                          👁️ Ver PDF
                        </button>
                      </div>
                   ) : <span style={{fontSize:'0.8rem', color:'#059669', fontWeight:600}}>✓ Aprovado e validado</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; position: relative; }
        .page-header { position: sticky; top: -10px; z-index: 10; background: linear-gradient(135deg, #2D180F 0%, #173b7d 100%); padding: 2rem; border-radius: 14px; color: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.15); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #E6C5A8; }
        .page-header p { color: #e2e8f0; max-width: 800px; }
        
        .card { background: #ffffff; border-radius: 14px; padding: 2rem; border: 1px solid #e2e8f0; }
        
        .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; }
        .table-header h2 { color: #2D180F; font-family: 'Outfit', sans-serif; font-size: 1.25rem; }

        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 1rem; background: #f8fafc; color: #475569; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #0f1e35; }
        .bold { font-weight: 800; color: #2D180F; }

        .status-badge { padding: 0.2rem 0.6rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
        .status-badge.success { background: #ecfdf5; color: #059669; }
        .status-badge.warning { background: #F7ECE1; color: #9A3412; }

        .action-btn { border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; transition:0.2s;}
        .action-btn.success { background: #ecfdf5; color: #059669; }
        .action-btn.success:hover { background: #d1fae5; }
        .action-btn.view { background: #FDF2E9; color: #2D180F; }
        .action-btn.view:hover { background: #FDF2E9; }
      `}</style>
    </div>
  );
}
