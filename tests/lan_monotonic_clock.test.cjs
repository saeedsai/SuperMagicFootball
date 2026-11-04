'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs');

test('broker elapsed clock never moves backwards and tolerates bad later samples',async()=>{
 const {createLanMonotonicClock}=await import(pathToFileURL(path.resolve('scripts/lan-monotonic-clock.mjs')).href);
 const samples=[100.8,110.2,4,NaN,125.9];
 const now=createLanMonotonicClock(()=>samples.shift());
 assert.deepEqual([now(),now(),now(),now(),now()],[110,110,110,125,125]);
});

test('LAN broker uses monotonic time for pending approval and replay TTLs',()=>{
 const source=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(source,/const brokerNow=createLanMonotonicClock\(\)/);
 assert.match(source,/const elapsedNow=brokerNow\(\)/);
 assert.match(source,/windowStart:connectedAt/);
 assert.match(source,/if\(elapsedNow-meta\.windowStart>=WINDOW_MS\)/);
 assert.match(source,/if\(elapsedNow-meta\.relayWindowStart>=1000\)/);
 assert.doesNotMatch(source,/Date\.now\(\).*windowStart|wallNow-meta\.(?:windowStart|relayWindowStart)/);
 assert.match(source,/if\(brokerNow\(\)-req\.time>30000\)/);
 assert.match(source,/expireLanPending\(pending,send,brokerNow\(\)\)/);
});
