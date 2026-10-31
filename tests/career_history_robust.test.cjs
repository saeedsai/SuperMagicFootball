/** CAREER-HISTORY-ROBUST-01: Manager hub renders with legacy/malformed career.history; valid display unchanged; no writes. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TEAMS=[{name:'Home FC'},{name:'Rivals <b>United</b>'},{name:'Third'},{name:'Fourth'}];
function slice(from,to){const a=ui.indexOf(from),b=ui.indexOf(to,a);assert(a>0&&b>a,'present: '+from);return ui.slice(a,b);}
const formSrc=slice('const careerScoreOK=','\nfunction careerOpponentScoutPanel(');
const mgrStart=ui.indexOf('function showManager(){');
const mgrEnd=ui.indexOf('\nfunction careerPlay(',mgrStart);
assert(mgrStart>0&&mgrEnd>mgrStart,'showManager present');
const mgrSrc=ui.slice(mgrStart,mgrEnd);
// Run the REAL showManager source (career branch) and capture the HTML handed to page().
function render(career){
 const out={html:null};
 const ctx={TEAMS,escapeHTML:esc,career,creatingCareer:false,out,
  CONTINENTS:[],CONTINENTAL_TEAMS:{},
  currentCareerFixture:()=>null,
  standings:c=>c.members.map(id=>({id,...c.table[id]})).sort((a,b)=>b.pts-a.pts),
  page:(t,s,body)=>{out.html=body;},button:(l,a)=>`<button data-action="${a}">${l}</button>`,
  eur:n=>'EUR'+n,teamIdentity:()=>'',careerOpponentScoutPanel:()=>''};
 vm.runInNewContext(formSrc+'\n'+mgrSrc+'\nshowManager();',ctx);
 return out.html;
}
const base=h=>({club:0,season:1,week:2,cash:10,members:[0,1],history:h,cup:{stage:0,eliminated:false,pending:false},
 facilities:{training:1,stadium:1,academy:1},table:{0:{p:2,w:1,d:1,l:0,gf:3,ga:1,pts:4},1:{p:2,w:0,d:1,l:1,gf:1,ga:3,pts:1}}});
const good=[{kind:'league',week:2,against:1,a:1,b:1,win:false},{kind:'cup',week:1,against:1,a:2,b:0,win:true}];
const latest=html=>{const i=html.indexOf('LATEST RESULTS</h3>');assert(i>0,'latest results present');return html.slice(i);};

test('valid history renders exactly the original LATEST RESULTS rows',()=>{
 const html=latest(render(base(good)));
 assert(html.includes('<div class="stat"><span>LEAGUE vs Rivals &lt;b&gt;United&lt;/b&gt;</span><strong>1:1</strong></div><div class="stat"><span>CUP vs Rivals &lt;b&gt;United&lt;/b&gt;</span><strong>2:0</strong></div>'),html);
 assert(html.indexOf('LEAGUE vs')<html.indexOf('CUP vs'),'newest first');
});
test('only the newest five entries are listed',()=>{
 const h=Array.from({length:8},(_,i)=>({kind:'league',week:i,against:1,a:i,b:0}));
 const html=latest(render(base(h)));
 assert.equal((html.match(/LEAGUE vs/g)||[]).length,5);assert(html.includes('<strong>4:0</strong>')&&!html.includes('<strong>5:0</strong>'));
});
test('empty history still shows the empty state',()=>{
 assert(latest(render(base([]))).includes('No matches played yet'));
});
test('Manager hub does not throw on malformed history entries and keeps valid ones',()=>{
 const bad=[null,undefined,7,'x',[],{},{a:1,b:0,against:1},{kind:'league',against:1},{kind:'league',a:2,b:1},
  {kind:'league',against:99,a:1,b:0},{kind:5,against:1,a:1,b:0},{kind:'league',against:1,a:'x',b:null},
  good[0]];
 const c=base(bad);const before=JSON.stringify(c);
 let html;assert.doesNotThrow(()=>{html=render(c);});
 assert.equal(JSON.stringify(c),before,'render must not mutate the career');
 const l=latest(html);
 assert(l.includes('<strong>1:1</strong>'),'valid entry still listed');
 assert(l.includes('<span>MATCH vs Rivals &lt;b&gt;United&lt;/b&gt;</span><strong>1:0</strong>'),'missing kind -> MATCH placeholder');
 assert(l.includes('<span>LEAGUE vs unknown club</span><strong>2:1</strong>'),'missing opponent -> placeholder');
 assert(!l.includes('<strong>x:')&&!l.includes(':null'),'unusable scores skipped');
 assert(!/undefined|NaN|\[object/.test(latest(html)),latest(html));
});
test('malformed-only history shows no crash and the empty state; hub still renders',()=>{
 const html=render(base([null,{},{kind:'cup'}]));
 assert(latest(html).includes('No matches played yet'));
 assert(html.includes('LEAGUE TABLE')&&html.includes('RECENT FORM'));
 assert(!/undefined|NaN|\[object/.test(latest(html)),latest(html));
});
test('non-array history does not crash the hub',()=>{
 for(const h of [undefined,null,'no',{}])assert.doesNotThrow(()=>render(base(h)));
});
test('legacy v0.5 custom-club migration (module load) skips malformed history entries',()=>{
 const a=ui.indexOf("if(career&&!career.saveSchema&&clubs.length){"),b=ui.indexOf('\nif(!careerSlots.error',a);
 assert(a>0&&b>a,'migration block present');
 const mk=h=>({club:83,members:[83,1],fixtures:[[[83,1]]],table:{83:{pts:1},1:{pts:0}},history:h,lastResult:null});
 const run=career=>{const puts=[];const ctx={career,clubs:[{id:'c1'}],TEAMS:[{id:'x'},{id:'y'},{id:'c1'}],store:{put:(k,v)=>puts.push(k)}};
  vm.runInNewContext(ui.slice(a,b)+'\nthis.out=career;',ctx);return {out:ctx.out,puts};};
 const valid=run(mk([{kind:'league',against:83,a:1,b:0},{kind:'cup',against:1,a:0,b:0}]));
 assert.equal(valid.out.history[0].against,2);assert.equal(valid.out.history[1].against,1);assert.equal(valid.out.saveSchema,2);
 let r;assert.doesNotThrow(()=>{r=run(mk([null,7,{kind:'league',against:83,a:1,b:0},'x']));});
 assert.equal(r.out.history[2].against,2);assert.equal(r.out.history[0],null);
 assert.doesNotThrow(()=>run({...mk([]),history:undefined,lastResult:7}));
});
test('slot vault round trip keeps a career with malformed history entries byte-identical, and the hub renders it',async()=>{
 const {CAREER_SLOTS}=await import('../src/modules/career_slots.js');
 const c={...base([null,{},{kind:'league',against:1,a:2,b:0},{a:1,b:1,against:1}]),roster:Array.from({length:12},(_,i)=>({id:i})),fixtures:[]};
 let raw=null;const db={getItem:()=>raw,setItem:(_k,v)=>{raw=String(v)}};
 CAREER_SLOTS.create(db).save(1,c,'Old');
 const loaded=CAREER_SLOTS.create(db).load(1);
 assert.deepEqual(loaded,c);
 const before=JSON.stringify(loaded);
 assert.doesNotThrow(()=>render(loaded));
 assert.equal(JSON.stringify(loaded),before,'displaying leaves the save byte-identical');
});
test('form summary and latest results agree on what counts as a usable score',()=>{
 const H=vm.runInNewContext(formSrc+'\n({s:careerFormSummary,l:careerLatestResultsHTML})',{TEAMS,escapeHTML:esc});
 const c={club:0,history:[{kind:'league',against:1,a:null,b:null},{kind:'league',against:1,a:'',b:2},{kind:'league',against:1,a:'3',b:1}]};
 assert.equal(H.s(c,[]).played,1);
 assert.equal((H.l(c).match(/class="stat"/g)||[]).length,1);
});
