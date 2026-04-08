import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getAnySession } from '../../../../lib/auth';

export async function GET() {
  try {
    const session = await getAnySession();
    const user = session?.user as any;

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get all matriculations for this student to find their courses
    const matriculations = await db.matriculation.findMany({
      where: { studentId: user.id }
    });

    // 2. Extract course IDs and find associated courses
    const courseIds = matriculations.map(m => m.courseId).filter(Boolean) as string[];
    
    // Also check for enrollment model as a fallback/alternative
    const enrollments = await db.enrollment.findMany({
      where: { studentId: user.id }
    });
    const enrolledCourseIds = enrollments.map(e => e.courseId);
    
    const allCourseIds = Array.from(new Set([...courseIds, ...enrolledCourseIds]));

    const courses = await db.course.findMany({
      where: {
        id: { in: allCourseIds }
      }
    });

    // 3. Extract materials from courses
    // Course.materials is stored as a JSON string in the DB (based on api/[collection]/route.ts)
    let studentMaterials: any[] = [];
    
    courses.forEach((course: any) => {
      if (course.materials) {
        try {
          const mats = typeof course.materials === 'string' 
            ? JSON.parse(course.materials) 
            : course.materials;
            
          if (Array.isArray(mats)) {
            mats.forEach(m => {
              studentMaterials.push({
                ...m,
                courseName: course.title,
                courseId: course.id
              });
            });
          }
        } catch (e) {
          console.error('Error parsing materials for course:', course.id, e);
        }
      }
    });

    // 4. Fetch global materials for students
    const globalMaterials = await db.material.findMany({
      where: {
        OR: [
          { access: 'ALL' },
          { access: 'STUDENTS' }
        ]
      }
    });

    // 5. Combine and deduplicate
    const combined = [
      ...globalMaterials.map(m => ({
        id: m.id,
        name: m.name,
        url: m.url,
        type: m.type || (m.url?.endsWith('.mp4') ? 'Vídeo' : 'Documento'),
        category: 'Geral',
        courseName: 'Todos os Cursos',
        createdAt: m.createdAt
      })),
      ...studentMaterials.map(m => ({
        ...m,
        id: m.id || m.url, // Fallback to URL if ID missing
        type: m.type || (m.url?.endsWith('.mp4') ? 'Vídeo' : 'Documento')
      }))
    ];

    return NextResponse.json(combined);
  } catch (error: any) {
    console.error('Error fetching student materials:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
