const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const start=source.indexOf('async function refreshAboutDevRevision(');
const stop=source.indexOf('function showHome(){',start);
assert(start>0&&stop>start,'source must contain the live About revision and menu');
const block=source.slice(start,stop);
const SHA_A='1111111111111111111111111111111111111111';
const SHA_B='abcdef0123456789abcdef0123456789abcdef01';

function fixture(reply={ok:true,json:async()=>({sha:SHA_A})}){
 const links=[];
 let shown=null,calls=[];
 const summary={isConnected:true,textContent:'Checking summary'};
 const recent={isConnected:true,textContent:'Checking history',children:[],replaceChildren(...rows){this.children=rows;this.textContent=''}};
 const node={isConnected:true,textContent:'Checking',children:[],
  replaceChildren(link){this.children=[link];this.textContent=''}};
 const context={document:{createElement(tag){assert.ok(['a','li'].includes(tag));const child={children:[],appendChild(item){this.children.push(item)}};if(tag==='a')links.push(child);return child},
  getElementById(id){const found={aboutDevRevision:node,aboutLatestChange:summary,aboutRecentChanges:recent}[id];assert.ok(found,'Unexpected About element '+id);return found}},
  window:{SupermagicFootball:{version:'0.8.25.32-integrated'}},
  escapeHTML:value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  TEAMS:Array(224),button:(label,action)=>'<button data-action="'+action+'">'+label+'</button>',
  page:(...args)=>{shown=args;},
  fetch:async (...args)=>{calls.push(args);return typeof reply==='function'?reply(...args):reply},
  Error,Promise};
 const api=vm.runInNewContext('(()=>{'+block+';return {refreshAboutDevRevision,refreshAboutRecentChanges,showAbout};})()',context);
 return {node,summary,recent,links,calls,api,shown:()=>shown};
}
test('About shows exact developer name, mailto and current bundled version',()=>{
 const app=fixture();
 app.api.showAbout();
 const [title,sub,html]=app.shown();
 assert.equal(title,'ABOUT SUPERMAGIC FOOTBALL');
 assert.match(html,/Developer: Saeed/);
 assert.match(html,/href="mailto:saeedmsalehi1990@gmail\.com"/);
 assert.match(html,/id="aboutBundleVersion">GAME BUNDLE · 0\.8\.25\.32-integrated/);
 assert.match(html,/id="aboutDevRevision" role="status" aria-live="polite"/);
 assert.match(html,/deployment can lag behind it/);
 assert.match(html,/Four action buttons/);
 assert.match(html,/id="aboutLatestChange"/);
 assert.match(html,/id="aboutRecentChanges"/);
 assert.match(html,/CURRENT DEVELOPMENT VERSION/);
});
test('valid dev commit is linked, not confused with deployed bundle',async()=>{
 const app=fixture();await app.api.refreshAboutDevRevision(app.node);
 assert.equal(app.node.children.length,1);
 const link=app.node.children[0];
 assert.equal(link.href,'https://github.com/saeedsai/SuperMagicFootball/commit/'+SHA_A);
 assert.equal(link.textContent,'v0.8.25.32-integrated+dev.'+SHA_A.slice(0,12));
 assert.equal(link.rel,'noopener noreferrer');
 assert.equal(link.target,'_blank');
 assert.equal(app.calls.length,1);
 assert.equal(app.calls[0][0],'https://api.github.com/repos/saeedsai/SuperMagicFootball/commits/dev');
 assert.equal(app.calls[0][1].cache,'no-store','fresh commit must be fetched per About view');
});
test('new About visits resolve a new commit after concurrent push',async()=>{
 let sha=SHA_A;
 const app=fixture(()=>({ok:true,json:async()=>({sha})}));
 await app.api.refreshAboutDevRevision(app.node);
 assert.equal(app.node.children[0].textContent,'v0.8.25.32-integrated+dev.'+SHA_A.slice(0,12));
 sha=SHA_B;
 await app.api.refreshAboutDevRevision(app.node);
 assert.equal(app.node.children[0].href,'https://github.com/saeedsai/SuperMagicFootball/commit/'+SHA_B);
 assert.equal(app.node.children[0].textContent,'v0.8.25.32-integrated+dev.'+SHA_B.slice(0,12));
 assert.equal(app.calls.length,2);
});
test('offline/API failure leaves About readable and does not throw',async()=>{
 for(const reply of [()=>{throw Error('Offline')},()=>({ok:false,status:403})]){
  const app=fixture(reply);
  await app.api.refreshAboutDevRevision(app.node);
  assert.match(app.node.textContent,/unavailable offline/);
  assert.equal(app.node.children.length,0);
 }
});
test('invalid or malicious revision cannot create arbitrary links',async()=>{
 for(const sha of ['<script>alert(1)</script>','deadbeef','A'.repeat(39),'g'.repeat(40)]){
  const app=fixture({ok:true,json:async()=>({sha})});
  await app.api.refreshAboutDevRevision(app.node);
  assert.equal(app.node.children.length,0);
  assert.match(app.node.textContent,/unavailable offline/);
 }
});
test('slow fetch never writes into detached About menu after user leaves',async()=>{
 let resolve;
 const app=fixture(()=>new Promise(r=>{resolve=r}));
 const pending=app.api.refreshAboutDevRevision(app.node);
 app.node.isConnected=false;resolve({ok:true,json:async()=>({sha:SHA_A})});await pending;
 assert.equal(app.node.children.length,0);
 assert.equal(app.node.textContent,'Checking');
});

