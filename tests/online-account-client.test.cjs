const test = require('node:test');
const assert = require('node:assert/strict');

let createOnlineAccountClient;
let copyOfflineCareerSlotToRemotePayload;
let OnlineAccountError;
test('online account client module imports', async () => {
  ({createOnlineAccountClient, copyOfflineCareerSlotToRemotePayload, OnlineAccountError} = await import('../src/modules/online-account-client.js'));
  assert.equal(typeof createOnlineAccountClient, 'function');
  assert.equal(typeof copyOfflineCareerSlotToRemotePayload, 'function');
});

const TOKEN = 'test-access-token-000000000000';
const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers:{'content-type':'application/json; charset=utf-8'}});
const record = (kind, payload, version = 1) => ({kind,payload,version,updatedAt:'2026-11-04T12:00:00.000Z'});

test('requests use exact API routes and an in-memory bearer callback; they never access token storage', async () => {
  const calls = [];
  const oldStorage = globalThis.localStorage;
  let storageTouches = 0;
  globalThis.localStorage = {getItem(){storageTouches++;throw Error('must not read storage')},setItem(){storageTouches++;throw Error('must not write storage')}};
  try {
    const client = createOnlineAccountClient({getAccessToken:() => TOKEN, fetchImpl:async (url, init) => {
      calls.push({url, init});
      if (url === '/api/v1/me') return json({profile:null,version:0,updatedAt:null});
      if (url === '/api/v1/career/current') return json({record:null});
      if (url === '/api/v1/ultimate-team/squad') return json({record:record('ultimate-team',{squad:[]})});
      throw Error('unexpected route');
    }});
    assert.deepEqual(await client.loadMe(), {profile:null,version:0,updatedAt:null});
    assert.equal(await client.loadCareer(), null);
    assert.deepEqual(await client.loadUltimateTeam(), record('ultimate-team',{squad:[]}));
    assert.deepEqual(calls.map(call => call.url), ['/api/v1/me','/api/v1/career/current','/api/v1/ultimate-team/squad']);
    for (const {init} of calls) {
      assert.equal(init.headers.authorization, `Bearer ${TOKEN}`);
      assert.equal(init.credentials, 'omit');
      assert.equal(init.cache, 'no-store');
      assert.equal(init.headers.authorization.includes('undefined'), false);
    }
    assert.equal(storageTouches, 0);
  } finally {
    if (oldStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = oldStorage;
  }
});

test('save sends expected version and idempotency key and validates saved or duplicate records', async () => {
  const calls = [];
  const client = createOnlineAccountClient({getAccessToken:async () => TOKEN, fetchImpl:async (url, init) => {
    calls.push({url,init});
    const body = JSON.parse(init.body);
    return json({status:'saved',version:body.expectedVersion+1,record:record('career',body.snapshot,body.expectedVersion+1)});
  }});
  const snapshot = {schemaVersion:1,season:3};
  const saved = await client.saveCareer(snapshot,{expectedVersion:2,idempotencyKey:'career_save_0003'});
  assert.equal(calls[0].url,'/api/v1/career/current');
  assert.equal(calls[0].init.method,'PUT');
  assert.deepEqual(JSON.parse(calls[0].init.body),{expectedVersion:2,idempotencyKey:'career_save_0003',snapshot});
  assert.equal(calls[0].init.headers['content-type'],'application/json');
  assert.deepEqual(saved,{status:'saved',version:3,record:record('career',snapshot,3)});
  const duplicateClient = createOnlineAccountClient({getAccessToken:() => TOKEN,fetchImpl:async () => json({status:'duplicate',version:3,record:record('career',snapshot,3)})});
  assert.equal((await duplicateClient.saveCareer(snapshot,{expectedVersion:2,idempotencyKey:'career_save_0003'})).status,'duplicate');
});

test('version and idempotency conflicts become safe, typed errors', async () => {
  for (const code of ['version-conflict','idempotency-conflict']) {
    const client = createOnlineAccountClient({getAccessToken:() => TOKEN,fetchImpl:async () => json({error:code},409)});
    await assert.rejects(client.saveUltimateTeam({squad:[]},{expectedVersion:1,idempotencyKey:'squad_save_0001'}), error => {
      assert.ok(error instanceof OnlineAccountError);
      assert.equal(error.code,code);
      assert.equal(error.status,409);
      assert.doesNotMatch(error.message,/database|sql|token|account/i);
      return true;
    });
  }
});

test('timeout aborts the in-flight fetch and returns a safe timeout error', async () => {
  let observedAbort = false;
  const client = createOnlineAccountClient({timeoutMs:20,getAccessToken:() => TOKEN,fetchImpl:(_url,{signal}) => new Promise((_,reject) => {
    signal.addEventListener('abort',() => {observedAbort=true;reject(Error('raw transport detail'))},{once:true});
  })});
  await assert.rejects(client.loadCareer(), error => error instanceof OnlineAccountError && error.code === 'timeout' && !error.message.includes('raw transport'));
  assert.equal(observedAbort,true);
});

test('bad auth callback, network errors, malformed envelopes, and malformed records fail safely', async () => {
  const unauthenticated = createOnlineAccountClient({getAccessToken:() => null,fetchImpl:async () => {throw Error('should not fetch')}});
  await assert.rejects(unauthenticated.loadMe(), error => error.code === 'auth-required');
  const network = createOnlineAccountClient({getAccessToken:() => TOKEN,fetchImpl:async () => {throw Error('secret endpoint and token')}});
  await assert.rejects(network.loadMe(), error => error.code === 'network-unavailable' && !error.message.includes('secret'));
  const malformedEnvelope = createOnlineAccountClient({getAccessToken:() => TOKEN,fetchImpl:async () => json([])});
  await assert.rejects(malformedEnvelope.loadCareer(), error => error.code === 'invalid-response');
  const malformedRecord = createOnlineAccountClient({getAccessToken:() => TOKEN,fetchImpl:async () => json({record:{kind:'career',payload:[],version:1,updatedAt:'bad'}})});
  await assert.rejects(malformedRecord.loadCareer(), error => error.code === 'invalid-response');
  const malformedMe = createOnlineAccountClient({getAccessToken:() => TOKEN,fetchImpl:async () => json({profile:null,version:3,updatedAt:null})});
  await assert.rejects(malformedMe.loadMe(), error => error.code === 'invalid-response');
});

test('caller cancellation is distinguished from timeout', async () => {
  const controller = new AbortController();
  const client = createOnlineAccountClient({getAccessToken:() => TOKEN,fetchImpl:(_url,{signal}) => new Promise((_,reject) => signal.addEventListener('abort',() => reject(Error('cancelled')),{once:true}))});
  const result = assert.rejects(client.loadCareer({signal:controller.signal}), error => error.code === 'aborted');
  controller.abort();
  await result;
});

test('offline Career import helper is explicit, deep-copies its source, and never touches local storage', () => {
  const slot = {name:'Local season',savedAt:'2026-11-04T12:00:00.000Z',career:{season:2,roster:[{id:1,skill:{pace:8}}]}};
  const before = structuredClone(slot);
  let storageTouches = 0;
  const oldStorage = globalThis.localStorage;
  globalThis.localStorage = {getItem(){storageTouches++;return 'unchanged'},setItem(){storageTouches++}};
  try {
    const payload = copyOfflineCareerSlotToRemotePayload(slot);
    assert.deepEqual(payload,{schemaVersion:1,name:slot.name,savedAt:slot.savedAt,career:slot.career});
    payload.career.roster[0].skill.pace = 99;
    assert.deepEqual(slot,before);
    assert.equal(storageTouches,0);
  } finally {
    if (oldStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = oldStorage;
  }
});

test('offline Career helper rejects malformed or non-JSON input', () => {
  assert.throws(() => copyOfflineCareerSlotToRemotePayload({name:'x',savedAt:'bad',career:{}}), error => error.code === 'invalid-request');
  const cyclic={};cyclic.loop=cyclic;
  assert.throws(() => copyOfflineCareerSlotToRemotePayload({name:'x',savedAt:'2026-11-04',career:cyclic}), error => error.code === 'invalid-request');
  assert.throws(() => copyOfflineCareerSlotToRemotePayload({name:'x',savedAt:'2026-11-04',career:{value:Infinity}}), error => error.code === 'invalid-request');
});

test('an actual current Career save-slot shape can be explicitly copied for remote import', async () => {
  const [{TEAMS,SHOTS},{installExpansion},{createCareer},{CAREER_SLOTS}] = await Promise.all([
    import('../src/data.js'), import('../src/expanded.js'), import('../src/career.js'), import('../src/modules/career_slots.js'),
  ]);
  installExpansion(TEAMS,SHOTS);
  const club = TEAMS.findIndex(team => team.customRoster && ['club26','continental'].includes(team.group));
  const career = createCareer(club,TEAMS);
  const rows = new Map();
  const storage = {getItem:key => rows.get(key) ?? null,setItem:(key,value) => rows.set(key,String(value)),removeItem:key => rows.delete(key)};
  const offlineSlots = CAREER_SLOTS.create(storage);
  const offlineSlot = offlineSlots.save(1,career,'Representative Career');
  const localBytesBefore = new TextEncoder().encode(storage.getItem('legend_careerSlots')).byteLength;
  const remotePayload = copyOfflineCareerSlotToRemotePayload(offlineSlot);
  const snapshotBytes = new TextEncoder().encode(JSON.stringify(remotePayload)).byteLength;
  const commitBytes = new TextEncoder().encode(JSON.stringify({expectedVersion:0,idempotencyKey:'career_fixture_0001',snapshot:remotePayload})).byteLength;
  assert.equal(career.roster.length,12);
  assert.equal(career.fixtures.length,14);
  assert.ok(snapshotBytes < 512 * 1024, `representative Career payload should fit: ${snapshotBytes} bytes`);
  assert.ok(commitBytes < 576 * 1024, `wrapped Career commit should fit the server envelope limit: ${commitBytes} bytes`);
  assert.equal(new TextEncoder().encode(storage.getItem('legend_careerSlots')).byteLength,localBytesBefore);
});

test('snapshot payloads are accepted up to 512 KiB and larger payloads are rejected locally', async () => {
  const limit = 512 * 1024;
  const overhead = new TextEncoder().encode(JSON.stringify({data:''})).byteLength;
  const atLimit = {data:'x'.repeat(limit - overhead)};
  assert.equal(new TextEncoder().encode(JSON.stringify(atLimit)).byteLength,limit);
  const client = createOnlineAccountClient({getAccessToken:() => TOKEN,fetchImpl:async (_url,init) => {
    const {expectedVersion,snapshot} = JSON.parse(init.body);
    return json({status:'saved',version:expectedVersion+1,record:record('career',snapshot,expectedVersion+1)});
  }});
  assert.equal((await client.saveCareer(atLimit,{expectedVersion:0,idempotencyKey:'limit_save_0001'})).version,1);
  await assert.rejects(client.saveCareer({data:'x'.repeat(limit - overhead + 1)},{expectedVersion:0,idempotencyKey:'limit_save_0002'}),error => error.code === 'invalid-request');
});

test('match history client validates account-relative results and bounded cursor pagination',async()=>{
 const calls=[],cursor='eyJhY2NvdW50SWQiOiJzYWZlIn0';
 const client=createOnlineAccountClient({baseUrl:'https://api.example.test',getAccessToken:()=>TOKEN,fetchImpl:async(url,init)=>{
  calls.push({url,init});return json({items:[{matchId:'a'.repeat(32),recordedAt:'2026-11-04T12:00:00.000Z',teamId:'japan',opponentTeamId:'brazil',score:[2,1],outcome:'win'}],nextCursor:cursor});
 }});
 const page=await client.loadMatchHistory({limit:10,cursor});
 assert.equal(calls[0].url,'https://api.example.test/api/v1/matches/history?limit=10&cursor='+encodeURIComponent(cursor));
 assert.equal(calls[0].init.headers.authorization,`Bearer ${TOKEN}`);assert.equal(calls[0].init.cache,'no-store');
 assert.equal(page.items[0].outcome,'win');assert.equal(page.items[0].score[0],2);assert.equal(page.nextCursor,cursor);
 await assert.rejects(client.loadMatchHistory({limit:51}),error=>error.code==='invalid-request');
 const bad=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json({items:[{matchId:'a'.repeat(32),recordedAt:'2026-11-04T12:00:00.000Z',teamId:'japan',opponentTeamId:'brazil',score:[0,1],outcome:'win',opponentAccountId:'private'}],nextCursor:null})});
 await assert.rejects(bad.loadMatchHistory(),error=>error.code==='invalid-response');
});

