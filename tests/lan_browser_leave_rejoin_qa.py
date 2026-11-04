#!/usr/bin/env python3
"""Real local broker/WebRTC acceptance for leaving and rejoining a live LAN room.

Run after building the modular fixture with: python -X utf8 scripts/build.py
This uses two Chromium contexts and loopback signaling; it is not physical-device,
hosted, restrictive-NAT, or real packet-loss certification.
"""
import os
import socket
import subprocess
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def start_server(port):
    env = {**os.environ, "LAN_PORT": str(port), "LAN_BIND": "127.0.0.1",
           "SMF_SIGNAL_MODE": "lan"}
    proc = subprocess.Popen(["node", "scripts/lan-server.mjs"], cwd=ROOT, env=env,
                            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    url = f"http://127.0.0.1:{port}/"
    deadline = time.monotonic() + 25
    while time.monotonic() < deadline:
        if proc.poll() is not None:
            raise RuntimeError("local LAN broker exited before HTTP became ready")
        try:
            with urllib.request.urlopen(url + "healthz", timeout=1) as response:
                if response.status == 200:
                    return proc, url
        except Exception:
            time.sleep(.1)
    raise TimeoutError("local LAN broker health endpoint did not respond")


def stop_server(proc):
    if proc.poll() is not None:
        return
    proc.terminate()
    try:
        proc.communicate(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.communicate(timeout=5)


def open_lan_menu(page, origin):
    page.goto(origin, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_function("Boolean(window.NekketsuHD?.game)", timeout=90000)
    page.locator('[data-action="navQuick"]').first.click()
    page.locator('[data-action="navLan"]').first.click()
    page.locator("#autoHost").wait_for(timeout=20000)


def start_live_match(host, guest):
    host.locator("#autoHost").click()
    host.wait_for_function("document.querySelector('#autoStatus')?.textContent.includes('Room registered')",
                           timeout=20000)
    room_id = host.evaluate("window.__smfBrokerTrace.sent.find(p=>p.type==='host')?.roomId")
    assert isinstance(room_id, str) and room_id.startswith("room_"), "host room registration missing"
    guest.locator("#autoFind").click()
    room_button = guest.locator("#autoRooms button").filter(has_text="JOIN ").first
    room_button.wait_for(timeout=20000)
    assert not room_button.is_disabled(), "new room should be joinable"
    room_button.click()
    first_request = guest.evaluate("window.__smfBrokerTrace.sent.filter(p=>p.type==='join').at(-1)?.requestId")
    assert isinstance(first_request, str) and first_request.startswith("request_"), "first request ID missing"
    approval = host.locator("#autoApproval button").filter(has_text="ACCEPT GUEST")
    approval.wait_for(timeout=20000)
    assert "wants to join" in host.locator("#autoApproval").inner_text().lower()
    approval.click()
    for page in (host, guest):
        page.wait_for_function("window.NekketsuHD.game.matchState==='play' && document.querySelector('#menu')?.classList.contains('hidden')",
                               timeout=45000)
        page.wait_for_function("window.__smfLanChannels?.some(channel=>channel.readyState==='open')",
                               timeout=20000)
    return room_id, first_request


def positions(page):
    return page.evaluate("""()=>{
      const g=window.NekketsuHD.game;
      const selected=team=>{const p=g.players.find(v=>v.t===team&&v.i===g.controlled[team]);return p&&{i:p.i,x:p.x,y:p.y};};
      return {home:selected(0),away:selected(1)};
    }""")


def player_position(page, team, slot):
    return page.evaluate("""({team,slot})=>{const p=window.NekketsuHD.game.players.find(v=>v.t===team&&v.i===slot);return p&&{x:p.x,y:p.y}}""",
                         {"team": team, "slot": slot})


def main():
    port = free_port()
    proc, origin = start_server(port)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
            contexts = [browser.new_context(viewport={"width": 1280, "height": 800}) for _ in range(2)]
            host, guest = [context.new_page() for context in contexts]
            errors = []
            for name, page in (("host", host), ("guest", guest)):
                page.on("pageerror", lambda error, n=name: errors.append(f"{n}: {error}"))
                page.add_init_script("""(()=>{
                  const NativeSocket=window.WebSocket;
                  window.__smfBrokerTrace={sent:[],received:[]};
                  window.WebSocket=new Proxy(NativeSocket,{construct(target,args){
                    const ws=Reflect.construct(target,args),trace=window.__smfBrokerTrace,nativeSend=ws.send.bind(ws);
                    ws.send=value=>{try{trace.sent.push(JSON.parse(value))}catch{}return nativeSend(value)};
                    ws.addEventListener('message',event=>{try{trace.received.push(JSON.parse(event.data))}catch{}});
                    return ws;
                  }});
                  const NativePeer=window.RTCPeerConnection;
                  window.__smfLanPeers=[];window.__smfLanChannels=[];window.__smfLanInputs=[];
                  const watch=channel=>{
                    window.__smfLanChannels.push(channel);
                    channel.addEventListener('message',event=>{try{const p=JSON.parse(event.data);if(p?.type==='input')window.__smfLanInputs.push(p)}catch{}});
                  };
                  window.RTCPeerConnection=new Proxy(NativePeer,{construct(target,args){
                    const peer=Reflect.construct(target,args);window.__smfLanPeers.push(peer);
                    peer.addEventListener('datachannel',event=>watch(event.channel));
                    const create=peer.createDataChannel.bind(peer);
                    peer.createDataChannel=(...values)=>{const channel=create(...values);watch(channel);return channel};
                    return peer;
                  }});
                })();""")
            try:
                open_lan_menu(host, origin)
                open_lan_menu(guest, origin)
                room_id, first_request = start_live_match(host, guest)
                host_before, guest_before = positions(host), positions(guest)
                assert host_before == guest_before, ("initial replicas diverged", host_before, guest_before)
                old_guest_channel = guest.evaluate("""()=>{
                  const channel=window.__smfLanChannels.find(item=>item.readyState==='open');
                  if(!channel)throw Error('initial guest DataChannel missing');
                  window.__smfOldLanChannel=channel;return {label:channel.label,state:channel.readyState};
                }""")
                old_host_channel = host.evaluate("""()=>{
                  const channel=window.__smfLanChannels.find(item=>item.readyState==='open');
                  if(!channel)throw Error('initial host DataChannel missing');
                  window.__smfOldLanChannel=channel;
                  window.__smfOldLanPeer=window.__smfLanPeers.at(-1);
                  return {label:channel.label,state:channel.readyState};
                }""")
                guest.evaluate("window.__smfOldLanPeer=window.__smfLanPeers.at(-1)")
                assert old_guest_channel["state"] == "open", old_guest_channel
                assert old_host_channel["state"] == "open", old_host_channel

                # Exercise the player's actual Leave Match route and browser confirmation.
                guest.once("dialog", lambda dialog: dialog.accept())
                guest.locator("#pauseBtn").click()
                guest.wait_for_function("document.querySelector('.logoHeading') && !document.querySelector('#menu')?.classList.contains('hidden')",
                                        timeout=15000)
                guest.evaluate("""()=>{
                  const old=window.__smfOldLanChannel;
                  if(old.readyState!=='closed')throw Error('leaving guest must close the old channel');
                  let rejected=false;try{old.send(JSON.stringify({type:'input',sequence:999,frame:999,buttons:['jump']}))}catch{rejected=true}
                  if(!rejected)throw Error('closed old DataChannel unexpectedly accepted an input');
                  return true;
                }""")
                host.evaluate("""()=>{if(window.__smfOldLanChannel.readyState!=='closed')throw Error('host old DataChannel should close with departing guest')}""")
                host.wait_for_function("roomId=>window.__smfBrokerTrace.received.some(p=>p.type==='guest-left'&&p.roomId===roomId)",
                                       arg=room_id, timeout=5000)
                host.wait_for_function("roomId=>window.__smfBrokerTrace.received.some(p=>p.type==='room-announce'&&p.roomId===roomId&&p.full===false)",
                                       arg=room_id, timeout=5000)
                host_live = host.evaluate("({state:window.NekketsuHD.game.matchState,menuHidden:document.querySelector('#menu').classList.contains('hidden')})")
                assert host_live["state"] == "none" and not host_live["menuHidden"], ("host should return to the still-registered room lobby after the old peer leaves", host_live)
                assert "hosting remains available" in host.locator("#autoStatus").inner_text().lower()

                open_lan_menu(guest, origin)
                guest.locator("#autoFind").click()
                room_button = guest.locator("#autoRooms button").filter(has_text="JOIN ").first
                room_button.wait_for(timeout=12000)
                assert not room_button.is_disabled(), "guest seat should be available again after clean leave"
                room_button.click()
                second_request = guest.evaluate("window.__smfBrokerTrace.sent.filter(p=>p.type==='join').at(-1)?.requestId")
                assert second_request and second_request != first_request, (first_request, second_request)
                host.wait_for_function("target=>window.__smfBrokerTrace.received.some(p=>p.type==='join-request'&&p.roomId===target.roomId&&p.requestId===target.requestId)",
                                       arg={"roomId": room_id, "requestId": second_request}, timeout=10000)
                approval = host.locator("#autoApproval button").filter(has_text="ACCEPT GUEST")
                approval.wait_for(timeout=10000)
                assert "wants to join" in host.locator("#autoApproval").inner_text().lower()
                approval.click()
                for page in (host, guest):
                    page.wait_for_function("window.NekketsuHD.game.matchState==='play' && document.querySelector('#menu')?.classList.contains('hidden')",
                                           timeout=30000)
                new_host_channel = host.evaluate("window.__smfLanChannels.filter(channel=>channel.readyState==='open').at(-1)?.label")
                new_guest_channel = guest.evaluate("window.__smfLanChannels.filter(channel=>channel.readyState==='open').at(-1)?.label")
                assert new_host_channel and new_guest_channel, (new_host_channel, new_guest_channel)
                assert host.evaluate("window.__smfLanPeers.at(-1)!==window.__smfOldLanPeer") and guest.evaluate("window.__smfLanPeers.at(-1)!==window.__smfOldLanPeer"), "rejoin must negotiate fresh peer connections"
                assert host.evaluate("window.__smfLanChannels.filter(channel=>channel.readyState==='open').at(-1)!==window.__smfOldLanChannel")
                assert guest.evaluate("window.__smfLanChannels.filter(channel=>channel.readyState==='open').at(-1)!==window.__smfOldLanChannel")

                before, guest_before = positions(host), positions(guest)
                assert before == guest_before, ("freshly approved peers should start from the same snapshot", before, guest_before)
                away_slot, home_slot = before["away"]["i"], before["home"]["i"]
                away_before, home_before = player_position(host, 1, away_slot), player_position(host, 0, home_slot)
                guest.keyboard.down("ArrowRight")
                time.sleep(.55)
                guest.keyboard.up("ArrowRight")
                host.wait_for_function("""({slot,x})=>{
                  const p=window.NekketsuHD.game.players.find(v=>v.t===1&&v.i===slot);return !!p&&p.x>x+4;
                }""", arg={"slot": away_slot, "x": away_before["x"]}, timeout=10000)
                target = player_position(host, 1, away_slot)
                guest.wait_for_function("""(state)=>{
                  const g=window.NekketsuHD.game,p=g.players.find(v=>v.t===1&&v.i===state.slot);
                  return !!p&&Math.abs(p.x-state.x)<15&&Math.abs(p.y-state.y)<15;
                }""", arg={"slot": away_slot, **target}, timeout=10000)
                away_after, home_after = player_position(host, 1, away_slot), player_position(host, 0, home_slot)
                guest_away_after, guest_home_after = player_position(guest, 1, away_slot), player_position(guest, 0, home_slot)
                away_delta = ((away_after["x"]-away_before["x"])**2+(away_after["y"]-away_before["y"])**2)**.5
                home_delta = ((home_after["x"]-home_before["x"])**2+(home_after["y"]-home_before["y"])**2)**.5
                assert away_delta > 4, (away_before, away_after)
                assert home_delta < 70, (home_before, home_after)
                assert abs(away_after["x"]-guest_away_after["x"]) < 15 and abs(away_after["y"]-guest_away_after["y"]) < 15, (away_after, guest_away_after)
                assert abs(home_after["x"]-guest_home_after["x"]) < 15 and abs(home_after["y"]-guest_home_after["y"]) < 15, (home_after, guest_home_after)
                host_clock, guest_clock = host.evaluate("window.NekketsuHD.game.clock"), guest.evaluate("window.NekketsuHD.game.clock")
                host_score, guest_score = host.evaluate("window.NekketsuHD.game.score"), guest.evaluate("window.NekketsuHD.game.score")
                assert abs(host_clock-guest_clock) < 1.5 and host_score == guest_score, (host_clock, guest_clock, host_score, guest_score)
                assert not errors, errors
                print("LAN_BROWSER_LEAVE_REJOIN_PASS", {
                    "roomId": room_id,
                    "firstRequest": first_request,
                    "secondRequest": second_request,
                    "oldGuestChannelClosed": True,
                    "newPeerConnections": True,
                    "awayMovement": round(away_delta, 2),
                    "homeMovement": round(home_delta, 2),
                    "pageErrors": errors,
                }, flush=True)
            finally:
                for context in contexts:
                    context.close()
                browser.close()
    finally:
        stop_server(proc)


if __name__ == "__main__":
    main()
