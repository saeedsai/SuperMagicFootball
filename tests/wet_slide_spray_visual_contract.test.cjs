'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/render.js','utf8');
const match=source.match(/function drawWetSlideSpray\(ctx,dx,dy,reducedFlash=false\)\{[\s\S]*?\n\}/);
assert.ok(match,'wet slide spray helper exists');

function helper(){
 const sandbox=vm.createContext({Math,Number,PI:Math.PI});
 vm.runInContext(`${match[0]}\nthis.drawWetSlideSpray=drawWetSlideSpray;`,sandbox);
 return sandbox.drawWetSlideSpray;
}
function capture(){
 const stack=[],calls=[],ctx={globalAlpha:1,fillStyle:null,strokeStyle:null,lineWidth:1,lineCap:'butt',
  save(){stack.push([this.globalAlpha,this.fillStyle,this.strokeStyle,this.lineWidth,this.lineCap]);},
  restore(){[this.globalAlpha,this.fillStyle,this.strokeStyle,this.lineWidth,this.lineCap]=stack.pop();},
  beginPath(){},moveTo(...args){calls.push({name:'moveTo',args});},quadraticCurveTo(...args){calls.push({name:'quadraticCurveTo',args});},
  ellipse(...args){calls.push({name:'ellipse',args,color:this.fillStyle,alpha:this.globalAlpha});},fill(){calls.push({name:'fill'});},stroke(){calls.push({name:'stroke',color:this.strokeStyle,alpha:this.globalAlpha});}};
 return {ctx,calls};
}

test('wet slide spray follows normalized tackle direction and restores canvas state',()=>{
 const draw=helper(),a=capture();
 assert.equal(draw(a.ctx,3,4,false),true);
 assert.equal(a.calls.filter(call=>call.name==='ellipse').length,5);
 const first=a.calls.find(call=>call.name==='ellipse');
 assert.ok(first.args[0]<0&&first.args[1]<0,'spray stays behind the diagonal slide vector');
 assert.equal(first.color,'#c3eff5');
 assert.equal(a.calls.filter(call=>call.name==='stroke').length,1,'a steady, narrow water curl connects the kicked droplets');
 assert.equal(a.ctx.globalAlpha,1);assert.equal(a.ctx.fillStyle,null);assert.equal(a.ctx.strokeStyle,null);assert.equal(a.ctx.lineCap,'butt');
});

test('reduced-flash mode lowers wet spray opacity and invalid headings draw nothing',()=>{
 const draw=helper(),normal=capture(),reduced=capture();
 draw(normal.ctx,1,0,false);draw(reduced.ctx,1,0,true);
 assert.ok(reduced.calls.find(call=>call.name==='ellipse').alpha<normal.calls.find(call=>call.name==='ellipse').alpha);
 const invalid=capture();assert.equal(draw(invalid.ctx,0,0,false),false);assert.deepEqual(invalid.calls,[]);
});

test('wet spray is attached only to live slide VFX on wet surfaces',()=>{
 assert.match(source,/if\(sliding&&this\.inMatchDraw&&!p\.preview&&p\.slideTimer>0\)\{[\s\S]*?if\(game\.condition==='Wet'\)drawWetSlideSpray\(ctx,dx,dy,!!game.options\?\.reducedFlash\)/);
 assert.match(source,/function drawWetSlideSpray\(ctx,dx,dy,reducedFlash=false\)/);
});
