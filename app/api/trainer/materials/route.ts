import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getAnySession } from '../../../../lib/auth';

export async function GET() {
  try {
    const session = await getAnySession();
    const user = session?.user as any;

    if (!user || user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get all courses assigned to this trainer
    // Course model has trainerId or trainerName/trainer fields
    const courses = await db.course.findMany({
      where: {
        OR: [
          { trainerId: user.id },
          { trainerName: user.name }
        ]
      }
    });

    // Also check matriculations as trainers can be assigned there too
    const matriculations = await db.matriculation.findMany({
        where: { trainerId: user.id }
    });
    const extraCourseIds = matriculations.map(m => m.courseId).filter(Boolean) as string[];

    const allCourses = await db.course.findMany({
        where: {
            OR: [
                { id: { in: Array.from(new Set([...courses.map(c => c.id), ...extraCourseIds])) } }
            ]
        }
    });

    // 2. Extract materials from courses
    let trainerMaterials: any[] = [];
    allCourses.forEach((course: any) => {
      if (course.materials) {
        try {
          const mats = typeof course.materials === 'string' 
            ? JSON.parse(course.materials) 
            : course.materials;
            
          if (Array.isArray(mats)) {
            mats.forEach(m => {
              trainerMaterials.push({
                ...m,
                courseName: course.title,
                courseId: course.id
              });
            });
          }
        } catch (e) {
          console.error('Error parsing materials for trainer course:', course.id, e);
        }
      }
    });

    // 3. Fetch global materials for trainers
    const globalMaterials = await db.material.findMany({
      where: {
        OR: [
          { access: 'ALL' },
          { access: 'PROFESSORS' }
        ]
      }
    });

    // 4. Combine and deduplicate
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
      ...trainerMaterials.map(m => ({
        ...m,
        id: m.id || m.url,
        type: m.type || (m.url?.endsWith('.mp4') ? 'Vídeo' : 'Documento')
      }))
    ];

    return NextResponse.json(combined);
  } catch (error: any) {
    console.error('Error fetching trainer materials:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
