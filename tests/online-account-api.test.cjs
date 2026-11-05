const test = require('node:test');
const assert = require('node:assert/strict');

const API_ORIGIN = 'https://game.example.test';
const TOKEN = 'Bearer test-token-0000000000000000';
let createOnlineAccountApi;
test('online account API module imports', async () => {
  ({createOnlineAccountApi} = await import('../scripts/online-account-api.mjs'));
  assert.equal(typeof createOnlineAccountApi, 'function');
});

function fixture({matchmaking, resultStore, matchLifecycleStore, rewardStore, ultimateTeamStore, onlineCareerService, limits, now, authenticate}={}) {
  const calls = [];
  const rows = new Map();
  const store = {
    async getProfile(userId) { calls.push(['getProfile', userId]); return {accountId:userId, profile:{displayName:'Player'}, version:1, updatedAt:'2026-11-04T00:00:00.000Z'}; },
    async getSnapshot(userId, kind) { calls.push(['getSnapshot', userId, kind]); const row=rows.get(`${userId}:${kind}`); return row ? {accountId:userId,kind,payload:row.payload,version:row.version,updatedAt:row.updatedAt} : null; },
    async putSnapshot(userId, kind, payload, options) {
      calls.push(['putSnapshot', userId, kind, payload, options]);
      const key = `${userId}:${kind}`;
      const old = rows.get(key);
      if (old?.idempotencyKey === options.idempotencyKey) {
        if (JSON.stringify(old.payload) !== JSON.stringify(payload)) { const error = new Error('idempotency conflict'); error.code = 'idempotency-conflict'; throw error; }
        return {...old, duplicate:true};
      }
      if (old && old.version !== options.expectedVersion) {
        const error = new Error('version conflict'); error.code = 'version-conflict'; throw error;
      }
      if (!old && options.expectedVersion !== 0) { const error = new Error('version conflict'); error.code = 'version-conflict'; throw error; }
      const row = {accountId:userId, kind, payload, version:(old?.version || 0) + 1, idempotencyKey:options.idempotencyKey, updatedAt:'2026-11-04T00:00:00.000Z', duplicate:false};
      rows.set(key, row); return row;
    }
  };
  const handler = createOnlineAccountApi({
    authenticate:authenticate || (async request => request.headers.get('authorization') === TOKEN ? {userId:'account_A'} : null),
    store,
    resultStore,
    matchLifecycleStore,
    rewardStore,
    ultimateTeamStore,
    onlineCareerService,
    matchmaking,
    allowedOrigins:[API_ORIGIN],
    ...(now ? {now} : {}),
    ...(limits ? {limits} : {})
  });
  const request = (path, {method='GET', body, headers={}}={}) => new Request(`https://api.example.test${path}`, {method, headers:{authorization:TOKEN, ...headers}, ...(body === undefined ? {} : {body})});
  return {handler, request, calls, rows};
}

