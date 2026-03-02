import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

const trainers = [
    { id: '1', name: 'Capitão Ricardo Gomes', specialty: 'Navegação Costeira', students: 45, status: 'Ativo' },
    { id: '2', name: 'Mestre Afonso Neves', specialty: 'Segurança e Salvamento', students: 50, status: 'Ativo' },
    { id: '3', name: 'Dr. Ocean', specialty: 'Ciências Náuticas', students: 30, status: 'Ativo' }
];

const courses = [
    { id: '1', title: 'Navegação Costeira', duration: '40h', trainer: 'Capitão Ricardo Gomes', students: 12, status: 'Em andamento' },
    { id: '2', title: 'Segurança em Alto Mar', duration: '20h', trainer: 'Mestre Afonso Neves', students: 25, status: 'Inscrições Abertas' },
    { id: '3', title: 'Manutenção de Motores', duration: '60h', trainer: 'Eng. Carlos Porto', students: 8, status: 'Em andamento' }
];

const students = [
    { id: 'S1', name: 'João Silva', email: 'aluno@maritimo.com', phone: '1199999999', course: 'Navegação Costeira', status: 'Ativo', createdAt: new Date().toISOString() }
];

const adminPassword = await bcrypt.hash('admin123', 10);
const professorPassword = await bcrypt.hash('prof123', 10);
const studentPassword = await bcrypt.hash('aluno123', 10);

const db = {
    users: [
        { id: 'user_admin', name: 'Super Admin', email: 'admin@maritimo.com', role: 'SUPER_ADMIN', password: adminPassword, createdAt: new Date().toISOString() },
        { id: 'user_professor', name: 'Dr. Ocean', email: 'professor@maritimo.com', role: 'PROFESSOR', password: professorPassword, createdAt: new Date().toISOString() },
        { id: 'user_student', name: 'João Silva', email: 'aluno@maritimo.com', role: 'STUDENT', password: studentPassword, createdAt: new Date().toISOString() }
    ],
    courses,
    trainers,
    classrooms: [
        { id: '1', name: 'Sala Atlântico', capacity: 30, location: 'Bloco A, Piso 1', availability: 'Ocupada' },
        { id: '2', name: 'Sala Índico', capacity: 25, location: 'Bloco A, Piso 2', availability: 'Disponível' }
    ],
    students,
    enrollments: [],
    inscriptions: [
        { id: 'I1', name: 'Maria Souza', email: 'maria@teste.com', phone: '1188888888', course: 'Segurança em Alto Mar', message: 'Interesse imediato', createdAt: new Date().toISOString(), status: 'PENDING' }
    ]
};

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));

console.log('Database seeded successfully with all modules initialized.');
