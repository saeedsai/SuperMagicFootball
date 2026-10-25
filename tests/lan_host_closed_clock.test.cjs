const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('closed host pending list never calls clock',async()=>{
 const {createLanHostApproval}=await import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
 let fail=false;
 const host=createLanHostApproval({send(){},now:()=>{if(fail)throw Error('clock offline');return 0;}});
 host.start('room_12345678');host.close();fail=true;
 assert.deepEqual(host.pendingRequests(),[]);
 assert.equal(host.pendingCount(),0);
 assert.equal(host.hasPending('request_12345678'),false);
});
