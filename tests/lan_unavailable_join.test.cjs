const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const load=()=>import('../scripts/lan-unavailable-join.mjs');

test('missing or invisible room rejects valid join without revealing visibility',async()=>{
 const {rejectUnavailableJoin}=await load();const guest={},events=[];
 assert.equal(rejectUnavailableJoin(guest,{type:'join',roomId:'missing-room',requestId:'request_123'},(to,msg)=>{events.push({to,...msg});return true}),true);
 assert.deepEqual(events,[{to:guest,type:'join-reject',roomId:'missing-room',requestId:'request_123',reason:'room-unavailable'}]);
});
test('other messages and malformed join IDs do not receive replies',async()=>{
 const {rejectUnavailableJoin}=await load();let sends=0;const send=()=>{sends++;return true};
 for(const msg of [{type:'offer',requestId:'request_123'},{type:'join',requestId:'bad'},{type:'join',requestId:'bad space 123'},{type:'join',requestId:123},null]) {
  assert.equal(rejectUnavailableJoin({},msg,send),false);
 }
 assert.equal(sends,0);
});
test('failed signaling send is propagated without throwing',async()=>{
 const {rejectUnavailableJoin}=await load();
 assert.equal(rejectUnavailableJoin({},{type:'join',requestId:'request_123'},()=>false),false);
});
test('LAN server invokes unavailable join reply only on inaccessible room path',()=>{
 const source=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(source,/import \{rejectUnavailableJoin\} from '\.\/lan-unavailable-join\.mjs'/);
 assert.match(source,/if\(!room\|\|!roomVisible\(room,meta\)\)\{rejectUnavailableJoin\(ws,m,send\);return;\}/);
});
