const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=()=>import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
const packet={version:1,type:'join-request',roomId:'room_12345678',requestId:'request_12345678'};
test('cancel removes pending join without sending a decision',async()=>{
 const {createLanHostApproval}=await load();let sends=0;
 const host=createLanHostApproval({send(){sends++}});host.start(packet.roomId);host.receive(packet);
 assert.equal(host.cancel(packet.requestId),true);
 assert.equal(host.hasPending(packet.requestId),false);
 assert.equal(host.respond(packet.requestId,true),false);
 assert.equal(sends,0);
});
test('cancel refuses to interfere with an in-flight send',async()=>{
 const {createLanHostApproval}=await load();let resolve;
 const host=createLanHostApproval({send:()=>new Promise(r=>{resolve=r})});host.start(packet.roomId);host.receive(packet);
 const task=host.respond(packet.requestId,true);
 assert.equal(host.cancel(packet.requestId),false);
 resolve(true);await task;
 assert.equal(host.hasPending(packet.requestId),false);
});