test('matchmaking ticket uses authenticated empty-body POST and returns only a valid ticket and parsed expiry', async () => {
  let call;
  const ticket = 'a'.repeat(64);
  const expiresAt = Date.now() + 60000;
  const client = createOnlineAccountClient({baseUrl:'https://api.example.test',getAccessToken:() => TOKEN,fetchImpl:async (url,init) => {
    call = {url,init};
    return json({ticket,expiresAt,accountId:'must-not-escape'},201);
  }});
  assert.deepEqual(await client.requestMatchTicket(),{ticket,expiresAt});
  assert.equal(call.url,'https://api.example.test/api/v1/matches/ticket');
  assert.equal(call.init.method,'POST');
  assert.equal(call.init.body,undefined);
  assert.equal(call.init.headers['content-type'],undefined);
  assert.equal(call.init.headers.authorization,`Bearer ${TOKEN}`);
});

test('matchmaking ticket can request a validated existing team without changing the legacy empty-body call', async () => {
  let call;
  const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async(url,init)=>{call={url,init};return json({ticket:'b'.repeat(64),expiresAt:Date.now()+60000},201);}});
  await client.requestMatchTicket({teamId:'real-club_12'});
  assert.equal(call.init.method,'POST');
  assert.equal(call.init.headers['content-type'],'application/json');
  assert.deepEqual(JSON.parse(call.init.body),{teamId:'real-club_12'});
  await assert.rejects(client.requestMatchTicket({teamId:'../forged'}),error=>error.code==='invalid-request');
});

