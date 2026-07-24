'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Pagination from '../../components/Pagination';

interface Course {
  id: string;
  title: string;
  startDate?: string;
  endDate?: string;
}

interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  status: string;
}

type AttendanceStatus = 'Presente' | 'Falta' | 'Justificada';

const PER_PAGE = 10;

export default function TrainerAttendancePage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [coursePage, setCoursePage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);

  const today = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    fetchCourses();
  }, [session]);

  async function fetchCourses() {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function selectCourse(course: Course) {
    setSelectedCourse(course);
    setSubmitted(false);
    setConfirmed(false);
    setStudentPage(1);
    setLoadingStudents(true);
    try {
      // Fetch enrolled students for this course
      const res = await fetch(`/api/matriculations?courseId=${course.id}`);
      const data = await res.json();
      const enrolled: Enrollment[] = Array.isArray(data) ? data : [];
      setEnrollments(enrolled);

      // Check if attendance already submitted today
      const attRes = await fetch(`/api/attendance?course=${course.id}&date=${today}`);
      const attData = await attRes.json();
      if (Array.isArray(attData) && attData.length > 0) {
        const existing = JSON.parse(attData[0].records || '{}');
        setAttendance(existing);
        setSubmitted(true);
      } else {
        // Default everyone to Presente
        const defaultAtt: Record<string, AttendanceStatus> = {};
        enrolled.forEach(e => { defaultAtt[e.studentId] = 'Presente'; });
        setAttendance(defaultAtt);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudents(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse || !confirmed) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          date: today,
          trainerId: (session?.user as any)?.id,
          records: JSON.stringify(attendance),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Erro ao submeter presenças. Tente novamente.');
      }
    } catch (e) {
      alert('Erro de rede. Verifique a sua ligação.');
    } finally {
      setSubmitting(false);
    }
  }

  const pagedCourses = courses.slice((coursePage - 1) * PER_PAGE, coursePage * PER_PAGE);
  const pagedStudents = enrollments.slice((studentPage - 1) * PER_PAGE, studentPage * PER_PAGE);

  const presentCount = Object.values(attendance).filter(v => v === 'Presente').length;
  const absentCount = Object.values(attendance).filter(v => v !== 'Presente').length;

  return (
    <div className="attendance-wrap">
      <div className="header">
        <h1>📋 Diário de Turma Eletrónico</h1>
        <p>Registo diário de presenças e faltas dos formandos.</p>
        <div className="header-date">📅 {todayFormatted}</div>
      </div>

      {!selectedCourse ? (
        <div className="card">
          <h2>Selecione o Curso para Registar Presenças</h2>
          {loading ? (
            <div className="loader">A carregar cursos...</div>
          ) : courses.length === 0 ? (
            <div className="empty">Nenhum curso disponível de momento.</div>
          ) : (
            <>
              <div className="courses-grid">
                {pagedCourses.map(c => (
                  <button key={c.id} className="course-card" onClick={() => selectCourse(c)}>
                    <span className="course-icon">📚</span>
                    <div>
                      <h3>{c.title}</h3>
                      {c.startDate && <span>{c.startDate} → {c.endDate || 'Em curso'}</span>}
                    </div>
                    <span className="arrow">→</span>
                  </button>
                ))}
              </div>
              <Pagination total={courses.length} perPage={PER_PAGE} page={coursePage} onChange={setCoursePage} />
            </>
          )}
        </div>
      ) : submitted ? (
        <div className="card success-card">
          <div className="success-icon">✅</div>
          <h2>Presenças Registadas com Sucesso!</h2>
          <p>O registo do dia <strong>{new Date(today).toLocaleDateString('pt-PT')}</strong> para o curso <strong>{selectedCourse.title}</strong> foi submetido ao controlo académico.</p>
          <div className="summary-badges">
            <span className="badge-present">✅ {presentCount} Presentes</span>
            <span className="badge-absent">❌ {absentCount} Ausentes</span>
          </div>
          <button className="btn-back" onClick={() => setSelectedCourse(null)}>← Voltar aos Cursos</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="list-top">
              <div>
                <h2>{selectedCourse.title}</h2>
                <span className="date-badge">📅 {new Date(today).toLocaleDateString('pt-PT')}</span>
              </div>
              <button type="button" className="btn-back-sm" onClick={() => setSelectedCourse(null)}>← Mudar Curso</button>
            </div>

            {loadingStudents ? (
              <div className="loader">A carregar formandos inscritos...</div>
            ) : enrollments.length === 0 ? (
              <div className="empty">Nenhum formando inscrito neste curso.</div>
            ) : (
              <>
                <div className="stats-bar">
                  <span className="stat-present">✅ Presentes: <strong>{presentCount}</strong></span>
                  <span className="stat-absent">❌ Ausentes: <strong>{absentCount}</strong></span>
                  <span className="stat-total">👥 Total: <strong>{enrollments.length}</strong></span>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nome do Formando</th>
                        <th style={{ textAlign: 'center' }}>Presença de Hoje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedStudents.map((enr, i) => (
                        <tr key={enr.studentId} className={attendance[enr.studentId] !== 'Presente' ? 'absent-row' : ''}>
                          <td className="row-num">{(studentPage - 1) * PER_PAGE + i + 1}</td>
                          <td className="student-name">{enr.studentName || 'Aluno sem nome'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="toggle-group">
                              {(['Presente', 'Falta', 'Justificada'] as AttendanceStatus[]).map(status => (
                                <button
                                  key={status}
                                  type="button"
                                  className={`toggle-btn ${attendance[enr.studentId] === status ? 'selected ' + status.toLowerCase() : ''}`}
                                  onClick={() => setAttendance(prev => ({ ...prev, [enr.studentId]: status }))}
                                >
                                  {status === 'Presente' ? '✅' : status === 'Falta' ? '❌' : '⚠️'} {status}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination total={enrollments.length} perPage={PER_PAGE} page={studentPage} onChange={setStudentPage} />
              </>
            )}
          </div>

          {enrollments.length > 0 && (
            <div className="card submit-card">
              <label className="confirm-check">
                <input type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
                <span>Confirmo que os registos acima representam a assiduidade real da sessão de hoje e assumo responsabilidade pela sua veracidade.</span>
              </label>
              <button type="submit" className="btn-submit" disabled={submitting || !confirmed}>
                {submitting ? 'A submeter...' : '📤 Submeter para Controlo Académico'}
              </button>
            </div>
          )}
        </form>
      )}

      <style jsx>{`
        .attendance-wrap { display: flex; flex-direction: column; gap: 1.5rem; max-width: 1000px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #2D180F 0%, #173b7d 100%); padding: 2rem; border-radius: 16px; color: white; }
        .header h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 0.5rem; color: #E6C5A8; }
        .header p { color: #cbd5e1; margin-bottom: 0.5rem; }
        .header-date { background: rgba(255,255,255,0.1); display: inline-block; padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.85rem; color: white; font-weight: 600; margin-top: 0.5rem; }

        .card { background: white; border-radius: 16px; padding: 2rem; border: 1px solid #e2e8f0; }
        .card h2 { color: #2D180F; font-family: 'Outfit', sans-serif; margin-bottom: 1.5rem; }

        .courses-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .course-card { display: flex; align-items: center; gap: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem 1.5rem; cursor: pointer; transition: 0.2s; text-align: left; }
        .course-card:hover { border-color: #2D180F; background: #FDF2E9; transform: translateX(4px); }
        .course-card h3 { color: #2D180F; font-family: 'Outfit', sans-serif; margin: 0 0 0.25rem; }
        .course-card span { font-size: 0.8rem; color: #64748b; }
        .course-icon { font-size: 1.5rem; }
        .arrow { margin-left: auto; color: #94a3b8; font-size: 1.2rem; }

        .list-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
        .list-top h2 { margin: 0 0 0.5rem; color: #2D180F; font-family: 'Outfit', sans-serif; }
        .date-badge { background: #F7ECE1; color: #9A3412; padding: 0.3rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }

        .stats-bar { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 10px; }
        .stat-present { color: #059669; font-size: 0.9rem; }
        .stat-absent { color: #dc2626; font-size: 0.9rem; }
        .stat-total { color: #475569; font-size: 0.9rem; }

        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 0.85rem 1rem; background: #f8fafc; color: #475569; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; }
        td { padding: 0.85rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
        .absent-row { background: #fff5f5; }
        .row-num { color: #94a3b8; font-size: 0.8rem; width: 40px; }
        .student-name { font-weight: 700; color: #2D180F; }

        .toggle-group { display: flex; gap: 0.4rem; justify-content: center; flex-wrap: wrap; }
        .toggle-btn { border: 1px solid #e2e8f0; background: white; padding: 0.35rem 0.65rem; border-radius: 8px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: 0.15s; color: #475569; }
        .toggle-btn:hover { background: #f1f5f9; }
        .toggle-btn.selected.presente { background: #ecfdf5; border-color: #059669; color: #059669; }
        .toggle-btn.selected.falta { background: #fff1f2; border-color: #dc2626; color: #dc2626; }
        .toggle-btn.selected.justificada { background: #F7ECE1; border-color: #9A3412; color: #9A3412; }

        .submit-card { display: flex; flex-direction: column; gap: 1.25rem; }
        .confirm-check { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.9rem; color: #475569; cursor: pointer; line-height: 1.5; }
        .confirm-check input { margin-top: 3px; width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }
        .btn-submit { background: #2D180F; color: white; border: none; padding: 1.1rem 2rem; border-radius: 10px; font-weight: 800; font-size: 1rem; cursor: pointer; transition: 0.2s; font-family: 'Outfit', sans-serif; }
        .btn-submit:hover:not(:disabled) { background: #173b7d; transform: translateY(-2px); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-back { background: #2D180F; color: white; border: none; padding: 0.85rem 1.75rem; border-radius: 10px; font-weight: 700; cursor: pointer; margin-top: 1rem; }
        .btn-back-sm { background: white; border: 1px solid #e2e8f0; color: #64748b; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.85rem; }
        .btn-back-sm:hover { background: #f1f5f9; }

        .success-card { text-align: center; padding: 3rem 2rem; }
        .success-icon { font-size: 4rem; margin-bottom: 1rem; }
        .success-card h2 { color: #059669; margin-bottom: 0.75rem; font-family: 'Outfit', sans-serif; }
        .success-card p { color: #475569; margin-bottom: 1.5rem; line-height: 1.6; }
        .summary-badges { display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem; }
        .badge-present { background: #ecfdf5; color: #059669; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; }
        .badge-absent { background: #fff1f2; color: #dc2626; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; }

        .loader, .empty { text-align: center; padding: 3rem; color: #94a3b8; }
      `}</style>
    </div>
  );
}
