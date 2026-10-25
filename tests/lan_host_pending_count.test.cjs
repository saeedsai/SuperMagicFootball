const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('pending count tracks requests, expiry, and close',async()=>{
 const {createLanHostApproval}=await import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
 let time=0;
 const host=createLanHostApproval({send(){},now:()=>time,ttlMs:1000});
 host.start('room_12345678');
 assert.equal(host.pendingCount(),0);
 assert.equal(host.receive({version:1,type:'join-request',roomId:'room_12345678',requestId:'request_12345678'}),true);
 assert.equal(host.pendingCount(),1);
 time=1000;
 assert.equal(host.pendingCount(),0);
 host.close();
 assert.equal(host.pendingCount(),0);
});
