const fetch = require('node-fetch');

async function testApi() {
    console.log('--- Testing Courses API ---');
    try {
        const courseRes = await fetch('http://localhost:3000/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Curso de Teste ' + Date.now(),
                description: 'Desc',
                duration: '1 mes',
                status: 'Inscrições Abertas',
                materials: []
            })
        });
        const courseData = await courseRes.json();
        console.log('Course Response Status:', courseRes.status);
        console.log('Course Response Body:', JSON.stringify(courseData, null, 2));
    } catch (e) {
        console.error('Course API failed:', e.message);
    }

    console.log('\n--- Testing Classrooms API ---');
    try {
        const roomRes = await fetch('http://localhost:3000/api/classrooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Sala Teste ' + Date.now(),
                capacity: 30,
                location: 'Bloco Teste',
                availability: 'Disponível'
            })
        });
        const roomData = await roomRes.json();
        console.log('Classroom Response Status:', roomRes.status);
        console.log('Classroom Response Body:', JSON.stringify(roomData, null, 2));
    } catch (e) {
        console.error('Classroom API failed:', e.message);
    }
}

testApi();
