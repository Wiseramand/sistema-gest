'use client';

import { useState, useEffect } from 'react';

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  availability: string;
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Classroom | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 0,
    location: '',
    availability: 'Disponível'
  });

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/classrooms');
      const data = await res.json();
      setClassrooms(data);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleOpenModal = (room?: Classroom) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        capacity: room.capacity,
        location: room.location,
        availability: room.availability
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        capacity: 20,
        location: '',
        availability: 'Disponível'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingRoom ? `/api/classrooms/${editingRoom.id}` : '/api/classrooms';
    const method = editingRoom ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, capacity: Number(formData.capacity) })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchClassrooms();
      }
    } catch (error) {
      console.error('Error saving classroom:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta sala?')) return;

    try {
      const res = await fetch(`/api/classrooms/${id}`, { method: 'DELETE' });
      if (res.ok) fetchClassrooms();
    } catch (error) {
      console.error('Error deleting classroom:', error);
    }
  };

  return (
    <div className="classrooms-content">
      <div className="page-header">
        <div>
          <div className="maritime-accent"></div>
          <h1>Registro de Salas de Aula</h1>
          <p>Infraestrutura e espaços físicos do centro de treinamento.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Nova Sala</button>
      </div>

      {loading ? (
        <div className="loading-box">Carregando infraestrutura...</div>
      ) : (
        <div className="grid-auto">
          {classrooms.map((room) => (
            <div key={room.id} className="card room-card shadow-sm">
              <div className="room-header">
                <h3>{room.name}</h3>
                <span className={`status-indicator ${room.availability === 'Disponível' ? 'available' : 'occupied'}`}>
                  {room.availability}
                </span>
              </div>
              <div className="room-body">
                <div className="info-row">
                  <span className="info-label">Capacidade:</span>
                  <span className="info-value">{room.capacity} pessoas</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Localização:</span>
                  <span className="info-value">{room.location}</span>
                </div>
              </div>
              <div className="room-footer">
                <button className="btn btn-icon edit" onClick={() => handleOpenModal(room)}>Editar</button>
                <button className="btn btn-icon delete" onClick={() => handleDelete(room.id)}>Remover</button>
              </div>
            </div>
          ))}
          {classrooms.length === 0 && <div className="empty-state">Nenhuma sala cadastrada.</div>}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card shadow-lg">
            <div className="modal-header">
              <h2>{editingRoom ? 'Editar Sala' : 'Nova Sala'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nome da Sala / Identificação</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Sala Atlântico"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Capacidade (Pax)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status Atual</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Ocupada">Ocupada</option>
                    <option value="Manutenção">Manutenção</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Localização / Bloco</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Bloco A, Piso 1"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Sala</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .page-header h1 { font-size: 1.85rem; color: var(--navy-deep); }
        .page-header p { color: var(--gray-medium); }

        .grid-auto {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .room-card {
          padding: 1.75rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
        }

        .room-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .room-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--navy-deep);
        }

        .status-indicator {
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .status-indicator.available { background-color: #ecfdf5; color: #059669; }
        .status-indicator.occupied { background-color: #fef2f2; color: #dc2626; }

        .room-body { flex: 1; margin-bottom: 1.75rem; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; }
        .info-label { color: var(--gray-medium); }
        .info-value { color: var(--navy-medium); font-weight: 600; }

        .room-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid #edf2f7;
        }

        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.8rem;
          transition: 0.2s;
        }

        .btn-icon.edit { color: var(--ocean-blue); }
        .btn-icon.delete { color: var(--coral-accent); }
        .btn-icon:hover { text-decoration: underline; opacity: 0.7; }

        .loading-box, .empty-state {
            padding: 3rem;
            text-align: center;
            color: #94a3b8;
            font-weight: 500;
        }

        /* Modal */
        .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 31, 63, 0.4);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center; justify-content: center;
            z-index: 1000;
        }

        .modal-content {
            width: 100%;
            max-width: 500px;
            padding: 2.5rem;
            border-radius: 16px;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .modal-header h2 { color: var(--navy-deep); font-weight: 800; margin: 0; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; }

        .form-group { margin-bottom: 1.25rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        label { display: block; font-weight: 700; font-size: 0.85rem; color: #475569; margin-bottom: 0.5rem; }
        input, select { width: 100%; padding: 0.85rem; border: 1px solid #cbd5e0; border-radius: 8px; font-size: 1rem; }
        input:focus, select:focus { outline: none; border-color: var(--ocean-blue); }

        .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2.5rem; }
      `}</style>
    </div>
  );
}
