import fs from 'fs';
import path from 'path';

function findSqlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        results = results.concat(findSqlFiles(fullPath));
      }
    } else if (file.endsWith('.sql')) {
      results.push(fullPath);
    }
  });
  return results;
}

const sqlFiles = findSqlFiles('.');
console.log('SQL files found:', sqlFiles.length);

const allCreateTables = {};

sqlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_\.\"]+)\s*\(([\s\S]*?)\);/gi);
  for (const m of matches) {
    const tableName = m[1].replace(/public\./i, '').replace(/\"/g, '');
    if (!allCreateTables[tableName]) {
      allCreateTables[tableName] = { file: f, ddl: m[0] };
    }
  }
});

console.log('Unique Tables in SQL files:', Object.keys(allCreateTables));
for (const [tbl, info] of Object.entries(allCreateTables)) {
  console.log(`\n=================== ${tbl} (from ${info.file}) ===================`);
  console.log(info.ddl);
}