test('PVP status endpoint is authenticated, exact-allowlisted, bounded, and account-bound',async()=>{
 const calls=[],ids=['a'.repeat(32),'b'.repeat(32)],matchLifecycleStore={async listStatuses(accountId,matchIds){calls.push([accountId,matchIds.slice()]);return{items:matchIds.map((matchId,index)=>({matchId,status:index?'unknown':'interrupted'}))};}};
 const {handler,request}=fixture({matchLifecycleStore});
 const anon=await handler(new Request('https://api.example.test/api/v1/matches/status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({matchIds:[ids[0]]})}));assert.equal(anon.status,401);assert.deepEqual(calls,[]);
 const success=await handler(request('/api/v1/matches/status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({matchIds:ids})}));
 assert.equal(success.status,200);assert.deepEqual(await success.json(),{items:[{matchId:ids[0],status:'interrupted'},{matchId:ids[1],status:'unknown'}]});
 assert.deepEqual(calls,[['account_A',ids]]);
 for(const body of [{matchIds:ids,userId:'account_B'},{matchIds:[ids[0],ids[0]]},{matchIds:[ids[0],'bad']},{matchIds:Array(5).fill(ids[0])},{}])
  assert.equal((await handler(request('/api/v1/matches/status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}))).status,400);
 assert.equal((await handler(request('/api/v1/matches/status?matchIds='+ids[0],{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({matchIds:[ids[0]]})}))).status,400);
 assert.equal((await handler(request('/api/v1/matches/status/other',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({matchIds:[ids[0]]})}))).status,404);
 assert.equal((await handler(request('/api/v1/matches/status',{method:'GET'}))).status,405);
});

test('API rejects missing bearer credentials before touching account storage', async () => {
  const {handler, calls} = fixture();
  const response = await handler(new Request('https://api.example.test/api/v1/me'));
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('www-authenticate'), 'Bearer');
  assert.deepEqual(calls, []);
});

test('account identity comes only from verified context, not request path or JSON', async () => {
  const {handler, request, calls} = fixture();
  const response = await handler(request('/api/v1/career/current?accountId=account_B'));
  assert.equal(response.status, 200);
  assert.deepEqual(calls, [['getSnapshot','account_A','career']]);
});

test('disallowed and null origins are rejected; allowed origins get exact non-credentialed CORS', async () => {
  const {handler, request} = fixture();
  const denied = await handler(request('/api/v1/me', {headers:{origin:'https://evil.example'}}));
  assert.equal(denied.status, 403);
  const nullOrigin = await handler(request('/api/v1/me', {headers:{origin:'null'}}));
  assert.equal(nullOrigin.status, 403);
  const allowed = await handler(request('/api/v1/me', {headers:{origin:API_ORIGIN}}));
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), API_ORIGIN);
  assert.equal(allowed.headers.get('access-control-allow-credentials'), null);
});

test('preflight only permits the configured origin, methods, and bearer/json headers', async () => {
  const {handler} = fixture();
  const ok = await handler(new Request('https://api.example.test/api/v1/career/current', {method:'OPTIONS', headers:{origin:API_ORIGIN, 'access-control-request-method':'PUT', 'access-control-request-headers':'authorization, content-type'}}));
  assert.equal(ok.status, 204);
  assert.match(ok.headers.get('access-control-allow-methods'), /PUT/);
  const bad = await handler(new Request('https://api.example.test/api/v1/career/current', {method:'OPTIONS', headers:{origin:API_ORIGIN, 'access-control-request-method':'DELETE', 'access-control-request-headers':'authorization'}}));
  assert.equal(bad.status, 403);
  const ticket = await handler(new Request('https://api.example.test/api/v1/matches/ticket', {method:'OPTIONS', headers:{origin:API_ORIGIN, 'access-control-request-method':'POST', 'access-control-request-headers':'authorization'}}));
  assert.equal(ticket.status, 204);
  assert.match(ticket.headers.get('access-control-allow-methods'), /POST/);
  const wrongMethod = await handler(new Request('https://api.example.test/api/v1/matches/ticket', {method:'OPTIONS', headers:{origin:API_ORIGIN, 'access-control-request-method':'PUT', 'access-control-request-headers':'authorization'}}));
  assert.equal(wrongMethod.status, 403);
});

test('match ticket requires authentication and binds ticket service to verified account only', async () => {
  const calls=[];
  const {handler, request} = fixture({matchmaking:{issueTicket:async userId=>{calls.push(userId);return {ok:true,ticket:'a'.repeat(64),expiresAt:1794000030000};}}});
  const anonymous=await handler(new Request('https://api.example.test/api/v1/matches/ticket?userId=account_B',{method:'POST'}));
  assert.equal(anonymous.status,401);
  assert.deepEqual(calls,[]);
  const success=await handler(request('/api/v1/matches/ticket?userId=account_B',{method:'POST'}));
  assert.equal(success.status,201);
  assert.deepEqual(await success.json(),{ticket:'a'.repeat(64),expiresAt:1794000030000});
  assert.deepEqual(calls,['account_A']);
});

test('PVP resume ticket uses only the authenticated account and never accepts a caller match ID', async()=>{
 const calls=[],token='c'.repeat(64),expiresAt=Date.now()+15000;
 const {handler,request}=fixture({matchmaking:{issueResumeTicket:async userId=>{calls.push(userId);return {ok:true,ticket:token,expiresAt};}}});
 const anonymous=await handler(new Request('https://api.example.test/api/v1/matches/resume-ticket',{method:'POST'}));
 assert.equal(anonymous.status,401);assert.deepEqual(calls,[]);
 const valid=await handler(request('/api/v1/matches/resume-ticket',{method:'POST'}));
 assert.equal(valid.status,201);assert.deepEqual(await valid.json(),{ticket:token,expiresAt});assert.deepEqual(calls,['account_A']);
 const query=await handler(request('/api/v1/matches/resume-ticket?matchId='+('d'.repeat(32)),{method:'POST'}));
 assert.equal(query.status,400);assert.deepEqual(calls,['account_A']);
 const body=await handler(request('/api/v1/matches/resume-ticket',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:'account_B',matchId:'d'.repeat(32)})}));
 assert.equal(body.status,400);assert.deepEqual(calls,['account_A']);
});

test('resume-ticket endpoint reports no resumable match without disclosing server state',async()=>{
 const {handler,request}=fixture({matchmaking:{issueResumeTicket:async userId=>{assert.equal(userId,'account_A');return {ok:false,reason:'resume-unavailable'};}}});
 const response=await handler(request('/api/v1/matches/resume-ticket',{method:'POST'}));
 assert.equal(response.status,409);assert.deepEqual(await response.json(),{error:'resume-unavailable'});
 const malformed=fixture({matchmaking:{issueResumeTicket:async()=>({ok:true,ticket:'bad',expiresAt:Date.now()+10000})}});
 assert.equal((await malformed.handler(malformed.request('/api/v1/matches/resume-ticket',{method:'POST'}))).status,503);
 const unavailable=fixture();
 assert.equal((await unavailable.handler(unavailable.request('/api/v1/matches/resume-ticket',{method:'POST'}))).status,503);
});

test('busy users get an opaque conflict; closed or missing matchmaking returns unavailable', async () => {
  const {handler:busy,request:busyRequest}=fixture({matchmaking:{issueTicket:async()=>({ok:false,reason:'duplicate-active-user'})}});
  const conflict=await busy(busyRequest('/api/v1/matches/ticket',{method:'POST'}));
  assert.equal(conflict.status,409);
  const conflictBody=await conflict.json();
  assert.deepEqual(conflictBody,{error:'already-active'});
  assert.equal(JSON.stringify(conflictBody).includes('account_A'),false);

  const {handler:closed,request:closedRequest}=fixture({matchmaking:{issueTicket:async()=>({ok:false,reason:'service-closed'})}});
  const unavailable=await closed(closedRequest('/api/v1/matches/ticket',{method:'POST'}));
  assert.equal(unavailable.status,503);
  assert.deepEqual(await unavailable.json(),{error:'matchmaking-unavailable'});
  const {handler:disabled,request:disabledRequest}=fixture();
  assert.equal((await disabled(disabledRequest('/api/v1/matches/ticket',{method:'POST'}))).status,503);
});

test('match ticket requires an empty body and unsupported ticket routes stay hidden', async () => {
  const {handler,request}=fixture({matchmaking:{issueTicket:async()=>({ok:true,ticket:'b'.repeat(64),expiresAt:1794000030000})}});
  const body=await handler(request('/api/v1/matches/ticket',{method:'POST',headers:{'content-type':'application/json'},body:'{"userId":"account_B"}'}));
  assert.equal(body.status,400);
  assert.equal((await handler(request('/api/v1/matches/ticket/nope',{method:'POST'}))).status,404);
  assert.equal((await handler(request('/api/v1/matches/ticket',{method:'PUT'}))).status,405);
});

test('ticketed team selection is authenticated, canonical, bounded to one field, and bound to the issued ticket', async () => {
  const calls=[];
  const matchmaking={isValidTeamId:id=>['japan','brazil'].includes(id),issueTicket:async(userId,teamId)=>{
    calls.push({userId,teamId});return {ok:true,ticket:'d'.repeat(64),expiresAt:1794000030000};
  }};
  const {handler,request}=fixture({matchmaking});
  const headers={'content-type':'application/json'};
  const valid=await handler(request('/api/v1/matches/ticket',{method:'POST',headers,body:JSON.stringify({teamId:'brazil'})}));
  assert.equal(valid.status,201);
  assert.deepEqual(calls,[{userId:'account_A',teamId:'brazil'}]);
  assert.equal((await handler(request('/api/v1/matches/ticket',{method:'POST',headers,body:JSON.stringify({teamId:'retired_or_unknown'})}))).status,400);
  assert.equal((await handler(request('/api/v1/matches/ticket',{method:'POST',headers,body:JSON.stringify({teamId:'japan',userId:'account_B'})}))).status,400);
  assert.deepEqual(calls,[{userId:'account_A',teamId:'brazil'}],'invalid/tampered selections never reach ticket issuance');
});

test('server match tickets require a server-owned online team; the free starter remains available',async()=>{
  const calls=[];const ultimateTeamStore={isItemOwned:async(accountId,category,itemId)=>{assert.equal(accountId,'account_A');assert.equal(category,'team');return itemId==='japan'||itemId==='brazil';}};
  const matchmaking={isValidTeamId:id=>['japan','brazil','england'].includes(id),issueTicket:async(userId,teamId)=>{calls.push({userId,teamId});return {ok:true,ticket:'9'.repeat(64),expiresAt:1794000030000};}};
  const {handler,request}=fixture({ultimateTeamStore,matchmaking});
  assert.equal((await handler(request('/api/v1/matches/ticket',{method:'POST'}))).status,201,'legacy empty request selects the free Japan starter');
  assert.equal((await handler(request('/api/v1/matches/ticket',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({teamId:'brazil'})}))).status,201);
  const locked=await handler(request('/api/v1/matches/ticket',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({teamId:'england'})}));
  assert.equal(locked.status,403);assert.deepEqual(await locked.json(),{error:'team-not-owned'});
  assert.deepEqual(calls,[{userId:'account_A',teamId:'japan'},{userId:'account_A',teamId:'brazil'}]);
});

