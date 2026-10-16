/** Live tactical calls: real in-match preset mappings, paused-only, no saved-team writes. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const start=src.indexOf('const QUICK_TACTICAL_CALLS=');
const stop=src.indexOf('function returnFromPauseTactics(){',start);
assert.ok(start>0&&stop>start,'missing quick live tactics implementation');
const block=src.slice(start,stop);
const make=(screen='PAUSED',humans=1)=>{
 const previous={formation:'2-1-2',lineup:[0,1,2,3,5,9],captain:3,
   penalty:4,freeKick:3,corner:3,attack:'Balanced',defence:'Balanced'};
 const store={calls:0,change:0};
 const game={matchState:'paused',teamPlans:[{...previous},{...previous}],
  applyPlan(side,raw){store.calls++;this.teamPlans[side]={...raw};return this.teamPlans[side]}};
 const ctx={game,screen,humans,store,toast:()=>{},alert:()=>{throw Error('alert')},
  pause:()=>{store.change++;},halftime:()=>{store.change++;},
  escapeHTML:x=>x,button:(label,action)=>`<button data-action="${action}">${label}</button>`};
 vm.createContext(ctx);
 vm.runInContext(block,ctx);
 return {ctx,game,store,previous,call:(side,key)=>vm.runInContext(`quickTacticalCall(${side},'${key}')`,ctx),
   panel:side=>vm.runInContext(`quickTacticalPanel(${side})`,ctx)};
};
test('four real tactics preset calls change only existing attack and defence',()=>{
 const x=make();
 const expected=[
  ['attack','Direct','High Press'],['control','Possession','Balanced'],
  ['defend','Possession','Deep Block'],['balanced','Balanced','Balanced']
 ];
 for(const [key,attack,defence] of expected){
  assert.equal(x.call(0,key),true);
  assert.equal(x.game.teamPlans[0].attack,attack);
  assert.equal(x.game.teamPlans[0].defence,defence);
  for(const p of ['formation','lineup','captain','penalty','freeKick','corner'])
   assert.deepEqual(x.game.teamPlans[0][p],x.previous[p],p);
 }
 assert.equal(x.store.calls,4);
 assert.equal(x.store.change,4,'only refresh paused menu');
 assert.equal(x.game.teamPlans[1].attack,'Balanced','CPU tactics unchanged');
 assert.doesNotMatch(block,/store\.put\(|localStorage\.(?:setItem|removeItem|clear)\(|substitutionsUsed\s*\+\+|\.lineup\s*=/);
});
test('calling already active tactical style is an idempotent, no-substitution action',()=>{
 const x=make();
 assert.equal(x.call(0,'balanced'),true);
 assert.equal(x.store.calls,0,'must not call applyPlan on no-op');
 assert.equal(x.store.change,0,'must not reconstruct pause menu');
 assert.equal(x.game.teamPlans[0].attack,'Balanced');
});
test('commands reject active play, invalid menu, CPU side and unknown actions',()=>{
 const x=make('PAUSED',1);
 for(const [screen,state,side,key] of [
  ['PAUSED','play',0,'attack'],['HOME','paused',0,'attack'],
  ['PAUSED','paused',1,'defend'],['PAUSED','paused',0,'unknown']
 ]){
  x.ctx.screen=screen;x.game.matchState=state;
  assert.equal(x.call(side,key),false);
 }
 assert.equal(x.store.calls,0);
});
test('half time and two-human modes preserve their own side and context',()=>{
 const x=make('HALF TIME',2);
 assert.equal(x.call(1,'defend'),true);
 assert.equal(x.game.teamPlans[1].defence,'Deep Block');
 assert.equal(x.game.teamPlans[0].defence,'Balanced');
 assert.match(x.panel(0),/quickTacticHomeAttack/);
 assert.match(x.panel(1),/quickTacticAwayBalanced/);
 assert.equal(x.store.change,1);
});
test('playable UI only shows shortcuts at PAUSED and HALF TIME; four gameplay actions unchanged',()=>{
 assert.match(src,/function pause\(\).*quickTacticalPanel\(0\)/);
 assert.match(src,/function halftime\(\).*quickTacticalPanel\(0\)/);
 assert.match(src,/quickTacticalCall\(match\[1\]==='Home'\?0:1,match\[2\]\.toLowerCase\(\)\)/);
 assert.match(src,/quickTacticalCall\(side,key\)[\s\S]*?game\.applyPlan\(side,\{\.\.\.plan,attack:choice\.attack,defence:choice\.defence\}\)/);
 assert.doesNotMatch(block,/touchButtons|touchPanel|INPUT\.|\.input\./);
});