test('matchmaking ticket maps queue conflicts and unavailable service to safe errors', async () => {
  for (const [status,errorCode,expected] of [[409,'already-active','already-active'],[503,'matchmaking-unavailable','matchmaking-unavailable']]) {
    const client = createOnlineAccountClient({getAccessToken:() => TOKEN,fetchImpl:async () => json({error:errorCode,detail:'secret internals'},status)});
    await assert.rejects(client.requestMatchTicket(),error => {
      assert.equal(error.code,expected);
      assert.doesNotMatch(error.message,/secret|account|database/i);
      return true;
    });
  }
});

test('PVP resume ticket request is empty, authenticated, strictly validated, and safely reports expiry',async()=>{
 const token='c'.repeat(64),expiresAt=Date.now()+15000;let call;
 const client=createOnlineAccountClient({baseUrl:'https://api.example.test',getAccessToken:()=>TOKEN,fetchImpl:async(url,init)=>{
  call={url,init};return json({ticket:token,expiresAt},201);
 }});
 assert.deepEqual(await client.requestMatchResumeTicket(),{ticket:token,expiresAt});
 assert.equal(call.url,'https://api.example.test/api/v1/matches/resume-ticket');assert.equal(call.init.method,'POST');
 assert.equal(call.init.body,undefined);assert.equal(call.init.headers.authorization,`Bearer ${TOKEN}`);
 const conflict=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json({error:'resume-unavailable'},409)});
 await assert.rejects(conflict.requestMatchResumeTicket(),error=>error.code==='resume-unavailable'&&error.status===409);
 for(const payload of [{ticket:'c'.repeat(64),expiresAt:Date.now()-1},{ticket:'c'.repeat(64),expiresAt:Date.now()+10000,accountId:'leak'}]){
  const malformed=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json(payload,201)});
  await assert.rejects(malformed.requestMatchResumeTicket(),error=>error.code==='invalid-response');
 }
});

