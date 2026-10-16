const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const start=source.indexOf('function matchHighlightsPanel(');
const end=source.indexOf('function returnFromPauseTactics(){',start);
assert.ok(start>0&&end>start,'live UI match events helper missing');
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const panel=vm.runInNewContext('(()=>{'+source.slice(start,end)+';return matchHighlightsPanel;})()',{escapeHTML});
const fixture=()=>({score:[0,0],events:[],lineups:[[0,1],[0,1]],
 teamPlans:[{attack:'Balanced'},{attack:'Balanced'}],substitutionsUsed:[0,0]});

test('new matches show an accessible empty events state',()=>{
 const game=fixture(),before=JSON.stringify(game),out=panel(game);
 assert.match(out,/id="matchHighlights"/);
 assert.match(out,/aria-label="Recent match events"/);
 assert.match(out,/No major match moments recorded yet/);
 assert.equal(JSON.stringify(game),before,'observation must never modify game');
});
test('five most recent significant events display newest first with both teams',()=>{
 const game=fixture();
 game.events=[
  {type:'goal',team:0,hero:'Old goal',score:[1,0]},
  {type:'save',team:1,player:{src:{name:'Away Keeper'}},saveType:'dive'},
  {type:'dribbleTrick',team:0,player:'Skill Star',name:'rainbow',success:true},
  {type:'teamTalk',team:1,choice:'focus'},
  {type:'substitution',team:0,count:1},
  {type:'goal',team:1,hero:{src:{name:'Away Striker'}},score:[1,1]}
 ];
 const out=panel(game);
 assert.equal((out.match(/<li>/g)||[]).length,5);
 assert.doesNotMatch(out,/Old goal/);
 for(const expected of ['GOAL · AWAY · Away Striker · 1–1','SUBSTITUTION · HOME · 1 player',
  'TEAM TALK · AWAY · focus','SKILL MOVE · HOME · Skill Star · rainbow · SUCCESS',
  'KEEPER SAVE · AWAY · Away Keeper · dive'])assert(out.includes(expected),expected);
 assert(out.indexOf('GOAL · AWAY')<out.indexOf('SUBSTITUTION · HOME'));
});
test('zero-count tactical-only substitutions are never presented as actual subs',()=>{
 const game=fixture();
 game.events=[{type:'substitution',team:0,count:0},{type:'goal',team:0,score:[1,0]},
  {type:'substitution',team:1,count:2}];
 const out=panel(game);
 assert.equal((out.match(/SUBSTITUTION/g)||[]).length,1);
 assert.match(out,/SUBSTITUTION · AWAY · 2 players/);
 assert.match(out,/GOAL · HOME · 1–0/);
});
test('untrusted player and technique fields are escaped, not rendered as HTML',()=>{
 const game=fixture();
 game.events=[{type:'dribbleTrick',team:0,player:'<img src=x onerror=alert(1)>',
  name:'<b>Rainbow</b>',success:false},{type:'save',team:1,
  player:{src:{name:'O&#x27;Connor<script>bad</script>'}},saveType:'<svg onload=alert(2)>'}];
 const out=panel(game);
 assert.match(out,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.match(out,/&lt;b&gt;Rainbow&lt;\/b&gt;/);
 assert.match(out,/&lt;svg onload=alert\(2\)&gt;/);
 assert.doesNotMatch(out,/<img|<script|<svg|<b>/);
 assert.match(out,/BLOCKED/);
});
test('non-highlight engine telemetry never obscures the latest real moment',()=>{
 const game=fixture();
 game.events=[{type:'goal',team:0,score:[1,0]},...Array.from({length:18},(_,i)=>({type:'shotAudit',id:i})),
  {type:'substitution',team:1,count:0},{type:'pass',team:0}];
 const out=panel(game);
 assert.match(out,/GOAL · HOME · 1–0/);
 assert.doesNotMatch(out,/shotAudit|SUBSTITUTION|<li>pass/);
});
test('read-only helper is rendered in Pause, Half Time and standard Full Time only',()=>{
 const pause=source.slice(source.indexOf('function pause(){'),source.indexOf('// Read-only halftime guidance.'));
 const halftime=source.slice(source.indexOf('function halftime(){'),source.indexOf('function fulltime(ev)'));
 const fulltime=source.slice(source.indexOf('function fulltime(ev)'),source.indexOf('function toast(',source.indexOf('function fulltime(ev)')));
 for(const part of [pause,halftime,fulltime])assert.match(part,/\$\{matchHighlightsPanel\(game\)\}/);
 const before=fixture(),snap=JSON.stringify(before);panel(before);assert.equal(JSON.stringify(before),snap);
 const helper=source.slice(start,end);
 for(const banned of ['store.put(','.applyPlan(','.substitutionsUsed[','=this.events','localStorage.setItem(','game.emit('])
  assert(!helper.includes(banned),'event rendering cannot mutate game or saves: '+banned);
});
