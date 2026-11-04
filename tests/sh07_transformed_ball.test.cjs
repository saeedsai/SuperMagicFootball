'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const render=fs.readFileSync(path.join(root,'src/modules/render.js'),'utf8');
const engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8');
const mechanics=JSON.parse(fs.readFileSync(path.join(root,'data/mechanics/gameplay.json'),'utf8'));

test('all manifest shot IDs have an explicit transformed visual family',()=>{
 const groups=[
  ['banana'],['fish','piranha','bird'],['ghost'],['ninja'],['nuts'],['wheel','cactus','elephant','horse'],
  ['mole'],['books'],['target'],['cannon','comet','lion','tiger'],['mega','omega','eagle','tornado','serpent'],
  ['silverCarp'],['dice'],['pineapple'],['apple'],['coconut'],['orange'],['strawberry'],['dolphin'],['wave']
 ];
 const assigned=groups.flat();
 assert.equal(new Set(assigned).size,assigned.length,'each shot belongs to one visual family');
 assert.deepEqual(assigned.slice().sort(),Object.keys(mechanics.shotTypes).sort());
 for(const id of assigned)assert.ok(render.includes(`'${id}'`),`renderer contains a visual case for ${id}`);
 for(const group of groups.filter(x=>x.length>1)){
  assert.ok(group.some(id=>render.includes(`id==='${id}'`)||render.includes(`['${id}'`)),`renderer contains visual family ${group.join('/')}`);
 }
});

test('transformation smoothly returns to the selected soccer-ball model before physics recovery',()=>{
 assert.match(engine,/\{\.\.\.opts\.shot,transformSeconds:SUPER_SHOT_TRANSFORM_SECONDS\}/);
 assert.match(render,/returnBlend=clamp\(\(b\.age-\(transformSeconds-\.18\)\)\/\.18,0,1\)/);
 assert.match(render,/this\.drawTransformation\(ctx,shot,b\.age,reducedFlash,game\.options\?\.ballModel\)/);
 assert.match(render,/if\(returnBlend>0\)\{ctx\.save\(\);ctx\.globalAlpha=returnBlend;this\.drawSoccerBall\(ctx,0,0,11\+returnBlend\*4,ballModel/);
 assert.match(engine,/if\(b\.shot&&b\.age>=SUPER_SHOT_TRANSFORM_SECONDS\)\{\s*b\.shot=null;if\(b\.strike\)b\.strike\.kind='normal';\s*b\.trail=\[\]/);
 assert.match(engine,/this\.emit\('shotTransformEnd',\{age:b\.age\}\)/);
});

test('reduced-flash mode removes special-shot shake, screen flash and rapid sprite motion',()=>{
 assert.match(engine,/reducedSH06=!!this\.options\?\.reducedFlash/);
 assert.match(engine,/this\.shake=reducedSH06\?0:\.19;this\.flash=reducedSH06\?0:\.23/);
 assert.match(engine,/this\.burst\(b\.x,b\.y,opts\.shot\.color,reducedSH06\?4:22\)/);
 assert.match(render,/drawTransformation\(ctx,s,t,reducedFlash=false/);
 assert.match(render,/ctx\.rotate\(reducedFlash\?0:Math\.sin\(t\*4\.5\)\*\.045\)/);
 assert.match(render,/const spin=reducedFlash\?0:t\*15/);
 assert.match(render,/ctx\.rotate\(reducedFlash\?0:Math\.sin\(t\*20\)\*\.4\)/);
 assert.match(render,/reducedFlash\?0:Math\.sin\(t\*10\+i\)\*14/);
 assert.match(render,/ctx\.shadowBlur=reducedFlash\?12:38;ctx\.shadowBlur\*=1-returnBlend/);
});

