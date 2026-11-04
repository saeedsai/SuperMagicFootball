#!/usr/bin/env python3
"""LAN acceptance smoke: real Chromium tabs, local WebSocket broker, real WebRTC.
Run after npm ci: python3 tests/lan_auto_two_browser_qa.py
A successful run is not a two-physical-device or hosted-Pages certification.
"""
import io
import os
import socket
import subprocess
import time
import urllib.request
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def wait_http(url, proc):
    until = time.monotonic() + 25
    while time.monotonic() < until:
        if proc.poll() is not None:
            raise RuntimeError("LAN server terminated before accepting HTTP requests")
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status == 200:
                    return
        except Exception:
            time.sleep(.2)
    raise TimeoutError("LAN server did not become ready")


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
    page.goto(origin + "/", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_function("Boolean(window.NekketsuHD?.game)", timeout=90000)
    page.locator('[data-action="navQuick"]').first.click()
    page.locator('[data-action="navLan"]').first.click()
    page.locator("#autoStatus").wait_for(timeout=20000)


def has_gameplay(page):
    page.wait_for_function("""() => !!window.NekketsuHD &&
        document.querySelector('#menu')?.classList.contains('hidden') &&
        window.NekketsuHD.game?.matchState === 'play'""", timeout=90000)


def player_positions(page):
    return page.evaluate("""() => {
      const game=window.NekketsuHD.game;
      const controlled=(team)=>{
        const player=game.players.find(p=>p.t===team&&p.i===game.controlled[team]);
        return player&&{i:player.i,x:player.x,y:player.y};
      };
      return {home:controlled(0),away:controlled(1)};
    }""")


def team_slot_position(page, team, slot):
    return page.evaluate("""({team,slot})=>{
      const player=window.NekketsuHD.game.players.find(p=>p.t===team&&p.i===slot);
      return player&&{x:player.x,y:player.y};
    }""", {"team": team, "slot": slot})


def set_synthetic_ice_state(page, state):
    """Emit a short browser-observed ICE state transition without dropping packets."""
    return page.evaluate("""state=>{
      const peer=window.__smfLanPeers?.[0];
      if(!peer)throw Error('LAN RTCPeerConnection instrumentation missing');
      let proto=Object.getPrototypeOf(peer),descriptor;
      while(proto&&!descriptor){descriptor=Object.getOwnPropertyDescriptor(proto,'iceConnectionState');proto=Object.getPrototypeOf(proto)}
      if(!descriptor?.configurable)throw Error('Chromium ICE state getter cannot be instrumented safely');
      if(!Object.hasOwn(peer,'__smfOriginalIceDescriptor'))Object.defineProperty(peer,'__smfOriginalIceDescriptor',{value:Object.getOwnPropertyDescriptor(peer,'iceConnectionState')||null});
      const own=peer.__smfOriginalIceDescriptor;
      if(state===null){
        if(own)Object.defineProperty(peer,'iceConnectionState',own);else delete peer.iceConnectionState;
      }else{
        Object.defineProperty(peer,'iceConnectionState',{configurable:true,get:()=>state});
      }
      peer.dispatchEvent(new Event('iceconnectionstatechange'));
      window.__smfLanIceEvents.push({ice:peer.iceConnectionState,connection:peer.connectionState});
      return {ice:peer.iceConnectionState,connection:peer.connectionState};
    }""", state)


def refuse_next_guest_input_send(page):
    """Reject exactly one real guest channel input after the match is ready."""
    return page.evaluate("""()=>{
      const channel=window.__smfLanChannels?.find(item=>item.readyState==='open');
      if(!channel)throw Error('LAN guest RTCDataChannel instrumentation missing');
      const nativeSend=channel.send.bind(channel);
      const trace=window.__smfLanSendTrace={attempts:[],refusals:0};
      Object.defineProperty(channel,'send',{configurable:true,value(data){
        let packet=null;try{packet=JSON.parse(data)}catch{}
        if(packet?.type==='input'){
          trace.attempts.push({sequence:packet.sequence,frame:packet.frame,
            buttons:Array.isArray(packet.buttons)?[...packet.buttons]:packet.buttons,delivered:false});
          if(trace.refusals===0){trace.refusals++;throw new Error('synthetic one-shot DataChannel refusal');}
          trace.attempts.at(-1).delivered=true;
        }
        return nativeSend(data);
      }});
      return {label:channel.label,state:channel.readyState};
    }""")


def colorful_screenshot(page):
    shot = Image.open(io.BytesIO(page.screenshot(full_page=False))).convert("RGB")
    sample = shot.resize((100, 60))
    assert len(sample.getcolors(maxcolors=6000) or []) > 25, "LAN gameplay graphic is blank"


def main():
    port = free_port()
    origin = f"http://127.0.0.1:{port}"
    env = {**os.environ, "LAN_PORT": str(port), "LAN_BIND": "0.0.0.0",
           "SMF_SIGNAL_MODE": "lan"}
    proc = subprocess.Popen(["node", "scripts/lan-server.mjs"], cwd=ROOT, env=env,
                            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    try:
        wait_http(origin, proc)
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, args=["--no-sandbox"])
            host_ctx = browser.new_context(viewport={"width": 1280, "height": 800})
            guest_ctx = browser.new_context(viewport={"width": 1280, "height": 800})
            for context in (host_ctx, guest_ctx):
                context.add_init_script("""(()=>{
                  const Native=window.RTCPeerConnection;
                  window.__smfLanPeers=[];window.__smfLanIceEvents=[];window.__smfLanChannels=[];window.__smfLanInputPackets=[];
                  const watchChannel=channel=>{
                    window.__smfLanChannels.push(channel);
                    channel.addEventListener('message',event=>{
                      try{const packet=JSON.parse(event.data);if(packet?.type==='input')window.__smfLanInputPackets.push({sequence:packet.sequence,frame:packet.frame,buttons:Array.isArray(packet.buttons)?[...packet.buttons]:packet.buttons})}catch{}
                    });
                  };
                  window.RTCPeerConnection=new Proxy(Native,{construct(target,args){
                    const peer=Reflect.construct(target,args);
                    peer.addEventListener('datachannel',event=>watchChannel(event.channel));
                    const create=peer.createDataChannel.bind(peer);
                    peer.createDataChannel=(...channelArgs)=>{const channel=create(...channelArgs);watchChannel(channel);return channel};
                    window.__smfLanPeers.push(peer);
                    peer.addEventListener('iceconnectionstatechange',()=>window.__smfLanIceEvents.push({ice:peer.iceConnectionState,connection:peer.connectionState}));
                    return peer;
                  }});
                })();""")
            host = host_ctx.new_page()
            guest = guest_ctx.new_page()
            page_errors = []
            host.on("pageerror", lambda error: page_errors.append(f"host: {error}"))
            guest.on("pageerror", lambda error: page_errors.append(f"guest: {error}"))
            try:
                open_lan_menu(host, origin)
                open_lan_menu(guest, origin)
                host.locator("#autoHost").click()
                host.wait_for_function("document.querySelector('#autoStatus')?.textContent.includes('Room registered')", timeout=20000)
                # The companion server must supply a shareable private address, never localhost.
                host.wait_for_function("document.querySelector('#autoHostInfo')?.textContent.includes('http://')", timeout=20000)
                guest.locator("#autoFind").click()
                join = guest.locator("#autoRooms button")
                join.first.wait_for(timeout=20000)
                assert "JOIN " in join.first.inner_text()
                join.first.click()
                host.locator("#autoApproval button").filter(has_text="ACCEPT GUEST").click(timeout=20000)
                has_gameplay(host)
                has_gameplay(guest)
                host.wait_for_function("window.NekketsuHD.game.clock > 0.2", timeout=30000)
                guest.wait_for_function("window.NekketsuHD.game.clock > 0.2", timeout=30000)
                host_before = player_positions(host)
                guest_before = player_positions(guest)
                assert host_before == guest_before, ("initial player state diverged", host_before, guest_before)
                guest_away_slot = guest_before["away"]["i"]
                host_home_slot = host_before["home"]["i"]
                # Refuse one real RTCDataChannel input send, then tap JUMP so
                # LAN-092 retries the retained one-shot edge on this real peer.
                channel_info = refuse_next_guest_input_send(guest)
                assert channel_info["state"] == "open", channel_info
                guest.keyboard.down("Space")
                guest.wait_for_function("window.__smfLanSendTrace?.refusals===1", timeout=5000)
                refused = guest.evaluate("window.__smfLanSendTrace.attempts[0]")
                guest.wait_for_function("window.__smfLanSendTrace.attempts.length>=2", timeout=5000)
                trace = guest.evaluate("window.__smfLanSendTrace")
                assert trace["refusals"] == 1, trace
                assert len(trace["attempts"]) >= 2, trace
                retry = next(attempt for attempt in trace["attempts"][1:] if attempt["delivered"] and "jump" in attempt["buttons"])
                assert retry["sequence"] == refused["sequence"], (refused, retry)
                assert retry["frame"] >= refused["frame"], (refused, retry)
                assert retry["frame"] >= 0, retry
                host.wait_for_function("""({sequence})=>window.__smfLanInputPackets.some(
                  packet=>packet.sequence===sequence&&packet.buttons?.includes('jump'))
                """, arg={"sequence": retry["sequence"]}, timeout=5000)
                accepted_jumps = host.evaluate("window.__smfLanInputPackets.filter(packet=>packet.buttons?.includes('jump'))")
                assert len([packet for packet in accepted_jumps if packet["sequence"] == retry["sequence"]]) == 1, accepted_jumps
                guest.keyboard.up("Space")
                away_before = team_slot_position(host, 1, guest_away_slot)
                home_before = team_slot_position(host, 0, host_home_slot)
                guest.keyboard.down("ArrowRight")
                time.sleep(.7)
                guest.keyboard.up("ArrowRight")
                host.wait_for_function("""(before)=>{
                  const game=window.NekketsuHD.game;
                  const player=game.players.find(p=>p.t===1&&p.i===before.slot);
                  return !!player&&player.x>before.away.x+5;
                }""", arg={"slot": guest_away_slot, "away": away_before}, timeout=10000)
                host_sync_target = player_positions(host)
                host_sync_target["away"]["i"] = guest_away_slot
                host_sync_target["away"].update(team_slot_position(host, 1, guest_away_slot))
                guest.wait_for_function("""(hostState)=>{
                  const game=window.NekketsuHD.game;
                  const away=game.players.find(p=>p.t===1&&p.i===hostState.away.i);
                  return !!away&&Math.abs(away.x-hostState.away.x)<4&&
                    Math.abs(away.y-hostState.away.y)<4;
                }""", arg=host_sync_target, timeout=10000)
                host_after = player_positions(host)
                guest_after = player_positions(guest)
                away_after = team_slot_position(host, 1, guest_away_slot)
                guest_away_after = team_slot_position(guest, 1, guest_away_slot)
                home_after = team_slot_position(host, 0, host_home_slot)
                assert away_after["x"] > away_before["x"] + 5, (away_before, away_after)
                assert ((home_after["x"] - home_before["x"]) ** 2 +
                        (home_after["y"] - home_before["y"]) ** 2) ** .5 < 70, (home_before, home_after)
                # The guest renders the newest delivered host tick; allow one
                # short local-loopback snapshot interval of simulation motion.
                assert abs(away_after["x"]-guest_away_after["x"])<15, (away_after,guest_away_after)
                assert abs(away_after["y"]-guest_away_after["y"])<15, (away_after,guest_away_after)
                assert abs(host_after["home"]["x"]-guest_after["home"]["x"])<4, (host_after,guest_after)
                assert abs(host_after["home"]["y"]-guest_after["home"]["y"])<4, (host_after,guest_after)
                h = host.evaluate("({clock:window.NekketsuHD.game.clock,score:window.NekketsuHD.game.score})")
                g = guest.evaluate("({clock:window.NekketsuHD.game.clock,score:window.NekketsuHD.game.score})")
                assert abs(h["clock"] - g["clock"]) < 1.5, (h, g)
                assert h["score"] == g["score"], (h, g)

                # Exercise app readiness loss/recovery through real Chromium
                # RTCPeerConnection events. The native DataChannel remains up;
                # this is not packet-loss or physical-network certification.
                time.sleep(.35)
                loss_host = set_synthetic_ice_state(host, "disconnected")
                loss_guest = set_synthetic_ice_state(guest, "disconnected")
                assert loss_host["ice"] == loss_guest["ice"] == "disconnected"
                assert loss_host["connection"] == loss_guest["connection"] == "connected"
                guest.keyboard.down("ArrowRight")
                time.sleep(.45)
                guest.keyboard.up("ArrowRight")
                recovered_host = set_synthetic_ice_state(host, None)
                recovered_guest = set_synthetic_ice_state(guest, None)
                assert recovered_host["ice"] in ("connected", "completed"), recovered_host
                assert recovered_guest["ice"] in ("connected", "completed"), recovered_guest
                assert host.evaluate("window.__smfLanIceEvents.some(event=>event.ice==='disconnected')")
                assert guest.evaluate("window.__smfLanIceEvents.some(event=>event.ice==='disconnected')")
                host.wait_for_function("window.NekketsuHD.game.clock > 0.2", timeout=10000)
                guest.wait_for_function("window.NekketsuHD.game.clock > 0.2", timeout=10000)
                resumed_before = team_slot_position(host, 1, guest_away_slot)
                guest.keyboard.down("ArrowRight")
                time.sleep(.7)
                guest.keyboard.up("ArrowRight")
                host.wait_for_function("""(before)=>{
                  const player=window.NekketsuHD.game.players.find(p=>p.t===1&&p.i===before.slot);
                  return !!player&&player.x>before.x+5;
                }""", arg={"slot": guest_away_slot, "x": resumed_before["x"]}, timeout=10000)
                resumed_host = team_slot_position(host, 1, guest_away_slot)
                guest.wait_for_function("""(target)=>{
                  const player=window.NekketsuHD.game.players.find(p=>p.t===1&&p.i===target.slot);
                  return !!player&&Math.abs(player.x-target.x)<15&&Math.abs(player.y-target.y)<15;
                }""", arg={"slot": guest_away_slot, **resumed_host}, timeout=10000)

                # Once direct WebRTC is established, discovery/signaling is
                # no longer in the match data path. Stop the local broker and
                # prove the connected peers still exchange live input/state.
                stop_server(proc)
                for peer_page in (host, guest):
                    transport = peer_page.evaluate("""()=>({
                      connection:window.__smfLanPeers?.[0]?.connectionState,
                      ice:window.__smfLanPeers?.[0]?.iceConnectionState
                    })""")
                    assert transport["connection"] == "connected", transport
                    assert transport["ice"] in ("connected", "completed"), transport
                    assert peer_page.evaluate("window.NekketsuHD.game.matchState") == "play"
                brokerless_before = team_slot_position(host, 1, guest_away_slot)
                guest.keyboard.down("ArrowRight")
                time.sleep(.45)
                guest.keyboard.up("ArrowRight")
                host.wait_for_function("""(before)=>{
                  const player=window.NekketsuHD.game.players.find(p=>p.t===1&&p.i===before.slot);
                  return !!player&&player.x>before.x+5;
                }""", arg={"slot": guest_away_slot, "x": brokerless_before["x"]}, timeout=10000)
                brokerless_host = team_slot_position(host, 1, guest_away_slot)
                guest.wait_for_function("""(target)=>{
                  const player=window.NekketsuHD.game.players.find(p=>p.t===1&&p.i===target.slot);
                  return !!player&&Math.abs(player.x-target.x)<15&&Math.abs(player.y-target.y)<15;
                }""", arg={"slot": guest_away_slot, **brokerless_host}, timeout=10000)
                print("LAN_SIGNALING_OUTAGE_PASS: established direct WebRTC match remains playable after local broker shutdown")
                colorful_screenshot(host)
                colorful_screenshot(guest)
                assert not page_errors, page_errors
                print("LAN_INPUT_OWNERSHIP_PASS",
                      f"away_dx={away_after['x']-away_before['x']:.1f}",
                      f"guest_replica_error={abs(away_after['x']-guest_away_after['x']):.1f}",
                      f"home_dx={home_after['x']-home_before['x']:.1f}")
                print("LAN_INPUT_REFUSAL_RETRY_PASS",
                      f"sequence={retry['sequence']}", f"refused_frame={refused['frame']}",
                      f"retry_frame={retry['frame']}", "host_received_same_sequence_once=true")
                print("LAN_SYNTHETIC_ICE_RECOVERY_PASS: browser-observed transient disconnect/recovery and fresh guest input")
                print("LAN REAL BROWSER PASS: auto discovery, approval, guest input ownership, replicated player state, authoritative match and visible graphics")
            finally:
                host_ctx.close()
                guest_ctx.close()
                browser.close()
    finally:
        stop_server(proc)


if __name__ == "__main__":
    main()
