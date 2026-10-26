#!/usr/bin/env python3
"""Real hosted WebSocket broker integration with distinct simulated client IPs.

Tests public P2P discovery, LAN isolation, host approval and SDP relay against
the production broker source. These are simulated IPs, not physical devices.
The browser shard installs the declared ws dependency before running this test.
"""
from pathlib import Path
import os, socket, subprocess, time, urllib.request

ROOT = Path(__file__).resolve().parents[1]
with socket.socket() as sock:
    sock.bind(('127.0.0.1',0))
    port=sock.getsockname()[1]
env={**os.environ,'LAN_PORT':str(port),'LAN_BIND':'127.0.0.1',
     'SMF_SIGNAL_MODE':'hosted','SMF_PUBLIC_ORIGIN':'https://saeedsai.github.io'}
env.pop('RENDER_EXTERNAL_URL',None)
server=subprocess.Popen(['node','scripts/lan-server.mjs'],cwd=ROOT,env=env,
                        stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT)
script=r"""
const WS=require('ws');
const target=process.argv[1];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function connect(ip){
 const ws=new WS(target,{headers:{Origin:'https://saeedsai.github.io','X-Forwarded-For':ip}});
 const messages=[];
 ws.on('message',payload=>{try{messages.push(JSON.parse(String(payload)))}catch{}});
 await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject)});
 return {ws,messages,send:msg=>ws.send(JSON.stringify(msg)),close:()=>ws.close()};
}
async function receive(client,type,check=()=>true){
 for(let i=0;i<160;i++){
  const match=client.messages.find(x=>x.type===type&&check(x));
  if(match)return match;
  await sleep(25);
 }
 throw Error('Timed out waiting for '+type+'; received '+JSON.stringify(client.messages));
}
(async()=>{
 const all=[];
 try{
  const publicHost=await connect('203.0.113.11');all.push(publicHost);
  const remoteGuest=await connect('198.51.100.22');all.push(remoteGuest);
  const localHost=await connect('203.0.113.11');all.push(localHost);
  const remoteLAN=await connect('198.51.100.22');all.push(remoteLAN);
  publicHost.send({type:'host',roomId:'room_internet_test',name:'Internet Match',build:'0.11.3.0',scope:'internet-p2p'});
  await receive(publicHost,'host-registered');
  localHost.send({type:'host',roomId:'room_local_test',name:'Local Match',build:'0.11.3.0'});
  await receive(localHost,'host-registered');
  remoteGuest.send({type:'rooms',scope:'internet-p2p'});
  const internet=await receive(remoteGuest,'rooms-snapshot');
  if(internet.rooms.length!==1||internet.rooms[0].roomId!=='room_internet_test'||internet.rooms[0].scope!=='internet-p2p')
   throw Error('Internet directory leaked LAN room or missed internet room '+JSON.stringify(internet));
  remoteLAN.send({type:'rooms'});
  const lan=await receive(remoteLAN,'rooms-snapshot');
  if(lan.rooms.length)throw Error('Remote LAN guest discovered nonlocal room '+JSON.stringify(lan));
  remoteGuest.send({type:'join',roomId:'room_internet_test',requestId:'request_test0001',build:'0.11.3.0'});
  await receive(publicHost,'join-request');
  if(remoteGuest.messages.some(x=>x.type==='join-accept'))throw Error('Host consent was bypassed');
  publicHost.send({type:'decision',roomId:'room_internet_test',requestId:'request_test0001',accept:true});
  await receive(remoteGuest,'join-accept');
  await receive(publicHost,'guest-approved');
  publicHost.send({type:'offer',roomId:'room_internet_test',sdp:'v=0\r\ntest-offer'});
  const offer=await receive(remoteGuest,'offer');
  if(!offer.sdp.includes('test-offer'))throw Error('Host SDP not forwarded');
  remoteGuest.send({type:'answer',roomId:'room_internet_test',sdp:'v=0\r\ntest-answer'});
  const answer=await receive(publicHost,'answer');
  if(!answer.sdp.includes('test-answer'))throw Error('Guest SDP not forwarded');
  console.log('PASS HOSTED_BROKER_SCOPED_P2P_DISCOVERY_AND_HOST_CONSENT');
 }finally{for(const c of all)c.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
"""
try:
    for _ in range(80):
        if server.poll() is not None:
            raise RuntimeError('Hosted signaling broker did not remain running')
        try:
            with urllib.request.urlopen(f'http://127.0.0.1:{port}/healthz',timeout=1) as response:
                if response.status==200:
                    break
        except Exception:
            time.sleep(.12)
    else:
        raise AssertionError('Hosted signaling broker failed to start')
    result=subprocess.run(['node','--input-type=commonjs','-e',script,
                           f'ws://127.0.0.1:{port}/lan-signal'],
                          cwd=ROOT,text=True,capture_output=True,timeout=35)
    print(result.stdout,flush=True)
    if result.returncode:
        print(result.stderr,flush=True)
        raise SystemExit(result.returncode)
finally:
    server.terminate()
    try:server.wait(timeout=5)
    except subprocess.TimeoutExpired:server.kill()