test('match history requires authentication, is account-scoped, returns viewer-relative scores and hides opponent identity',async()=>{
  const rows=[
    {matchId:'a'.repeat(32),status:'finished',terminal:true,half:2,participants:[{userId:'account_A',side:0},{userId:'account_B',side:1}],teamIds:['team_one','team_two'],score:[2,1],recordedAt:'2026-11-04T10:00:00.000Z'},
    {matchId:'b'.repeat(32),status:'finished',terminal:true,half:2,participants:[{userId:'account_C',side:0},{userId:'account_A',side:1}],teamIds:['team_three','team_four'],score:[0,3],recordedAt:'2026-11-04T09:00:00.000Z'},
    {matchId:'c'.repeat(32),status:'finished',terminal:true,half:2,participants:[{userId:'account_B',side:0},{userId:'account_C',side:1}],teamIds:['team_five','team_six'],score:[4,0],recordedAt:'2026-11-04T08:00:00.000Z'}
  ];
  const resultStore={listMatchResults:async accountId=>({items:rows.filter(row=>row.participants.some(p=>p.userId===accountId)),nextCursor:null})};
  const {handler,request}=fixture({resultStore});
  const anonymous=await handler(new Request('https://api.example.test/api/v1/matches/history'));
  assert.equal(anonymous.status,401);
  const response=await handler(request('/api/v1/matches/history?limit=20'));
  assert.equal(response.status,200);
  const body=await response.json();
  assert.deepEqual(body.items,[
    {matchId:'a'.repeat(32),recordedAt:'2026-11-04T10:00:00.000Z',teamId:'team_one',opponentTeamId:'team_two',score:[2,1],outcome:'win'},
    {matchId:'b'.repeat(32),recordedAt:'2026-11-04T09:00:00.000Z',teamId:'team_four',opponentTeamId:'team_three',score:[3,0],outcome:'win'}
  ]);
  assert.equal(JSON.stringify(body).includes('account_B'),false);
  assert.equal(JSON.stringify(body).includes('account_C'),false);
  assert.equal(JSON.stringify(body).includes('c'.repeat(32)),false);
});

