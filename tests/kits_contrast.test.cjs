'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {KITS}=require('../src/modules/kits.js');

const teams=JSON.parse(fs.readFileSync('data/teams.json','utf8'));
function luminance(hex){
 const rgb=hex.slice(1).match(/../g).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);
 return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}

test('VIZ-04 all 223 team away kits maintain at least 2:1 primary contrast with home',()=>{
 assert.equal(teams.length,223);
 for(const team of teams){
  const home=KITS.kitFor(team,'home'),away=KITS.kitFor(team,'away');
  assert.equal(home.primary,team.primary,team.name+' home primary is preserved');
  assert.equal(away.id,team.id,team.name+' keeps its canonical identity');
  assert.equal(away.kit,'away',team.name+' is still identified as the away kit');
  assert.ok(ratio(home.primary,away.primary)>=2,team.name+' home/away primary contrast is below 2:1');
 }
});

test('VIZ-04 contrast recommendation keeps passing kit choices and resolves every opposing-team pair',()=>{
 let pairs=0;
 for(const home of teams)for(const away of teams){
  if(home.id===away.id)continue;
  for(const preferredHome of KITS.KIT_CHOICES)for(const preferredAway of KITS.KIT_CHOICES){
   const preferred=[preferredHome,preferredAway],before=KITS.matchContrast(home,away,preferred);
   const result=KITS.bestContrastSelections(home,away,preferred);
   if(before>=2){
    assert.equal(result.homeChoice,preferredHome,`${home.name}/${away.name} preserves passing home kit`);
    assert.equal(result.awayChoice,preferredAway,`${home.name}/${away.name} preserves passing away kit`);
    assert.equal(result.changed,false);
   }else{
    assert.ok(result.changed,`${home.name}/${away.name} changes a clashing choice`);
    const changed=Number(result.homeChoice!==preferredHome)+Number(result.awayChoice!==preferredAway);
    const minPassingChanges=Math.min(...KITS.KIT_CHOICES.flatMap(h=>KITS.KIT_CHOICES.map(a=>KITS.matchContrast(home,away,[h,a])>=2?Number(h!==preferredHome)+Number(a!==preferredAway):Infinity)));
    assert.equal(changed,minPassingChanges,`${home.name}/${away.name} uses the fewest changes`);
   }
   assert.ok(result.ratio>=2,`${home.name}/${away.name} recommended contrast ${result.ratio.toFixed(3)}:1`);
   assert.equal(result.ratio,KITS.matchContrast(home,away,[result.homeChoice,result.awayChoice]));
   assert.deepEqual(result,KITS.bestContrastSelections(home,away,preferred),'recommendation is deterministic');
  }
  pairs++;
 }
 assert.equal(pairs,223*222);
});
