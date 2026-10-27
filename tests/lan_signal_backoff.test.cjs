const assert=require('node:assert/strict');
const {test}=require('node:test');
const load=()=>import('../src/modules/lan-auto-signal.js');
class Socket extends EventTarget {
 static instances=[];
 constructor(url){super();this.url=url;this.readyState=0;this.sent=[];Socket.instances.push(this)}
 open(){this.readyState=1;this.dispatchEvent(new Event('open'))}
 close(){this.readyState=3;this.dispatchEvent(new Event('close'))}
 send(p){this.sent.push(p)}
}
async function setup(internet=false){
 Socket.instances=[];let now=0;const timers=[];const states=[];
 globalThis.location={protocol:'http:',host:'192.168.1.20:8000'};
 const {connectLanSignal}=await load();
 const client=connectLanSignal({internet,WebSocketImpl:Socket,onState:s=>states.push(s),nowImpl:()=>now,
  setTimeoutImpl:(fn,delay)=>{const t={fn,delay,cancelled:false};timers.push(t);return t},
  clearTimeoutImpl:t=>t.cancelled=true});
 const retries=()=>timers.filter(t=>t.delay<=10000&&!t.cancelled);
 return {client,states,retries,advance(ms){now+=ms},latest(){return Socket.instances.at(-1)},runRetry(){const t=retries().at(-1);assert.ok(t);t.cancelled=true;t.fn()}};
}
for(const internet of [false,true]){
 test(`short-lived ${internet?'P2P':'LAN'} broker opens preserve exponential reconnect backoff`,async()=>{
  const f=await setup(internet);
  for(const delay of [1000,2000,4000,8000,10000]){
   f.latest().open();f.advance(100);f.latest().close();
   assert.equal(f.retries().at(-1).delay,delay);
   f.runRetry();
  }
  f.client.close();
 });
 test(`stable ${internet?'P2P':'LAN'} connection resets reconnect backoff`,async()=>{
  const f=await setup(internet);
  f.latest().open();f.latest().close();assert.equal(f.retries().at(-1).delay,1000);f.runRetry();
  f.latest().open();f.latest().close();assert.equal(f.retries().at(-1).delay,2000);f.runRetry();
  f.latest().open();f.advance(30000);f.latest().close();assert.equal(f.retries().at(-1).delay,1000);
  f.runRetry();f.latest().open();assert.equal(f.client.ready,true);assert.equal(f.client.send({type:'rooms'}),true);
  f.client.close();assert.equal(f.retries().length,0);
 });
}
