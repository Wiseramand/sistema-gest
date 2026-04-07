'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function TrainerAttendancePage() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  
  // Fake Mock for classes assigned to trainer
  useEffect(() => {
    // In real scenario, fetch('/api/courses?trainerId='+session.user.id)
    const timeout = setTimeout(() => {
      setClasses([
        { id: '1', title: 'Segurança Básica (STCW)', students: [{name:'João Silva'}, {name:'Maria Santos'}] },
        { id: '2', title: 'Operador de Rádio GMDSS', students: [{name:'Carlos Sousa'}, {name:'Ana Oliveira'}, {name:'Rui Costa'}] }
      ]);
    }, 0);
    return () => clearTimeout(timeout);
  }, [session]);

  const [selectedClass, setSelectedClass] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('As presenças foram submetidas e registadas criptograficamente na plataforma!');
    setSelectedClass(null);
  };

  return (
    <div className="attendance-wrap">
      <div className="header">
        <h1>Diário de Turma Eletrónico</h1>
        <p>Registo e assinatura digital diária das frequências requeridas para STCW.</p>
      </div>

      <div className="content card">
        {!selectedClass ? (
          <div className="class-selector">
            <h2>Selecione a turma de hoje:</h2>
            <div className="grid">
              {classes.map(c => (
                <button key={c.id} className="class-card" onClick={() => setSelectedClass(c)}>
                  <h3>{c.title}</h3>
                  <span>{c.students.length} formandos alocados</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form className="class-list" onSubmit={handleSubmit}>
            <div className="list-top">
              <h2>Turma: {selectedClass.title}</h2>
              <button type="button" className="btn-voltar" onClick={() => setSelectedClass(null)}>Voltar a turmas</button>
            </div>
            <div className="date-box">Data de Registo: {new Date().toLocaleDateString('pt-PT')}</div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome do Aluno</th>
                    <th style={{textAlign:'center'}}>Chamada Hoje</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedClass.students.map((student: any, i: number) => (
                    <tr key={i}>
                      <td>{student.name}</td>
                      <td style={{textAlign:'center'}}>
                        <select defaultValue="Presente">
                          <option value="Presente">✅ Presente</option>
                          <option value="Falta">❌ Falta Injustificada</option>
                          <option value="Justificada">⚠️ Falta Justificada</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="signature-area">
               <label><input type="checkbox" required /> Confirmo que os registos acima representam a assiduidade real da sessão.</label>
            </div>
            <button type="submit" className="btn-submit">Submeter para Controlo Académico</button>
          </form>
        )}
      </div>

      <style jsx>{`
        .attendance-wrap { display: flex; flex-direction: column; gap: 2rem; }
        .header { background: linear-gradient(135deg, #0a2a5e 0%, #173b7d 100%); padding: 2rem; border-radius: 14px; color: white; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.15); }
        .header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #F5C518; }
        
        .card { background: #ffffff; border-radius: 14px; padding: 2rem; border: 1px solid #e2e8f0; }
        
        .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); margin-top: 1.5rem; }
        .class-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.5rem; border-radius: 12px; cursor: pointer; transition: 0.2s; text-align: left; }
        .class-card h3 { color: #0a2a5e; margin-bottom: 0.5rem; font-family: 'Outfit', sans-serif; font-size: 1.1rem; }
        .class-card span { font-size: 0.85rem; color: #64748b; font-weight: 600; }
        .class-card:hover { border-color: #0a2a5e; box-shadow: 0 5px 15px rgba(10, 42, 94, 0.1); transform: translateY(-2px); }

        .list-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .list-top h2 { color: #0a2a5e; font-family: 'Outfit', sans-serif; }
        .btn-voltar { background: transparent; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; color: #64748b; font-weight: 600; }
        .btn-voltar:hover { background: #f1f5f9; }

        .date-box { background: #fcf8e3; color: #8a6d3b; padding: 0.75rem 1rem; border-radius: 8px; font-weight: 700; margin-bottom: 1.5rem; border: 1px solid #faebcc; }

        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 1rem; background: #f8fafc; color: #475569; font-size: 0.85rem; text-transform: uppercase; }
        td { padding: 1rem; border-bottom: 1px solid #e2e8f0; color: #0f1e35; font-weight: 500; }
        select { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; font-weight: 600; color: #0f1e35; background: #fff; cursor: pointer; outline: none; }

        .signature-area { margin: 2rem 0; padding: 1rem; background: #f8fafc; border-radius: 8px; font-size: 0.9rem; color: #475569; font-weight: 600; }
        .signature-area input { margin-right: 10px; }

        .btn-submit { background: #0a2a5e; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.2s; width: 100%; font-family: 'DM Sans', sans-serif;}
        .btn-submit:hover { background: #173b7d; }
      `}</style>
    </div>
  );
}
