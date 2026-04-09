'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ClassSchedule {
    id: string;
    course: string;
    classroom: string;
    schedule: string;
    startDate: string;
    endDate?: string;
}

const DAYS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function CalendarPage() {
    const { data: session, status } = useSession();
    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!session?.user) return;
            setLoading(true);
            try {
                const userId = (session?.user as any)?.id;
                const userName = session?.user?.name;
                if (!userId) return;

                const [resM, resC] = await Promise.all([
                    fetch('/api/matriculations'),
                    fetch('/api/courses')
                ]);
                const allMatrics = await resM.json();
                const allCourses = await resC.json();
                
                // 1. Identify courses where this trainer is involved
                const matriculationCourseTitles = new Set(
                    allMatrics
                        .filter((m: any) => (m.trainerId === userId || m.trainer === userName))
                        .map((m: any) => m.course)
                );

                const profCourses = allCourses.filter((c: any) => 
                    (c.trainerId === userId) || 
                    (c.trainerName === userName) || 
                    matriculationCourseTitles.has(c.title)
                );

                // 2. Create schedule entries based on the courses and their matriculation details
                const uniqueSchedules: Record<string, ClassSchedule> = {};
                
                profCourses.forEach((c: any) => {
                    // Try to find the most representative matriculation for this course and trainer
                    const m = allMatrics.find((m: any) => 
                        (m.courseId === c.id || m.course === c.title) && 
                        (m.trainerId === userId || m.trainer === userName)
                    );

                    const key = `${c.title}-${m?.schedule || 'N/A'}-${m?.classroom || 'N/A'}`;
                    if (!uniqueSchedules[key]) {
                        uniqueSchedules[key] = {
                            id: c.id,
                            course: c.title,
                            classroom: m?.classroom || c.classroom || 'Sala a definir',
                            schedule: m?.schedule || c.schedule || 'Sem horário',
                            startDate: m?.startDate || c.startDate || 'A definir',
                            endDate: m?.endDate || c.endDate
                        };
                    }
                });
                
                setSchedules(Object.values(uniqueSchedules));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedules();
    }, [session]);

    const matchesDay = (schedule: string, day: string) => {
        const s = schedule.toLowerCase();
        const d = day.split('-')[0].toLowerCase(); // e.g., "segunda"
        
        // Basic contains
        if (s.includes(d)) return true;
        
        // Handlers for common ranges like "Segunda a Sexta"
        if (s.includes('segunda a sexta')) {
            const weekdays = ['segunda', 'terça', 'quarta', 'quinta', 'sexta'];
            return weekdays.includes(d);
        }

        // Handlers for "Terça e Quinta"
        if (s.includes('terça') && s.includes('quinta')) {
            return d === 'terça' || d === 'quinta';
        }

        // Abbreviation handlers (Seg, Ter, Qua, Qui, Sex, Sab)
        const mapping: Record<string, string> = {
            'seg': 'segunda',
            'ter': 'terça',
            'qua': 'quarta',
            'qui': 'quinta',
            'sex': 'sexta',
            'sab': 'sábado'
        };
        
        for (const [abbr, full] of Object.entries(mapping)) {
            if (s.includes(abbr) && d.startsWith(full)) return true;
        }

        return false;
    };

    if (status === 'loading') {
        return <div className="p-8 text-center text-gray-500">A carregar...</div>;
    }

    if (!session) {
        return <div className="p-8 text-center text-red-500">Acesso negado. Por favor inicie sessão.</div>;
    }

    return (
        <div className="calendar-page container">
            <div className="page-header">
                <div>
                    <div className="maritime-accent"></div>
                    <h1>Agenda Semanal</h1>
                    <p>Consulte o seu cronograma de aulas e salas atribuídas.</p>
                </div>
            </div>

            <div className="calendar-layout">
                {loading ? <div className="loader">A carregar agenda...</div> : (
                    <div className="schedule-grid">
                        {DAYS.map(day => (
                            <div key={day} className="day-column">
                                <div className="day-header">
                                    <h3>{day}</h3>
                                </div>
                                <div className="day-classes">
                                    {schedules.filter(s => matchesDay(s.schedule, day)).length > 0 ? (
                                        schedules.filter(s => matchesDay(s.schedule, day)).map(s => (
                                            <div key={s.id} className="class-card card shadow-sm">
                                                <div className="time-badge">{s.schedule.split(' ').pop()}</div>
                                                <div className="class-info">
                                                    <span className="course-name">{s.course}</span>
                                                    <span className="room-name">📍 {s.classroom}</span>
                                                </div>
                                                <div className="class-footer">
                                                    <small>Início: {s.startDate}</small>
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
                .page-header h1 { font-size: 1.8rem; color: var(--navy-deep); margin-top: 0.5rem; }
                
                .schedule-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; align-items: start; min-width: 1000px; }
                .day-column { display: flex; flex-direction: column; gap: 1rem; height: 100%; border-right: 1px solid #e2e8f0; padding-right: 1rem; }
                .day-column:last-child { border-right: none; padding-right: 0; }
                
                .day-header { padding: 1rem; border-radius: 12px; background: #0a2a5e; color: white; text-align: center; margin-bottom: 1rem; }
                .day-header h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; margin: 0; }
                
                .day-classes { display: flex; flex-direction: column; gap: 1rem; }
                .class-card { padding: 1rem; border-left: 4px solid var(--sand-gold); display: flex; flex-direction: column; gap: 0.75rem; transition: 0.2s; cursor: pointer; }
                .class-card:hover { transform: translateY(-3px); border-color: var(--ocean-blue); }
                
                .time-badge { font-size: 0.75rem; font-weight: 700; color: var(--ocean-blue); background: #f0f9ff; padding: 0.2rem 0.6rem; border-radius: 4px; display: inline-block; width: fit-content; }
                .class-info { display: flex; flex-direction: column; gap: 0.25rem; }
                .course-name { font-size: 0.9rem; font-weight: 700; color: var(--navy-deep); line-height: 1.3; }
                .room-name { font-size: 0.75rem; color: #64748b; font-weight: 600; }
                .class-footer { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #f1f5f9; }
                .class-footer small { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
                
                .no-classes { text-align: center; padding: 2rem 1rem; font-size: 0.75rem; color: #cbd5e1; font-style: italic; border: 1.5px dashed #f1f5f9; border-radius: 12px; }
                
                .loader { text-align: center; padding: 5rem; color: #94a3b8; grid-column: span 6; }
                
                .calendar-layout { overflow-x: auto; padding-bottom: 2rem; }
                .calendar-layout::-webkit-scrollbar { height: 8px; }
                .calendar-layout::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .calendar-layout::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }
            `}</style>
        </div>
    );
}