test('history rejects malformed or repeated paging parameters and reports unavailable separately',async()=>{
  const {handler,request}=fixture({resultStore:{listMatchResults:async()=>({items:[],nextCursor:null})}});
  for(const path of ['/api/v1/matches/history?limit=0','/api/v1/matches/history?limit=51','/api/v1/matches/history?limit=01',
    '/api/v1/matches/history?cursor=','/api/v1/matches/history?cursor=bad%2Fcursor','/api/v1/matches/history?limit=1&limit=2','/api/v1/matches/history?userId=x'])
    assert.equal((await handler(request(path))).status,400,path);
  const disabled=fixture();
  assert.equal((await disabled.handler(disabled.request('/api/v1/matches/history'))).status,503);
});

test('online reward balance and match claims use only the verified account and a strict match ID body',async()=>{
  const calls=[];const id='e'.repeat(32);
  const rewardStore={getBalance:async accountId=>{calls.push(['balance',accountId]);return 45;},claimMatchReward:async request=>{calls.push(['claim',request]);return {ok:true,duplicate:false,balance:75,receipt:{matchId:id,side:0,outcome:'win',reward:30,balanceAfter:75,recordedAt:'2026-11-04T12:00:00.000Z'}};}};
  const {handler,request}=fixture({rewardStore});
  assert.equal((await handler(new Request('https://api.example.test/api/v1/tokens/balance'))).status,401);
  assert.deepEqual(await (await handler(request('/api/v1/tokens/balance'))).json(),{balance:45,maxBalance:999999});
  const headers={'content-type':'application/json'};
  const response=await handler(request('/api/v1/matches/rewards/claim',{method:'POST',headers,body:JSON.stringify({matchId:id})}));
  assert.equal(response.status,201);
  assert.deepEqual(await response.json(),{duplicate:false,balance:75,maxBalance:999999,receipt:{matchId:id,side:0,outcome:'win',reward:30,balanceAfter:75,recordedAt:'2026-11-04T12:00:00.000Z'}});
  assert.deepEqual(calls,[['balance','account_A'],['claim',{accountId:'account_A',matchId:id}]]);
  for(const body of [JSON.stringify({matchId:id,accountId:'account_B'}),JSON.stringify({matchId:'../../x'}),'not json'])
    assert.equal((await handler(request('/api/v1/matches/rewards/claim',{method:'POST',headers,body}))).status,400);
  assert.equal((await handler(request('/api/v1/matches/rewards/claim',{method:'POST'}))).status,400);
  const disabled=fixture();
  assert.equal((await disabled.handler(disabled.request('/api/v1/tokens/balance'))).status,503);
  assert.equal((await disabled.handler(disabled.request('/api/v1/matches/rewards/claim',{method:'POST',headers,body:JSON.stringify({matchId:id})}))).status,503);
});

test('Online UT catalog, collection, and purchases are authenticated and server-priced',async()=>{
  const calls=[];let balance=900;let owned=[];
  const ultimateTeamStore={
    getCatalog(){return [{category:'team',id:'brazil',price:300},{category:'player',id:'brazil/player_10',price:250}];},
    async getCollection(accountId){calls.push(['collection',accountId]);return [{category:'team',itemId:'japan',acquiredAt:null},{category:'player',itemId:'japan/jp0',acquiredAt:null},...owned.map(item=>({...item,acquiredAt:'2026-11-04T12:00:00.000Z'}))];},
    async purchase(request){calls.push(['purchase',request]);if(request.accountId!=='account_A')throw new Error('wrong account');if(request.category!=='team'||request.itemId!=='brazil')return {error:'unexpected'};
      if(owned.length)return {ok:true,duplicate:true,balance,receipt:{category:'team',itemId:'brazil',price:300,balanceAfter:600,recordedAt:'2026-11-04T12:00:00.000Z'}};
      balance-=300;owned=[{category:'team',itemId:'brazil'}];return {ok:true,duplicate:false,balance,receipt:{category:'team',itemId:'brazil',price:300,balanceAfter:balance,recordedAt:'2026-11-04T12:00:00.000Z'}};
    }
  };
  const rewardStore={getBalance:async accountId=>{assert.equal(accountId,'account_A');return balance;}};
  const {handler,request}=fixture({ultimateTeamStore,rewardStore});
  assert.equal((await handler(new Request('https://api.example.test/api/v1/ultimate-team/catalog'))).status,401);
  assert.deepEqual(await (await handler(request('/api/v1/ultimate-team/catalog'))).json(),{catalog:ultimateTeamStore.getCatalog()});
  assert.deepEqual(await (await handler(request('/api/v1/ultimate-team/collection'))).json(),{items:[{category:'team',itemId:'japan',acquiredAt:null},{category:'player',itemId:'japan/jp0',acquiredAt:null}],balance:900});
  const headers={'content-type':'application/json'};const body={category:'team',itemId:'brazil',idempotencyKey:'purchase-key-0001'};
  const first=await handler(request('/api/v1/ultimate-team/purchases',{method:'POST',headers,body:JSON.stringify(body)}));
  assert.equal(first.status,201);assert.deepEqual(await first.json(),{status:'purchased',balance:600,receipt:{category:'team',itemId:'brazil',price:300,balanceAfter:600,recordedAt:'2026-11-04T12:00:00.000Z'}});
  assert.equal((await handler(request('/api/v1/ultimate-team/purchases',{method:'POST',headers,body:JSON.stringify(body)}))).status,200);
  for(const invalid of [{...body,accountId:'account_B'},{...body,price:1},{...body,category:'other'}])
    assert.equal((await handler(request('/api/v1/ultimate-team/purchases',{method:'POST',headers,body:JSON.stringify(invalid)}))).status,400);
  assert.deepEqual(calls.filter(call=>call[0]==='purchase').map(call=>call[1]),[
    {accountId:'account_A',...body},{accountId:'account_A',...body}
  ]);
});

