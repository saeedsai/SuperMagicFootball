const test=require('node:test');
const assert=require('node:assert/strict');

async function loadStore(){return import('../scripts/online-account-store.mjs')}

class FakePool {
  constructor(){this.state={profiles:new Map(),snapshots:new Map(),commits:new Map()}}
  async query(sql,params){return this.exec(sql,params,this.state)}
  async connect(){
    const pool=this;
    let state=cloneState(this.state),active=true;
    return {
      async query(sql,params){if(!active)throw Error('client released');return pool.exec(sql,params,state)},
      async release(){active=false},
      async commit(){pool.state=state}
    };
  }
  exec(sql,p,state){
    const s=sql.replace(/\s+/g,' ').trim().toLowerCase();
    if(s==='begin')return {rows:[]};
    if(s==='commit'){
      // transaction clients are identified by their cloned map object
      const maps=state;
      this.state=maps;
      return {rows:[]};
    }
    if(s==='rollback')return {rows:[]};
    if(s.startsWith('select pg_advisory_xact_lock'))return {rows:[{}]};
    if(s.startsWith('select request_hash, committed_version, result from smf_online_commit_keys')){
      const row=state.commits.get(`${p[0]}|${p[1]}|${p[2]}`);
      return {rows:row?[structuredClone(row)]:[]};
    }
    if(s.startsWith('select version from smf_online_profiles')){
      const row=state.profiles.get(p[0]);return {rows:row?[{version:row.version}]:[]};
    }
    if(s.startsWith('select version from smf_online_snapshots')){
      const row=state.snapshots.get(`${p[0]}|${p[1]}`);return {rows:row?[{version:row.version}]:[]};
    }
    if(s.startsWith('insert into smf_online_profiles')){
      const [accountId,json,version,updatedAt,expected]=p,current=state.profiles.get(accountId);
      if(current&&current.version!==expected)return {rows:[]};
      const row={account_id:accountId,profile:JSON.parse(json),version,updated_at:updatedAt};
      state.profiles.set(accountId,row);return {rows:[row]};
    }
    if(s.startsWith('insert into smf_online_snapshots')){
      const [accountId,kind,json,version,updatedAt,expected]=p,key=`${accountId}|${kind}`,current=state.snapshots.get(key);
      if(current&&current.version!==expected)return {rows:[]};
      const row={account_id:accountId,kind,payload:JSON.parse(json),version,updated_at:updatedAt};
      state.snapshots.set(key,row);return {rows:[row]};
    }
    if(s.startsWith('insert into smf_online_commit_keys')){
      const [accountId,resource,key,hash,version,result,createdAt]=p,k=`${accountId}|${resource}|${key}`;
      if(state.commits.has(k)){const e=Error('unique');e.code='23505';throw e}
      state.commits.set(k,{account_id:accountId,resource,idempotency_key:key,request_hash:hash,committed_version:version,result:JSON.parse(result),created_at:createdAt});return {rows:[]};
    }
    if(s.startsWith('select account_id,profile,version,updated_at from smf_online_profiles')){
      const row=state.profiles.get(p[0]);return {rows:row?[structuredClone(row)]:[]};
    }
    if(s.startsWith('select account_id,kind,payload,version,updated_at from smf_online_snapshots')){
      const row=state.snapshots.get(`${p[0]}|${p[1]}`);return {rows:row?[structuredClone(row)]:[]};
    }
    throw Error(`Unhandled SQL in test adapter: ${sql}`);
  }
}

function cloneState(state){return {profiles:new Map(structuredClone([...state.profiles])),snapshots:new Map(structuredClone([...state.snapshots])),commits:new Map(structuredClone([...state.commits]))}}
function setup(){return loadStore().then(({createOnlineAccountStore})=>({store:createOnlineAccountStore({db:new FakePool(),now:()=>new Date('2026-11-04T12:00:00.000Z')})}))}

