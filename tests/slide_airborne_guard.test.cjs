'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf(' slideContact(p){');
const helperStart=source.indexOf('  const slideClosingContact=',start);
const helperEnd=source.indexOf(';\n  const targets=',helperStart)+1;
const filterStart=source.indexOf('  const targets=this.players.filter(',helperEnd);
const filterEnd=source.indexOf('\n   .sort(',filterStart);
assert.ok(start>=0&&helperStart>start&&helperEnd>helperStart&&filterStart>helperEnd&&filterEnd>filterStart,'locate production slide contact helper and filter');
const helper=source.slice(helperStart,helperEnd);
const filter=source.slice(filterStart,filterEnd).replace('this.players.filter(','players.filter(');
const eligibleFn=vm.runInNewContext('(players,p,distance)=>{'+helper+';'+filter+';return targets;}',{Number});
const eligible=(players,p)=>eligibleFn(players,p,(a,b)=>Math.hypot(a.x-b.x,a.y-b.y));
const defender={t:0,x:0,y:0};
const opponent=(overrides={})=>({t:1,x:32,y:0,z:0,keeper:false,stun:0,invuln:0,action:'idle',...overrides});
test('SLIDE-AIRBORNE-GUARD-01: grounded slides cannot knock high jumpers out of the air',()=>{
 const high=opponent({z:35});
 assert.equal(eligible([high],defender).length,0);
 assert.equal(eligible([opponent({z:19})],defender).length,1,'low airborne opponent still within slide reach');
 assert.equal(eligible([opponent({z:20})],defender).length,0,'20 units is out of slide contact');
});
test('SLIDE-AIRBORNE-GUARD-01: slides do not hit already-downed or getting-up opponents',()=>{
 assert.equal(eligible([opponent({action:'shotDown'})],defender).length,0);
 assert.equal(eligible([opponent({action:'shotGetUp'})],defender).length,0);
 assert.equal(eligible([opponent({action:'hurt'})],defender).length,1,'standing recoiling opponent remains eligible');
});
test('SLIDE-AIRBORNE-GUARD-01: standing ball carrier remains tackleable',()=>{
 const valid=opponent(),high=opponent({z:40}),down=opponent({action:'shotDown'});
 assert.equal(eligible([high,down,valid],defender).length,1);
 assert.equal(eligible([opponent({x:100})],defender).length,0);
 assert.equal(eligible([opponent({keeper:true})],defender).length,0);
 assert.equal(eligible([opponent({t:0})],defender).length,0);
});
