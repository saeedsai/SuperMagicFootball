const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('LAN-094 busy/version rejection includes both admission identifiers',async()=>{
 const {rejectBusyLanJoin}=await import('../scripts/lan-busy-join.mjs');
 const guest={},messages=[],m={type:'join',roomId:'room_12345678',requestId:'request_12345678'};
 assert.equal(rejectBusyLanJoin(guest,m,(to,msg)=>{messages.push({to,...msg});return true}),true);
 assert.deepEqual(messages,[{to:guest,type:'join-reject',roomId:m.roomId,requestId:m.requestId,reason:'room-full-or-version'}]);
 assert.equal(rejectBusyLanJoin(guest,{...m,requestId:undefined},()=>true),false);
 assert.equal(rejectBusyLanJoin(guest,m,()=>false),false);
});
test('LAN-094 real broker routes occupied/version-mismatch rejection through correlated helper',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/import \{rejectBusyLanJoin\} from '\.\/lan-busy-join\.mjs'/);
 const join=server.split("if(m.type==='join'){")[1]?.split("if(m.type==='decision'){")[0];
 assert.ok(join);assert.match(join,/room\.guest\|\|/);assert.match(join,/m\.build!==room\.build/);
 assert.match(join,/return rejectBusyLanJoin\(ws,m,send\)/);
});