test('Online UT purchase maps insufficient balance and already-owned failures without leaking store details',async()=>{
  for(const [code,status] of [['insufficient-balance',409],['already-owned',409],['unknown-item',404]]){
    const ultimateTeamStore={getCatalog:()=>[],getCollection:async()=>[],purchase:async()=>{throw Object.assign(new Error('private database details'),{code});}};
    const {handler,request}=fixture({ultimateTeamStore});
    const response=await handler(request('/api/v1/ultimate-team/purchases',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({category:'team',itemId:'brazil',idempotencyKey:'purchase-key-0001'})}));
    assert.equal(response.status,status);const payload=await response.json();assert.deepEqual(payload,{error:code});
    assert.equal(JSON.stringify(payload).includes('private database details'),false);
  }
});

test('Online UT lineup routes are account-scoped, revisioned, bounded, and used for server tickets',async()=>{
 const ids=Array.from({length:12},(_,i)=>`japan/jp${i}`),calls=[];let current={teamId:'japan',playerIds:ids,version:0};
 const ultimateTeamStore={isItemOwned:async(accountId,category,itemId)=>accountId==='account_A'&&category==='team'&&itemId==='japan',
  getLineup:async(accountId,teamId)=>{calls.push(['get',accountId,teamId]);if(teamId!=='japan')throw Object.assign(Error('private'),{code:'team-not-owned'});return current;},
  saveLineup:async(accountId,commit)=>{calls.push(['save',accountId,commit]);current={teamId:commit.teamId,playerIds:commit.playerIds,version:1};return {duplicate:false,lineup:current};}};
 const matchmaking={isValidTeamId:id=>id==='japan',issueTicket:async(accountId,teamId,playerIds)=>{calls.push(['ticket',accountId,teamId,playerIds]);return {ok:true,ticket:'a'.repeat(64),expiresAt:Date.now()+60000};}};
 const {handler,request}=fixture({ultimateTeamStore,matchmaking});
 const loaded=await handler(request('/api/v1/ultimate-team/lineup?teamId=japan'));
 assert.equal(loaded.status,200);assert.deepEqual(await loaded.json(),{lineup:current});
 assert.equal((await handler(request('/api/v1/ultimate-team/lineup?teamId=japan&accountId=other'))).status,400);
 assert.equal((await handler(request('/api/v1/ultimate-team/lineup?teamId=brazil'))).status,403);
 const changed=ids.slice();changed[0]='japan/jp10';changed[10]='japan/jp0';
 const body={teamId:'japan',playerIds:changed,expectedVersion:0,idempotencyKey:'lineup-save-0001'};
 const saved=await handler(request('/api/v1/ultimate-team/lineup',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(body)}));
 assert.equal(saved.status,201);assert.deepEqual((await saved.json()).lineup,{teamId:'japan',playerIds:changed,version:1});
 assert.equal((await handler(request('/api/v1/ultimate-team/lineup',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({...body,playerIds:[...changed.slice(0,11)]})}))).status,400);
 const ticket=await handler(request('/api/v1/matches/ticket',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({teamId:'japan'})}));
 assert.equal(ticket.status,201);assert.deepEqual(calls.at(-1),['ticket','account_A','japan',changed]);
});

test('reward claims do not reveal whether another account owns a result or a result is missing',async()=>{
  const rewardStore={getBalance:async()=>0,claimMatchReward:async({matchId})=>{const error=new Error('private detail');error.code=matchId==='a'.repeat(32)?'not-participant':'result-not-found';throw error;}};
  const {handler,request}=fixture({rewardStore});
  const claim=matchId=>request('/api/v1/matches/rewards/claim',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({matchId})});
  const outsider=await handler(claim('a'.repeat(32))),missing=await handler(claim('b'.repeat(32)));
  assert.equal(outsider.status,404);assert.equal(missing.status,404);
  assert.deepEqual(await outsider.json(),{error:'reward-unavailable'});assert.deepEqual(await missing.json(),{error:'reward-unavailable'});
});

function matchId(value){return value}

test('valid remote Career and Ultimate Team commits pass account, revision, and idempotency to storage', async () => {
  const {handler, request, calls} = fixture();
  const body = JSON.stringify({expectedVersion:0, idempotencyKey:'career-commit_0001', snapshot:{season:1, players:[]}});
  const headers = {'content-type':'application/json', origin:API_ORIGIN};
  const career = await handler(request('/api/v1/career/current', {method:'PUT', body, headers}));
  assert.equal(career.status, 200);
      assert.deepEqual(await career.json(), {status:'saved', version:1, record:{kind:'career',payload:{season:1,players:[]},version:1,updatedAt:'2026-11-04T00:00:00.000Z'}});
  const ut = await handler(request('/api/v1/ultimate-team/squad', {method:'PUT', body:JSON.stringify({expectedVersion:0,idempotencyKey:'ut-squad_00001',snapshot:{formation:'4-3-3',playerIds:['p1']}}), headers}));
  assert.equal(ut.status, 200);
  assert.deepEqual(calls.at(-1), ['putSnapshot','account_A','ultimate-team',{formation:'4-3-3',playerIds:['p1']},{expectedVersion:0,idempotencyKey:'ut-squad_00001'}]);
});

