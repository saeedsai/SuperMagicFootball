'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=()=>import(pathToFileURL(path.resolve('src/modules/lan-session.js')).href);
test('LAN diagonal movement is normalized without changing cardinal input',async()=>{
 const {createLanHostState,acceptLanPacket}=await load();
 const joined=acceptLanPacket(createLanHostState('room001','host001'),{type:'hello',version:1,roomId:'room001',peerId:'guest01'}).state;
 const packet=axis=>({type:'input',version:1,roomId:'room001',peerId:'guest01',sequence:0,buttons:{pass:false,shoot:false,dribble:false,jump:false},axis});
 const diagonal=acceptLanPacket(joined,packet({x:1,y:1}));
 assert.equal(diagonal.accepted,true);
 assert.ok(Math.abs(Math.hypot(diagonal.input.axis.x,diagonal.input.axis.y)-1)<1e-12);
 const cardinal=acceptLanPacket(joined,packet({x:1,y:0}));
 assert.deepEqual(cardinal.input.axis,{x:1,y:0});
 assert.deepEqual(packet({x:1,y:1}).axis,{x:1,y:1});
});
