const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('room refresh is authoritative, network-scoped and includes occupancy',async()=>{
 const {lanRoomSnapshot}=await import('../scripts/lan-room-snapshot.mjs');
 const rooms=new Map([
  ['one',{id:'room_12345678',name:'Available',build:'0.10.6.0',ip:'lan-a',guest:null}],
  ['two',{id:'room_87654321',name:'Occupied',build:'0.10.6.0',ip:'lan-a',guest:{}}],
  ['three',{id:'room_11111111',name:'Other network',build:'0.10.6.0',ip:'lan-b',guest:null}]
 ]);
 const visible=(viewer,host)=>viewer===host;
 assert.deepEqual(lanRoomSnapshot(rooms,'lan-a',visible),{type:'rooms-snapshot',rooms:[
  {roomId:'room_12345678',name:'Available',build:'0.10.6.0',full:false},
  {roomId:'room_87654321',name:'Occupied',build:'0.10.6.0',full:true}
 ]});
 assert.deepEqual(lanRoomSnapshot(rooms,'lan-c',visible).rooms,[]);
 assert.equal(rooms.size,3,'directory query does not mutate hosted rooms');
 assert.throws(()=>lanRoomSnapshot(rooms,'lan-a',null),TypeError);
});
test('signaling broker responds to room refresh with scoped authoritative snapshot',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/import \{lanRoomSnapshot\} from '\.\/lan-room-snapshot\.mjs'/);
 assert.match(server,/lanRoomSnapshot\(rooms,meta\.ip,sameSubnet,requested\)/);
 assert.match(server,/meta\.discoveryScope=requested/);
 assert.match(server,/roomVisible\(room,meta\)/);
});

test('internet P2P rooms are globally visible only in their explicit directory; LAN remains scoped',async()=>{
 const {lanRoomSnapshot}=await import('../scripts/lan-room-snapshot.mjs');
 const rooms=new Map([
  ['lan-local',{id:'room_11111111',name:'Local host',build:'0.11.3.0',scope:'lan',ip:'10.0.0.1',guest:null}],
  ['lan-remote',{id:'room_22222222',name:'Remote LAN',build:'0.11.3.0',scope:'lan',ip:'10.0.1.1',guest:null}],
  ['internet',{id:'room_33333333',name:'Internet host',build:'0.11.3.0',scope:'internet-p2p',ip:'203.0.113.9',guest:null}]
 ]);
 const same=(viewer,host)=>viewer===host;
 const lan=lanRoomSnapshot(rooms,'10.0.0.1',same,'lan');
 assert.deepEqual(lan.rooms.map(r=>r.roomId),['room_11111111']);
 const remote=lanRoomSnapshot(rooms,'198.51.100.25',same,'internet-p2p');
 assert.deepEqual(remote.rooms,[{roomId:'room_33333333',name:'Internet host',
  build:'0.11.3.0',full:false,scope:'internet-p2p'}]);
 assert.deepEqual(lanRoomSnapshot(rooms,'198.51.100.25',same,'lan').rooms,[]);
 assert.equal(rooms.size,3);
});

test('host consent broker forwards bounded guest name and original host display name',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/guestName:safeGuestName\(m\.guestName\)/);
 assert.match(server,/type:'join-request',roomId:id,requestId,guestName:safeGuestName\(m\.guestName\)/);
 assert.match(server,/type:'join-accept',roomId:id,requestId,hostName:room\.name/);
 assert.match(server,/type:'guest-approved',roomId:id,requestId,guestName:req\.guestName/);
 assert.match(server,/slice\(0,32\)/,'guest name must be bounded');
});
