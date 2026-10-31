/** CAREER-RECENT-FORM-01: real production helpers, real CAREER.advanceCareer history, legacy-save safety. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
const at=ui.indexOf('const careerScoreOK=');
const end=ui.indexOf('\nfunction careerOpponentScoutPanel(',at);
assert(at>0&&end>at,'production form helpers present');
assert(ui.includes('$'+'{careerFormPanel(c,sorted)}'),'manager hub embeds the form panel');
assert(ui.indexOf('careerFormPanel(c,sorted)')<ui.indexOf('LATEST RESULTS</h3>',ui.indexOf('careerFormPanel(c,sorted)')),'panel sits above latest results');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TEAMS=[{name:'Home FC'},{name:'Rivals <b>United</b>'},{name:'Third'},{name:'Fourth'}];
const src=ui.slice(at,end);
const H=vm.runInNewContext(src+'\n({summary:careerFormSummary,panel:careerFormPanel})',{TEAMS,escapeHTML:esc});
const league=(a,b)=>({kind:'league',week:1,against:1,a,b,win:a>b});
const cup=(a,b,win)=>({kind:'cup',week:1,against:2,a,b,win});
const rows=(me,other)=>[{id:0,pts:me},{id:1,pts:other}].sort((x,y)=>y.pts-x.pts);
test('classifies league W/D/L by score and cup level ties by shootout flag, newest first',()=>{
 const f=H.summary({club:0,history:[cup(1,1,false),cup(2,2,true),league(1,1),league(0,2),league(3,1)]},rows(3,3));
 assert.deepEqual(f.results,['L','W','D','L','W']);
 assert.equal(f.w,2);assert.equal(f.d,1);assert.equal(f.l,2);
 assert.equal(f.gf,7);assert.equal(f.ga,7);
 assert.deepEqual({...f.run},{code:'L',length:1});
});
test('only the newest five results count and the current run length is exact',()=>{
 const h=[league(1,0),league(2,0),league(3,0),league(0,0),league(5,0),league(0,9),league(0,9)];
 const f=H.summary({club:0,history:h},rows(10,10));
 assert.equal(f.played,5);assert.deepEqual(f.results,['W','W','W','D','W']);
 assert.deepEqual({...f.run},{code:'W',length:3});assert.equal(f.gf,11);
});
test('table gap: leader margin, trailing gap, level points and missing table',()=>{
 assert.deepEqual({...H.summary({club:0,history:[]},rows(9,6)).gap},{leader:true,other:1,pts:3});
 assert.deepEqual({...H.summary({club:0,history:[]},rows(4,10)).gap},{leader:false,other:1,pts:6});
 assert.equal(H.summary({club:0,history:[]},[]).gap,null);
 assert.equal(H.summary({club:0,history:[]},undefined).gap,null);
});
test('panel text: accessible strip, summary, escaping and empty state',()=>{
 const c={club:0,history:[league(2,0),league(1,1),league(1,2)]};
 const out=H.panel(c,rows(1,4));
 assert(out.includes('id="careerForm"'));
 assert(out.includes('aria-label="Last 3 results, oldest to newest: loss, draw, win"'),out);
 assert(out.includes('data-form="L"')&&out.includes('data-form="W"'));
 assert(out.indexOf('data-form="L"')<out.indexOf('data-form="W"'),'oldest on the left');
 assert(out.includes('1W 1D 1L')&&out.includes('goals 4:3')&&out.includes('Last result: win'),out);
 assert(out.includes('3 points behind leaders Rivals &lt;b&gt;United&lt;/b&gt;.'),out);
 assert(!/<b>United/.test(out),'team name escaped');
 assert(!/<button|<a /.test(out),'read-only');
 const empty=H.panel({club:0,history:[]},rows(0,0));
 assert(empty.includes('Form appears after your first match.')&&!empty.includes('formBadge'));
 assert(H.panel({club:0,history:[league(1,0),league(2,0)]},rows(6,0)).includes('2 wins in a row'));
 assert(H.panel({club:0,history:[league(0,1),league(0,1)]},rows(0,6)).includes('2 defeats in a row'));
});
test('legacy and malformed history entries are skipped without throwing or mutating',()=>{
 const legacy={club:0,history:[null,{},{kind:'friendly',a:1,b:0},{kind:'league',a:'x',b:1},{kind:'league',a:2,b:1},{a:1,b:0}]};
 const before=JSON.stringify(legacy);
 const out=H.panel(legacy,rows(3,0));
 assert(out.includes('aria-label="Last 1 result, oldest to newest: win"'),out);
 assert.equal(H.summary(legacy,rows(3,0)).played,1);
 assert.equal(JSON.stringify(legacy),before);
 for(const bad of [undefined,null,{},{history:'no'}])assert.equal(H.summary(bad,undefined).played,0);
 assert(H.panel(undefined,undefined).includes('Form appears'));
});
test('real CAREER.advanceCareer history feeds the form and tracks the real table',()=>{
 const source=fs.readFileSync(path.join(root,'src/modules/career.js'),'utf8').replace(/^import .*;\s*$/gm,'').replace(/^export \{.*\};?\s*$/gm,'');
 const F=vm.runInNewContext(fs.readFileSync(path.join(root,'src/modules/fitness.js'),'utf8').replace(/^export \{.*\};?\s*$/gm,'')+'\nFITNESS',{});
 const realm={FITNESS:F};vm.runInNewContext(source+'\nthis.C=CAREER;',realm);
 const C=realm.C;
 const teams=Array.from({length:8},(_,i)=>({index:i,rank:60,group:'club26',flag:'EN',customRoster:Array.from({length:12},(_,k)=>({id:i+'-'+k,name:'P'+k,role:['GK','DF','MF','FW'][k%4],num:k+1,power:50,shoot:30,defense:30,rating:60,xp:0,level:1,condition:100,value:1e6,stamina:60}))}));
 const c=C.createCareer(0,teams);
 const scores=[[2,0],[1,1],[0,3],[4,1]];
 for(const s of scores){const fx=C.currentCareerFixture(c);assert(fx);C.advanceCareer(c,teams,s);}
 const f=H.summary(c,C.standings(c));
 assert.equal(f.played,c.history.length);
 assert(f.played>=4);
 const w=f.results.filter(x=>x==='W').length,l=f.results.filter(x=>x==='L').length,d=f.results.filter(x=>x==='D').length;
 assert.equal(w+d+l,f.played);
 assert.equal(f.gf,c.history.slice(0,f.played).reduce((t,r)=>t+r.a,0));
 assert(H.panel(c,C.standings(c)).includes('id="careerForm"'));
});
test('no new save field: feature is derived only; legacy career JSON round-trips unchanged',()=>{
 assert(!/careerForm\s*[:=]\s*\{/.test(ui.slice(at,end)),'helpers hold no persisted state');
 assert(!/store\.put|setItem|saveCareer\(/.test(ui.slice(at,end)),'helpers never write');
 const legacy={club:0,season:2,week:3,history:[{kind:'league',week:3,against:1,a:2,b:1,win:true}],lastResult:null,members:[0,1],table:{0:{p:3,w:1,d:1,l:1,gf:4,ga:4,pts:4},1:{p:3,w:1,d:1,l:1,gf:4,ga:4,pts:4}}};
 const raw=JSON.stringify(legacy);
 H.panel(legacy,[{id:0,pts:4},{id:1,pts:4}]);
 assert.equal(JSON.stringify(legacy),raw);
});
test('Career slot vault still validates and loads a legacy save unchanged',async()=>{
 const {CAREER_SLOTS}=await import('../src/modules/career_slots.js');
 const legacy={club:2,season:1,week:2,members:[1,2],fixtures:[],history:[{kind:'league',week:2,against:1,a:0,b:0,win:false}],roster:Array.from({length:12},(_,i)=>({id:i})),table:{1:{pts:1,gf:0,ga:0},2:{pts:1,gf:0,ga:0}},facilities:{training:1,stadium:1,academy:1},cup:{stage:0,eliminated:false,pending:false,wins:0},cash:5};
 let raw=null;const db={getItem:()=>raw,setItem:(_k,v)=>{raw=String(v)}};
 const slots=CAREER_SLOTS.create(db);slots.save(1,legacy,'Old');
 const loaded=CAREER_SLOTS.create(db).load(1);
 assert.deepEqual(loaded,legacy);
});
