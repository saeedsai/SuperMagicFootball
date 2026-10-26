'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=async()=>({
  ...(await import('../src/modules/lan_peer_connection.js')),
  ...(await import('../src/modules/lan-live-match.js'))
});
const hello={protocol:1,type:'hello',session:'0123456789abcdef0123456789abcdef',
  sequence:0,build:require('../package.json').version};
class FakeChannel extends EventTarget{
  constructor(label){super();this.label=label;this.readyState='connecting';this.sent=[];}
  send(message){
    if(this.readyState!=='open')throw Error('channel closed');
    this.sent.push(message);
    const ev=new Event('message');ev.data=message;
    this.other?.dispatchEvent(ev);
  }
  open(){this.readyState='open';this.dispatchEvent(new Event('open'));}
  close(){if(this.readyState==='closed')return;this.readyState='closed';this.dispatchEvent(new Event('close'));}
}
class FakePeer extends EventTarget{
  constructor(config){super();this.config=config;this.iceGatheringState='new';this.connectionState='new';}
  createDataChannel(label){this.channel=new FakeChannel(label);return this.channel;}
  async createOffer(){return {type:'offer',sdp:'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n'};}
  async createAnswer(){return {type:'answer',sdp:'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n'};}
  async setLocalDescription(d){this.localDescription=d;this.iceGatheringState='complete';this.dispatchEvent(new Event('icegatheringstatechange'));}
  async setRemoteDescription(d){this.remoteDescription=d;}
  close(){this.connectionState='closed';this.dispatchEvent(new Event('connectionstatechange'));}
}
function input(){
  return {state:[{x:1,y:0,pass:1,shoot:0,dribble:0,jump:0},{},{},{}],
    pressed:[{pass:true},{},{},{}],releases:[{},{},{},{}],
    prev:[{},{},{},{}],tapDurations:[{},{},{},{}],
    poll(){},held(i,a){return !!this.state[i]?.[a]},
    just(i,a){return !!this.pressed[i]?.[a]}};
}
function game(i){
  return {matchState:'play',half:1,controlled:[3,3],clock:0,score:[0,0],
    players:[{t:0,i:0,x:300,y:250,face:1,anim:0},{t:1,i:0,x:700,y:250,face:-1,anim:0}],
    ball:{x:500,y:250,z:0,owner:null},
    update(dt){i.poll(true);this.clock+=dt;
      this.players[1].x+=(i.state[1].x||0)*80*dt;
    }
  };
}
test('LAN-050 complete protocol DataChannel host/guest simulation and remote rendering',async()=>{
  const {createLanPeerConnection,createLanLiveMatch}=await load();
  const host=createLanPeerConnection({...hello,role:'host'},{RTCPeerConnection:FakePeer});
  const guest=createLanPeerConnection({...hello,role:'guest'},{RTCPeerConnection:FakePeer});
  const offer=await host.createOffer();
  const answer=await guest.acceptOffer(offer);
  await host.acceptAnswer(answer);
  const guestChannel=new FakeChannel('smf-lan');
  guest.peer.dispatchEvent(Object.assign(new Event('datachannel'),{channel:guestChannel}));
  host.peer.channel.other=guestChannel;
  guestChannel.other=host.peer.channel;
  host.peer.channel.open();guestChannel.open();
  assert.equal(host.ready,true);assert.equal(guest.ready,true);
  const hi=input(),gi=input(),hg=game(hi),gg=game(gi);
  hg.magicHazards=[{kind:'banana',team:0,x:360,y:250,life:2.8,arm:.2}];
  gg.magicHazards=[];
  const field={x:100,y:50,w:800,h:400};
  const h=createLanLiveMatch({peer:host,role:'host',game:hg,input:hi,field});
  const g=createLanLiveMatch({peer:guest,role:'guest',game:gg,input:gi,field});
  for(let n=0;n<12;n++){
    assert.equal(h.step(.016),true);
    g.step(.016);
  }
  assert.equal(h.latestTick,11);
  assert.equal(g.latestTick,11);
  assert.ok(hg.players[1].x>700,'guest command must affect authoritative away player');
  assert.equal(gg.players[1].x,hg.players[1].x,'guest renders host-owned coordinates');
  assert.ok(Math.abs(gg.clock-hg.clock)<=.0005,'guest clock follows host within wire millisecond precision');
  assert.equal(gg.half,1);
  assert.deepEqual(gg.magicHazards,hg.magicHazards,
    'host Magic Trick trap reaches guest through the actual RTC snapshot bridge');
  hg.magicHazards=[];
  assert.equal(h.step(.016),true);
  assert.deepEqual(gg.magicHazards,[],'host trap removal reaches guest immediately');
  assert.ok(host.peer.channel.sent.length>=12);
  assert.ok(guestChannel.sent.length>=10);
  h.dispose();g.dispose();host.dispose();guest.dispose();
  assert.equal(host.disposed,true);assert.equal(guest.disposed,true);
});
