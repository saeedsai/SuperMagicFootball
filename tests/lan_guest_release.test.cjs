const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const load=()=>import('../scripts/lan-guest-release.mjs');
const fixture=()=>{
 const host={},guest={},other={},rooms=new Map([
  ['room_1',{id:'room_1',host,guest,ip:'192.168.1.2'}],
  ['room_2',{id:'room_2',host,guest:other,ip:'192.168.1.2'}]
 ]),pending=new Map([
  ['request_a',{roomId:'room_2',guest,host}],
  ['request_b',{roomId:'room_2',guest:other,host}]
 ]),events=[];
 return {host,guest,other,rooms,pending,events,send:(to,message)=>events.push({to,...message})};
};
test('departing guest frees approved seat and only own pending requests',async()=>{
 const {releaseLanGuest}=await load(),f=fixture();
 assert.deepEqual(releaseLanGuest(f.guest,f.rooms,f.pending,f.send),{cancelled:1,released:1});
 assert.equal(f.rooms.get('room_1').guest,null);
 assert.equal(f.rooms.get('room_2').guest,f.other);
 assert.equal(f.pending.has('request_a'),false);
 assert.equal(f.pending.has('request_b'),true);
 assert.deepEqual(f.events.map(e=>e.type),['join-cancel','guest-left']);
 assert.ok(f.events.every(e=>e.to===f.host));
});
test('different socket cannot release another guest or cancel their request',async()=>{
 const {releaseLanGuest}=await load(),f=fixture();
 assert.deepEqual(releaseLanGuest({},f.rooms,f.pending,f.send),{cancelled:0,released:0});
 assert.equal(f.rooms.get('room_1').guest,f.guest);
 assert.equal(f.pending.size,2);
 assert.equal(f.events.length,0);
});
test('leave is idempotent and host room remains advertised',async()=>{
 const {releaseLanGuest}=await load(),f=fixture();
 releaseLanGuest(f.guest,f.rooms,f.pending,f.send);
 assert.deepEqual(releaseLanGuest(f.guest,f.rooms,f.pending,f.send),{cancelled:0,released:0});
 assert.equal(f.rooms.size,2);
 assert.equal(f.events.length,2);
});
test('server and lobby wire guest leave, cancel and socket-close cleanup',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 const lobby=fs.readFileSync('src/modules/lan-auto-lobby.js','utf8');
 assert.match(server,/import \{releaseLanGuest\} from '\.\/lan-guest-release\.mjs'/);
 assert.match(server,/if\(m\.type==='leave'\)\{clearHost\(ws\);releaseLanGuest\(ws,rooms,pending,send\);return\}/);
 assert.match(server,/ws\.on\('close',[\s\S]*releaseLanGuest\(ws,rooms,pending,send\)/);
 assert.match(lobby,/if\(mode==='host'\|\|mode==='guest'\)send\(\{type:'leave'\}\)/);
 assert.match(lobby,/m\.type==='join-cancel'/);
});

test('host departure notifies an already approved guest before room removal',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/if\(room\.guest\)send\(room\.guest,\{type:'host-left',roomId:id\}\)/);
 assert.match(server,/send\(req\.guest,\{type:'join-reject',roomId:id,requestId:reqId,reason:'host-left'\}\)/);
});

test('host registration must be acknowledged before UI claims a discoverable room',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 const lobby=fs.readFileSync('src/modules/lan-auto-lobby.js','utf8');
 assert.match(server,/send\(ws,\{type:'host-registered',roomId:id\}\)/);
 assert.match(lobby,/m\.type==='host-registered'&&mode==='host'&&!started&&m\.roomId===roomId/);
 assert.match(lobby,/Registering room with discovery service/);
 assert.match(lobby,/Unable to register room/);
});

test('duplicate host ID is rejected; same owner retry preserves active guest',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/if\(rooms\.has\(id\)\)\{if\(rooms\.get\(id\)\.host!==ws\)return send\(ws,\{type:'error',message:'Room already exists'\}\);send\(ws,\{type:'host-registered',roomId:id\}\);return\}/);
});

test('switching from guest to host releases previous guest seat and pending joins',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/clearHost\(ws\);\s*\/\/ Switching from guest[\s\S]*?releaseLanGuest\(ws,rooms,pending,send\);\s*meta\.discoveryScope=requested;\s*const room=/);
 assert.match(server,/some\(active=>active\.guest===ws\|\|active\.host===ws\)/);
});