const ONLINE_SEASON={
  seasonId:'a'.repeat(32),version:1,status:'active',teamId:'japan',fixtureCount:2,playedCount:0,
  fixtures:[
    {fixtureNo:1,fixtureId:'b'.repeat(32),status:'scheduled',teamIds:['japan','brazil'],score:null,recordedAt:null},
    {fixtureNo:2,fixtureId:'c'.repeat(32),status:'scheduled',teamIds:['japan','france'],score:null,recordedAt:null}
  ],standings:[]
};

test('Online Career current-season API returns only a validated public projection',async()=>{
  const calls=[];
  const onlineCareerService={async getCurrentSeason(accountId){calls.push(['current',accountId]);return ONLINE_SEASON;}};
  const {handler,request}=fixture({onlineCareerService});
  const response=await handler(request('/api/v1/online-career/current'));
  assert.equal(response.status,200);
  assert.deepEqual(calls,[['current','account_A']]);
  const body=await response.json();
  assert.equal(body.season.status,'active');
  assert.equal(body.season.teamId,'japan');
  assert.equal(body.season.fixtures.length,2);
  assert.equal(Object.hasOwn(body.season,'seasonId'),false);
  assert.equal(Object.hasOwn(body.season.fixtures[0],'matchId'),false);
});

test('Online Career archive is account-scoped, bounded by the service, and excludes the current season',async()=>{
 const calls=[],complete={...ONLINE_SEASON,seasonId:'f'.repeat(32),status:'complete',playedCount:2,fixtures:ONLINE_SEASON.fixtures.map(row=>({...row,status:'completed',score:[2,0],recordedAt:'2026-11-04T12:00:00.000Z'}))};
 const onlineCareerService={async listSeasons(accountId,limit){calls.push(['list',accountId,limit]);return [ONLINE_SEASON,complete];},async getCurrentSeason(accountId){calls.push(['current',accountId]);return ONLINE_SEASON;}};
 const {handler,request}=fixture({onlineCareerService});
 const response=await handler(request('/api/v1/online-career/seasons'));
 assert.equal(response.status,200);assert.deepEqual(calls,[['list','account_A',20],['current','account_A']]);
 const body=await response.json();assert.equal(body.seasons.length,1);assert.equal(body.seasons[0].seasonId,'f'.repeat(32));
 assert.equal(body.seasons[0].season.status,'complete');assert.equal(body.seasons[0].season.playedCount,2);
 assert.equal(Object.hasOwn(body.seasons[0].season,'seasonId'),false);assert.equal(Object.hasOwn(body.seasons[0].season.fixtures[0],'matchId'),false);
 assert.equal((await handler(request('/api/v1/online-career/seasons?limit=200'))).status,400);
});

test('Online Career creation verifies owned team and accepts only the exact optional team choice',async()=>{
  const calls=[];
  const ultimateTeamStore={async isItemOwned(accountId,category,itemId){calls.push(['owned',accountId,category,itemId]);return itemId==='japan'||itemId==='brazil';}};
  const onlineCareerService={async createSeason(accountId,teamId){calls.push(['create',accountId,teamId]);return {...ONLINE_SEASON,teamId};}};
  const matchmaking={isValidTeamId:id=>['japan','brazil','france'].includes(id)};
  const {handler,request}=fixture({ultimateTeamStore,onlineCareerService,matchmaking});
  const response=await handler(request('/api/v1/online-career/current',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({teamId:'brazil'})}));
  assert.equal(response.status,200);
  assert.deepEqual(calls,[['owned','account_A','team','brazil'],['create','account_A','brazil']]);
  const unowned=await handler(request('/api/v1/online-career/current',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({teamId:'france'})}));
  assert.equal(unowned.status,403);
  const spoof=await handler(request('/api/v1/online-career/current',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({teamId:'japan',accountId:'account_B'})}));
  assert.equal(spoof.status,400);
});

test('Online Career next-ticket endpoint claims the durable fixture before local matchmaking and accepts no client fixture data',async()=>{
  const calls=[];
  const binding={fixtureId:'d'.repeat(32),matchId:'e'.repeat(32),fixtureNo:1,
    participants:[{userId:'account_A',side:0},{userId:'smf_server_career_ai',side:1}],teamIds:['japan','brazil'],mode:'career-ai'};
  const onlineCareerService={
    async getCurrentSeason(accountId){calls.push(['current',accountId]);return ONLINE_SEASON;},
    async claimNextFixtureBinding(accountId,seasonId){calls.push(['claim',accountId,seasonId]);return {ok:true,binding,reservationId:'a'.repeat(32)};},
    async releaseFixtureReservation(accountId,seasonId,matchId,reservationId){calls.push(['release-db',accountId,seasonId,matchId,reservationId]);return true;}
  };
  const matchmaking={
    reserveCareerFixture(value){calls.push(['reserve',value]);return {ok:true};},
    issueCareerTicket(matchId,userId){calls.push(['ticket',matchId,userId]);return {ok:true,ticket:'f'.repeat(64),expiresAt:1800000001000};},
    releaseCareerFixture(matchId,userId){calls.push(['release-local',matchId,userId]);return true;}
  };
  const {handler,request}=fixture({onlineCareerService,matchmaking});
  const response=await handler(request('/api/v1/online-career/current/fixtures/next/ticket',{method:'POST'}));
  assert.equal(response.status,201);
  assert.deepEqual(await response.json(),{ticket:'f'.repeat(64),expiresAt:1800000001000,fixtureNo:1,teamIds:['japan','brazil']});
  assert.deepEqual(calls.map(row=>row[0]),['current','claim','reserve','ticket']);
  assert.equal(calls[2][1],binding);
  const spoof=await handler(request('/api/v1/online-career/current/fixtures/next/ticket',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({fixtureId:'0'.repeat(32),score:[999,0]})}));
  assert.equal(spoof.status,400);
  assert.equal(calls.length,4,'invalid client fixture data must never reach the reservation service');
});