test('matchmaking rejects malformed ticket tokens and non-numeric or expired timestamps', async () => {
  const fixtures = [
    {ticket:'A'.repeat(64),expiresAt:Date.now()+60000},
    {ticket:'a'.repeat(63),expiresAt:Date.now()+60000},
    {ticket:'a'.repeat(64),expiresAt:String(Date.now()+60000)},
    {ticket:'a'.repeat(64),expiresAt:Date.now()-1},
  ];
  for (const body of fixtures) {
    const client = createOnlineAccountClient({getAccessToken:() => TOKEN,fetchImpl:async () => json(body,201)});
    await assert.rejects(client.requestMatchTicket(),error => error.code === 'invalid-response');
  }
});

test('online token balance and reward claims are account-authenticated and validate durable receipts',async()=>{
 const id='f'.repeat(32);let claim;
 const balanceClient=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async(url,init)=>{assert.equal(url,'/api/v1/tokens/balance');assert.equal(init.method,'GET');return json({balance:45,maxBalance:999999});}});
 assert.deepEqual(await balanceClient.getOnlineTokenBalance(),{balance:45,maxBalance:999999});
 const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async(url,init)=>{claim={url,init};return json({duplicate:false,balance:75,maxBalance:999999,receipt:{matchId:id,side:1,outcome:'win',reward:30,balanceAfter:75,recordedAt:'2026-11-04T12:00:00.000Z'}},201);}});
 assert.deepEqual(await client.claimMatchReward(id),{duplicate:false,balance:75,maxBalance:999999,receipt:{matchId:id,side:1,outcome:'win',reward:30,balanceAfter:75,recordedAt:'2026-11-04T12:00:00.000Z'}});
 assert.equal(claim.url,'/api/v1/matches/rewards/claim');assert.deepEqual(JSON.parse(claim.init.body),{matchId:id});assert.equal(claim.init.headers.authorization,`Bearer ${TOKEN}`);
 await assert.rejects(client.claimMatchReward('../forged'),error=>error.code==='invalid-request');
 const bad=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json({duplicate:false,balance:75,maxBalance:999999,receipt:{matchId:id,side:1,outcome:'win',reward:999,balanceAfter:75,recordedAt:'2026-11-04T12:00:00.000Z'}},201)});
 await assert.rejects(bad.claimMatchReward(id),error=>error.code==='invalid-response');
});

