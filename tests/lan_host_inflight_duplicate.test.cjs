const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('duplicate request rejected while decision transport is pending',async()=>{
 const {createLanHostApproval}=await import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
 let release;
 const host=createLanHostApproval({send:()=>new Promise(resolve=>{release=resolve;})});
 const request={version:1,type:'join-request',roomId:'room_12345678',requestId:'request_12345678'};
 host.start(request.roomId);
 assert.equal(host.receive(request),true);
 const inFlight=host.respond(request.requestId,true);
 assert.equal(host.receive(request),false);
 release(true);
 await inFlight;
 assert.equal(host.receive(request),false);
});
