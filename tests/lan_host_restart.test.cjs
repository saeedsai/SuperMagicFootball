const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('same-room restart preserves pending request; switching clears it',async()=>{
 const {createLanHostApproval}=await import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
 const host=createLanHostApproval({send() {}});
 host.start('room_12345678');
 assert.equal(host.receive({version:1,type:'join-request',roomId:'room_12345678',requestId:'request_12345678'}),true);
 host.start('room_12345678');
 assert.deepEqual(host.pendingRequests(),['request_12345678']);
 host.start('room_87654321');
 assert.deepEqual(host.pendingRequests(),[]);
});
