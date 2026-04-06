'use client';

import { useState } from 'react';

export default function UserManagementPage() {
  const [admins, setAdmins] = useState([
    { id: '1', name: 'Administrador Geral', email: 'admin@mtc.com', role: 'SUPER_ADMIN', responsibilities: ['all'] },
    { id: '2', name: 'Joana Financeiro', email: 'joana@mtc.com', role: 'ADMIN', responsibilities: ['financeiro', 'invoices'] },
    { id: '3', name: 'Ricardo Pedagógico', email: 'ricardo@mtc.com', role: 'ADMIN', responsibilities: ['students', 'courses', 'media'] },
    { id: '4', name: 'Sofia Validações', email: 'sofia@mtc.com', role: 'ADMIN', responsibilities: ['certificates', 'validations'] },
  ]);

  const allResponsibilities = [
    { id: 'financeiro', label: 'Financeiro (Pagamentos/Faturas)' },
    { id: 'students', label: 'Alunos (Inscrições/Lista)' },
    { id: 'courses', label: 'Cursos (Turmas/Calendário)' },
    { id: 'certificates', label: 'Certificados (Emissão/Arquivo)' },
    { id: 'media', label: 'Média (Materiais de Apoio)' },
    { id: 'reports', label: 'Relatórios & Auditoria' },
  ];

  const handleToggleResponsibility = (adminId: string, respId: string) => {
    setAdmins(prev => prev.map(a => {
      if (a.id === adminId) {
        const has = a.responsibilities.includes(respId);
        return {
          ...a,
          responsibilities: has 
            ? a.responsibilities.filter(r => r !== respId)
            : [...a.responsibilities, respId]
        };
      }
      return a;
    }));
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h1>Gestão de Utilizadores Administrativos</h1>
          <p>Configure as permissões e responsabilidades da sua equipa do Marítimo Training Center.</p>
        </div>
        <button className="btn-primary">+ Novo Administrador</button>
      </div>

      <div className="grid-users">
        {admins.map(admin => (
          <div key={admin.id} className="user-card card">
            <div className="user-info">
              <div className="avatar">
                {admin.name.slice(0,2).toUpperCase()}
              </div>
              <div>
                <h3>{admin.name}</h3>
                <p>{admin.email}</p>
                <span className={`role-badge ${admin.role.toLowerCase()}`}>{admin.role}</span>
              </div>
            </div>

            <div className="responsibilities">
              <h4>Responsabilidades Atribuídas</h4>
              {admin.role === 'SUPER_ADMIN' ? (
                <div className="full-access">Acesso Total ao Sistema</div>
              ) : (
                <div className="resp-list">
                  {allResponsibilities.map(resp => (
                    <label key={resp.id} className="resp-item">
                      <input 
                        type="checkbox" 
                        checked={admin.responsibilities.includes(resp.id)}
                        onChange={() => handleToggleResponsibility(admin.id, resp.id)}
                      />
                      <span>{resp.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div className="user-actions">
              <button className="btn-outline">Editar Perfil</button>
              <button className="btn-danger">Suspender</button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; }
        .page-header { background: linear-gradient(135deg, #0a2a5e 0%, #173b7d 100%); padding: 2rem; border-radius: 14px; color: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.15); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #F5C518; }
        .page-header p { color: #e2e8f0; opacity: 0.9; }

        .btn-primary { background: #F5C518; color: #0a2a5e; border: none; padding: 0.7rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245, 197, 24, 0.3); }

        .grid-users { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 1.5rem; }
        .card { background: white; border-radius: 14px; border: 1px solid #e2e8f0; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; transition: 0.2s; }
        .card:hover { box-shadow: 0 10px 25px rgba(0,0,0,0.05); }

        .user-info { display: flex; gap: 1rem; align-items: center; }
        .avatar { width: 48px; height: 48px; border-radius: 12px; background: #f0f4f8; display: flex; align-items: center; justify-content: center; color: #0a2a5e; font-weight: 800; font-family: 'Outfit', sans-serif; font-size: 1.2rem; }
        .user-info h3 { font-size: 1.1rem; color: #0a2a5e; margin: 0; font-family: 'Outfit', sans-serif; }
        .user-info p { font-size: 0.85rem; color: #64748b; margin: 0; }

        .role-badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 800; margin-top: 0.5rem; }
        .role-badge.super_admin { background: #0a2a5e; color: white; }
        .role-badge.admin { background: #f1f5f9; color: #475569; }

        .responsibilities h4 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 1rem; }
        .full-access { background: #ecfdf5; color: #059669; padding: 1rem; border-radius: 8px; font-weight: 700; font-size: 0.9rem; text-align: center; border: 1px dashed #059669; }
        
        .resp-list { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .resp-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #475569; cursor: pointer; padding: 0.4rem; border-radius: 6px; transition: 0.1s; }
        .resp-item:hover { background: #f8fafc; }
        .resp-item input { accent-color: #0a2a5e; }

        .user-actions { display: flex; gap: 0.5rem; margin-top: auto; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
        .btn-outline { flex: 1; background: transparent; border: 1px solid #e2e8f0; padding: 0.5rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; color: #475569; cursor: pointer; }
        .btn-danger { background: #fef2f2; border: 1px solid #fee2e2; color: #dc2626; padding: 0.5rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
        .btn-outline:hover { background: #f8fafc; }
        .btn-danger:hover { background: #fee2e2; }
      `}</style>
    </div>
  );
}
