'use client';

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

interface Matriculation {
    id: string; studentId: string; studentName: string;
    course: string; classroom: string; trainer: string;
    schedule: string; duration: string; paymentStatus: string;
    amountDue: number; startDate: string;
}
interface Course { id: string; title: string; }

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ReportsPage() {
    const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [activeTab, setActiveTab] = useState<'students' | 'matriculations' | 'trainers' | 'courses'>('matriculations');
    const [data, setData] = useState({
        students: [] as any[], trainers: [] as any[],
        courses: [] as Course[], matriculations: [] as Matriculation[], inscriptions: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [s, t, c, m, i] = await Promise.all([
                    fetch('/api/students').then(r => r.json()),
                    fetch('/api/trainers').then(r => r.json()),
                    fetch('/api/courses').then(r => r.json()),
                    fetch('/api/matriculations').then(r => r.json()),
                    fetch('/api/inscriptions').then(r => r.json()),
                ]);
                setData({
                    students: Array.isArray(s) ? s : [],
                    trainers: Array.isArray(t) ? t : [],
                    courses: Array.isArray(c) ? c : [],
                    matriculations: Array.isArray(m) ? m : [],
                    inscriptions: Array.isArray(i) ? i : []
                });
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    const filterByDate = (items: any[], dateField = 'createdAt') => {
        const now = new Date();
        return items.filter(item => {
            const dateStr = item[dateField] || item.startDate || item.createdAt || 0;
            const d = new Date(dateStr);
            if (filter === 'today') return d.toDateString() === now.toDateString();
            if (filter === 'week') {
                const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
                return d >= weekStart;
            }
            if (filter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            if (filter === 'year') return d.getFullYear() === now.getFullYear();
            if (filter === 'custom' && customFrom && customTo) {
                return d >= new Date(customFrom) && d <= new Date(customTo + 'T23:59:59');
            }
            return true;
        });
    };

    const exportToCSV = (items: any[], type: string) => {
        if (items.length === 0) return;
        const headersMap: Record<string, string[]> = {
            matriculations: ['studentName', 'course', 'classroom', 'trainer', 'startDate', 'paymentStatus', 'amountDue'],
            students: ['name', 'email', 'idDocument', 'nationality', 'status', 'createdAt'],
            trainers: ['name', 'specialty', 'email', 'nationality', 'status'],
            courses: ['title', 'duration', 'status']
        };
        const activeHeaders = headersMap[type] || Object.keys(items[0]);
        let csvContent = "\uFEFF"; // BOM for Excel UTF-8
        csvContent += activeHeaders.join(";") + "\r\n";
        items.forEach(item => {
            const row = activeHeaders.map(h => {
                const val = item[h] === null || item[h] === undefined ? '' : item[h];
                return `"${String(val).replace(/"/g, '""')}"`;
            }).join(";");
            csvContent += row + "\r\n";
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_${type}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filtered = {
        students: filterByDate(data.students),
        trainers: filterByDate(data.trainers),
        matriculations: filterByDate(data.matriculations, 'startDate'),
        inscriptions: filterByDate(data.inscriptions),
    };

    const paymentStats = [
        { name: 'Pago Total', value: filtered.matriculations.filter(m => m.paymentStatus === 'Pago Total').length, color: '#10b981' },
        { name: 'Metade', value: filtered.matriculations.filter(m => m.paymentStatus === 'Metade').length, color: '#f59e0b' },
        { name: 'Pendente', value: filtered.matriculations.filter(m => m.paymentStatus === 'Pendente').length, color: '#ef4444' },
    ].filter(s => s.value > 0);

    const courseStats = data.courses.map(c => ({
        name: c.title,
        alunos: data.matriculations.filter(m => m.course === c.title).length
    })).sort((a, b) => b.alunos - a.alunos);

    const enrollmentTrend = (() => {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return months.map((m, i) => ({
            name: m,
            count: data.matriculations.filter(mat => new Date(mat.startDate).getMonth() === i).length
        }));
    })();

    return (
        <div className="page-wrapper">
            <div className="page-top">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Relatórios e Estatísticas</h1>
                    <p>Visão analítica do centro de formação com dados em tempo real.</p>
                </div>
                <div className="top-actions">
                    <button className="csv-btn no-print" onClick={() => exportToCSV(activeTab === 'courses' ? data.courses : (filtered as any)[activeTab], activeTab)}>
                        📥 Exportar CSV
                    </button>
                    <button className="print-btn" onClick={() => window.print()}>🖨️ Imprimir / PDF</button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar no-print">
                <div className="filter-pills">
                    {(['today', 'week', 'month', 'year'] as const).map(f => (
                        <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f === 'today' ? 'Hoje' : f === 'week' ? 'Esta Semana' : f === 'month' ? 'Este Mês' : 'Este Ano'}
                        </button>
                    ))}
                    <button className={`pill ${filter === 'custom' ? 'active' : ''}`} onClick={() => setFilter('custom')}>Personalizado</button>
                </div>
                {filter === 'custom' && (
                    <div className="date-range">
                        <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
                        <span>até</span>
                        <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} />
                    </div>
                )}
            </div>

            {/* Visual Overview Section */}
            <div className="charts-grid no-print">
                <div className="chart-card">
                    <h3>Status de Pagamentos</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={paymentStats}
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {paymentStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Popularidade dos Cursos (Alunos)</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={courseStats.slice(0, 5)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={10} interval={0} />
                                <YAxis fontSize={10} />
                                <Tooltip />
                                <Bar dataKey="alunos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card wide">
                    <h3>Tendência de Matrículas (Anual)</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={enrollmentTrend}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" fontSize={10} />
                                <YAxis fontSize={10} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="stats-row">
                {[
                    { label: 'Alunos (Período)', value: filtered.students.length, icon: '👥', color: '#3b82f6' },
                    { label: 'Matrículas (Período)', value: filtered.matriculations.length, icon: '🖋️', color: '#8b5cf6' },
                    { label: 'Inscrições (Período)', value: filtered.inscriptions.length, icon: '📝', color: '#f59e0b' },
                    { label: 'Formadores Ativos', value: data.trainers.filter(t => t.status === 'Ativo').length, icon: '👨‍🏫', color: '#10b981' },
                ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ borderTopColor: s.color }}>
                        <div className="stat-icon" style={{ background: `${s.color}18` }}>{s.icon}</div>
                        <div className="stat-val">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="tabs no-print">
                {(['matriculations', 'students', 'trainers', 'courses'] as const).map(tab => (
                    <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                        {tab === 'matriculations' ? '🖋️ Matrículas' : tab === 'students' ? '👥 Alunos' : tab === 'trainers' ? '👨‍🏫 Formadores' : '⚓ Cursos'}
                    </button>
                ))}
            </div>

            {loading ? <div className="loader">A carregar dados analíticos...</div> : (
                <div className="table-wrap">
                    {/* MATRICULATIONS TAB */}
                    {activeTab === 'matriculations' && (
                        <table className="data-table">
                            <thead><tr><th>Aluno</th><th>Curso</th><th>Sala</th><th>Formador</th><th>Início</th><th>Pagamento</th></tr></thead>
                            <tbody>
                                {filtered.matriculations.map(m => (
                                    <tr key={m.id}>
                                        <td className="bold">{m.studentName}</td>
                                        <td>{m.course}</td>
                                        <td>{m.classroom}</td>
                                        <td>{m.trainer}</td>
                                        <td>{m.startDate}</td>
                                        <td><span className={`pay-badge ${m.paymentStatus === 'Pago Total' ? 'paid' : m.paymentStatus === 'Metade' ? 'half' : 'pending'}`}>{m.paymentStatus}</span></td>
                                    </tr>
                                ))}
                                {filtered.matriculations.length === 0 && <tr><td colSpan={6} className="empty">Sem registos no período seleccionado.</td></tr>}
                            </tbody>
                        </table>
                    )}

                    {/* STUDENTS TAB */}
                    {activeTab === 'students' && (
                        <table className="data-table">
                            <thead><tr><th>Nome</th><th>E-mail</th><th>Documento</th><th>Nacionalidade</th><th>Status</th><th>Registo</th></tr></thead>
                            <tbody>
                                {filtered.students.map(s => (
                                    <tr key={s.id}>
                                        <td className="bold">{s.name}</td>
                                        <td>{s.email}</td>
                                        <td>{s.idDocument || '—'}</td>
                                        <td>{s.nationality || '—'}</td>
                                        <td><span className={`status-pill ${s.status === 'Ativo' ? 'active' : 'inactive'}`}>{s.status}</span></td>
                                        <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                                    </tr>
                                ))}
                                {filtered.students.length === 0 && <tr><td colSpan={6} className="empty">Sem registos no período.</td></tr>}
                            </tbody>
                        </table>
                    )}

                    {/* TRAINERS TAB */}
                    {activeTab === 'trainers' && (
                        <table className="data-table">
                            <thead><tr><th>Nome</th><th>Especialidade</th><th>Email</th><th>Nationalidade</th><th>Status</th></tr></thead>
                            <tbody>
                                {data.trainers.map(t => (
                                    <tr key={t.id}>
                                        <td className="bold">{t.name}</td>
                                        <td>{t.specialty}</td>
                                        <td>{t.email || '—'}</td>
                                        <td>{t.nationality || '—'}</td>
                                        <td><span className={`status-pill ${t.status === 'Ativo' ? 'active' : 'inactive'}`}>{t.status}</span></td>
                                    </tr>
                                ))}
                                {data.trainers.length === 0 && <tr><td colSpan={5} className="empty">Nenhum formador registado.</td></tr>}
                            </tbody>
                        </table>
                    )}

                    {/* COURSES TAB */}
                    {activeTab === 'courses' && (
                        <table className="data-table">
                            <thead><tr><th>Curso</th><th>Duração</th><th>Status</th><th>Alunos Matriculados</th></tr></thead>
                            <tbody>
                                {data.courses.map(c => (
                                    <tr key={c.id}>
                                        <td className="bold">{c.title}</td>
                                        <td>{(c as any).duration}</td>
                                        <td><span className={`status-pill ${(c as any).status === 'Inscrições Abertas' ? 'active' : 'inactive'}`}>{(c as any).status}</span></td>
                                        <td><strong>{data.matriculations.filter(m => m.course === c.title).length}</strong></td>
                                    </tr>
                                ))}
                                {data.courses.length === 0 && <tr><td colSpan={4} className="empty">Nenhum curso cadastrado.</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            <style jsx>{`
                .page-wrapper { padding: 0.5rem; }
                .page-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .page-top h1 { font-size: 1.8rem; color: var(--navy-deep); margin: 0.25rem 0; font-weight: 800; }
                .page-top p { color: #64748b; margin: 0; font-size: 0.95rem; }
                .top-actions { display: flex; gap: 0.75rem; }
                .print-btn, .csv-btn { background: white; border: 1.5px solid #e2e8f0; color: #475569; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.9rem; transition: 0.2s; }
                .print-btn:hover, .csv-btn:hover { background: #f8fafc; border-color: var(--navy-deep); transform: translateY(-1px); }
                .csv-btn { border-color: #bae6fd; color: var(--ocean-blue); }
                .csv-btn:hover { background: #f0f9ff; border-color: var(--ocean-blue); }

                .filter-bar { display: flex; align-items: center; gap: 1.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 2rem; flex-wrap: wrap; }
                .filter-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .pill { padding: 0.45rem 1rem; border-radius: 50px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; font-size: 0.82rem; cursor: pointer; transition: 0.2s; }
                .pill.active { background: var(--navy-deep); color: white; border-color: var(--navy-deep); }
                .date-range { display: flex; align-items: center; gap: 0.75rem; }
                .date-range input { padding: 0.5rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; background: #f8fafc; }
                .date-range span { color: #94a3b8; font-weight: 600; }

                /* Charts Central Styles */
                .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
                .chart-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .chart-card.wide { grid-column: span 2; }
                .chart-card h3 { font-size: 0.9rem; color: #64748b; margin-bottom: 1.5rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                .chart-container { height: 250px; width: 100%; }

                .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
                .stat-card { background: white; border: 1px solid #e2e8f0; border-top: 4px solid; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
                .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
                .stat-val { font-size: 2rem; font-weight: 900; color: var(--navy-deep); }
                .stat-label { font-size: 0.82rem; color: #64748b; font-weight: 600; }

                .tabs { display: flex; gap: 0.25rem; margin-bottom: 0; }
                .tab { padding: 0.75rem 1.5rem; border: 1px solid #e2e8f0; border-bottom: none; border-radius: 10px 10px 0 0; background: #f8fafc; color: #64748b; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: 0.2s; }
                .tab.active { background: white; color: var(--navy-deep); border-color: #e2e8f0; }

                .table-wrap { background: white; border: 1px solid #e2e8f0; border-radius: 0 12px 12px 12px; overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th { background: #f8fafc; padding: 1rem 1.5rem; font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; border-bottom: 1px solid #e2e8f0; text-align: left; }
                .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
                .data-table tr:last-child td { border-bottom: none; }
                .bold { font-weight: 700; color: var(--navy-deep); }
                .empty { text-align: center; color: #94a3b8; padding: 2.5rem !important; }
                .loader { text-align: center; padding: 3rem; color: #94a3b8; }

                .status-pill { padding: 0.3rem 0.75rem; border-radius: 50px; font-size: 0.7rem; font-weight: 800; }
                .status-pill.active { background: #ecfdf5; color: #059669; }
                .status-pill.inactive { background: #f1f5f9; color: #64748b; }

                .pay-badge { padding: 0.3rem 0.65rem; border-radius: 50px; font-size: 0.7rem; font-weight: 800; }
                .pay-badge.paid { background: #ecfdf5; color: #059669; }
                .pay-badge.half { background: #fffbeb; color: #d97706; }
                .pay-badge.pending { background: #fef2f2; color: #dc2626; }

                @media print {
                    .no-print { display: none !important; }
                    .page-wrapper { padding: 0; }
                    .table-wrap { border: none; border-radius: 0; }
                    .stat-card { break-inside: avoid; }
                }

                @media (max-width: 1024px) {
                    .charts-grid { grid-template-columns: 1fr; }
                    .chart-card.wide { grid-column: auto; }
                    .stats-row { grid-template-columns: 1fr 1fr; }
                }
            `}</style>
        </div>
    );
}
