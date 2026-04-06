const fs = require('fs');
const path = require('path');

const files = [
  'app/api/upload/route.ts',
  'app/api/media/route.ts',
  'app/api/matriculations/[id]/route.ts',
  'app/api/matriculations/route.ts',
  'app/api/materials/[id]/route.ts',
  'app/api/materials/route.ts',
  'app/api/generate-access/route.ts',
  'app/api/feedbacks/route.ts',
  'app/api/chat/route.ts',
  'app/api/certificates/[id]/route.ts',
  'app/api/certificates/route.ts',
  'app/api/adminusers/route.ts',
  'app/api/activity-logs/route.ts'
];

const basePath = 'c:/Users/KMS-TIC-002/Downloads/sistema-gest-main/sistema-gest-main';

files.forEach(fileRelPath => {
  const fullPath = path.join(basePath, fileRelPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // 1. Update imports
  // Replace: import { authOptions } from '.../lib/auth';
  // With: import { getAnySession } from '.../lib/auth';
  content = content.replace(/import\s*{\s*([^}]*?)authOptions([^}]*?)\s*}\s*from\s*['"](.*?)lib\/auth['"]/g, (match, p1, p2, p3) => {
    let parts = [p1.trim(), p2.trim()].filter(p => p && p !== ',');
    if (parts.length > 0) {
      return `import { ${parts.join(', ')}, getAnySession } from '${p3}lib/auth'`;
    } else {
      return `import { getAnySession } from '${p3}lib/auth'`;
    }
  });

  // Remove getServerSession import from next-auth if it exists and is no longer needed
  // This is complex, so we'll just focus on the helper replacement first.
  content = content.replace(/import\s*{\s*([^}]*?)getServerSession([^}]*?)\s*}\s*from\s*['"]next-auth['"]/g, (match, p1, p2) => {
      let parts = [p1.trim(), p2.trim()].filter(p => p && p !== ',');
      if (parts.length > 0) {
          return `import { ${parts.join(', ')} } from 'next-auth'`;
      }
      return ''; // Remove entirely if empty
  });

  // 2. Replace getServerSession(authOptions) with getAnySession()
  content = content.replace(/getServerSession\(\s*authOptions\s*\)/g, 'getAnySession()');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${fileRelPath}`);
});
