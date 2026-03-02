import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

const updateSchema = () => {
    if (!fs.existsSync(DB_PATH)) {
        console.error('db.json not found');
        return;
    }

    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

    // Update Trainers structure
    data.trainers = data.trainers.map(t => ({
        ...t,
        fullName: t.name,
        idDocument: '',
        validity: '',
        photo: '',
        address: '',
        nationality: '',
        phone: t.phone || '',
        email: t.email || '',
        status: t.status || 'Ativo'
    }));

    // Update Students structure
    data.students = data.students.map(s => ({
        ...s,
        idDocument: '',
        validity: '',
        nationality: '',
        photo: '',
        phone: s.phone || '',
        email: s.email || ''
    }));

    // Update Courses structure
    data.courses = data.courses.map(c => ({
        ...c,
        description: '',
        materials: [] // { name, type, url }
    }));

    // Add Matriculations if not exists
    if (!data.matriculations) {
        data.matriculations = [];
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    console.log('Schema updated successfully.');
};

updateSchema();
