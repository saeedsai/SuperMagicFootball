const PENDING_KEY='smf.online.oidc.pending.v1';
const MAX_TOKEN=8192;
const MAX_PENDING_AGE_MS=10*60*1000;

function exactHttps(value,label){
 let url;try{url=new URL(value)}catch{throw new TypeError(`${label} must be an absolute HTTPS URL`)}
 if(url.protocol!=='https:'||url.username||url.password||url.hash)throw new TypeError(`${label} must be an absolute HTTPS URL`);
 return url;
}
function randomState(cryptoImpl){
 const bytes=new Uint8Array(32);cryptoImpl.getRandomValues(bytes);
 return Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('');
}
function base64url(bytes){
 let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
 return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function readJsonBounded(response,maxBytes){
 const text=await response.text();
 if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>maxBytes)throw new Error('identity-response-too-large');
 try{return JSON.parse(text)}catch{throw new Error('identity-response-invalid')}
}
function safeReturnUrl(location){return `${location.pathname||'/'}${location.hash||''}`}

/** OIDC authorization-code + PKCE public client. Tokens live only in this JS instance. */
export function createOnlineOidcSession({issuer,clientId,redirectUri,audience='',scope='openid profile',fetchImpl=globalThis.fetch,
 storage,location=globalThis.location,history=globalThis.history,cryptoImpl=globalThis.crypto,now=Date.now}={}){
 const issuerUrl=exactHttps(issuer,'issuer');
 const redirect=exactHttps(redirectUri,'redirectUri');
 let sessionStorage=storage;
 if(sessionStorage===undefined){try{sessionStorage=globalThis.sessionStorage}catch{sessionStorage=null}}
 if(typeof clientId!=='string'||!/^[A-Za-z0-9._:@-]{3,256}$/.test(clientId)||
    typeof location?.origin==='string'&&redirect.origin!==location.origin)throw new TypeError('Invalid online identity client configuration');
 if(typeof audience!=='string'||audience.length>256||typeof scope!=='string'||scope.length>256||!scope.split(/\s+/).includes('openid')||
    typeof fetchImpl!=='function'||sessionStorage!==null&&sessionStorage!==undefined&&(
     typeof sessionStorage.getItem!=='function'||typeof sessionStorage.setItem!=='function'||typeof sessionStorage.removeItem!=='function')||
    !location||typeof location.assign!=='function'||!history||typeof history.replaceState!=='function'||
    !cryptoImpl?.getRandomValues||!cryptoImpl?.subtle||typeof now!=='function')throw new TypeError('Invalid online sign-in dependencies');
 let accessToken=null,expiresAt=0,metadataPromise=null;

 async function metadata(){
  if(!metadataPromise)metadataPromise=(async()=>{
   const discovery=new URL('.well-known/openid-configuration',issuerUrl.href.endsWith('/')?issuerUrl.href:`${issuerUrl.href}/`);
   const response=await fetchImpl(discovery,{headers:{accept:'application/json'},cache:'no-store',credentials:'omit'});
   if(!response?.ok)throw new Error('identity-unavailable');
   const value=await readJsonBounded(response,64*1024);
   if(!value||value.issuer!==issuerUrl.href||typeof value.authorization_endpoint!=='string'||typeof value.token_endpoint!=='string'||
      typeof value.code_challenge_methods_supported==='undefined'||!value.code_challenge_methods_supported.includes('S256'))throw new Error('identity-config-invalid');
   const authorization=exactHttps(value.authorization_endpoint,'authorization endpoint');
   const token=exactHttps(value.token_endpoint,'token endpoint');
   return Object.freeze({authorization:authorization.href,token:token.href});
  })().catch(error=>{metadataPromise=null;throw error});
  return metadataPromise;
 }

 async function beginSignIn(){
  let verifierBytes=new Uint8Array(32);cryptoImpl.getRandomValues(verifierBytes);
  const verifier=Array.from(verifierBytes,value=>value.toString(16).padStart(2,'0')).join('');
  const digest=await cryptoImpl.subtle.digest('SHA-256',new TextEncoder().encode(verifier));
  const challenge=base64url(new Uint8Array(digest));
  const state=randomState(cryptoImpl);
  const pending={state,verifier,createdAt:now(),returnTo:safeReturnUrl(location)};
  if(!sessionStorage)throw new Error('online-sign-in-storage-unavailable');
  try{sessionStorage.setItem(PENDING_KEY,JSON.stringify(pending))}catch{throw new Error('online-sign-in-storage-unavailable')}
  let endpoints;
  try{endpoints=await metadata()}catch(error){try{sessionStorage.removeItem(PENDING_KEY)}catch{};throw error}
  const url=new URL(endpoints.authorization);
  url.searchParams.set('client_id',clientId);url.searchParams.set('redirect_uri',redirect.href);
  url.searchParams.set('response_type','code');url.searchParams.set('scope',scope);
  url.searchParams.set('state',state);url.searchParams.set('code_challenge_method','S256');url.searchParams.set('code_challenge',challenge);
  if(audience)url.searchParams.set('audience',audience);
  location.assign(url.href);
  return Object.freeze({started:true});
 }

 async function completeRedirect(){
  const current=new URL(location.href);
  const code=current.searchParams.get('code'),state=current.searchParams.get('state'),error=current.searchParams.get('error');
  if(!code&&!state&&!error)return Object.freeze({completed:false,returnTo:null});
  history.replaceState(history.state??null,'',safeReturnUrl(location));
  let pending;
  try{pending=JSON.parse(sessionStorage?.getItem(PENDING_KEY)||'null');sessionStorage?.removeItem(PENDING_KEY)}catch{pending=null}
  if(error)return Object.freeze({completed:false,error:'identity-sign-in-failed',returnTo:pending?.returnTo||null});
  if(typeof code!=='string'||code.length<1||code.length>2048||typeof state!=='string'||!pending||pending.state!==state||
     typeof pending.verifier!=='string'||pending.verifier.length!==64||!Number.isFinite(pending.createdAt)||now()-pending.createdAt>MAX_PENDING_AGE_MS||pending.createdAt>now()+30000){
   return Object.freeze({completed:false,error:'identity-response-invalid',returnTo:pending?.returnTo||null});
  }
  try{
   const endpoints=await metadata();
   const body=new URLSearchParams({grant_type:'authorization_code',client_id:clientId,code,redirect_uri:redirect.href,code_verifier:pending.verifier});
   const response=await fetchImpl(endpoints.token,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded',accept:'application/json'},body:body.toString(),cache:'no-store',credentials:'omit'});
   if(!response?.ok)throw new Error('identity-token-exchange-failed');
   const value=await readJsonBounded(response,16*1024);
   if(!value||typeof value.access_token!=='string'||value.access_token.length<16||value.access_token.length>MAX_TOKEN||
      typeof value.token_type!=='string'||value.token_type.toLowerCase()!=='bearer'||!Number.isFinite(value.expires_in)||value.expires_in<30||value.expires_in>86400){
    throw new Error('identity-token-invalid');
   }
   accessToken=value.access_token;expiresAt=now()+value.expires_in*1000;
   return Object.freeze({completed:true,returnTo:typeof pending.returnTo==='string'?pending.returnTo:null});
  }catch{accessToken=null;expiresAt=0;return Object.freeze({completed:false,error:'identity-token-exchange-failed',returnTo:pending.returnTo||null})}
 }

 function getAccessToken(){return accessToken&&expiresAt>now()+5000?accessToken:null}
 function signOut(){accessToken=null;expiresAt=0;try{sessionStorage?.removeItem(PENDING_KEY)}catch{}}
 return Object.freeze({beginSignIn,completeRedirect,getAccessToken,signOut,isSignedIn:()=>getAccessToken()!==null});
}
