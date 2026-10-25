const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('host exposes room identity only while hosting',async()=>{
 const {createLanHostApproval}=await import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
 const host=createLanHostApproval({send(){}});
 assert.equal(host.roomId(),null);
 host.start('room_12345678');assert.equal(host.roomId(),'room_12345678');
 host.stop();assert.equal(host.roomId(),null);
 host.start('room_87654321');assert.equal(host.roomId(),'room_87654321');
 host.close();assert.equal(host.roomId(),null);
});