test('Ultimate Team catalog and collection methods validate server-owned catalog and account balance envelopes',async()=>{
 const calls=[];
 const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async(url,init)=>{
  calls.push({url,init});
  if(url==='/api/v1/ultimate-team/catalog')return json({catalog:[{category:'team',id:'japan',price:300},{category:'player',id:'japan/jp0',price:250}]});
  if(url==='/api/v1/ultimate-team/collection')return json({items:[{category:'player',itemId:'japan/jp0',acquiredAt:'2026-11-04T14:00:00.000Z'},{category:'player',itemId:'japan/jp1',acquiredAt:null}],balance:750});
  throw Error('unexpected endpoint');
 }});
 assert.deepEqual(await client.loadUltimateTeamCatalog(),[{category:'team',id:'japan',price:300},{category:'player',id:'japan/jp0',price:250}]);
 assert.deepEqual(await client.loadUltimateTeamCollection(),{items:[{category:'player',itemId:'japan/jp0',acquiredAt:'2026-11-04T14:00:00.000Z'},{category:'player',itemId:'japan/jp1',acquiredAt:null}],balance:750});
 assert.deepEqual(calls.map(row=>row.url),['/api/v1/ultimate-team/catalog','/api/v1/ultimate-team/collection']);
 assert.ok(calls.every(row=>row.init.headers.authorization===`Bearer ${TOKEN}`&&row.init.cache==='no-store'));
});

test('UT purchase sends only category, item ID, idempotency key and validates the durable receipt',async()=>{
 let call;
 const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async(url,init)=>{
  call={url,init};return json({status:'purchased',balance:500,receipt:{category:'player',itemId:'japan/jp0',price:250,balanceAfter:500,recordedAt:'2026-11-04T14:00:00.000Z'}} ,201);
 }});
 assert.deepEqual(await client.purchaseUltimateTeamItem({category:'player',itemId:'japan/jp0',idempotencyKey:'ut_purchase_0001'}),{
  status:'purchased',balance:500,receipt:{category:'player',itemId:'japan/jp0',price:250,balanceAfter:500,recordedAt:'2026-11-04T14:00:00.000Z'}});
 assert.equal(call.url,'/api/v1/ultimate-team/purchases');assert.equal(call.init.method,'POST');
 assert.deepEqual(JSON.parse(call.init.body),{category:'player',itemId:'japan/jp0',idempotencyKey:'ut_purchase_0001'});
 assert.equal(Object.hasOwn(JSON.parse(call.init.body),'price'),false);assert.equal(Object.hasOwn(JSON.parse(call.init.body),'accountId'),false);
 assert.equal(call.init.credentials,'omit');assert.equal(call.init.cache,'no-store');
});

