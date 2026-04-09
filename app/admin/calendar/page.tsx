'use client';

import React, { useState, useEffect } from 'react';

export default function CalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([
    { id: '1', date: '2026-04-07', time: '09:00', event: 'Início Turma STCW-2026-A', type: 'Aula Teórica', location: 'Sala 101' },
    { id: '2', date: '2026-04-08', time: '14:30', event: 'Exame de GMDSS', type: 'Avaliação', location: 'Laboratório Rádio' },
    { id: '3', date: '2026-04-10', time: '10:00', event: 'Prática de Sobrevivência', type: 'Aula Prática', location: 'Piscina Municipal' }
  ]);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    event: '',
    type: 'Aula Teórica',
    location: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData
    };
    setEvents([...events, newEvent]);
    setIsModalOpen(false);
    setFormData({ date: '', time: '', event: '', type: 'Aula Teórica', location: '' });
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Calendário de Atividades</h1>
        <p>Visão global do agendamento de Cursos, Sessões Práticas e Avaliações STCW.</p>
      </div>
      
      <div className="page-content card">
        <div className="table-header">
          <h2>Próximos Eventos Agendados</h2>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Novo Agendamento</button>
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
            {events.map((p) => (
              <tr key={p.id}>
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
        {events.length === 0 && <div className="empty-state">Nenhum evento agendado.</div>}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box small-modal">
            <div className="modal-top">
              <div>
                <h2>⚓ Novo Agendamento</h2>
                <p>Registe um novo evento ou atividade no calendário.</p>
              </div>
              <button className="close-x" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              <div className="field">
                <label>Título do Evento *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.event} 
                  onChange={e => setFormData({...formData, event: e.target.value})}
                  placeholder="Ex: Aula de Navegação"
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Data *</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="field">
                  <label>Hora *</label>
                  <input 
                    type="time" 
                    required 
                    value={formData.time} 
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="field">
                <label>Tipo de Evento</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Aula Teórica">Aula Teórica</option>
                  <option value="Aula Prática">Aula Prática</option>
                  <option value="Avaliação">Avaliação</option>
                  <option value="Formatura">Formatura</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="field">
                <label>Localização</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="Ex: Sala 102 ou Porto de Luanda"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">✓ Confirmar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 2rem; position: relative; }
        .page-header { position: sticky; top: -10px; z-index: 10; background: linear-gradient(135deg, #0a2a5e 0%, #173b7d 100%); padding: 2rem; border-radius: 14px; color: white; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.15); }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #F5C518; }
        .page-header p { color: #e2e8f0; font-size: 0.95rem; }
        
        .card { background: #ffffff; border-radius: 14px; padding: 2rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        
        .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 1.25rem; }
        .table-header h2 { color: #0a2a5e; font-family: 'Outfit', sans-serif; font-size: 1.25rem; margin: 0; }
        .btn-primary { background: #0a2a5e; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 6px rgba(10, 42, 94, 0.2); }
        .btn-primary:hover { background: #173b7d; transform: translateY(-2px); }

        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { padding: 1rem; background: #f8fafc; color: #64748b; font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; font-weight: 700; }
        .data-table td { padding: 1.1rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #0f1e35; }
        .bold { font-weight: 700; color: #0a2a5e; }

        .type-badge { background: #fff7ed; color: #c2410c; padding: 0.3rem 0.75rem; border-radius: 50px; font-size: 0.7rem; font-weight: 800; }

        .action-btn.view { background: #f0f9ff; color: #0a2a5e; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .action-btn.view:hover { background: #e0f2fe; }

        .action-btn.view:hover { background: #e0f2fe; }
        .empty-state { text-align: center; padding: 2rem; color: #94a3b8; font-style: italic; }
      `}</style>
    </div>
  );
}
