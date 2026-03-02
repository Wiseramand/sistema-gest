const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'db.json');

async function reset() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('New Hash:', hash);

    if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        const user = data.users.find(u => u.email === 'admin@maritimo.com');
        if (user) {
            user.password = hash;
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
            console.log('Password updated for admin@maritimo.com');
        } else {
            console.log('Admin user not found');
        }
    }
}

reset();
