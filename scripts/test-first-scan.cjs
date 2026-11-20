const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: name => mocks[name] || require(name), Buffer, console, crypto: require('node:crypto').webcrypto, process });
  return module.exports;
}

async function main() {
  let writes = 0;
  let scan = { lookbook: {} };
  const member = { id: 'member', name: 'Original', photo_url: 'original.jpg', created_at: '2026-01-01', member_number: 1, referral_code: 'UM-ABCD' };
  const db = { from(table) { return {
    select(_cols, opts) { return { eq() { return { maybeSingle: async () => ({ data: table === 'waitlist' ? member : scan, error: null }) }; }, lt: async () => ({ count: 0, error: null }) }; },
    update() { writes++; throw new Error('unexpected update'); },
    insert() { writes++; throw new Error('unexpected insert'); },
  }; } };
  const { POST } = load('app/api/waitlist/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } },
    '@/lib/supabase': { getSupabaseServerClient: () => db },
    '@/lib/phone': { checkIndianMobile: () => ({ ok: true, e164: '+919876543210', pretty: '+91 98765 43210' }), isEmail: () => true },
    '@/lib/content': { SHAPE_ORDER: [], SHAPES: {} },
    '@/lib/saveLookbook': { saveLookbook: () => { throw new Error('unexpected scan save'); } },
    '@/lib/lookbook': { isLookbook: () => false },
  });
  const request = { json: async () => ({ name: 'Original', phone: '9876543210' }) };
  const complete = await POST(request);
  assert.equal(complete.status, 200);
  assert.equal(complete.body.alreadyJoined, true);
  scan = null;
  const incomplete = await POST(request);
  assert.equal(incomplete.status, 409);
  member.photo_url = null;
  assert.equal((await POST(request)).status, 409);
  assert.equal(writes, 0);

  let insertCount = 0;
  let saved = null;
  const raceDb = { from() { return {
    select() { return { eq() { return { maybeSingle: async () => ({ data: saved, error: null }) }; } }; },
    async insert(row) { insertCount++; if (saved) return { error: { code: '23505' } }; saved = row; return { error: null }; },
    update() { throw new Error('must not update the original scan'); },
  }; } };
  const { saveLookbook } = load('lib/saveLookbook.ts', { './lookbook': { createLookbook: () => ({}), lookbookSignature: () => 'signature' } });
  const results = await Promise.allSettled([
    saveLookbook(raceDb, 'member', 'oval', [], { scan: 'first' }, null, null),
    saveLookbook(raceDb, 'member', 'oval', [], { scan: 'second' }, null, null),
  ]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(insertCount, 2);
  assert.equal(saved.face_data.scan, 'first');
  console.log('First-scan protection checks passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
