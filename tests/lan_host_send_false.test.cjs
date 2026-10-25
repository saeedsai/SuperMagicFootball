const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const request={version:1,type:'join-request',roomId:'room_12345678',requestId:'request_12345678'};
test('sync false send preserves request for retry',async()=>{
 const {createLanHostApproval}=await import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
 const host=createLanHostApproval({send:()=>false});host.start(request.roomId);host.receive(request);
 assert.equal(host.respond(request.requestId,true),false);
 assert.equal(host.hasPending(request.requestId),true);
});
test('async false send preserves request for retry',async()=>{
 const {createLanHostApproval}=await import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
 const host=createLanHostApproval({send:async()=>false});host.start(request.roomId);host.receive(request);
 assert.equal(await host.respond(request.requestId,true),false);
 assert.equal(host.hasPending(request.requestId),true);
});
