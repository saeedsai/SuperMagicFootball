const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('invalid clock callback fails at construction',async()=>{
 const {createLanRoomDirectory}=await import(pathToFileURL(path.resolve('src/modules/lan-room-directory.js')).href);
 assert.throws(()=>createLanRoomDirectory({now:null}),TypeError);
 assert.throws(()=>createLanRoomDirectory({now:42}),TypeError);
 assert.equal(createLanRoomDirectory({now:()=>0}).count(),0);
});
