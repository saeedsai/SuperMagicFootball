const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('room count updates on expiry',async()=>{
 const {createLanRoomDirectory}=await import(pathToFileURL(path.resolve('src/modules/lan-room-directory.js')).href);
 let time=0;
 const directory=createLanRoomDirectory({now:()=>time,ttlMs:1000});
 assert.equal(directory.count(),0);
 directory.receive({version:1,type:'room-announce',roomId:'room_12345678',name:'Match',players:1});
 assert.equal(directory.count(),1);
 time=1000;
 assert.equal(directory.count(),0);
});
