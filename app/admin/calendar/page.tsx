'use client';

export default function CalendarPage() {
  const dummyEvents = [
    { date: '07-04-2026', time: '09:00', event: 'Início Turma STCW-2026-A', type: 'Aula Teórica', location: 'Sala 101' },
    { date: '08-04-2026', time: '14:30', event: 'Exame de GMDSS', type: 'Avaliação', location: 'Laboratório Rádio' },
    { date: '10-04-2026', time: '10:00', event: 'Prática de Sobrevivência', type: 'Aula Prática', location: 'Piscina Municipal' }
  ];

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Calendário de Atividades</h1>
        <p>Visão global do agendamento de Cursos, Sessões Práticas e Avaliações STCW.</p>
      </div>
      
      <div className="page-content card">
        <div className="table-header">
          <h2>Próximos Eventos Agendados</h2>
          <button className="btn-primary">+ Novo Agendamento</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Hora</th>
              <th>Evento / Atividade</th>
              <th>Tipo</th>
              <th>Localização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dummyEvents.map((p, i) => (
              <tr key={i}>
                <td className="bold">{p.date}</td>
                <td>{p.time}</td>
                <td className="bold">{p.event}</td>
                <td><span className="type-badge">{p.type}</span></td>
                <td>{p.location}</td>
                <td>
                  <button className="action-btn view">✏️ Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; position: relative; }
        .page-header { position: sticky; top: -10px; z-index: 10; background: linear-gradient(135deg, #0a2a5e 0%, #173b7d 100%); padding: 2rem; border-radius: 14px; color: white; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.15); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #F5C518; }
        .page-header p { color: #e2e8f0; }
        
        .card { background: #ffffff; border-radius: 14px; padding: 2rem; border: 1px solid #e2e8f0; }
        
        .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1rem; }
        .table-header h2 { color: #0a2a5e; font-family: 'Outfit', sans-serif; font-size: 1.25rem; margin: 0; }
        .btn-primary { background: #0a2a5e; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { background: #173b7d; }

        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 1rem; background: #f8fafc; color: #475569; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #0f1e35; }
        .bold { font-weight: 700; color: #0a2a5e; }

        .type-badge { background: #fef3c7; color: #92400e; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }

        .action-btn.view { background: #f0f9ff; color: #0a2a5e; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 700; cursor: pointer; }
        .action-btn.view:hover { background: #e0f2fe; }
      `}</style>
    </div>
  );
}
