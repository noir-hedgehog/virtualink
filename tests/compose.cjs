const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawnSync}=require('node:child_process');
test('Compose preserves special password bytes and existing PostgreSQL volume', t=>{
 const available=spawnSync('docker',['compose','version'],{encoding:'utf8'});
 if(available.status!==0){t.skip('Docker Compose CLI unavailable; no daemon is required');return;}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'virtualink-compose-test-'));
 try{
  fs.copyFileSync(path.resolve(__dirname,'../compose.yaml'),path.join(dir,'compose.yaml'));
  fs.writeFileSync(path.join(dir,'.env'),'VIRTUALINK_AUTH_SECRET=fake-test-only\n');
  const password='test@:/?#%value';
  const result=spawnSync('docker',['compose','--project-directory',dir,'--file',path.join(dir,'compose.yaml'),'config','--format','json'],{encoding:'utf8',env:{...process.env,POSTGRES_PASSWORD:password,VIRTUALINK_IMAGE:'virtualink-app:'+'a'.repeat(40)}});
  assert.equal(result.status,0,result.stderr);const config=JSON.parse(result.stdout);
  assert.equal(config.services.app.environment.PGPASSWORD,password);
  assert.equal(config.services.db.environment.POSTGRES_PASSWORD,password);
  assert.equal(config.services.app.environment.PGHOST,'db');
  assert.equal(config.services.app.environment.DATABASE_URL,undefined);
  assert.equal(config.services.app.image,'virtualink-app:'+'a'.repeat(40));
  assert.equal(config.services.db.volumes[0].source,'virtualink-postgres');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
