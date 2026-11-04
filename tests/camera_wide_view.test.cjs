const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('Wide graphics setting names the larger field view and explains gameplay remains unchanged',()=>{
 const ui=read('src/modules/ui.js');
 assert.match(ui,/\['Wide','Wider pitch view'\]/);
 assert.match(ui,/Wider pitch view shows more of the field around the ball\. It does not change movement, scoring or hitboxes\./);
});

test('Wide framing expands the camera world viewport while overlays restore the base transform',()=>{
 const render=read('src/modules/render.js');
 assert.match(render,/const cameraZoom=zoomWide\s*\?\s*\.86\s*:\s*1/);
 assert.match(render,/const viewW=this\.screenW\/cameraZoom,viewH=this\.screenH\/cameraZoom/);
 assert.match(render,/const cameraExtraX=this\.screenW\*\(1-cameraZoom\)\/\(2\*cameraZoom\),cameraExtraY=this\.screenH\*\(1-cameraZoom\)\/\(2\*cameraZoom\)/);
 assert.match(render,/clamp\(follow\.x-this\.screenW\/2\+\(follow\.vx\|\|0\)\*\.12,cameraExtraX,WORLD\.w-viewW\+cameraExtraX\)/);
 assert.match(render,/clamp\(follow\.y-this\.screenH\/2\+\(follow\.vy\|\|0\)\*\.055,cameraExtraY,WORLD\.h-viewH\+cameraExtraY\)/);
 assert.match(render,/F\.x\+F\.w-viewW\+cameraExtraX/);
 assert.match(render,/ctx\.rect\(0,0,this\.screenW,this\.screenH\);ctx\.clip\(\);\s*\n const zoomWide/);
 assert.match(render,/ctx\.setTransform\(s\*cameraZoom/);
});
