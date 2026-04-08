'use client';

import { useState, useEffect } from 'react';
import Pagination from '../../components/Pagination';

interface Course {
  id: string;
  title: string;
}

interface AttendanceRecord {
  id: string;
  courseId: string;
  date: string;
  records: string; // JSON string: { [studentId]: status }
  trainerId?: string;
}

interface StudentDay {
  date: string;
  status: string;
}

interface StudentSummary {
  studentId: string;
  name: string;
  days: StudentDay[];
  presenceCount: number;
  absenceCount: number;
  percentage: number;
}

const PER_PAGE = 10;

export default function AdminAttendancePage() {
  // View controller: 'courses' | 'course' | 'student'
  const [view, setView] = useState<'courses' | 'course' | 'student'>('courses');

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [coursePage, setCoursePage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, []);

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
    setView('course');
    setStudentPage(1);
    setLoadingRecords(true);
    try {
      const [attRes, matRes] = await Promise.all([
        fetch(`/api/attendance?course=${course.id}`),
        fetch(`/api/matriculations?courseId=${course.id}`)
      ]);
      const attData = await attRes.json();
      const matData = await matRes.json();
      
      setAttendanceRecords(Array.isArray(attData) ? attData : []);
      
      const names: Record<string, string> = {};
      if (Array.isArray(matData)) {
        matData.forEach((m: any) => { names[m.studentId] = m.studentName || m.studentId; });
      }
      setStudentNames(names);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecords(false);
    }
  }

  // Build per-student summaries from attendance records
  function buildStudentSummaries(): StudentSummary[] {
    const studentMap: Record<string, { name: string; days: StudentDay[] }> = {};

    attendanceRecords.forEach(record => {
      try {
        const recs = JSON.parse(record.records || '{}');
        Object.entries(recs).forEach(([studentId, status]) => {
          if (!studentMap[studentId]) {
            studentMap[studentId] = { name: studentNames[studentId] || studentId, days: [] };
          }
          studentMap[studentId].days.push({ date: record.date, status: status as string });
        });
      } catch (e) {}
    });

    return Object.entries(studentMap).map(([studentId, data]) => {
      const presenceCount = data.days.filter(d => d.status === 'Presente').length;
      const total = data.days.length;
      return {
        studentId,
        name: data.name,
        days: data.days.sort((a, b) => a.date.localeCompare(b.date)),
        presenceCount,
        absenceCount: total - presenceCount,
        percentage: total > 0 ? Math.round((presenceCount / total) * 100) : 0,
      };
    });
  }

  function openStudentHistory(summary: StudentSummary) {
    setSelectedStudent(summary);
    setHistoryPage(1);
    setView('student');
  }

  function printPage() {
    window.print();
  }

  const studentSummaries = buildStudentSummaries();
  const pagedCourses = courses.slice((coursePage - 1) * PER_PAGE, coursePage * PER_PAGE);
  const pagedStudents = studentSummaries.slice((studentPage - 1) * PER_PAGE, studentPage * PER_PAGE);
  const pagedHistory = selectedStudent?.days.slice((historyPage - 1) * PER_PAGE, historyPage * PER_PAGE) || [];

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="page-header no-print">
        <div className="header-nav">
          <div>
            <h1>📊 Frequência a Aulas / Presenças</h1>
            <p>Monitoramento de assiduidade dos formandos por curso.</p>
          </div>
          {view !== 'courses' && (
            <div className="breadcrumb">
              <button onClick={() => setView('courses')} className="crumb">Todos os Cursos</button>
              {selectedCourse && <><span>›</span><button onClick={() => setView('course')} className="crumb">{selectedCourse.title}</button></>}
              {view === 'student' && selectedStudent && <><span>›</span><span className="crumb active">{selectedStudent.name}</span></>}
            </div>
          )}
        </div>
        {view !== 'courses' && (
          <button className="btn-print" onClick={printPage}>🖨️ Imprimir / Gerar PDF</button>
        )}
      </div>

      {/* Print Header - only shows when printing */}
      <div className="print-only print-header">
        <h1>Marítimo Training Center</h1>
        <h2>
          {view === 'course' && selectedCourse ? `Frequências — ${selectedCourse.title}` : ''}
          {view === 'student' && selectedStudent ? `Histórico de ${selectedStudent.name}` : ''}
        </h2>
        <p>Gerado em: {new Date().toLocaleDateString('pt-PT')}</p>
      </div>

      {/* COURSES VIEW */}
      {view === 'courses' && (
        <div className="card">
          <h2>Selecione um Curso para Ver as Presenças</h2>
          {loading ? (
            <div className="loader">A carregar cursos...</div>
          ) : courses.length === 0 ? (
            <div className="empty">Nenhum curso disponível.</div>
          ) : (
            <>
              <div className="courses-list">
                {pagedCourses.map(c => (
                  <button key={c.id} className="course-row" onClick={() => selectCourse(c)}>
                    <span className="course-icon">📚</span>
                    <span className="course-name">{c.title}</span>
                    <span className="arrow">Ver Presenças →</span>
                  </button>
                ))}
              </div>
              <Pagination total={courses.length} perPage={PER_PAGE} page={coursePage} onChange={setCoursePage} />
            </>
          )}
        </div>
      )}

      {/* COURSE DETAIL VIEW */}
      {view === 'course' && selectedCourse && (
        <div className="card">
          <div className="card-header">
            <h2>{selectedCourse.title}</h2>
            <span className="total-badge">{studentSummaries.length} formandos · {attendanceRecords.length} sessões registadas</span>
          </div>

          {loadingRecords ? (
            <div className="loader">A carregar registos...</div>
          ) : studentSummaries.length === 0 ? (
            <div className="empty">Nenhum registo de presenças encontrado para este curso.</div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nome do Formando</th>
                    <th>Sessões Presentes</th>
                    <th>Faltas</th>
                    <th>Taxa de Presença</th>
                    <th>Estado</th>
                    <th className="no-print">Histórico</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedStudents.map((s, i) => (
                    <tr key={s.studentId}>
                      <td className="row-num">{(studentPage - 1) * PER_PAGE + i + 1}</td>
                      <td className="bold">{s.name}</td>
                      <td><span className="badge-present">{s.presenceCount} presentes</span></td>
                      <td><span className="badge-absent">{s.absenceCount} faltas</span></td>
                      <td>
                        <div className="progress-wrap">
                          <div className="progress-bar" style={{ width: `${s.percentage}%`, background: s.percentage >= 75 ? '#10b981' : s.percentage >= 50 ? '#f59e0b' : '#ef4444' }} />
                          <span>{s.percentage}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${s.percentage >= 75 ? 'success' : s.percentage >= 50 ? 'warning' : 'danger'}`}>
                          {s.percentage >= 75 ? 'Conforme' : s.percentage >= 50 ? 'Aviso' : 'Crítico'}
                        </span>
                      </td>
                      <td className="no-print">
                        <button className="btn-history" onClick={() => openStudentHistory(s)}>📋 Histórico</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="no-print">
                <Pagination total={studentSummaries.length} perPage={PER_PAGE} page={studentPage} onChange={setStudentPage} />
              </div>
            </>
          )}
        </div>
      )}

      {/* STUDENT HISTORY VIEW */}
      {view === 'student' && selectedStudent && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Histórico: {selectedStudent.name}</h2>
              <p className="course-label">Curso: {selectedCourse?.title}</p>
            </div>
            <div className="summary-stats">
              <span className="badge-present">{selectedStudent.presenceCount} presenças</span>
              <span className="badge-absent">{selectedStudent.absenceCount} faltas</span>
              <span className={`big-percent ${selectedStudent.percentage >= 75 ? 'ok' : 'risk'}`}>{selectedStudent.percentage}%</span>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Data da Sessão</th>
                <th>Estado de Presença</th>
              </tr>
            </thead>
            <tbody>
              {pagedHistory.map((day, i) => (
                <tr key={day.date} className={day.status !== 'Presente' ? 'absent-row' : ''}>
                  <td className="row-num">{(historyPage - 1) * PER_PAGE + i + 1}</td>
                  <td>{new Date(day.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  <td>
                    <span className={`status-badge ${day.status === 'Presente' ? 'success' : day.status === 'Justificada' ? 'warning' : 'danger'}`}>
                      {day.status === 'Presente' ? '✅' : day.status === 'Justificada' ? '⚠️' : '❌'} {day.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="no-print">
            <Pagination total={selectedStudent.days.length} perPage={PER_PAGE} page={historyPage} onChange={setHistoryPage} />
          </div>
        </div>
      )}

      <style jsx>{`
        .page-wrap { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { background: linear-gradient(135deg, #0a2a5e 0%, #173b7d 100%); padding: 1.5rem 2rem; border-radius: 16px; color: white; display: flex; justify-content: space-between; align-items: flex-start; }
        .page-header h1 { font-family: 'Outfit', sans-serif; font-size: 1.7rem; margin-bottom: 0.25rem; color: #F5C518; }
        .page-header p { color: #cbd5e1; font-size: 0.9rem; }
        .header-nav { display: flex; flex-direction: column; gap: 0.75rem; }

        .breadcrumb { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .crumb { background: rgba(255,255,255,0.15); border: none; color: white; padding: 0.3rem 0.75rem; border-radius: 20px; font-size: 0.8rem; cursor: pointer; font-weight: 600; transition: 0.2s; }
        .crumb:hover { background: rgba(255,255,255,0.25); }
        .crumb.active { background: #F5C518; color: #000; cursor: default; }
        .breadcrumb span { color: rgba(255,255,255,0.5); }

        .btn-print { background: #F5C518; color: #000; border: none; padding: 0.65rem 1.25rem; border-radius: 10px; font-weight: 800; cursor: pointer; transition: 0.2s; font-size: 0.9rem; white-space: nowrap; }
        .btn-print:hover { background: #eab308; transform: translateY(-2px); }

        .card { background: white; border-radius: 16px; padding: 2rem; border: 1px solid #e2e8f0; }
        .card h2 { color: #0a2a5e; font-family: 'Outfit', sans-serif; margin-bottom: 1.25rem; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .card-header h2 { margin: 0 0 0.35rem; }
        .course-label { color: #64748b; font-size: 0.85rem; margin: 0; }

        .courses-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .course-row { display: flex; align-items: center; gap: 1rem; padding: 1.1rem 1.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: 0.2s; text-align: left; }
        .course-row:hover { border-color: #0a2a5e; background: #eff6ff; transform: translateX(4px); }
        .course-icon { font-size: 1.2rem; }
        .course-name { font-weight: 700; color: #0a2a5e; font-family: 'Outfit', sans-serif; flex: 1; }
        .arrow { font-size: 0.85rem; color: #64748b; font-weight: 600; white-space: nowrap; }
        .total-badge { font-size: 0.8rem; color: #64748b; background: #f1f5f9; padding: 0.35rem 0.85rem; border-radius: 20px; font-weight: 600; white-space: nowrap; }

        .summary-stats { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .big-percent { font-size: 1.5rem; font-weight: 900; font-family: 'Outfit', sans-serif; }
        .big-percent.ok { color: #059669; }
        .big-percent.risk { color: #dc2626; }

        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; padding: 0.8rem 1rem; background: #f8fafc; color: #475569; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid #e2e8f0; }
        .data-table td { padding: 0.9rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #0f1e35; }
        .absent-row { background: #fff8f8; }
        .row-num { color: #94a3b8; font-size: 0.8rem; width: 40px; }
        .bold { font-weight: 700; color: #0a2a5e; }

        .badge-present { background: #ecfdf5; color: #059669; padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
        .badge-absent { background: #fff1f2; color: #dc2626; padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }

        .progress-wrap { display: flex; align-items: center; gap: 0.5rem; }
        .progress-bar { height: 6px; border-radius: 3px; min-width: 4px; max-width: 80px; transition: width 0.3s; }
        .progress-wrap span { font-weight: 700; font-size: 0.85rem; color: #334155; }

        .status-badge { padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.78rem; font-weight: 800; }
        .status-badge.success { background: #ecfdf5; color: #059669; }
        .status-badge.warning { background: #fffbeb; color: #d97706; }
        .status-badge.danger { background: #fff1f2; color: #dc2626; }

        .btn-history { background: #eff6ff; color: #0a2a5e; border: 1px solid #bfdbfe; padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: 0.15s; }
        .btn-history:hover { background: #dbeafe; }

        .loader, .empty { text-align: center; padding: 3rem; color: #94a3b8; }

        /* Print styles */
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .page-header { display: none; }
          .card { border: none; padding: 0; }
          .data-table th { background: #f0f0f0 !important; -webkit-print-color-adjust: exact; }
          .absent-row { background: #fff0f0 !important; -webkit-print-color-adjust: exact; }
        }
        .print-only { display: none; }
        .print-header { text-align: center; border-bottom: 2px solid #0a2a5e; padding-bottom: 1rem; margin-bottom: 1.5rem; }
        .print-header h1 { color: #0a2a5e; font-size: 1.5rem; margin-bottom: 0.25rem; }
        .print-header h2 { color: #334155; font-size: 1.2rem; margin-bottom: 0.25rem; }
        .print-header p { color: #64748b; font-size: 0.85rem; }
      `}</style>
    </div>
  );
}
