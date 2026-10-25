const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('invalid clock cannot create pending join request',async()=>{
 const {createLanHostApproval}=await import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
 let time=NaN;
 const host=createLanHostApproval({send(){},now:()=>time});host.start('room_12345678');
 const request={version:1,type:'join-request',roomId:'room_12345678',requestId:'request_12345678'};
 assert.equal(host.receive(request),false);
 assert.equal(host.pendingCount(),0);
 time=0;
 assert.equal(host.receive(request),true);
 assert.equal(host.pendingCount(),1);
});

test('host samples clock once when accepting join, so expiry cannot be extended by clock drift',async()=>{
 const {createLanHostApproval}=await import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
 let calls=0;
 const host=createLanHostApproval({send(){},ttlMs:1000,now:()=>++calls===1?0:100000});
 host.start('room_12345678');
 const request={version:1,type:'join-request',roomId:'room_12345678',requestId:'request_12345678'};
 assert.equal(host.receive(request),true);
 assert.equal(calls,1);
 assert.equal(host.pendingCount(),0,'request must expire from original timestamp');
});
test('unsafe and fractional clocks cannot create join requests',async()=>{
 const {createLanHostApproval}=await import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
 let time=Number.MAX_SAFE_INTEGER;
 const host=createLanHostApproval({send(){},now:()=>time});host.start('room_12345678');
 const request={version:1,type:'join-request',roomId:'room_12345678',requestId:'request_12345678'};
 assert.equal(host.receive(request),false);
 time=0.5;
 assert.equal(host.receive(request),false);
 time=0;
 assert.equal(host.receive(request),true);
});