test('Online Career releases durable and local fixture claims when ticket creation fails',async()=>{
  const calls=[],binding={fixtureId:'d'.repeat(32),matchId:'e'.repeat(32),fixtureNo:1,participants:[{userId:'account_A',side:0},{userId:'smf_server_career_ai',side:1}],teamIds:['japan','brazil'],mode:'career-ai'};
  const onlineCareerService={async getCurrentSeason(){return ONLINE_SEASON;},async claimNextFixtureBinding(){return {ok:true,binding,reservationId:'a'.repeat(32)};},
    async releaseFixtureReservation(...args){calls.push(['release-db',...args]);return true;}};
  const matchmaking={reserveCareerFixture(){return {ok:true};},issueCareerTicket(){return {ok:false,reason:'duplicate-active-user'};},
    releaseCareerFixture(...args){calls.push(['release-local',...args]);return true;}};
  const {handler,request}=fixture({onlineCareerService,matchmaking});
  const response=await handler(request('/api/v1/online-career/current/fixtures/next/ticket',{method:'POST'}));
  assert.equal(response.status,409);assert.deepEqual(await response.json(),{error:'already-active'});
  assert.deepEqual(calls,[['release-db','account_A',ONLINE_SEASON.seasonId,binding.matchId,'a'.repeat(32)],['release-local',binding.matchId,'account_A']]);
});

test('Online Career attempts local rollback even when durable lease release fails',async()=>{
  const binding={fixtureId:'d'.repeat(32),matchId:'e'.repeat(32),fixtureNo:1,participants:[{userId:'account_A',side:0},{userId:'smf_server_career_ai',side:1}],teamIds:['japan','brazil'],mode:'career-ai'};
  let durableReleaseAttempts=0,localReleaseAttempts=0;
  const onlineCareerService={async getCurrentSeason(){return ONLINE_SEASON;},async claimNextFixtureBinding(){return {ok:true,binding,reservationId:'a'.repeat(32)};},
    async releaseFixtureReservation(){durableReleaseAttempts++;throw new Error('database cleanup unavailable');}};
  const matchmaking={reserveCareerFixture(){return {ok:true};},issueCareerTicket(){return {ok:false,reason:'service-capacity'};},
    releaseCareerFixture(){localReleaseAttempts++;return {ok:true,released:true};}};
  const {handler,request}=fixture({onlineCareerService,matchmaking});
  const response=await handler(request('/api/v1/online-career/current/fixtures/next/ticket',{method:'POST'}));
  assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:'service-unavailable'});
  assert.equal(durableReleaseAttempts,1,'the durable lease receives one release attempt and then expires if storage is unavailable');
  assert.equal(localReleaseAttempts,1,'local reservation cleanup is still attempted exactly once');
});

test('Online Career returns an active-fixture conflict when another server holds the durable lease',async()=>{
  let reserveCalls=0;
  const onlineCareerService={async getCurrentSeason(){return ONLINE_SEASON;},async claimNextFixtureBinding(){return {ok:false,reason:'fixture-reserved'};},async releaseFixtureReservation(){throw Error('no claim to release');}};
  const matchmaking={reserveCareerFixture(){reserveCalls++;return {ok:true};},issueCareerTicket(){reserveCalls++;return {ok:true};}};
  const {handler,request}=fixture({onlineCareerService,matchmaking});
  const response=await handler(request('/api/v1/online-career/current/fixtures/next/ticket',{method:'POST'}));
  assert.equal(response.status,409);assert.deepEqual(await response.json(),{error:'already-active'});assert.equal(reserveCalls,0);
});

test('stale revisions and idempotency key conflicts return conflict without leaking storage details', async () => {
  const {handler, request} = fixture();
  const headers = {'content-type':'application/json'};
  const commit = (expectedVersion, idempotencyKey, snapshot) => request('/api/v1/career/current', {method:'PUT', headers, body:JSON.stringify({expectedVersion,idempotencyKey,snapshot})});
  assert.equal((await handler(commit(0,'commit_key_0001',{season:1}))).status, 200);
  const duplicate = await handler(commit(0,'commit_key_0001',{season:1}));
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).status, 'duplicate');
  const idempotency = await handler(commit(0,'commit_key_0001',{season:99}));
  assert.equal(idempotency.status, 409);
  assert.deepEqual(await idempotency.json(), {error:'idempotency-conflict'});
  const stale = await handler(commit(0,'commit_key_0002',{season:2}));
  assert.equal(stale.status, 409);
  assert.deepEqual(await stale.json(), {error:'version-conflict'});
});

