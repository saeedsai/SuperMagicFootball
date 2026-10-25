const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=()=>import('../scripts/lan-addresses.mjs');
const interfaces={wifi:[{family:'IPv4',internal:false,address:'192.168.1.20'},{family:'IPv6',internal:false,address:'fe80::2'}],loop:[{family:'IPv4',internal:true,address:'127.0.0.1'}],vpn:[{family:'IPv4',internal:false,address:'10.8.1.9'}],public:[{family:'IPv4',internal:false,address:'8.8.8.8'}]};
test('advertises reachable private HTTP game origins without localhost or public hosts',async()=>{
 const {getLanGameUrls}=await load();
 assert.deepEqual(getLanGameUrls({interfaces,port:8000}),['http://10.8.1.9:8000','http://192.168.1.20:8000']);
 assert.deepEqual(getLanGameUrls({interfaces,port:8888,bind:'192.168.1.20'}),['http://192.168.1.20:8888']);
 assert.deepEqual(getLanGameUrls({interfaces,port:8000,bind:'127.0.0.1'}),[]);
});
test('invalid ports cannot produce advertised host links',async()=>{
 const {getLanGameUrls}=await load();
 for(const port of [0,-1,65536,1.5,'8000'])assert.throws(()=>getLanGameUrls({interfaces,port}),/port/);
});
test('signaling server sends host address list as a separate event',()=>{
 const fs=require('node:fs'),source=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(source,/getLanGameUrls\(\{interfaces:networkInterfaces\(\),port,bind:host\}\)/);
 assert.match(source,/type:'lan-addresses'/);
});
