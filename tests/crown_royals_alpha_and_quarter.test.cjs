'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/crownroyals.js'),'utf8')
 .replace('export {CROWN_ROYALS};','globalThis.CROWN_ROYALS=CROWN_ROYALS;');
test('Crown renderer keeps transparent sprite edges and does not squash quarter views',()=>{
 const pixels=new Uint8ClampedArray(132*90*4);
 pixels.set([200,100,50,12],0);
 pixels.set([200,100,50,255],4);
 let output;
 const context={
  drawImage(){},getImageData(){return {data:pixels}},putImageData(frame){output=frame.data}
 };
 const canvas={width:0,height:0,getContext(){return context}};
 const sandbox={document:{createElement(){return canvas}},Image:class{
  constructor(){this.complete=true;this.naturalWidth=132;}
  set src(v){this._src=v;if(this.onload)this.onload();}
 },URL,console};
 sandbox.globalThis=sandbox;
 vm.runInNewContext(source.replaceAll('import.meta.url', "'https://example.invalid/game.js'"),sandbox);
 const crown=sandbox.CROWN_ROYALS;
 assert.equal(crown.status().playerCount,4);
 assert.equal(crown.status().loaded,true);
 assert.deepEqual(Array.from(output.slice(0,4)),[0,0,0,0]);
 assert.deepEqual(Array.from(output.slice(4,8)),[200,100,50,255]);
 const transforms=[];
 const ctx={save(){},restore(){},translate(){},rotate(){},scale(x,y){transforms.push([x,y])},drawImage(){}};
 const p={src:{id:'crown_royals_reference_alex',renderModel:'crown_royals_reference'}};
 assert.equal(crown.draw(ctx,p,{kind:'quarterFront'}),true);
 assert.equal(crown.draw(ctx,p,{kind:'quarterBack'}),true);
 assert.equal(transforms.some(([x,y])=>x===.86&&y===1),false);
 const mirrored=[];
 const mirroredCtx={save(){},restore(){},translate(){},rotate(){},scale(x,y){mirrored.push([x,y])},drawImage(){}};
 assert.equal(crown.draw(mirroredCtx,p,{kind:'side',flip:true}),true);
 assert.equal(mirrored.some(([x,y])=>x===-1&&y===1),true);
 const normal=[];
 const normalCtx={save(){},restore(){},translate(){},rotate(){},scale(x,y){normal.push([x,y])},drawImage(){}};
 assert.equal(crown.draw(normalCtx,p,{kind:'side',flip:false}),true);
 assert.equal(normal.some(([x,y])=>x===-1&&y===1),false);
 const lunges=[];
 const actionCtx={save(){},restore(){},translate(x,y){lunges.push(['translate',x,y])},
  rotate(angle){lunges.push(['rotate',angle])},
  scale(x,y){lunges.push(['scale',x,y])},drawImage(){}};
 assert.equal(crown.draw(actionCtx,p,{kind:'side'},{action:'tackle',phase:1}),true);
 assert.equal(lunges.some(([kind,x,y])=>kind==='translate'&&x===12&&y===8),true);
 assert.equal(lunges.some(([kind,x,y])=>kind==='scale'&&x===1.12&&y===.8),true);
 assert.equal(crown.draw(actionCtx,p,{kind:'side'},{action:'slide',phase:-1}),true);
 assert.equal(lunges.some(([kind,x,y])=>kind==='translate'&&x===-12&&y===8),true);
});
