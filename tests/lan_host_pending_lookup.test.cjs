const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('pending lookup tracks expiry and host close',async()=>{
 const {createLanHostApproval}=await import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
 let now=0;
 const host=createLanHostApproval({send(){},now:()=>now,ttlMs:1000});
 host.start('room_12345678');
 const requestId='request_12345678';
 assert.equal(host.hasPending(requestId),false);
 assert.equal(host.receive({version:1,type:'join-request',roomId:'room_12345678',requestId}),true);
 assert.equal(host.hasPending(requestId),true);
 now=1000;
 assert.equal(host.hasPending(requestId),false);
 host.close();
 assert.equal(host.hasPending(requestId),false);
});
