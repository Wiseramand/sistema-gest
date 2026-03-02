async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/students');
        const students = await res.json();
        if (students.length === 0) {
            console.log('No students found to test.');
            return;
        }
        const student = students[0];
        console.log('Testing access generation for:', student.name, 'ID:', student.id);

        const resAccess = await fetch('http://localhost:3000/api/generate-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'student', id: student.id })
        });

        console.log('Status:', resAccess.status);
        const data = await resAccess.json();
        console.log('Response:', data);
    } catch (err) {
        console.error('Test Failed:', err.message);
    }
}

test();
