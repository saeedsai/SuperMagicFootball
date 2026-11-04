const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const load=()=>import('../scripts/lan-signal-policy.mjs');
test('LAN mode remains private-address and same-subnet scoped',async()=>{
 const {createLanSignalPolicy}=await load(),p=createLanSignalPolicy();
 assert.equal(p.allows('192.168.1.2','http://192.168.1.2:8000','192.168.1.2:8000'),true);
 assert.equal(p.allows('8.8.8.8','http://localhost:8000','localhost:8000'),false);
 assert.equal(p.allows('192.168.1.2','https://evil.example','192.168.1.2:8000'),false);
 assert.equal(p.visible('192.168.1.2','192.168.1.3'),true);
 assert.equal(p.visible('192.168.1.2','192.168.2.3'),false);
 assert.equal(p.visible('127.0.0.1','192.168.1.3'),true,'host browsing localhost must be visible to private LAN guests');
 assert.equal(p.visible('192.168.1.3','::1'),true,'IPv6 localhost host must be visible too');
 assert.equal(p.visible('127.0.0.1','8.8.8.8'),false,'never expose loopback-hosted rooms to public source addresses');
});
test('hosted mode requires exact configured HTTPS browser origin',async()=>{
 const {createLanSignalPolicy}=await load(),p=createLanSignalPolicy({mode:'hosted',publicOrigin:'https://saeedsai.github.io'});
 assert.equal(p.allows('8.8.8.8','https://saeedsai.github.io','signal.example'),true);
 const own=createLanSignalPolicy({mode:'hosted',publicOrigin:'https://saeedsai.github.io',selfOrigin:'https://game.onrender.com'});
 assert.equal(own.allows('203.0.113.5','https://game.onrender.com','game.onrender.com'),true);
 assert.equal(own.allows('203.0.113.5','https://evil.test','game.onrender.com'),false);
 for(const origin of [undefined,'http://saeedsai.github.io','https://saeedsai.github.io.evil.test','https://evil.test'])
  assert.equal(p.allows('8.8.8.8',origin,'signal.example'),false);
 assert.equal(p.visible('192.168.1.2','10.1.2.3'),false,'different public IPs cannot discover each other');
 assert.equal(p.visible('203.0.113.21','203.0.113.21'),true,'devices sharing a public IPv4 can discover each other');
 assert.equal(p.visible('2001:db8:1:2::1','2001:db8:1:2::2'),true,'IPv6 privacy addresses on same /64 can discover each other');
});
test('hosted mode rejects unsafe configuration rather than opening a public socket',async()=>{
 const {createLanSignalPolicy}=await load();
 for(const publicOrigin of [undefined,'*','http://saeedsai.github.io','https://saeedsai.github.io/','https://saeedsai.github.io/path'])
  assert.throws(()=>createLanSignalPolicy({mode:'hosted',publicOrigin}),/exact HTTPS/);
 assert.throws(()=>createLanSignalPolicy({mode:'other'}),/Invalid signaling mode/);
});
test('server wires hosted scope policy to websocket handshake and room visibility',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/createLanSignalPolicy\(\{mode:process\.env\.SMF_SIGNAL_MODE\|\|'lan',publicOrigin:process\.env\.SMF_PUBLIC_ORIGIN,selfOrigin:process\.env\.RENDER_EXTERNAL_URL\|\|null\}\)/);
 assert.match(server,/signalPolicy\.allows\(ip,origin,req\.headers\.host\)/);
 assert.match(server,/signalPolicy\.visible\(a,b\)/);
});

test('hosted signaling bounds room count and per-guest/per-room pending requests',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/MAX_ROOMS=128,MAX_PENDING_PER_GUEST=1,MAX_PENDING_PER_ROOM=1/);
 assert.match(server,/rooms\.size>=MAX_ROOMS/);
 assert.match(server,/p\.guest===ws/);
 assert.match(server,/p\.roomId===id/);
 assert.match(server,/reason:'request-already-pending'/);
 assert.match(server,/reason:'room-queue-full'/);
});

