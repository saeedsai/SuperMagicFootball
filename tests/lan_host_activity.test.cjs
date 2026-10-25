const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
test('host activity state follows lifecycle',async()=>{
 const {createLanHostApproval}=await import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
 const host=createLanHostApproval({send(){}});
 assert.equal(host.isHosting(),false);
 host.start('room_12345678');assert.equal(host.isHosting(),true);
 host.start('room_12345678');assert.equal(host.isHosting(),true);
 host.stop();assert.equal(host.isHosting(),false);
 host.start('room_87654321');assert.equal(host.isHosting(),true);
 host.close();assert.equal(host.isHosting(),false);
});
