import fs from 'fs';
import { execSync } from 'child_process';

const html = fs.readFileSync('tienda.html', 'utf8');
const scriptRegex = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const code = match[1];
  const tmpPath = `scratch/tmp_tienda_script_${count}.js`;
  fs.writeFileSync(tmpPath, code, 'utf8');
  try {
    execSync(`node --check ${tmpPath}`);
    console.log(`✓ Script block ${count} syntax OK`);
    fs.unlinkSync(tmpPath);
  } catch (err) {
    console.error(`✗ Syntax error in script block ${count}`);
    process.exit(1);
  }
}
console.log(`All ${count} inline script blocks passed syntax check!`);
