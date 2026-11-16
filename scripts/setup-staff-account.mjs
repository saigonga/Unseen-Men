import { createClient } from '@supabase/supabase-js';
import env from '@next/env';
import { stdin, stdout } from 'node:process';

env.loadEnvConfig(process.cwd());
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !stdin.isTTY) { console.error('Run this from an interactive terminal with Supabase server credentials configured.'); process.exit(1); }
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const permitted = ['sai.gonga@theboredmonkey.com', 'aayushi.tripathi@noddmen.com'];
const email = (process.argv[2] || permitted[0]).trim().toLowerCase();
if (!permitted.includes(email)) { console.error('This email is not authorized for the member studio.'); process.exit(1); }
let existing = false;
for (let page = 1; ; page++) {
  const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) { console.error('Could not check existing accounts:', error.message); process.exit(1); }
  if (data.users.some(user => user.email?.toLowerCase() === email)) { existing = true; break; }
  if (data.users.length < 1000) break;
}
if (existing) { console.error('This account already exists. No password or account was changed.'); process.exit(1); }
stdout.write('Enter the password for the staff account (input is hidden): ');
stdin.setRawMode(true); stdin.resume(); stdin.setEncoding('utf8');
let password = '';
await new Promise((resolve, reject) => stdin.on('data', function onData(char) {
  if (char === '\u0003') { stdin.setRawMode(false); stdin.pause(); reject(new Error('Cancelled')); return; }
  if (char === '\r' || char === '\n') { stdin.removeListener('data', onData); stdin.setRawMode(false); stdin.pause(); stdout.write('\n'); resolve(); return; }
  if (char === '\u007f' || char === '\b') password = password.slice(0, -1);
  else if (!char.includes('\u001b')) password += char;
}));
if (password.length < 8) { console.error('Password must have at least 8 characters.'); process.exit(1); }
const { error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
password = '';
if (error) { console.error('Could not create the account:', error.message); process.exit(1); }
console.log('Staff account created.');
