const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const old='1'.repeat(40),next='2'.repeat(40);
function harness(options={}) {
 const base=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'virtualink-deploy-test-')));
 const bin=path.join(base,'bin'),config=path.join(base,'config'),app=path.join(base,'app'),source=path.join(base,'source'),log=path.join(base,'commands');
 for(const d of [bin,config,app,source,path.join(app,'releases',old)])fs.mkdirSync(d,{recursive:true});
 for(const name of ['compose.yaml','Dockerfile'])fs.writeFileSync(path.join(config,name),'trusted');
 fs.writeFileSync(path.join(config,'deploy.conf'),'repository=https://github.com/noir-hedgehog/virtualink.git\nref=refs/heads/main\n');
 fs.writeFileSync(path.join(app,'.env'),'POSTGRES_PASSWORD=fake');
 fs.writeFileSync(path.join(app,'releases',old,'.revision'),old);
 fs.symlinkSync(path.join(app,'releases',old),path.join(app,'current'));
 function fake(name,body){fs.writeFileSync(path.join(bin,name),'#!/bin/bash\n'+body,{mode:0o755});}
 fake('id','echo 0');
 // Simulate Linux stat and root ownership; the writable-path negative case
 // proves the real guard runs before any source fetch or Docker command.
 fake('stat',options.untrusted ? `if [[ "$3" == '${config}/deploy.conf' ]]; then echo '1000 644'; else echo '0 755'; fi` : "echo '0 755'");
 fake('timeout',`echo "timeout $*" >> '${log}'\n[[ "$1" != --kill-after=* ]] || shift\nshift\nexec "$@"`);
 fake('flock','exit 0');fake('tar','cat >/dev/null');fake('seq','echo 1');fake('sleep','exit 0');
 fake('git',`echo "git $*" >> '${log}'
case "$*" in
 *'init --bare'*) mkdir -p "\${@: -1}";;
 *'rev-parse FETCH_HEAD'*) echo '${next}';;
 *'archive'*) echo snapshot;;
esac`);
 fake('docker',`echo "docker image=\${VIRTUALINK_IMAGE:-} $*" >> '${log}'
if [[ "$1 $2" == 'image inspect' ]]; then ${options.existingImage?'exit 0':'exit 1'}; fi
if [[ "$*" == *' exec -T app '* && "\${VIRTUALINK_IMAGE:-}" == 'virtualink-app:${next}' ]]; then exit 1; fi
exit 0`);
 let script=fs.readFileSync(path.join(root,'ops/virtualink-deploy-release.sh'),'utf8');
 script=script.replace('export PATH=/usr/sbin:/usr/bin:/sbin:/bin HOME=/root',`export PATH='${bin}':/usr/bin:/bin HOME='${base}'`)
 .replace('config_dir=/etc/virtualink',`config_dir='${config}'`).replace('app_root=/opt/apps/virtualink',`app_root='${app}'`).replace('source_dir=/var/lib/virtualink-deploy',`source_dir='${source}'`);
 const entry=path.join(base,'engine');fs.writeFileSync(entry,script);
 const result=spawnSync('/bin/bash',[entry],{encoding:'utf8',env:{...process.env,PATH:bin+':/usr/bin:/bin'}});
 return {result,commands:fs.existsSync(log)?fs.readFileSync(log,'utf8'):'',current:fs.readlinkSync(path.join(app,'current')),oldPath:path.join(app,'releases',old),remove:()=>fs.rmSync(base,{recursive:true,force:true})};
}
test('root wrapper rejects a runner-provided checkout and SHA',()=>{
 const result=spawnSync('/bin/bash',[path.join(root,'ops/virtualink-deploy.sh'),next,'/tmp/runner-checkout'],{encoding:'utf8'});
 assert.equal(result.status,2);assert.match(result.stderr,/accepts no arguments/);
});
test('untrusted administrator config is rejected before Git or Docker execution',()=>{
 const h=harness({untrusted:true});try{assert.equal(h.result.status,2);assert.match(h.result.stderr,/Untrusted deployment path/);assert.equal(h.commands,'');}finally{h.remove();}
});
test('failed health restores previous revision image without rebuilding or pulling it',()=>{
 const h=harness();try{
  assert.equal(h.result.status,1,h.result.stderr);assert.equal(h.current,h.oldPath);
  assert.match(h.commands,new RegExp(`docker image=virtualink-app:${old} .*up -d --no-build --pull never app`));
  assert.match(h.commands,/timeout --kill-after=2s 8s docker compose .*exec -T app/);
  assert.match(h.commands,/AbortSignal.timeout\(5000\)/);
  assert.match(h.commands,/fetch --no-tags https:\/\/github.com\/noir-hedgehog\/virtualink.git refs\/heads\/main/);
  assert.doesNotMatch(h.commands,new RegExp(`image=virtualink-app:${old} .*build app`));
 }finally{h.remove();}
});
test('an existing revision image is never rebuilt',()=>{
 const h=harness({existingImage:true});try{assert.equal(h.result.status,1,h.result.stderr);assert.doesNotMatch(h.commands,/ build app/);}finally{h.remove();}
});
test('fixed executable wrapper ignores caller BASH_ENV before rejecting arguments',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'virtualink-wrapper-test-'));
 try{
  const marker=path.join(dir,'executed'),envFile=path.join(dir,'bash-env');
  fs.writeFileSync(envFile,`echo compromised > '${marker}'\n`);
  const result=spawnSync(path.join(root,'ops/virtualink-deploy.sh'),['untrusted'],{encoding:'utf8',env:{...process.env,BASH_ENV:envFile}});
  assert.equal(result.status,2,result.stderr);assert.equal(fs.existsSync(marker),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('the actual health program exits when a connected HTTP request never responds',async()=>{
 const vm=require('node:vm');
 const script=fs.readFileSync(path.join(root,'ops/virtualink-deploy-release.sh'),'utf8');
 const expression=script.match(/node -e "([^"]+)"/)[1];
 let exitResolve;const exited=new Promise(resolve=>{exitResolve=resolve;});let guard;
 vm.runInNewContext(expression,{
  fetch:(_url,options={})=>new Promise((_resolve,reject)=>{options.signal?.addEventListener('abort',()=>reject(new Error('aborted')));}),
  AbortSignal:{timeout:ms=>{assert.equal(ms,5000);const controller=new AbortController();setTimeout(()=>controller.abort(),10);return controller.signal;}},
  process:{exit:exitResolve},
 });
 try{const code=await Promise.race([exited,new Promise((_resolve,reject)=>{guard=setTimeout(()=>reject(new Error('Health request did not abort')),200);})]);assert.equal(code,1);}
 finally{clearTimeout(guard);}
});