test('UT request and response validators reject forged fields, malformed IDs, duplicate offers and invalid receipts',async()=>{
 const responses=[
  {catalog:[{category:'team',id:'../../attacker',price:1}]},
  {catalog:[{category:'team',id:'japan',price:300},{category:'team',id:'japan',price:300}]},
  {catalog:[{category:'team',id:'japan',price:'1'}]},
  {items:[{category:'team',itemId:'japan',acquiredAt:'bad'}],balance:5},
  {items:[],balance:-1},
 ];
 for(const payload of responses){
  const route=Object.hasOwn(payload,'catalog')?'/ultimate-team/catalog':'/ultimate-team/collection';
  const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json(payload)});
  await assert.rejects(route.endsWith('catalog')?client.loadUltimateTeamCatalog():client.loadUltimateTeamCollection(),e=>e.code==='invalid-response');
 }
 const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json({status:'purchased',balance:1,receipt:{category:'team',itemId:'japan',price:300,balanceAfter:1,recordedAt:'2026-11-04T14:00:00.000Z',accountId:'secret'}})});
 await assert.rejects(client.purchaseUltimateTeamItem({category:'team',itemId:'japan',idempotencyKey:'ut_purchase_0001'}),e=>e.code==='invalid-response');
 const requests=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>{throw Error('must not send invalid request')}});
 for(const request of [
  {category:'other',itemId:'japan',idempotencyKey:'ut_purchase_0001'},
  {category:'team',itemId:'japan/jp0',idempotencyKey:'ut_purchase_0001'},
  {category:'player',itemId:'jp0',idempotencyKey:'ut_purchase_0001'},
  {category:'player',itemId:'japan/jp0',price:1,idempotencyKey:'ut_purchase_0001'},
 ])await assert.rejects(requests.purchaseUltimateTeamItem(request),e=>e.code==='invalid-request');
});

test('UT server purchase conflicts map to safe retry or user-facing errors',async()=>{
 for(const [status,errorCode,expected] of [[409,'already-owned','already-owned'],[409,'idempotency-conflict','idempotency-conflict'],[422,'insufficient-balance','insufficient-balance'],[404,'unknown-item','unknown-item']]){
  const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json({error:errorCode,detail:'private DB data'},status)});
  await assert.rejects(client.purchaseUltimateTeamItem({category:'team',itemId:'japan',idempotencyKey:'ut_purchase_0001'}),error=>{
   assert.equal(error.code,expected);assert.doesNotMatch(error.message,/private|database|account/i);return true;
  });
 }
});

test('online match reports when a selected non-starter team is not in the authenticated account collection',async()=>{
 const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json({error:'team-not-owned',detail:'private account info'},403)});
 await assert.rejects(client.requestMatchTicket({teamId:'not-owned-club'}),error=>{
  assert.equal(error.code,'team-not-owned');assert.match(error.message,/Japan.*free starter team/i);assert.doesNotMatch(error.message,/private|account info/);return true;
 });
});

const onlineCareerSeason={version:2,status:'active',fixtureCount:2,playedCount:1,teamId:'japan',fixtures:[
 {fixtureNo:1,status:'completed',teamIds:['japan','brazil'],score:[2,1],recordedAt:'2026-11-04T14:00:00.000Z'},
 {fixtureNo:2,status:'scheduled',teamIds:['japan','france'],score:null,recordedAt:null},
],standings:[
 {teamId:'japan',played:1,wins:1,draws:0,losses:0,goalsFor:2,goalsAgainst:1,points:3,goalDifference:1},
 {teamId:'brazil',played:1,wins:0,draws:0,losses:1,goalsFor:1,goalsAgainst:2,points:0,goalDifference:-1},
]};

test('Online Career season client loads a nullable current season and strictly validates the public projection',async()=>{
 const calls=[];let reads=0;
 const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async(url,init)=>{
  calls.push({url,init});return json({season:reads++===0?structuredClone(onlineCareerSeason):null});
 }});
 assert.deepEqual(await client.loadOnlineCareerSeason(),onlineCareerSeason);
 assert.equal(await client.loadOnlineCareerSeason(),null);
 assert.deepEqual(calls.map(call=>call.url),['/api/v1/online-career/current','/api/v1/online-career/current']);
 assert.ok(calls.every(call=>call.init.method==='GET'&&call.init.headers.authorization===`Bearer ${TOKEN}`&&call.init.cache==='no-store'));
});

