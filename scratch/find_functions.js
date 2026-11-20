import fs from 'fs';

const files = [
  'scratch/full_supabase_schema.sql',
  'scratch/supabase_security_setup.sql',
  'scratch/supabase_security_hardening.sql',
  'scratch/migration_strict_rls_orders_pickups.sql'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  console.log('=== ' + f + ' Functions & Triggers ===');
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+([a-zA-Z0-9_\.]+)\s*\(([\s\S]*?)\)\s*RETURNS\s+([\s\S]*?)\$\$/gi);
  for (const m of matches) {
    console.log(`Function: ${m[1]}`);
  }
});
