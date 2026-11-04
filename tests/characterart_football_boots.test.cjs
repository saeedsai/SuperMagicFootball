const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.resolve(__dirname,'../src/modules/characterart.js'),'utf8');
const boots=source.slice(source.indexOf(' function boots('),source.indexOf(' function drawLeg(',source.indexOf(' function boots(')));
const live=fs.readFileSync(path.resolve(__dirname,'../src/modules/render.js'),'utf8');
const liveModel=live.slice(live.indexOf('function drawPremiumCharacter('),live.indexOf('\n}\n\nclass Renderer'));
const footwearStart=liveModel.indexOf('// Small trim-colored crossed laces');
const footwearEnd=liveModel.indexOf('leg(-1,false)',footwearStart);
const liveFootwear=liveModel.slice(footwearStart,footwearEnd);

test('existing player boots retain their silhouette while drawing laces, toe seams and three trim-colored cleat studs',()=>{
 assert.ok(boots.length>0,'boot painter exists');
 assert.match(boots,/Fine crossed laces/);
 assert.match(boots,/stroke\(c,\[\[x-4\.5,y-1\.5\],\[x-1\.8,y\+1\],\[x\+1,y-1\.5\],\[x\+3\.7,y\+1\],\[x\+6\.4,y-1\]\]/);
 assert.match(boots,/toe-cap seam/);
 assert.match(boots,/oval\(c,toe\+5,y\+7,1\.6,1,col\)/,'preserve the existing toe stud');
 assert.match(boots,/oval\(c,x-5,y\+7,1\.55,1\.15,col,dark,\.45\);oval\(c,x\+2,y\+7,1\.55,1\.15,col,dark,\.45\)/,'add two contrast-outlined studs');
 assert.doesNotMatch(boots,/p\.x\s*=|p\.y\s*=|hitbox|velocity|physics/i,'cosmetic detail has no gameplay writes');
});

test('live match renderer adds restrained footwear details without changing player geometry',()=>{
 assert.ok(liveModel.includes('const toe=side?11:q?sign===1?8:4:sign===1?7:-6;'),'retain the live directional shoe anchor');
 assert.match(liveModel,/Small trim-colored crossed laces/);
 assert.match(liveModel,/laceCenter-laceDir\*3\.1[\s\S]*laceCenter\+laceDir\*3\.1/);
 assert.match(liveModel,/const capX=ankle\[0\]\+toe\+7/);
 assert.match(liveModel,/for\(let stud=0;stud<3;stud\+\+\)artEllipse\(ctx,ankle\[0\]-5\+stud\*4\.8,ankle\[1\]\+8\.1,1\.05,\.7,trim,dark,\.45\)/);
 assert.ok(footwearStart>=0&&footwearEnd>footwearStart,'live footwear detail block exists');
 assert.doesNotMatch(liveFootwear,/p\.x\s*=|p\.y\s*=|hitbox|velocity|physics/i,'footwear remains cosmetic');
});