test('malformed JSON, wrong media type, invalid envelope, unsafe keys, and oversized streaming bodies fail closed', async () => {
  const {handler, request} = fixture();
  const put = (body, contentType='application/json') => request('/api/v1/career/current', {method:'PUT', headers:{'content-type':contentType}, body});
  assert.equal((await handler(put('{'))).status, 400);
  assert.equal((await handler(put('{}','text/plain'))).status, 415);
  assert.equal((await handler(put(JSON.stringify({expectedVersion:-1,idempotencyKey:'bad',snapshot:{}})))).status, 400);
  assert.equal((await handler(put('{"expectedVersion":0,"idempotencyKey":"safe_key_00001","snapshot":{"__proto__":{"polluted":true}}}'))).status, 400);
  const huge = new ReadableStream({start(controller) { controller.enqueue(new TextEncoder().encode(' '.repeat(600 * 1024))); controller.close(); }});
  const oversized = new Request('https://api.example.test/api/v1/career/current', {method:'PUT', headers:{authorization:TOKEN, 'content-type':'application/json'}, body:huge, duplex:'half'});
  assert.equal((await handler(oversized)).status, 413);
});

test('unknown API routes, unsupported methods, and non-API paths are handled distinctly', async () => {
  const {handler, request} = fixture();
  assert.equal(await handler(request('/assets/player.png')), null);
  assert.equal((await handler(request('/api/v1/private'))).status, 404);
  assert.equal((await handler(request('/api/v1/me',{method:'DELETE'}))).status, 405);
});

test('authenticated reads and writes have separate fixed-window limits and reset at the exact boundary', async () => {
  let time=10_000;
  const ticketCalls=[];
  const {handler,request}=fixture({now:()=>time,limits:{windowMs:5000,read:1,write:1,maxAccounts:4},
    matchmaking:{issueTicket:async userId=>{ticketCalls.push(userId);return {ok:true,ticket:'c'.repeat(64),expiresAt:time+30_000};}}});
  assert.equal((await handler(request('/api/v1/me'))).status,200);
  assert.equal((await handler(request('/api/v1/matches/ticket',{method:'POST'}))).status,201);
  const readLimited=await handler(request('/api/v1/career/current'));
  assert.equal(readLimited.status,429);
  assert.equal(readLimited.headers.get('retry-after'),'5');
  assert.deepEqual(await readLimited.json(),{error:'rate-limited'});
  const writeLimited=await handler(request('/api/v1/matches/ticket',{method:'POST'}));
  assert.equal(writeLimited.status,429);
  assert.equal(writeLimited.headers.get('retry-after'),'5');
  assert.deepEqual(ticketCalls,['account_A']);
  time=15_000;
  assert.equal((await handler(request('/api/v1/me'))).status,200);
  assert.equal((await handler(request('/api/v1/matches/ticket',{method:'POST'}))).status,201);
});

test('unauthenticated and denied-origin requests do not allocate or consume account budgets', async () => {
  let time=20_000;
  const authenticate=async request=>request.headers.get('authorization')===TOKEN&&request.headers.get('x-test-account')
    ? {userId:request.headers.get('x-test-account')} : null;
  const {handler,request}=fixture({now:()=>time,limits:{windowMs:5000,read:1,write:1,maxAccounts:1},authenticate});
  assert.equal((await handler(request('/api/v1/me',{headers:{'x-test-account':'account_A',authorization:'Bearer invalid-token-value'}}))).status,401);
  assert.equal((await handler(request('/api/v1/me',{headers:{'x-test-account':'account_A',origin:'https://evil.example'}}))).status,403);
  assert.equal((await handler(request('/api/v1/me',{headers:{'x-test-account':'account_A'}}))).status,200);
  assert.equal((await handler(request('/api/v1/me',{headers:{'x-test-account':'account_A'}}))).status,429);
  time+=5000;
  assert.equal((await handler(request('/api/v1/me',{headers:{'x-test-account':'account_B'}}))).status,200);
});

test('the rate identity map is bounded and refuses new identities until expired rows can be pruned', async () => {
  let time=30_000;
  const authenticate=async request=>request.headers.get('authorization')===TOKEN&&request.headers.get('x-test-account')
    ? {userId:request.headers.get('x-test-account')} : null;
  const {handler,request}=fixture({now:()=>time,limits:{windowMs:5000,read:5,write:2,maxAccounts:2},authenticate});
  assert.equal((await handler(request('/api/v1/me',{headers:{'x-test-account':'account_A'}}))).status,200);
  assert.equal((await handler(request('/api/v1/me',{headers:{'x-test-account':'account_B'}}))).status,200);
  const saturated=await handler(request('/api/v1/me',{headers:{'x-test-account':'account_C'}}));
  assert.equal(saturated.status,429);
  assert.equal(saturated.headers.get('retry-after'),'5');
  const saturatedBody=await saturated.json();
  assert.deepEqual(saturatedBody,{error:'rate-limited'});
  assert.equal(JSON.stringify(saturatedBody).includes('account_C'),false);
  time+=5000;
  assert.equal((await handler(request('/api/v1/me',{headers:{'x-test-account':'account_C'}}))).status,200);
});

test('rate-limit configuration and clock are validated at construction and fail closed at request time', async () => {
  const store={getProfile:async()=>null,getSnapshot:async()=>null,putSnapshot:async()=>null};
  assert.throws(()=>createOnlineAccountApi({authenticate:async()=>null,store,limits:{maxAccounts:0}}),/rate limits/);
  assert.throws(()=>createOnlineAccountApi({authenticate:async()=>null,store,now:1}),/clock/);
  const handler=createOnlineAccountApi({authenticate:async()=>({userId:'account_A'}),store,now:()=>NaN});
  const response=await handler(new Request('https://api.example.test/api/v1/me',{headers:{authorization:TOKEN}}));
  assert.equal(response.status,503);
  assert.deepEqual(await response.json(),{error:'service-unavailable'});
});
