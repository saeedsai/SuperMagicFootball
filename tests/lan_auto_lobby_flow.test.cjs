const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=()=>import('../src/modules/lan-auto-lobby.js');

class MockElement extends EventTarget{
 constructor(){super();this.children=[];this.textContent='';this.className='';this.onclick=null}
 replaceChildren(...elements){this.children=[...elements];this.textContent=''}
 append(...elements){this.children.push(...elements)}
 click(){this.onclick?.();this.dispatchEvent(new Event('click'))}
}
function setup(){
 const oldDoc=globalThis.document,oldLocation=globalThis.location;
 globalThis.location={origin:'http://localhost:8000',host:'localhost:8000',hostname:'localhost',protocol:'http:'};
 globalThis.document={createElement:()=>new MockElement()};
 const elements=new Map();
 const root={innerHTML:'',querySelector(selector){
  if(!elements.has(selector))elements.set(selector,new MockElement());
  return elements.get(selector);
 }};
 const packets=[];
 let hooks=null;
 const connection={ready:false,closed:false,send(packet){if(!this.ready)return false;packets.push(packet);return true},close(){this.closed=true}};
 const signalFactory=handlers=>{hooks=handlers;return connection};
 return {root,elements,packets,connection,signalFactory,emit:packet=>hooks.onEvent(packet),
  connect(){connection.ready=true;hooks.onState('connected')},
  cleanup(){globalThis.document=oldDoc;globalThis.location=oldLocation}};
}
test('one Host click before signaling opens registers once and shows reachable guest address',async()=>{
 const f=setup();
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.0.0',signalFactory:f.signalFactory});
  f.elements.get('#autoHost').click();
  assert.match(f.elements.get('#autoStatus').textContent,/register automatically/);
  assert.doesNotMatch(f.elements.get('#autoHostInfo').textContent,/Guest address: http:\/\/localhost/);
  f.emit({type:'lan-addresses',urls:['http://192.168.1.20:8000','http://evil.test']});
  f.connect();
  assert.equal(f.packets.length,1);
  assert.equal(f.packets[0].type,'host');
  const roomId=f.packets[0].roomId;
  f.emit({type:'host-registered',roomId});
  assert.match(f.elements.get('#autoStatus').textContent,/Room registered/);
  assert.match(f.elements.get('#autoHostInfo').textContent,/http:\/\/192\.168\.1\.20:8000/);
  assert.doesNotMatch(f.elements.get('#autoHostInfo').textContent,/evil/);
  dispose();
  assert.equal(f.connection.closed,true);
 }finally{f.cleanup()}
});
test('one Find Games click before signaling opens later discovers and joins host',async()=>{
 const f=setup();
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.0.0',signalFactory:f.signalFactory});
  f.elements.get('#autoFind').click();
  assert.match(f.elements.get('#autoStatus').textContent,/search will start automatically/);
  f.connect();
  assert.equal(f.packets[0].type,'rooms');
  f.emit({type:'room-announce',roomId:'room_12345678',name:'A match',build:'0.10.0.0'});
  const buttons=f.elements.get('#autoRooms').children;
  assert.equal(buttons.length,1);
  assert.match(buttons[0].textContent,/JOIN A match/);
  buttons[0].click();
  assert.equal(f.packets.at(-1).type,'join');
  assert.equal(f.packets.at(-1).roomId,'room_12345678');
  dispose();
 }finally{f.cleanup()}
});
