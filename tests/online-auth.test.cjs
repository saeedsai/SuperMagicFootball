const test=require('node:test');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');

const issuer='https://identity.example.test/';
function setup({tokenResponse,discoveryOverride={},fetchError=false}={}){
  const data=new Map(),calls=[],redirects=[],historyCalls=[];
  const storage={getItem:key=>data.has(key)?data.get(key):null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
  const location={origin:'https://game.example.test',href:'https://game.example.test/',pathname:'/',hash:'#home',assign:value=>redirects.push(value)};
  const history={state:null,replaceState(...args){historyCalls.push(args)}};
  const discovery={issuer,authorization_endpoint:'https://identity.example.test/authorize',token_endpoint:'https://identity.example.test/token',code_challenge_methods_supported:['S256'],...discoveryOverride};
  const fetchImpl=async(url,init={})=>{
    calls.push({url:String(url),init});
    if(fetchError)throw Error('offline');
    if(String(url).includes('.well-known/openid-configuration'))return {ok:true,text:async()=>JSON.stringify(discovery)};
    if(String(url)==='https://identity.example.test/token')return {ok:true,text:async()=>JSON.stringify(tokenResponse||{access_token:'signed-access-token-value-1234',token_type:'Bearer',expires_in:3600})};
    throw Error('unexpected-url');
  };
  return {storage,location,history,fetchImpl,data,calls,redirects,historyCalls};
}
async function factory(deps){
  const {createOnlineOidcSession}=await import('../src/modules/online-auth.js');
  const env=setup(deps);
  const session=createOnlineOidcSession({issuer,clientId:'smf-browser-app',redirectUri:'https://game.example.test/',audience:'smf-api',...env,cryptoImpl:webcrypto,now:()=>1800000000000});
  return {session,...env};
}

test('OIDC sign-in uses authorization code + S256 PKCE and keeps bearer token in memory',async()=>{
  const ctx=await factory();
  assert.deepEqual(await ctx.session.completeRedirect(),{completed:false,returnTo:null});
  await ctx.session.beginSignIn();
  assert.equal(ctx.redirects.length,1);
  const authorize=new URL(ctx.redirects[0]);
  assert.equal(authorize.origin,'https://identity.example.test');
  assert.equal(authorize.searchParams.get('response_type'),'code');
  assert.equal(authorize.searchParams.get('code_challenge_method'),'S256');
  assert.equal(authorize.searchParams.get('audience'),'smf-api');
  const pending=JSON.parse(ctx.storage.getItem('smf.online.oidc.pending.v1'));
  const challenge=authorize.searchParams.get('code_challenge');
  const digest=await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(pending.verifier));
  const expected=Buffer.from(digest).toString('base64url');
  assert.equal(challenge,expected);
  assert.equal(pending.verifier.length,64);
  assert.equal(ctx.storage.getItem('smf.online.oidc.access_token'),null);

  ctx.location.href=`https://game.example.test/?code=one-time-code&state=${authorize.searchParams.get('state')}#home`;
  ctx.location.pathname='/';ctx.location.hash='#home';
  const result=await ctx.session.completeRedirect();
  assert.deepEqual(result,{completed:true,returnTo:'/#home'});
  assert.equal(ctx.session.getAccessToken(),'signed-access-token-value-1234');
  assert.equal(ctx.session.isSignedIn(),true);
  const tokenCall=ctx.calls.find(call=>call.url.endsWith('/token'));
  assert.equal(tokenCall.init.credentials,'omit');
  assert.match(tokenCall.init.body,/code_verifier=/);
  assert.equal(ctx.data.has('smf.online.oidc.pending.v1'),false);
  assert.equal([...ctx.data.values()].some(value=>value.includes('signed-access-token-value-1234')),false);
  assert.equal(ctx.historyCalls.length,1);
  ctx.session.signOut();
  assert.equal(ctx.session.getAccessToken(),null);
});

test('OIDC callback requires matching unexpired state before exchanging code',async()=>{
  const ctx=await factory();await ctx.session.beginSignIn();
  ctx.location.href='https://game.example.test/?code=one-time-code&state=attacker#home';
  assert.equal((await ctx.session.completeRedirect()).error,'identity-response-invalid');
  assert.equal(ctx.calls.filter(call=>call.url.endsWith('/token')).length,0);
  assert.equal(ctx.data.has('smf.online.oidc.pending.v1'),false);
});

test('OIDC callback returns generic errors for provider denial and malformed token response',async()=>{
  const denied=await factory();await denied.session.beginSignIn();
  const state=new URL(denied.redirects[0]).searchParams.get('state');
  denied.location.href=`https://game.example.test/?error=access_denied&state=${state}`;
  assert.equal((await denied.session.completeRedirect()).error,'identity-sign-in-failed');
  const malformed=await factory({tokenResponse:{access_token:'short',token_type:'Bearer',expires_in:3600}});
  await malformed.session.beginSignIn();
  const s=new URL(malformed.redirects[0]).searchParams.get('state');
  malformed.location.href=`https://game.example.test/?code=one-time-code&state=${s}`;
  assert.equal((await malformed.session.completeRedirect()).error,'identity-token-exchange-failed');
  assert.equal(malformed.session.getAccessToken(),null);
});

test('OIDC discovery requires the configured issuer and HTTPS token endpoints',async()=>{
  for(const discoveryOverride of [{issuer:'https://attacker.test/'},{token_endpoint:'http://identity.example.test/token'},
    {code_challenge_methods_supported:['plain']}]){
    const ctx=await factory({discoveryOverride});
    await assert.rejects(()=>ctx.session.beginSignIn());
    assert.equal(ctx.data.has('smf.online.oidc.pending.v1'),false);
  }
});

test('OIDC client rejects insecure or cross-origin deployment configuration',async()=>{
  const {createOnlineOidcSession}=await import('../src/modules/online-auth.js');
  const ctx=setup();
  assert.throws(()=>createOnlineOidcSession({issuer:'http://identity.example.test/',clientId:'smf-browser-app',redirectUri:'https://game.example.test/',...ctx,cryptoImpl:webcrypto}),/HTTPS/);
  assert.throws(()=>createOnlineOidcSession({issuer,clientId:'smf-browser-app',redirectUri:'https://attacker.test/',...ctx,cryptoImpl:webcrypto}),/configuration/);
});

test('OIDC sign-in tolerates a browser that denies sessionStorage without breaking app startup',async()=>{
  const {createOnlineOidcSession}=await import('../src/modules/online-auth.js');
  const ctx=setup();
  const session=createOnlineOidcSession({issuer,clientId:'smf-browser-app',redirectUri:'https://game.example.test/',...ctx,storage:null,cryptoImpl:webcrypto});
  await assert.rejects(()=>session.beginSignIn(),/storage-unavailable/);
  assert.equal(session.getAccessToken(),null);
});