test('Online Career history client validates bounded, unique season IDs and full public summaries',async()=>{
 const archived=[{seasonId:'a'.repeat(32),season:structuredClone(onlineCareerSeason)}];let call;
 const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async(url,init)=>{call={url,init};return json({seasons:archived});}});
 assert.deepEqual(await client.loadOnlineCareerSeasons(),[{seasonId:'a'.repeat(32),...onlineCareerSeason}]);
 assert.equal(call.url,'/api/v1/online-career/seasons');assert.equal(call.init.method,'GET');assert.equal(call.init.cache,'no-store');
 const invalid=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json({seasons:[...archived,...archived]})});
 await assert.rejects(invalid.loadOnlineCareerSeasons(),error=>error.code==='invalid-response');
 const tooMany=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json({seasons:Array(21).fill(archived[0])})});
 await assert.rejects(tooMany.loadOnlineCareerSeasons(),error=>error.code==='invalid-response');
});

test('Online Career create sends either no body or only the optional selected team and returns a validated season',async()=>{
 const calls=[];
 const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async(url,init)=>{calls.push({url,init});return json({season:structuredClone(onlineCareerSeason)});}});
 const created=await client.createOnlineCareerSeason();
 assert.deepEqual(created,{season:onlineCareerSeason});
 await client.createOnlineCareerSeason('brazil',{signal:new AbortController().signal});
 assert.equal(calls[0].url,'/api/v1/online-career/current');assert.equal(calls[0].init.method,'POST');
 assert.equal(calls[0].init.body,undefined);assert.equal(calls[0].init.headers['content-type'],undefined);
 assert.deepEqual(JSON.parse(calls[1].init.body),{teamId:'brazil'});assert.equal(calls[1].init.method,'POST');
 assert.equal(Object.hasOwn(JSON.parse(calls[1].init.body),'accountId'),false);
 await assert.rejects(client.createOnlineCareerSeason('../fake'),e=>e.code==='invalid-request');
});

test('Online Career next-fixture ticket request has an empty body and validates ticket, fixture, and teams',async()=>{
 let call;const expiresAt=Date.now()+60000;
 const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async(url,init)=>{
  call={url,init};return json({ticket:'c'.repeat(64),expiresAt,fixtureNo:3,teamIds:['japan','brazil']},201);
 }});
 assert.deepEqual(await client.requestOnlineCareerTicket(),{ticket:'c'.repeat(64),expiresAt,fixtureNo:3,teamIds:['japan','brazil']});
 assert.equal(call.url,'/api/v1/online-career/current/fixtures/next/ticket');assert.equal(call.init.method,'POST');
 assert.equal(call.init.body,undefined);assert.equal(call.init.headers['content-type'],undefined);
});

test('Online Career season projection rejects malformed counts, fixture state, scores, standings and extra fields',async()=>{
 const invalid=[];
 invalid.push({...onlineCareerSeason,fixtureCount:0});
 invalid.push({...onlineCareerSeason,fixtureCount:65});
 invalid.push({...onlineCareerSeason,playedCount:0});
 invalid.push({...onlineCareerSeason,fixtureCount:3});
 invalid.push({...onlineCareerSeason,teamId:'../japan'});
 let value=structuredClone(onlineCareerSeason);value.fixtures[0].teamIds[0]='../japan';invalid.push(value);
 value=structuredClone(onlineCareerSeason);value.fixtures[0].score=[1000,0];invalid.push(value);
 value=structuredClone(onlineCareerSeason);value.fixtures[1].score=[0,0];invalid.push(value);
 value=structuredClone(onlineCareerSeason);value.fixtures[0].recordedAt='bad';invalid.push(value);
 value=structuredClone(onlineCareerSeason);value.standings[0].points=99;invalid.push(value);
 value=structuredClone(onlineCareerSeason);value.standings[0].played=0;invalid.push(value);
 value=structuredClone(onlineCareerSeason);value.standings[0].privateAccountId='secret';invalid.push(value);
 value={...onlineCareerSeason,seasonId:'secret'};invalid.push(value);
 for(const season of invalid){
  const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json({season})});
  await assert.rejects(client.loadOnlineCareerSeason(),e=>e.code==='invalid-response');
 }
});