test('About displays versioned commit label while keeping deployed bundle distinct',async()=>{
 const app=fixture();
 app.api.showAbout();
 const [, ,html]=app.shown();
 assert.match(html,/auto-versioned after every update/);
 assert.match(html,/not necessarily the deployed build/);
 assert.match(html,/GAME BUNDLE · 0\.8\.25\.32-integrated/);
 await app.api.refreshAboutDevRevision(app.node);
 assert.match(app.node.children[0].textContent,/^v0\.8\.25\.32-integrated\+dev\.[a-f0-9]{12}$/);
});

test('About prints real latest commit subject and updates it on the next revision',async()=>{
 let sha=SHA_A, message='feat(gameplay): new zigzag shot';
 const app=fixture(()=>({ok:true,json:async()=>({sha,commit:{message:message+String.fromCharCode(10)+'Longer body'}})}));
 await app.api.refreshAboutDevRevision(app.node);
 assert.equal(app.summary.textContent,'feat(gameplay): new zigzag shot');
 sha=SHA_B;message='fix(ui): repair controls';
 await app.api.refreshAboutDevRevision(app.node);
 assert.equal(app.summary.textContent,'fix(ui): repair controls');
 assert.equal(app.node.children[0].href,'https://github.com/saeedsai/SuperMagicFootball/commit/'+SHA_B);
});
test('Recent changes show actual source summaries but omit coordination bookkeeping',async()=>{
 const change=(sha,message)=>({sha,commit:{message}});
 const app=fixture({ok:true,json:async()=>[
  change(SHA_A,'chore(coordination): claim feature'),
  change(SHA_B,'feat(shots): new zigzag flight'+String.fromCharCode(10)+'more detail'),
  change(SHA_A,'docs(memory): refresh private checkpoint'),
  change(SHA_B,'art(C01): rear arm')
 ]});
 await app.api.refreshAboutRecentChanges(app.recent);
 assert.equal(app.recent.children.length,2);
 assert.equal(app.recent.children[0].children[0].textContent,'feat(shots): new zigzag flight');
 assert.equal(app.recent.children[1].children[0].textContent,'art(C01): rear arm');
 assert.equal(app.recent.children[0].children[0].href,'https://github.com/saeedsai/SuperMagicFootball/commit/'+SHA_B);
 assert.equal(app.calls[0][0],'https://api.github.com/repos/saeedsai/SuperMagicFootball/commits?sha=dev&per_page=25');
 assert.equal(app.calls[0][1].cache,'no-store');
});
test('Recent changes and summary have independent offline fallback and never inject HTML',async()=>{
 const app=fixture(()=>{throw Error('offline')});
 await app.api.refreshAboutDevRevision(app.node);
 await app.api.refreshAboutRecentChanges(app.recent);
 assert.match(app.summary.textContent,/unavailable offline/);
 assert.match(app.recent.textContent,/unavailable offline/);
 const other=fixture({ok:true,json:async()=>[{sha:SHA_B,commit:{message:'feat(ui): <img src=x onerror=alert(1)>'}}]});
 await other.api.refreshAboutRecentChanges(other.recent);
 assert.equal(other.recent.children.length,1);
 assert.equal(other.recent.children[0].children[0].textContent,'feat(ui): <img src=x onerror=alert(1)>');
});
