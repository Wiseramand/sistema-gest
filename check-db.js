const fs = require('fs');
const path = require('path');

try {
    const dbPath = path.join(__dirname, 'data', 'db.json');
    console.log('Checking:', dbPath);
    const content = fs.readFileSync(dbPath, 'utf-8');
    const data = JSON.parse(content);
    console.log('Keys:', Object.keys(data));
    for (const key in data) {
        if (Array.isArray(data[key])) {
            console.log(`- ${key}: ${data[key].length} items`);
        }
    }
    console.log('JSON is valid and readable.');
} catch (err) {
    console.error('Integrity Check Failed:', err.message);
}
