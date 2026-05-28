import fs from 'fs';
import path from 'path';

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = dir + '/' + file;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, filesList);
    } else if (name.endsWith('.ts')) {
      filesList.push(name);
    }
  }
  return filesList;
}

const apiDir = path.join(process.cwd(), 'app/server/api');
const files = getFiles(apiDir);

let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;

  // Replace standard Kysely where clauses
  // e.g., .where('church_id', '=', session.user.church_id)
  // e.g., .where('t.church_id', '=', session.user.church_id)
  content = content.replace(
    /\.where\((['"`])([a-zA-Z0-9_.]*church_id)\1,\s*(['"`])=\3,\s*session\.user\.church_id\)/g,
    ".$if(event.context.userRole !== 0, (qb) => qb.where('$2', '=', event.context.churchId || session.user.church_id))"
  );

  // Replace inside template literals/sql tags
  // e.g., AND church_id = ${session.user.church_id}
  content = content.replace(
    /AND\s+([a-zA-Z0-9_.]*church_id)\s*=\s*\$\{session\.user\.church_id\}/g,
    "AND ($1 = ${event.context.churchId || session.user.church_id} OR ${event.context.userRole} = 0)"
  );
  
  // Replace direct assignments or usage of session.user.church_id for inserts/updates
  content = content.replace(
    /church_id:\s*session\.user\.church_id/g,
    "church_id: event.context.churchId || session.user.church_id"
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    modifiedCount++;
    console.log(`Modified: ${file}`);
  }
}

console.log(`\nTotal files modified: ${modifiedCount}`);