test('versioned snapshots save, read, update and isolate accounts and kinds',async()=>{
 const {store}=await setup();
 assert.equal(await store.getSnapshot('player_1','career'),null);
 const saved=await store.putSnapshot('player_1','career',{schemaVersion:1,season:1},{expectedVersion:0,idempotencyKey:'career-save-001'});
 assert.equal(saved.version,1);assert.equal(saved.duplicate,false);
 assert.deepEqual(await store.getSnapshot('player_1','career'),{accountId:'player_1',kind:'career',payload:{schemaVersion:1,season:1},version:1,updatedAt:'2026-11-04T12:00:00.000Z'});
 assert.equal(await store.getSnapshot('player_2','career'),null);
 assert.equal(await store.getSnapshot('player_1','ultimate-team'),null);
 const updated=await store.putSnapshot('player_1','career',{schemaVersion:1,season:2},{expectedVersion:1,idempotencyKey:'career-save-002'});
 assert.equal(updated.version,2);
});

test('retries are idempotent, but reusing a key for changed content conflicts',async()=>{
 const {store}=await setup(),payload={schemaVersion:1,squad:[]};
 const first=await store.putSnapshot('user_123','ultimate-team',payload,{expectedVersion:0,idempotencyKey:'squad-save-01'});
 const retry=await store.putSnapshot('user_123','ultimate-team',{squad:[],schemaVersion:1},{expectedVersion:0,idempotencyKey:'squad-save-01'});
 assert.equal(retry.duplicate,true);assert.equal(retry.version,first.version);assert.deepEqual(retry.payload,payload);
 await assert.rejects(store.putSnapshot('user_123','ultimate-team',{schemaVersion:1,squad:['changed']},{expectedVersion:0,idempotencyKey:'squad-save-01'}),e=>e.code==='idempotency-conflict');
});

test('optimistic version check prevents lost updates and leaves stored version untouched',async()=>{
 const {store}=await setup();
 await store.putSnapshot('user_123','career',{schemaVersion:1,week:1},{expectedVersion:0,idempotencyKey:'career-put-01'});
 await assert.rejects(store.putSnapshot('user_123','career',{schemaVersion:1,week:9},{expectedVersion:0,idempotencyKey:'career-put-02'}),e=>e.code==='version-conflict');
 assert.equal((await store.getSnapshot('user_123','career')).payload.week,1);
});

test('account profile has its own versioned record and idempotency scope',async()=>{
 const {store}=await setup();
 assert.equal(await store.getProfile('acct'),null);
 const saved=await store.putProfile('acct',{displayName:'Captain'},{expectedVersion:0,idempotencyKey:'profile-001'});
 assert.equal(saved.version,1);assert.deepEqual((await store.getProfile('acct')).profile,{displayName:'Captain'});
 await assert.rejects(store.putProfile('acct',{displayName:'Changed'},{expectedVersion:0,idempotencyKey:'profile-002'}),e=>e.code==='version-conflict');
});

test('rejects invalid account IDs, resources, versions, keys and non-record payloads',async()=>{
 const {store}=await setup();
 await assert.rejects(store.getProfile('bad id'),e=>e.code==='invalid-account');
 await assert.rejects(store.getSnapshot('acct','wallet'),e=>e.code==='invalid-resource');
 await assert.rejects(store.putSnapshot('acct','career',{}, {expectedVersion:-1,idempotencyKey:'career-key-01'}),e=>e.code==='invalid-version');
 await assert.rejects(store.putSnapshot('acct','career',{}, {expectedVersion:0,idempotencyKey:'short'}),e=>e.code==='invalid-idempotency-key');
 await assert.rejects(store.putSnapshot('acct','career',[], {expectedVersion:0,idempotencyKey:'career-key-01'}),e=>e.code==='invalid-payload');
});

test('rejects non-JSON values, cycles, reserved keys and oversized snapshots',async()=>{
 const {store}=await setup(),options={expectedVersion:0,idempotencyKey:'career-data-01'};
 const circular={schemaVersion:1};circular.self=circular;
 await assert.rejects(store.putSnapshot('acct','career',{value:Infinity},options),e=>e.code==='invalid-payload');
 await assert.rejects(store.putSnapshot('acct','career',circular,options),e=>e.code==='invalid-payload');
 await assert.rejects(store.putSnapshot('acct','career',JSON.parse('{"__proto__":{"polluted":true}}'),options),e=>e.code==='invalid-payload');
 await assert.rejects(store.putSnapshot('acct','career',{data:'x'.repeat(512*1024)},options),e=>e.code==='payload-too-large');
});
