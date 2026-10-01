const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function loader(mocks = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(root, file);
    if (!fs.existsSync(file)) file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx';
    if (cache.has(file)) return cache.get(file).exports;
    const m = new Module(file, module); cache.set(file, m); m.filename = file;
    m.paths = Module._nodeModulePaths(path.dirname(file));
    const original = m.require.bind(m);
    m.require = id => Object.hasOwn(mocks, id) ? mocks[id]
      : id.startsWith('@/') ? load('src/' + id.slice(2))
      : id.startsWith('.') ? load(path.resolve(path.dirname(file), id)) : original(id);
    m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText, file);
    return m.exports;
  }
  return load;
}
function browser(owner = 'account-a') {
  const values = new Map(); if (owner) values.set('virtualink-storage-owner-v1', owner);
  const events = new EventTarget(); const documentEvents = new EventTarget();
  let reloads = 0, interval, cleanup; const readiness=[];
  global.window = Object.assign(events, {
    localStorage: { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,String(v)), removeItem: k => values.delete(k) },
    location: { reload: () => reloads++ }, setTimeout, clearTimeout, setInterval: fn => { interval = fn; return 1; }, clearInterval: () => {},
  });
  global.document = Object.assign(documentEvents, { visibilityState: 'visible' });
  const load = loader({ react: { useEffect: effect => { cleanup = effect(); }, useState: () => [false, value => readiness.push(value)] } });
  const storage = load('src/lib/sync/storage.ts');
  return { values, load, storage, readiness, reloads: () => reloads, tick: () => interval?.(), cleanup: () => cleanup?.() };
}
const doc = records => ({ version: 1, updatedAt: new Date().toISOString(), records });
const response = data => ({ ok: true, json: async () => data });
const settle = async () => { for (let i=0; i<8; i++) await new Promise(resolve => setImmediate(resolve)); };