test('signaling closes sockets that exceed the per-connection message budget',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/MAX_MESSAGES_PER_WINDOW=120,WINDOW_MS=60000/);
 assert.match(server,/windowStart:connectedAt,messageCount:0/);
 assert.match(server,/if\(elapsedNow-meta\.windowStart>=WINDOW_MS\)/);
 assert.doesNotMatch(server,/Date\.now\(\).*windowStart|wallNow-meta\.windowStart/);
 assert.match(server,/\+\+meta\.messageCount>MAX_MESSAGES_PER_WINDOW/);
 assert.match(server,/ws\.close\(1008,'Signaling rate limit'\)/);
});

test('signaling caps concurrent WebSocket sessions per source IP',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/MAX_CONNECTIONS_PER_IP=8/);
 assert.match(server,/maxPerIp:MAX_CONNECTIONS_PER_IP/);
 assert.match(server,/connectionBudget\.reserve\(req,ip\)/);
});

test('signaling reserves a configurable bounded total connection budget through handshake completion',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/LAN_MAX_CONNECTIONS===undefined\?256:Number\(process\.env\.LAN_MAX_CONNECTIONS\)/);
 assert.match(server,/connectionBudget\.reserve\(req,ip\)/);
 assert.match(server,/connectionBudget\.connect\(req\)/);
 assert.match(server,/connectionBudget\.release\(req\)/);
 assert.match(server,/wss\.on\('wsClientError',\(_error,_socket,req\)=>connectionBudget\.release\(req\)\)/);
});

test('approving a guest rejects other queued requests for that room',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/for\(const \[otherKey,other\] of pending\)if\(other\.roomId===id\)/);
 assert.match(server,/pending\.delete\(otherKey\)/);
 assert.match(server,/send\(other\.guest,\{type:'join-reject',roomId:id,requestId:otherId,reason:'room-full'\}\)/);
 assert.match(server,/send\(ws,\{type:'join-cancel',roomId:id,requestId:otherId\}\)/);
});

test('repeated registration by the same host is idempotent',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/if\(rooms\.has\(id\)\)\{const existing=rooms\.get\(id\);if\(existing\.host!==ws\).*?send\(ws,\{type:'host-registered',roomId:id\}\);return\}/);
 assert.match(server,/existing\.listed=requested!=='internet-p2p'\|\|m\.public!==false/);
 assert.match(server,/existing\.scope!==requested\)return send\(ws,\{type:'error',message:'Cannot change discovery scope for an active room'\}\)/);
 assert.match(server,/requested==='internet-p2p'&&m\.public!==undefined&&typeof m\.public!=='boolean'/);
});

test('host or approved guest cannot request another guest seat on the same socket',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/\[\.\.\.rooms\.values\(\)\]\.some\(active=>active\.guest===ws\|\|active\.host===ws\)/);
 assert.match(server,/if\(ws===room\.host\|\|room\.guest\|\|\[\.\.\.rooms\.values\(\)\]\.some\(active=>active\.guest===ws\|\|active\.host===ws\)/);
});

test('late host approval cannot bypass the 30-second join expiry',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/if\(brokerNow\(\)-req\.time>30000\)/);
 assert.match(server,/send\(req\.guest,\{type:'join-reject',roomId:id,requestId,reason:'timeout'\}\)/);
 assert.match(server,/send\(ws,\{type:'join-cancel',roomId:id,requestId,reason:'timeout'\}\)/);
});

test('half-open WebSocket rooms are evicted after missed heartbeat response',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/alive:true/);
 assert.match(server,/ws\.on\('pong',\(\)=>\{meta\.alive=true\}\)/);
 assert.match(server,/if\(!meta\.alive\)\{ws\.terminate\(\);continue\}/);
 assert.match(server,/meta\.alive=false;try\{ws\.ping\(\)\}/);
 assert.match(server,/\},20000\)\.unref\(\)/);
});
