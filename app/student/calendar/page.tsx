'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ClassSchedule {
    id: string;
    course: string;
    classroom: string;
    schedule: string;
    trainer: string;
    startDate: string;
}

const DAYS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function StudentCalendarPage() {
    const { data: session } = useSession();
    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!session?.user) return;
            setLoading(true);
            try {
                const userId = (session.user as any).id;
                const res = await fetch('/api/matriculations');
                const data = await res.json();
                
                // Filter student's active matriculations
                const myMatrics = data.filter((m: any) => m.studentId === userId && m.status === 'Ativo');
                
                const list = myMatrics.map((m: any) => ({
                    id: m.id,
                    course: m.course,
                    classroom: m.classroom || 'Sala Marítimo',
                    schedule: m.schedule || 'A definir',
                    trainer: m.trainer || 'Formador Central',
                    startDate: m.startDate || 'N/A'
                }));
                
                setSchedules(list);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedules();
    }, [session]);

    return (
        <div className="calendar-page container">
            <div className="page-header">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Agenda de Aulas</h1>
                    <p>Consulte o seu cronograma semanal de formação e salas atribuídas.</p>
                </div>
            </div>

            <div className="calendar-layout">
                {loading ? <div className="loader pink">A preparar o seu cronograma...</div> : (
                    <div className="schedule-grid">
                        {DAYS.map(day => (
                            <div key={day} className="day-column">
                                <div className="day-header">
                                    <h3>{day}</h3>
                                </div>
                                <div className="day-classes">
                                    {schedules.filter(s => s.schedule.includes(day.split('-')[0])).length > 0 ? (
                                        schedules.filter(s => s.schedule.includes(day.split('-')[0])).map(s => (
                                            <div key={s.id} className="class-card card shadow-sm">
                                                <div className="time-badge">{s.schedule.split(' ').pop()}</div>
                                                <div className="class-info">
                                                    <span className="course-name">{s.course}</span>
                                                    <span className="trainer-name">👤 {s.trainer}</span>
                                                    <span className="room-name">📍 {s.classroom}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-classes">Sem aulas agendadas</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .calendar-page { padding: 1rem 0; }
                .page-header { margin-bottom: 2.5rem; }
                .page-header h1 { font-size: 1.8rem; color: #2D180F; margin-top: 0.5rem; }
                
                .schedule-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; align-items: start; min-width: 1000px; }
                .day-column { display: flex; flex-direction: column; gap: 1rem; height: 100%; }
                
                .day-header { padding: 1rem; border-radius: 12px; background: #f8fafc; color: #334155; text-align: center; border: 1.5px solid #edf2f7; }
                .day-header h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; margin: 0; }
                
                .day-classes { display: flex; flex-direction: column; gap: 1rem; }
                .class-card { padding: 1rem; border-left: 4px solid #EA580C; display: flex; flex-direction: column; gap: 0.75rem; transition: 0.2s; cursor: pointer; background: white; }
                .class-card:hover { transform: translateY(-3px); border-color: #2D180F; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
                
                .time-badge { font-size: 0.75rem; font-weight: 800; color: #EA580C; background: #FDF2E9; padding: 0.2rem 0.6rem; border-radius: 4px; display: inline-block; width: fit-content; }
                .class-info { display: flex; flex-direction: column; gap: 0.35rem; }
                .course-name { font-size: 0.95rem; font-weight: 800; color: #0f172a; line-height: 1.3; }
                .trainer-name, .room-name { font-size: 0.75rem; color: #64748b; font-weight: 600; }
                
                .no-classes { text-align: center; padding: 2rem 1rem; font-size: 0.75rem; color: #94a3b8; font-style: italic; border: 1.5px dashed #edf2f7; border-radius: 12px; }
                
                .loader { text-align: center; padding: 5rem; color: #94a3b8; grid-column: span 6; font-weight: 700; }
                
                .calendar-layout { overflow-x: auto; padding-bottom: 2rem; }
            `}</style>
        </div>
    );
}