test('Online Career ticket rejects expired or malformed ticket and fixture metadata',async()=>{
 const invalid=[
  {ticket:'C'.repeat(64),expiresAt:Date.now()+60000,fixtureNo:1,teamIds:['japan','brazil']},
  {ticket:'c'.repeat(64),expiresAt:Date.now()-1,fixtureNo:1,teamIds:['japan','brazil']},
  {ticket:'c'.repeat(64),expiresAt:Date.now()+60000,fixtureNo:0,teamIds:['japan','brazil']},
  {ticket:'c'.repeat(64),expiresAt:Date.now()+60000,fixtureNo:65,teamIds:['japan','brazil']},
  {ticket:'c'.repeat(64),expiresAt:Date.now()+60000,fixtureNo:1,teamIds:['japan','japan']},
  {ticket:'c'.repeat(64),expiresAt:Date.now()+60000,fixtureNo:1,teamIds:['japan','../brazil']},
  {ticket:'c'.repeat(64),expiresAt:Date.now()+60000,fixtureNo:1,teamIds:['japan','brazil'],matchId:'private'},
 ];
 for(const body of invalid){
  const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json(body,201)});
  await assert.rejects(client.requestOnlineCareerTicket(),e=>e.code==='invalid-response');
 }
});

test('Online Career server conflicts and failures map to safe useful client errors',async()=>{
 const cases=[[404,'online-career-season-not-found','online-career-season-not-found'],[404,'online-career-fixture-not-found','online-career-fixture-not-found'],
  [409,'online-career-season-conflict','online-career-season-conflict'],[409,'online-career-season-complete','online-career-season-complete'],
  [409,'online-career-match-unavailable','online-career-match-unavailable'],[503,'online-career-unavailable','online-career-unavailable'],
  [400,'invalid-career-request','invalid-career-request'],[403,'team-not-owned','team-not-owned']];
 for(const [status,errorCode,expected] of cases){
  const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json({error:errorCode,detail:'private account/DB information'},status)});
  await assert.rejects(client.loadOnlineCareerSeason(),error=>{assert.equal(error.code,expected);assert.doesNotMatch(error.message,/private|account\/DB|database/i);return true;});
 }
});

test('Online UT lineup client validates versioned roster identity and saves only canonical player IDs',async()=>{
 const playerIds=Array.from({length:12},(_,index)=>`japan/jp${index}`),calls=[];
 const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async(url,init)=>{
  calls.push({url,init});return init.method==='PUT'?json({status:'saved',lineup:{teamId:'japan',playerIds,version:2}},201):json({lineup:{teamId:'japan',playerIds,version:1}});
 }});
 assert.deepEqual(await client.loadUltimateTeamLineup('japan'),{teamId:'japan',playerIds,version:1});
 assert.equal(calls[0].url,'/api/v1/ultimate-team/lineup?teamId=japan');
 const saved=await client.saveUltimateTeamLineup({teamId:'japan',playerIds,expectedVersion:1,idempotencyKey:'ut-lineup-0001'});
 assert.deepEqual(saved,{status:'saved',lineup:{teamId:'japan',playerIds,version:2}});
 assert.deepEqual(JSON.parse(calls[1].init.body),{teamId:'japan',playerIds,expectedVersion:1,idempotencyKey:'ut-lineup-0001'});
 await assert.rejects(client.saveUltimateTeamLineup({teamId:'japan',playerIds:[...playerIds.slice(1)],expectedVersion:1,idempotencyKey:'ut-lineup-0002'}),error=>error.code==='invalid-request');
});

test('online reward errors are safe and distinguish retryable service failure from no entitlement',async()=>{
 for(const [status,errorCode,expected] of [[404,'reward-unavailable','reward-unavailable'],[503,'rewards-unavailable','rewards-unavailable']]){
  const client=createOnlineAccountClient({getAccessToken:()=>TOKEN,fetchImpl:async()=>json({error:errorCode,detail:'private account data'},status)});
  await assert.rejects(client.claimMatchReward('a'.repeat(32)),error=>{assert.equal(error.code,expected);assert.doesNotMatch(error.message,/private|account data/);return true;});
 }
});
