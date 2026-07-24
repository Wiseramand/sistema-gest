'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function StudentCertificatesPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.email) return;
      try {
        // Fetch student profile to check clientType
        const sRes = await fetch(`/api/students?email=${session.user.email}`);
        if (sRes.ok) {
          const sData = await sRes.json();
          const currentStudent = Array.isArray(sData) ? sData[0] : sData;
          setStudent(currentStudent);

          if (currentStudent) {
            // Fetch certificates for this student
            const cRes = await fetch(`/api/certificates?studentId=${currentStudent.id}`);
            if (cRes.ok) {
              const cData = await cRes.json();
              setCertificates(Array.isArray(cData) ? cData : []);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching certificate data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  if (loading) return <div className="loader">Carregando certificações únicas...</div>;

  const isParticular = student?.clientType === 'Particular';

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Meus Certificados STCW</h1>
        <p>Aceda às suas qualificações marítimas oficiais e verifique a sua validade.</p>
      </div>

      <div className="page-content">
        {!isParticular ? (
          <div className="restriction-card card">
            <span className="icon">🏢</span>
            <h2>Acesso via Entidade Patronal</h2>
            <p>Os seus certificados foram emitidos via conta corporativa (**{student?.company || 'Empresa'}**).</p>
            <p className="notice">De acordo com as políticas do Marítimo Training Center, os certificados originais de alunos não particulares devem ser solicitados diretamente à sua entidade patronal ou à secretaria do centro.</p>
            <button className="btn-contact">Contactar Secretaria</button>
          </div>
        ) : certificates.length === 0 ? (
          <div className="empty-state card">
            <span className="icon">📜</span>
            <h2>Nenhum Certificado Encontrado</h2>
            <p>Ainda não possui certificados aprovados no sistema. Verifique o estado das suas matrículas.</p>
          </div>
        ) : (
          <div className="cert-grid">
            {certificates.map((cert) => (
              <div key={cert.id} className="cert-card card">
                <div className="cert-status">
                   <span className={`badge ${cert.status === 'APROVADO' ? 'success' : 'pending'}`}>
                     {cert.status}
                   </span>
                </div>
                <div className="cert-main">
                  <h3>{cert.courseTitle}</h3>
                  <p className="id-tag">ID: {cert.id}</p>
                  <div className="validity">
                    <span>Validade:</span>
                    <strong>{cert.validUntil ? new Date(cert.validUntil).toLocaleDateString() : 'N/A'}</strong>
                  </div>
                </div>
                <div className="cert-actions">
                  <button className="btn-action view">👁️ Visualizar</button>
                  <button className="btn-action download">⬇️ Download PDF</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; max-width: 1200px; margin: 0 auto; }
        .page-header { background: linear-gradient(135deg, #2D180F 0%, #173b7d 100%); padding: 2.5rem; border-radius: 16px; color: white; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.1); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 2rem; margin-bottom: 0.5rem; color: #E6C5A8; }
        .page-header p { color: #e2e8f0; font-size: 1.1rem; }

        .card { background: white; border-radius: 16px; padding: 2rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        
        .restriction-card { text-align: center; max-width: 600px; margin: 4rem auto; }
        .restriction-card .icon { font-size: 3rem; display: block; margin-bottom: 1.5rem; }
        .restriction-card h2 { color: #2D180F; font-family: 'Outfit', sans-serif; margin-bottom: 1rem; }
        .restriction-card p { color: #64748b; line-height: 1.6; margin-bottom: 1rem; }
        .notice { font-weight: 600; color: #475569; }
        .btn-contact { background: #2D180F; color: white; border: none; padding: 0.8rem 2rem; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 1rem; }

        .cert-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .cert-card { display: flex; flex-direction: column; gap: 1.5rem; transition: transform 0.2s; }
        .cert-card:hover { transform: translateY(-5px); }
        
        .badge { padding: 0.3rem 0.7rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
        .badge.success { background: #ecfdf5; color: #059669; }
        .badge.pending { background: #F7ECE1; color: #9A3412; }

        .cert-main h3 { color: #2D180F; font-family: 'Outfit', sans-serif; font-size: 1.2rem; margin-bottom: 0.5rem; }
        .id-tag { font-family: monospace; color: #94a3b8; font-size: 0.8rem; margin-bottom: 1rem; }
        .validity { display: flex; justify-content: space-between; font-size: 0.9rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
        .validity span { color: #64748b; }
        .validity strong { color: #0f1e35; }

        .cert-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .btn-action { border: none; padding: 0.6rem; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
        .btn-action.view { background: #FDF2E9; color: #2D180F; }
        .btn-action.download { background: #fffae6; color: #b48a04; }
        .btn-action:hover { filter: brightness(0.95); }

        .loader { padding: 5rem; text-align: center; font-weight: 700; color: #2D180F; }
        .empty-state { text-align: center; padding: 4rem; color: #94a3b8; }
        .empty-state .icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
      `}</style>
    </div>
  );
}
