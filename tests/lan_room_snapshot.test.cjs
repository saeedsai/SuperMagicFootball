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
 assert.match(server,/if\(m\.type==='rooms'\)\{send\(ws,lanRoomSnapshot\(rooms,meta\.ip,sameSubnet\)\);return\}/);
});
