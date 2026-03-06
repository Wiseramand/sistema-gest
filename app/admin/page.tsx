'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: [] as any[],
    courses: [] as any[],
    trainers: [] as any[],
    inscriptions: 0,
    matriculations: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [expiringCerts, setExpiringCerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [s, c, t, i, certs] = await Promise.all([
          fetch('/api/students').then(r => r.json()),
          fetch('/api/courses').then(r => r.json()),
          fetch('/api/trainers').then(r => r.json()),
          fetch('/api/inscriptions').then(r => r.json()),
          fetch('/api/certificates').then(r => r.json())
        ]);
        setStats({
          students: Array.isArray(s) ? s : [],
          courses: Array.isArray(c) ? c : [],
          trainers: Array.isArray(t) ? t : [],
          inscriptions: Array.isArray(i) ? i.length : 0,
          matriculations: [] // Default for now
        });

        // Fetch matriculations for additional stats
        const mRes = await fetch('/api/matriculations');
        if (mRes.ok) {
          const m = await mRes.json();
          setStats(prev => ({ ...prev, matriculations: Array.isArray(m) ? m : [] }));
        }

        // Filter certificates expiring in the next 6 months
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(today.getMonth() + 6);

        const expiring = (Array.isArray(certs) ? certs : []).filter((cert: any) => {
          const expiry = new Date(cert.validUntil);
          return cert.status === 'APROVADO' && expiry <= sixMonthsFromNow && expiry > today;
        });
        setExpiringCerts(expiring);

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const inscritos = Array.isArray(stats.students) ? stats.students.filter((s: any) => s.status === 'Ativo' || s.status === 'Inscrito').length : 0;
  const matriculados = Array.isArray(stats.matriculations) ? stats.matriculations.length : 0;
  const formados = Array.isArray(stats.students) ? stats.students.filter((s: any) => s.status === 'Formado').length : 0;

  // Calculos para "Formandos por curso" e "Formandos por formador"
  const formandosPorCurso: Record<string, number> = {};
  const formandosPorFormador: Record<string, number> = {};

  if (Array.isArray(stats.matriculations)) {
    stats.matriculations.forEach((m: any) => {
      if (m.course) {
        formandosPorCurso[m.course] = (formandosPorCurso[m.course] || 0) + 1;
      }
      if (m.trainer) {
        formandosPorFormador[m.trainer] = (formandosPorFormador[m.trainer] || 0) + 1;
      }
    });
  }

  const statCards = [
    { title: 'Inscritos', value: inscritos, icon: '📝', color: '#0074D9', label: 'Alunos Registados' },
    { title: 'Matriculados', value: matriculados, icon: '🎓', color: '#2ECC40', label: 'Em Turmas' },
    { title: 'Formados', value: formados, icon: '📜', color: '#B10DC9', label: 'Cursos Concluídos' },
    { title: 'Formadores', value: Array.isArray(stats.trainers) ? stats.trainers.length : 0, icon: '👨‍🏫', color: '#FF851B', label: 'Especialistas Ativos' },
  ];

  // Filters State
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [selectedMatriculationFilter, setSelectedMatriculationFilter] = useState('');

  return (
    <div className="dashboard-overview">
      <div className="welcome-banner">
        <div className="banner-content">
          <h1>Bem-vindo ao Painel de Controle</h1>
          <p>Visão geral das atividades e métricas do Centro de Treinamento Marítimo.</p>
        </div>
        <div className="maritime-illustration">⚓</div>
      </div>

      {expiringCerts.length > 0 && (
        <div className="alert-section">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <h3>Alertas de Validade (Próximos 6 meses)</h3>
          </div>
          <div className="alert-list">
            {expiringCerts.map(cert => (
              <div key={cert.id} className="alert-item">
                <div className="alert-info">
                  <span className="student-name">{cert.studentName}</span>
                  <span className="course-title">{cert.courseTitle}</span>
                </div>
                <div className="expiry-date">
                  Expira em: {new Date(cert.validUntil).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card"></div>)}
        </div>
      ) : (
        <div className="stats-grid">
          {statCards.map((card, idx) => (
            <div key={idx} className="stat-card card">
              <div className="card-inner">
                <div className="stat-info">
                  <span className="stat-label">{card.title}</span>
                  <p className="stat-value">{card.value}</p>
                  <span className="stat-sublabel">{card.label}</span>
                </div>
                <div className="stat-icon-box" style={{ backgroundColor: card.color + '15', color: card.color }}>
                  {card.icon}
                </div>
              </div>
              <div className="card-progress">
                <div className="progress-bar" style={{ width: '100%', backgroundColor: card.color }}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-row">
        <div className="card main-card">
          <h2>Atividades Recentes</h2>
          <div className="timeline">
            {expiringCerts.length > 0 && (
              <div className="timeline-item">
                <div className="timeline-marker warning"></div>
                <div className="timeline-content">
                  <h3>Atenção: Certificados a Expirar</h3>
                  <p>Existem {expiringCerts.length} certificados que precisam de renovação brevemente.</p>
                </div>
              </div>
            )}
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h3>Monitoramento de Inscrições</h3>
                <p>Existem {stats.inscriptions} novas inscrições aguardando revisão da coordenação pedagógica.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker success"></div>
              <div className="timeline-content">
                <h3>Base de Alunos Conectada</h3>
                <p>O sistema está sincronizado com a base de dados JSON segura.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card list-card">
          <h2>Distribuição de Formandos</h2>
          <div className="distribution-grid">
            <div className="dist-section">
              <h3>Por Curso</h3>
              <ul className="dist-list">
                {Object.keys(formandosPorCurso).length > 0 ? (
                  Object.entries(formandosPorCurso).map(([curso, total]) => (
                    <li key={curso}>
                      <span className="dist-name">{curso}</span>
                      <span className="dist-count">{total} {total === 1 ? 'aluno' : 'alunos'}</span>
                    </li>
                  ))
                ) : (
                  <li className="empty-li">Sem dados</li>
                )}
              </ul>
            </div>
            <div className="dist-section">
              <h3>Por Formador</h3>
              <ul className="dist-list">
                {Object.keys(formandosPorFormador).length > 0 ? (
                  Object.entries(formandosPorFormador).map(([formador, total]) => (
                    <li key={formador}>
                      <span className="dist-name">{formador}</span>
                      <span className="dist-count">{total} {total === 1 ? 'aluno' : 'alunos'}</span>
                    </li>
                  ))
                ) : (
                  <li className="empty-li">Sem dados</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="card filters-card">
          <h2>Filtros do Dashboard</h2>
          <div className="filter-group">
            <label>Filtrar por Curso</label>
            <select value={selectedCourseFilter} onChange={e => setSelectedCourseFilter(e.target.value)}>
              <option value="">Todos os Cursos</option>
              {Array.isArray(stats.courses) && stats.courses.map((c: any) => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Filtrar por Turma / Matrícula</label>
            <select value={selectedMatriculationFilter} onChange={e => setSelectedMatriculationFilter(e.target.value)}>
              <option value="">Todas as Turmas</option>
              {Array.isArray(stats.matriculations) && [...new Set(stats.matriculations.map((m: any) => m.classroom))].filter(Boolean).map((cl: any, i) => (
                <option key={i} value={cl}>{cl}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card side-card">
          <h2>Status do Sistema</h2>
          <div className="status-list">
            <div className="status-item">
              <span>Banco de Dados</span>
              <span className="status-tag online">ONLINE</span>
            </div>
            <div className="status-item">
              <span>Servidor de API</span>
              <span className="status-tag online">ONLINE</span>
            </div>
            <div className="status-item">
              <span>Autenticação</span>
              <span className="status-tag online">ATIVO</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-overview {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .welcome-banner {
          background: linear-gradient(135deg, var(--navy-deep) 0%, var(--ocean-blue) 100%);
          padding: 3rem;
          border-radius: 16px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 10px 30px rgba(0, 31, 63, 0.15);
        }

        .banner-content h1 { font-size: 2rem; margin-bottom: 0.5rem; color: var(--sand-gold); }
        .banner-content p { font-size: 1.1rem; opacity: 0.9; }
        .maritime-illustration { font-size: 5rem; opacity: 0.2; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          padding: 1.75rem;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover { transform: translateY(-5px); }

        .card-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-info { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.85rem; font-weight: 700; color: var(--gray-medium); text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value { font-size: 2.5rem; font-weight: 800; color: var(--navy-deep); margin: 0.25rem 0; }
        .stat-sublabel { font-size: 0.75rem; color: var(--ocean-blue); font-weight: 600; }

        .stat-icon-box {
          width: 60px; height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center; justify-content: center;
          font-size: 1.75rem;
        }

        .card-progress {
          position: absolute;
          bottom: 0; left: 0; width: 100%;
          height: 4px;
          background-color: #f1f5f9;
        }

        .progress-bar { height: 100%; width: 0; transition: width 1s ease-out; }

        .dashboard-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .main-card, .side-card { padding: 2rem; }
        h2 { font-size: 1.25rem; color: var(--navy-deep); margin-bottom: 2rem; font-weight: 800; border-left: 4px solid var(--sand-gold); padding-left: 1rem; }

        .timeline { display: flex; flex-direction: column; gap: 2rem; position: relative; }
        .timeline::before { content: ''; position: absolute; left: 7px; top: 0; bottom: 0; width: 2px; background: #edf2f7; }

        .timeline-item { display: flex; gap: 1.5rem; position: relative; padding-left: 2rem; }
        .timeline-marker { position: absolute; left: 0; top: 5px; width: 16px; height: 16px; border-radius: 50%; background: var(--ocean-blue); border: 3px solid white; box-shadow: 0 0 0 1px #edf2f7; z-index: 1; }
        .timeline-marker.success { background: #10b981; }

        .timeline-content h3 { font-size: 1rem; color: var(--navy-medium); margin-bottom: 0.25rem; }
        .timeline-content p { font-size: 0.9rem; color: var(--gray-medium); }

        .status-list { display: flex; flex-direction: column; gap: 1rem; }
        .status-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8fafc; border-radius: 8px; font-size: 0.9rem; font-weight: 600; color: var(--navy-medium); }
        .status-tag { font-size: 0.65rem; padding: 0.25rem 0.6rem; border-radius: 4px; font-weight: 800; }
        .status-tag.online { background: #ecfdf5; color: #059669; }

        .loading-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .skeleton-card { height: 140px; background: white; border-radius: 12px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

        .filter-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
        .filter-group label { font-size: 0.85rem; font-weight: 700; color: #475569; }
        .filter-group select { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; background: #f8fafc; color: var(--navy-deep); outline: none; }

        .list-card { padding: 2.5rem 2rem; }
        .distribution-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .dist-section h3 { font-size: 0.95rem; color: var(--navy-medium); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #f1f5f9; }
        .dist-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
        .dist-list li { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 0.5rem; background: #f8fafc; border-radius: 6px; }
        .dist-name { font-weight: 600; color: #334155; }
        .dist-count { background: #e0f2fe; color: #0284c7; padding: 0.2rem 0.6rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
        .empty-li { color: #94a3b8; font-style: italic; background: transparent !important; }

        @media (max-width: 1024px) {
          .dashboard-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
