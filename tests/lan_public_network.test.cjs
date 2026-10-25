'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=()=>import('../scripts/lan-public-network.mjs');

test('LAN client IP uses socket and ignores untrusted browser forwarded headers',async()=>{
 const {lanClientIp}=await load();
 const request={socket:{remoteAddress:'::ffff:192.168.1.5'},headers:{'x-forwarded-for':'198.51.100.19'}};
 assert.equal(lanClientIp(request),'192.168.1.5');
});

test('managed hosted signaling uses the edge-forwarded client IP, not Render load balancer',async()=>{
 const {lanClientIp}=await load();
 const request={socket:{remoteAddress:'10.111.0.5'},headers:{'x-forwarded-for':'203.0.113.20, 172.16.20.3'}};
 assert.equal(lanClientIp(request,{hosted:true}),'172.16.20.3');
 const spoofed={socket:{remoteAddress:'10.111.0.5'},headers:{'x-forwarded-for':'198.51.100.66, 203.0.113.20'}};
 assert.equal(lanClientIp(spoofed,{hosted:true}),'203.0.113.20','client-supplied prefix must not spoof discovery network');
 assert.equal(lanClientIp({socket:{remoteAddress:'10.111.0.5'},headers:{}},{hosted:true}),'');
 assert.equal(lanClientIp({socket:{remoteAddress:'10.111.0.5'},headers:{'x-forwarded-for':'evil'}},{hosted:true}),'');
});

test('hosted rooms appear only to the same public IPv4 or IPv6 network',async()=>{
 const {samePublicNetwork}=await load();
 assert.equal(samePublicNetwork('203.0.113.5','203.0.113.5'),true);
 assert.equal(samePublicNetwork('203.0.113.5','203.0.113.6'),false);
 assert.equal(samePublicNetwork('203.0.113.5','198.51.100.5'),false);
 assert.equal(samePublicNetwork('2001:db8:abcd:9876::1','2001:db8:abcd:9876::cafe'),true);
 assert.equal(samePublicNetwork('2001:db8:abcd:9876::1','2001:db8:abcd:9877::1'),false);
 assert.equal(samePublicNetwork('203.0.113.5','2001:db8::1'),false);
 assert.equal(samePublicNetwork('',''),false);
});
