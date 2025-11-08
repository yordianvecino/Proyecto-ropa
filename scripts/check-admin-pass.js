const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function main() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  const m = content.match(/^ADMIN_PASSWORD_HASH\s*=\s*"?([^"]+)"?/m);
  if (!m) {
    console.error('ADMIN_PASSWORD_HASH no encontrado en .env.local');
    process.exit(1);
  }
  const hash = m[1].trim();
  const password = process.argv[2] || '';
  if (!password) {
    console.error('Uso: node scripts/check-admin-pass.js <password>');
    process.exit(1);
  }
  const ok = await bcrypt.compare(password, hash);
  console.log('match?', ok);
  console.log('hash length:', hash.length);
}

main().catch(err => { console.error(err); process.exit(1); });
