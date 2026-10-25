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