test('fingerprint ignores updatedAt and insertion order, but sees missing keys', () => {
  const { fingerprint } = loader()('src/lib/sync/schema.ts');
  const a = doc({ 'chillmxmk-todo': 'a', 'chillmxmk-diary': 'b' });
  const b = { ...doc({ 'chillmxmk-diary': 'b', 'chillmxmk-todo': 'a' }), updatedAt: 'other' };
  assert.equal(fingerprint(a), fingerprint(b));
  assert.notEqual(fingerprint(a), fingerprint(doc({ 'chillmxmk-todo': 'a' })));
});
test('remote missing keys remove only active account data, retain recovery and guest', () => {
  const b=browser(); const s=b.storage;
  b.values.set('chillmxmk-todo','guest'); b.values.set(s.storageKey('chillmxmk-todo'),'account-a');
  b.values.set(s.storageKey('chillmxmk-todo','account-b'),'account-b');
  assert.equal(s.applyDocument(doc({})),true);
  assert.equal(b.values.get(s.storageKey('chillmxmk-todo')),undefined);
  assert.equal(b.values.get('chillmxmk-todo'),'guest');
  assert.equal(b.values.get(s.storageKey('chillmxmk-todo','account-b')),'account-b');
  assert.ok([...b.values.keys()].some(k => k.startsWith('virtualink-recovery:account-a:')));
});
test('guest is absent from account snapshots; explicit import fills missing records without overwriting', async () => {
  const b=browser(),s=b.storage;
  b.values.set('chillmxmk-todo','guest todo'); b.values.set('chillmxmk-diary','guest diary');
  b.values.set(s.storageKey('chillmxmk-todo'),'account todo');
  assert.deepEqual(s.createDocument().records,{'chillmxmk-todo':'account todo'});
  global.fetch=async()=>response({ownerId:"account-a",document:doc({"chillmxmk-todo":"account todo"})});
  await s.importGuestData();
  assert.equal(b.values.get(s.storageKey('chillmxmk-todo')),'account todo');
  assert.equal(b.values.get(s.storageKey('chillmxmk-diary')),'guest diary');
  assert.equal(b.values.get('chillmxmk-diary'),'guest diary');
  assert.ok(b.values.get(s.storageKey('sync-baseline')));
});
test('cross-tab switch rejects stale in-memory store writes and reloads', async () => {
  const b=browser(); global.fetch = async () => response({authenticated:true,user:{id:'account-a'}});
  b.load('src/components/sync/CloudSync.tsx').CloudSync();
  b.values.set('virtualink-storage-owner-v1','account-b');
  const event=new Event('storage');event.key='virtualink-storage-owner-v1';window.dispatchEvent(event);
  b.storage.accountStorage.setItem('chillmxmk-todo',{state:{items:['stale']},version:0});
  assert.equal(b.values.has(b.storage.storageKey('chillmxmk-todo','account-b')),false);
  assert.equal(b.reloads(),1); b.cleanup(); await settle();
});
for (const serverDocument of [null,doc({})]) test(`bootstrap ${serverDocument === null ? 'null' : 'empty'} document cannot upload guest records`, async () => {
  const b=browser(); b.values.set('chillmxmk-todo','legacy guest'); const writes=[];
  global.fetch=async (url,options={}) => {
    if(url==='/api/auth/status')return response({authenticated:true,user:{id:'account-a'}});
    if(options.method==='PUT'){writes.push(JSON.parse(options.body).document);return response({ownerId:'account-a',document:JSON.parse(options.body).document});}
    return response({ownerId:'account-a',document:serverDocument});
  };
  b.load('src/components/sync/CloudSync.tsx').CloudSync();await settle();
  for(const write of writes)assert.deepEqual(write.records,{});
  assert.equal(b.values.get('chillmxmk-todo'),'legacy guest'); b.cleanup();
});
test('logout invalidates an in-flight read even when transport ignores AbortSignal', async () => {
  const b=browser(); let resolveState;const writes=[];
  global.fetch=async (url,options={}) => {
    if(url==='/api/auth/status')return response({authenticated:true,user:{id:'account-a'}});
    if(options.method==='PUT'){writes.push(options);return response({ownerId:'account-a'});}
    return new Promise(resolve=>{resolveState=resolve;});
  };
  b.load('src/components/sync/CloudSync.tsx').CloudSync();await settle();
  b.storage.authChanging();resolveState(response({ownerId:'account-a',document:doc({'chillmxmk-todo':'late'})}));await settle();
  assert.equal(b.values.has(b.storage.storageKey('chillmxmk-todo')),false);assert.equal(writes.length,0);b.cleanup();
});
test('request-owner mismatch cannot write account state after cookie switches', async () => {
  process.env.VIRTUALINK_AUTH_SECRET='test-secret-only'; let writes=0;
  const load=loader({'@/lib/server/state':{writeUserState:async()=>{writes++;},readUserState:async()=>null}});
  const token=load('src/lib/server/auth.ts').createUserSession({id:'account-b',username:'B'});
  const request={cookies:{get:()=>({value:token})},headers:new Headers({'X-Virtualink-Owner':'account-a'}),json:async()=>({document:doc({})})};
  const result=await load('src/app/api/state/route.ts').PUT(request);
  assert.equal(result.status,409);assert.equal(writes,0);
});
test('discrete PG password preserves URI special characters without changing existing credentials', () => {
  const {databaseConfig}=loader()('src/lib/server/db.ts');
  const password='x@:/?#%$\\end';
  const config=databaseConfig({PGHOST:'db',PGUSER:'virtualink',PGDATABASE:'virtualink',PGPASSWORD:password,DATABASE_URL:'legacy'});
  assert.equal(config.password,password); assert.equal(config.connectionString,undefined);
  assert.deepEqual(databaseConfig({DATABASE_URL:'legacy'}),{connectionString:'legacy',max:5});
  assert.throws(()=>databaseConfig({PGHOST:'db'}));
});
test('a newly selected account reloads before reading or uploading the previous account namespace', async () => {
  const b=browser();b.values.set(b.storage.storageKey('chillmxmk-todo'),'account-a-private');let stateCalls=0;
  global.fetch=async url=>{if(url==='/api/auth/status')return response({authenticated:true,user:{id:'account-b'}});stateCalls++;return response({ownerId:'account-b',document:null});};
  b.load('src/components/sync/CloudSync.tsx').CloudSync();await settle();
  assert.equal(stateCalls,0);assert.equal(b.values.get('virtualink-storage-owner-v1'),'account-b');
  assert.equal(b.values.get(b.storage.storageKey('chillmxmk-todo','account-a')),'account-a-private');assert.equal(b.reloads(),1);b.cleanup();
});
test('empty remote bootstraps only existing account-owned records on the next pass', async () => {
  const b=browser();b.values.set('chillmxmk-diary','unclaimed');b.values.set(b.storage.storageKey('chillmxmk-todo'),'account-owned');const writes=[];
  global.fetch=async(url,options={})=>{
    if(url==='/api/auth/status')return response({authenticated:true,user:{id:'account-a'}});
    if(options.method==='PUT'){const document=JSON.parse(options.body).document;writes.push(document);assert.equal(options.headers['X-Virtualink-Owner'],'account-a');return response({ownerId:'account-a',document});}
    return response({ownerId:'account-a',document:doc({})});
  };
  b.load('src/components/sync/CloudSync.tsx').CloudSync();await settle();b.tick();await settle();
  assert.equal(writes.length,1);assert.deepEqual(writes[0].records,{'chillmxmk-todo':'account-owned'});assert.equal(b.values.get('chillmxmk-diary'),'unclaimed');b.cleanup();
});
test('logout invalidates an in-flight PUT acknowledgement and does not publish its baseline', async()=>{
  const b=browser();let finishPut;const local=b.storage.storageKey('chillmxmk-todo');b.values.set(local,'account-a-local');
  global.fetch=async(url,options={})=>{
    if(url==='/api/auth/status')return response({authenticated:true,user:{id:'account-a'}});
    if(options.method==='PUT')return new Promise(resolve=>{finishPut=resolve;});
    return response({ownerId:'account-a',document:null});
  };
  b.load('src/components/sync/CloudSync.tsx').CloudSync();await settle();b.storage.authChanging();finishPut(response({ownerId:'account-a',document:doc({})}));await settle();
  assert.equal(b.values.has(b.storage.storageKey('sync-baseline')),false);assert.equal(b.values.get(local),'account-a-local');b.cleanup();
});
test('global account boundary hides old account pages before a new identity is selected', async()=>{
 const b=browser();global.fetch=async()=>response({authenticated:true,user:{id:'account-b'}});
 b.load('src/components/sync/AccountBoundary.tsx').AccountBoundary({children:'private-page'});await settle();
 assert.equal(b.reloads(),1);assert.equal(b.readiness.includes(true),false);assert.equal(b.values.get('virtualink-storage-owner-v1'),'account-b');b.cleanup();
});
test('global account boundary handles cross-tab logout on routes without CloudSync', async()=>{
 const b=browser();global.fetch=async()=>response({authenticated:true,user:{id:'account-a'}});
 b.load('src/components/sync/AccountBoundary.tsx').AccountBoundary({children:'private-page'});await settle();
 assert.ok(b.readiness.includes(true));b.values.delete('virtualink-storage-owner-v1');
 const event=new Event('storage');event.key='virtualink-storage-owner-v1';window.dispatchEvent(event);
 assert.equal(b.reloads(),1);assert.equal(b.readiness.at(-1),false);b.cleanup();
});
test('explicit guest import before account bootstrap preserves the fresh remote account', async()=>{
 const b=browser();b.values.set('chillmxmk-todo','guest todo');b.values.set('chillmxmk-diary','guest diary');
 global.fetch=async()=>response({ownerId:'account-a',document:doc({'chillmxmk-todo':'remote account todo'})});
 await b.storage.importGuestData();
 assert.equal(b.values.get(b.storage.storageKey('chillmxmk-todo')),'remote account todo');
 assert.equal(b.values.get(b.storage.storageKey('chillmxmk-diary')),'guest diary');
 assert.equal(b.values.get('chillmxmk-todo'),'guest todo');
});
test('late abandoned authentication recovers after expiry without reloading the owner', async()=>{
 const b=browser();let calls=0;global.fetch=async()=>{calls++;return response({authenticated:true,user:{id:'account-a'}});};
 b.load('src/components/sync/AccountBoundary.tsx').AccountBoundary({children:'private-page'});await settle();
 b.tick();b.storage.authChanging();assert.equal(b.readiness.at(-1),false);
 const originalNow=Date.now;const future=originalNow()+40_000;
 try{Date.now=()=>future;b.tick();await settle();assert.equal(b.readiness.at(-1),true);assert.equal(calls,2);b.tick();await settle();assert.equal(calls,2);}
 finally{Date.now=originalNow;b.cleanup();}
});
test('guest import preserves local deletions and fresh remote-only keys with three-way merge', async()=>{
 const b=browser(),s=b.storage;const baseline=doc({'chillmxmk-todo':'old todo'});
 b.values.set(s.storageKey('sync-baseline'),b.load('src/lib/sync/schema.ts').fingerprint(baseline));
 b.values.set('chillmxmk-diary','guest diary');
 global.fetch=async()=>response({ownerId:'account-a',document:doc({'chillmxmk-todo':'old todo','chillmxmk-habits':'new remote habits'})});
 await s.importGuestData();
 assert.equal(b.values.has(s.storageKey('chillmxmk-todo')),false);
 assert.equal(b.values.get(s.storageKey('chillmxmk-habits')),'new remote habits');
 assert.equal(b.values.get(s.storageKey('chillmxmk-diary')),'guest diary');
});
