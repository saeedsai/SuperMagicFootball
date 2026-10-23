'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('src/modules/crownroyals.js','utf8').replace('export {CROWN_ROYALS};','').replace(/new URL\([^\n]*import\.meta\.url\)\.href/,"'test.png'");
test('Alex brown side hair and Leo blond rear/headband remain bounded to head pixels',()=>{
 const frames=[];
 class FakeImage{constructor(){this.complete=true;this.naturalWidth=132;}set src(v){this.onload?.();}}
 const document={createElement(){const data=new Uint8ClampedArray(132*90*4);
  for(let i=0;i<data.length;i+=4){data[i]=234;data[i+1]=225;data[i+2]=217;data[i+3]=247;}
  frames.push(data);
  return {getContext(){return {drawImage(){},getImageData(){return {data};},putImageData(){}};}};
 }};
 const art=vm.runInNewContext(src+';CROWN_ROYALS',{Image:FakeImage,document,Object});
 assert.equal(art.status().hairCorrected,true);
 const px=(d,x,y)=>Array.from(d.slice((y*132+x)*4,(y*132+x)*4+4));
 const alex=frames[0],leo=frames[2],kwame=frames[4];
 assert.deepEqual(px(alex,108,12),[202,120,57,247]);
 assert.deepEqual(px(leo,72,11),[29,24,43,247]);
 assert.notDeepEqual(px(leo,72,8).slice(0,3),[234,225,217]);
 assert.deepEqual(px(leo,72,24),[234,225,217,247],'neck unchanged');
 for(const d of [alex,leo,kwame])assert.deepEqual(px(d,12,55),[234,225,217,247],'uniform unchanged');
 assert.deepEqual(px(kwame,72,11),[234,225,217,247],'Kwame untouched');
});
test('missing canvas readback falls back to original image',()=>{
 class FakeImage{constructor(){this.complete=true;this.naturalWidth=132;}set src(v){this.onload?.();}}
 const art=vm.runInNewContext(src+';CROWN_ROYALS',{Image:FakeImage,Object});
 assert.equal(art.status().loaded,true);assert.equal(art.status().leoLoaded,true);assert.equal(art.status().kwameLoaded,true);
});
