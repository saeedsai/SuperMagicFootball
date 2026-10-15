const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const get=p=>fs.readFileSync(path.join(root,p),'utf8');
const m=JSON.parse(get('data/mechanics/gameplay.json'));
test('performance HUD defaults off without changing existing saves',()=>{
 assert.equal(m.defaultOptions.showPerformance,false);
 assert.match(get('src/modules/ui.js'),/opt\.showPerformance===true/);
 assert.match(get('src/modules/ui.js'),/store\.put\('options',opt\)/);
 assert.match(get('index.html'),/id="perfHud"/);
 assert.match(get('style.css'),/\.perfHud\.hidden/);
});
test('existing four action buttons and six formations remain intact',()=>{
 assert.equal(Object.keys(m.formations).length,6);
 assert.equal((get('index.html').match(/data-act="/g)||[]).length,4);
});
test('new engine balance keys preserve previous physics defaults',()=>{
 const v=m.engineBalance;
 assert.deepEqual(v,{attackingStoppageProgress:.68,superKnockbackReferencePower:72,superKnockbackPowerSpan:75,superKnockbackLevelFactor:.16,superKnockbackStrengthFactor:.008,superKnockbackMax:3,keeperPredictionMaxSeconds:.95});
 const src=get('src/modules/engine.js');
 for(const key of Object.keys(v))assert.ok(src.includes('ENGINE_BALANCE.'+key),key);
});
test('loader recovers gracefully when hosted JSON fails',()=>{
 const src=get('src/main.js');
 assert.match(src,/retryLoad/);assert.match(src,/location\.reload\(\)/);
 assert.match(src,/location\.protocol==='file:'/);
});
test('service worker cache version rotates after source/data update',()=>{
 assert.match(get('sw.js'),/smf-082533-pitch-length20-v1/);
 assert.match(get('sw.js'),/mechanics\/gameplay\.json/);
});