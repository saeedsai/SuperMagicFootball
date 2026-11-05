#!/usr/bin/env python3
"""Local two-browser LAN-098 terminal-receipt ACK acceptance on the current app build.

Runs a real local broker and Chromium WebRTC peer pair. The test accelerates the
engine's ordinary match clock through public game state to reach its real finish
path; it adds no application or production debug hook. This is local emulated
browser evidence, not hosted, physical-device, or internet-network certification.
"""
import json
import os
import socket
import subprocess
import time
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
CURRENT_VERSION = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
DOCS = ROOT / "docs"
WALLET_KEY = "legend_tokenWallet"
EMPTY_WALLET = json.dumps({"schema": 1, "tokens": 0, "unlocks": [], "receipts": []})


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def start_server(port):
    env = {**os.environ, "LAN_PORT": str(port), "LAN_BIND": "127.0.0.1",
           "SMF_SIGNAL_MODE": "lan"}
    proc = subprocess.Popen(["node", "scripts/lan-server.mjs"], cwd=ROOT, env=env,
                            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    origin = f"http://127.0.0.1:{port}"
    deadline = time.monotonic() + 25
    while time.monotonic() < deadline:
        if proc.poll() is not None:
            raise RuntimeError("local LAN broker exited before HTTP became ready")
        try:
            with urllib.request.urlopen(origin + "/healthz", timeout=1) as response:
                if response.status == 200:
                    return proc, origin
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


def init_context(context, role, drop_ack=False, refuse_ack_once=False):
    context.add_init_script(f"window.__smfAckTestRole={json.dumps(role)};window.__smfDropAck={json.dumps(drop_ack)};window.__smfRefuseAckOnce={json.dumps(refuse_ack_once)};")
    context.add_init_script(f"""(()=>{{
      const trace=window.__smfLanAckTrace={{role:window.__smfAckTestRole,sent:[],received:[],walletWrites:[],
        terminalDuplicatesInjected:0,ackRefusalInjected:false,errors:[]}};
      window.addEventListener('smf:lan-result-ack-error',event=>trace.errors.push({{at:performance.now(),receiptId:event.detail?.receiptId,message:event.detail?.message}}));
      const nativeSet=Storage.prototype.setItem;
      Storage.prototype.setItem=function(key,value){{
        const result=nativeSet.call(this,key,value);
        if(key==={json.dumps(WALLET_KEY)}){{let parsed=null;try{{parsed=JSON.parse(value)}}catch{{}}
          trace.walletWrites.push({{at:performance.now(),wallet:parsed}});}}
        return result;
      }};
      const nativeReceiptAdd=IDBObjectStore.prototype.add;
      IDBObjectStore.prototype.add=function(value,...args){{
        const request=nativeReceiptAdd.call(this,value,...args);
        if(this.name==='receipts')trace.walletWrites.push({{at:performance.now(),wallet:{{receipts:[value.id]}},receiptId:value.id}});
        return request;
      }};
      const seed={{schema:1,tokens:0,unlocks:[],receipts:[]}};
      nativeSet.call(localStorage,{json.dumps(WALLET_KEY)},JSON.stringify(seed));
      const Native=window.RTCPeerConnection;
      window.__smfLanPeers=[];window.__smfLanChannels=[];
      const watch=channel=>{{
        window.__smfLanChannels.push(channel);
        channel.addEventListener('message',event=>{{try{{const packet=JSON.parse(event.data);
          trace.received.push({{at:performance.now(),packet}});
        }}catch{{}}}});
        const nativeSend=channel.send.bind(channel);
        Object.defineProperty(channel,'send',{{configurable:true,value(data){{
          let packet=null;try{{packet=JSON.parse(data)}}catch{{}}
          if(window.__smfAckTestRole==='guest'&&window.__smfDropAck&&packet?.type==='result-ack'){{
            trace.sent.push({{at:performance.now(),ok:true,packet,dropped:true}});return;
          }}
          if(window.__smfAckTestRole==='guest'&&window.__smfRefuseAckOnce&&packet?.type==='result-ack'&&!trace.ackRefusalInjected){{
            trace.ackRefusalInjected=true;
            trace.sent.push({{at:performance.now(),ok:false,packet,refused:true,error:'injected one-shot RTCDataChannel.send refusal'}});
            throw new DOMException('injected one-shot RTCDataChannel.send refusal','OperationError');
          }}
          let ok=false;
          try{{const result=nativeSend(data);ok=true;trace.sent.push({{at:performance.now(),ok,packet}});
            if(window.__smfAckTestRole==='host'&&packet?.type==='snapshot'&&
               packet.meta?.phase==='finished'&&trace.terminalDuplicatesInjected===0){{
              trace.terminalDuplicatesInjected++;
              // Retransmit the same finished result on the next live host tick.
              // A repeat is a real serialized WebRTC snapshot; wallet receipt
              // de-duplication must keep it from granting a second payout.
              const duplicate={{...packet,tick:packet.tick+1}};
              const duplicateSent=nativeSend(JSON.stringify(duplicate));
              trace.sent.push({{at:performance.now(),ok:true,packet:duplicate,injectedDuplicate:true}});
            }}
            return result;
          }}catch(error){{trace.sent.push({{at:performance.now(),ok:false,packet,error:String(error)}});throw error;}}
        }}}});
      }};
      window.RTCPeerConnection=new Proxy(Native,{{construct(target,args){{
        const peer=Reflect.construct(target,args);
        peer.addEventListener('datachannel',event=>watch(event.channel));
        const create=peer.createDataChannel.bind(peer);
        peer.createDataChannel=(...args)=>{{const channel=create(...args);watch(channel);return channel;}};
        window.__smfLanPeers.push(peer);return peer;
      }}}});
    }})();""")


def open_lan(page, origin):
    page.goto(origin + "/", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_function("Boolean(window.NekketsuHD?.game)", timeout=90000)
    assert page.evaluate("window.NekketsuHD.version") == CURRENT_VERSION, "wrong candidate loaded"
    page.locator('[data-action="navQuick"]').first.click()
    page.locator('[data-action="navLan"]').first.click()
    page.locator("#autoHost").wait_for(timeout=20000)


def connect(host, guest):
    host.locator("#autoHost").click()
    host.wait_for_function("document.querySelector('#autoStatus')?.textContent.includes('Room registered')",
                           timeout=20000)
    guest.locator("#autoFind").click()
    join = guest.locator("#autoRooms button").filter(has_text="JOIN ").first
    join.wait_for(timeout=20000)
    join.click()
    host.locator("#autoApproval button").filter(has_text="ACCEPT GUEST").click(timeout=20000)
    for page in (host, guest):
        page.wait_for_function("window.NekketsuHD.game.matchState==='play' && document.querySelector('#menu')?.classList.contains('hidden')",
                               timeout=45000)
        page.wait_for_function("window.__smfLanChannels?.some(channel=>channel.readyState==='open')",
                               timeout=20000)


def wallet(page):
    return page.evaluate("""async () => {
      const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('smf-token-wallet');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
      try {const tx=db.transaction(['wallet','receipts'],'readonly');const get=r=>new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
        const [wallet,rows]=await Promise.all([get(tx.objectStore('wallet').get('main')),get(tx.objectStore('receipts').getAll())]);
        return {schema:2,tokens:wallet.tokens,unlocks:wallet.unlocks,receipts:rows.map(row=>row.id)};
      } finally {db.close()}
    }""")


def main():
    drop_ack = os.environ.get("SMF_ACK_BROWSER_DROP_ACK") == "1"
    refuse_ack_once = os.environ.get("SMF_ACK_BROWSER_REFUSE_ONCE") == "1"
    if drop_ack and refuse_ack_once:
        raise ValueError("Choose either lost-ACK or one-shot send-refusal mode")
    port = free_port()
    proc, origin = start_server(port)
    errors = []
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, args=["--no-sandbox"])
            host_context = browser.new_context(viewport={"width": 1280, "height": 800})
            guest_context = browser.new_context(viewport={"width": 1280, "height": 800})
            init_context(host_context, "host")
            init_context(guest_context, "guest", drop_ack=drop_ack, refuse_ack_once=refuse_ack_once)
            host, guest = host_context.new_page(), guest_context.new_page()
            for label, page in (("host", host), ("guest", guest)):
                page.on("pageerror", lambda error, label=label: errors.append(f"{label}: {error}"))
            try:
                open_lan(host, origin)
                open_lan(guest, origin)
                connect(host, guest)

                # First prove normal live input still traverses the real channel.
                away_slot = guest.evaluate("window.NekketsuHD.game.controlled[1]")
                before_x = host.evaluate("slot=>window.NekketsuHD.game.players.find(p=>p.t===1&&p.i===slot).x", away_slot)
                guest.keyboard.down("ArrowRight")
                host.wait_for_function("slot=>window.NekketsuHD.game.players.find(p=>p.t===1&&p.i===slot).x>" + str(before_x + 6),
                                       arg=away_slot, timeout=10000)
                guest.keyboard.up("ArrowRight")
                input_packets = host.evaluate("window.__smfLanAckTrace.received.filter(row=>row.packet?.type==='input')")
                assert input_packets and any("right" in row["packet"].get("buttons", []) or row["packet"].get("dx", 0) > 0 for row in input_packets), input_packets[-8:]
                DOCS.mkdir(exist_ok=True)
                host.screenshot(path=str(DOCS / "LAN_TOKEN_RESULT_ACK_BROWSER_LIVE_20261105_50.png"), full_page=False)

                # Reach the engine's ordinary end-of-match event quickly by
                # reducing its active clock. No app-specific debug/test hook.
                host.evaluate("""()=>{
                  const game=window.NekketsuHD.game;
                  game.score=[1,0];game.matchSeconds=.04;game.clock=.03;
                  game.stoppageWindow=0;game.stoppageAnnounced=false;
                }""")
                host.wait_for_function("window.__smfLanAckTrace.sent.some(row=>row.packet?.type==='snapshot'&&row.packet?.meta?.phase==='finished')",
                                       timeout=12000)
                host.wait_for_function("window.__smfLanAckTrace.sent.some(row=>row.packet?.type==='snapshot'&&row.packet?.meta?.phase==='finished'&&row.injectedDuplicate)",
                                       timeout=3000)

                host_trace = host.evaluate("window.__smfLanAckTrace")
                terminal = next(row for row in host_trace["sent"]
                                if row["packet"].get("type") == "snapshot" and
                                row["packet"].get("meta", {}).get("phase") == "finished")
                snapshot = terminal["packet"]
                match_id = snapshot["meta"].get("matchId")
                assert isinstance(match_id, str) and len(match_id) == 32, snapshot["meta"]
                room_id, host_id = snapshot["roomId"], snapshot["hostId"]
                receipt_id = f"lan:{room_id}:{host_id}:{match_id}"

                try:
                    guest.wait_for_function("id=>window.__smfLanAckTrace.sent.some(row=>row.packet?.type==='result-ack'&&row.packet.receiptId===id&&row.ok)",
                                            arg=receipt_id, timeout=5000)
                except Exception as error:
                    raise AssertionError(("durable guest result ACK was not sent", receipt_id,
                                          guest.evaluate("()=>({sent:window.__smfLanAckTrace.sent.map(row=>({type:row.packet?.type,receiptId:row.packet?.receiptId,phase:row.packet?.meta?.phase,ok:row.ok})).slice(-25),errors:window.__smfLanAckTrace.errors,buffers:window.__smfLanChannels.map(channel=>channel.bufferedAmount)})"), errors,
                                          guest.evaluate("localStorage.getItem('legend_tokenWallet')"),
                                          guest.evaluate("async()=>({phase:window.NekketsuHD?.game?.matchState,score:window.NekketsuHD?.game?.score,pending:sessionStorage.getItem('smf_lanHostResultRecovery_v1'),wallet:await new Promise(resolve=>{const request=indexedDB.open('smf-token-wallet');request.onerror=()=>resolve('open failed');request.onsuccess=()=>{const db=request.result;const tx=db.transaction(['wallet','receipts'],'readonly');const wallet=tx.objectStore('wallet').get('main'),rows=tx.objectStore('receipts').getAll();tx.oncomplete=()=>{db.close();resolve({wallet:wallet.result,receipts:rows.result.map(x=>x.id)})}}})})"))) from error
                if drop_ack:
                    first_terminal_at = terminal["at"]
                    guest.wait_for_function("async id=>new Promise(resolve=>{const request=indexedDB.open('smf-token-wallet');request.onerror=()=>resolve(false);request.onsuccess=()=>{const db=request.result;let tx,receipt;try{tx=db.transaction('receipts','readonly');receipt=tx.objectStore('receipts').get(id)}catch{db.close();resolve(false);return}receipt.onsuccess=()=>{const found=!!receipt.result;db.close();resolve(found)};receipt.onerror=()=>{db.close();resolve(false)}}})",
                                            arg=receipt_id, timeout=5000)
                    host.wait_for_function("async id=>new Promise(resolve=>{const request=indexedDB.open('smf-token-wallet');request.onerror=()=>resolve(false);request.onsuccess=()=>{const db=request.result;let tx,receipt;try{tx=db.transaction('receipts','readonly');receipt=tx.objectStore('receipts').get(id)}catch{db.close();resolve(false);return}receipt.onsuccess=()=>{const found=!!receipt.result;db.close();resolve(found)};receipt.onerror=()=>{db.close();resolve(false)}}})",
                                           arg=receipt_id, timeout=5000)
                    host.wait_for_function("window.__smfLanChannels?.length&&window.__smfLanChannels.every(channel=>channel.readyState==='closed')",
                                           timeout=6000)
                    cleanup_elapsed = host.evaluate("performance.now()") - first_terminal_at
                    host_trace = host.evaluate("window.__smfLanAckTrace")
                    guest_trace = guest.evaluate("window.__smfLanAckTrace")
                    host_wallet, guest_wallet = wallet(host), wallet(guest)
                    dropped = [row for row in guest_trace["sent"] if row.get("dropped") and row["packet"].get("receiptId")==receipt_id]
                    host_acks = [row for row in host_trace["received"] if row["packet"].get("type")=="result-ack"]
                    host_receipt_writes = [row for row in host_trace["walletWrites"] if receipt_id in (row.get("wallet") or {}).get("receipts", [])]
                    guest_receipt_writes = [row for row in guest_trace["walletWrites"] if receipt_id in (row.get("wallet") or {}).get("receipts", [])]
                    assert 2700 <= cleanup_elapsed <= 5500, cleanup_elapsed
                    assert dropped and not host_acks, (dropped, host_acks)
                    assert len(host_receipt_writes)==1 and len(guest_receipt_writes)==1, (host_receipt_writes, guest_receipt_writes)
                    assert host_wallet["tokens"]==30 and guest_wallet["tokens"]==20, (host_wallet, guest_wallet)
                    assert not errors, errors
                    host.screenshot(path=str(DOCS / "LAN_TOKEN_RESULT_ACK_BROWSER_TIMEOUT_HOST_20261105_50.png"), full_page=False)
                    print("LAN098_BROWSER_LOST_ACK_FALLBACK_PASS",
                          f"version={host.evaluate('window.NekketsuHD.version')}",
                          f"receipt={receipt_id}",f"cleanup_after_terminal_ms={cleanup_elapsed:.1f}",
                          f"guest_ack_retries_dropped={len(dropped)}","host_ack_received=0",
                          f"host_tokens={host_wallet['tokens']}",f"guest_tokens={guest_wallet['tokens']}",
                          "single_receipt_per_peer=true","host_channel_closed_after_bounded_fallback=true")
                    print("LAN098_BROWSER_NORMAL_INPUT_PASS: guest directional control replicated through the same real DataChannel")
                    return
                try:
                    host.wait_for_function("id=>window.__smfLanAckTrace.received.some(row=>row.packet?.type==='result-ack'&&row.packet.receiptId===id)",
                                           arg=receipt_id, timeout=5000)
                except Exception as error:
                    host_trace = host.evaluate("window.__smfLanAckTrace")
                    guest_trace = guest.evaluate("window.__smfLanAckTrace")
                    host.screenshot(path=str(DOCS / "LAN_TOKEN_RESULT_ACK_BROWSER_HOST_ACK_TIMEOUT_20261105_50.png"), full_page=False)
                    guest.screenshot(path=str(DOCS / "LAN_TOKEN_RESULT_ACK_BROWSER_GUEST_ACK_TIMEOUT_20261105_50.png"), full_page=False)
                    raise AssertionError(json.dumps({
                        "cause": str(error), "receipt": receipt_id,
                        "host_connection": host.evaluate("window.__smfLanPeers?.[0]?.connectionState"),
                        "host_channel": host.evaluate("window.__smfLanChannels?.[0]?.readyState"),
                        "host_ack_received": [row for row in host_trace["received"] if row["packet"].get("type")=="result-ack"],
                        "guest_ack_sent": [row for row in guest_trace["sent"] if row.get("packet",{}).get("type")=="result-ack"],
                        "host_wallet": wallet(host), "guest_wallet": wallet(guest)
                    }, indent=2))
                host.wait_for_function("async id=>new Promise(resolve=>{const request=indexedDB.open('smf-token-wallet');request.onerror=()=>resolve(false);request.onsuccess=()=>{const db=request.result;let tx,receipt;try{tx=db.transaction('receipts','readonly');receipt=tx.objectStore('receipts').get(id)}catch{db.close();resolve(false);return}receipt.onsuccess=()=>{const found=!!receipt.result;db.close();resolve(found)};receipt.onerror=()=>{db.close();resolve(false)}}})",
                                       arg=receipt_id, timeout=5000)
                guest.wait_for_function("async id=>new Promise(resolve=>{const request=indexedDB.open('smf-token-wallet');request.onerror=()=>resolve(false);request.onsuccess=()=>{const db=request.result;let tx,receipt;try{tx=db.transaction('receipts','readonly');receipt=tx.objectStore('receipts').get(id)}catch{db.close();resolve(false);return}receipt.onsuccess=()=>{const found=!!receipt.result;db.close();resolve(found)};receipt.onerror=()=>{db.close();resolve(false)}}})",
                                        arg=receipt_id, timeout=5000)

                host_trace = host.evaluate("window.__smfLanAckTrace")
                guest_trace = guest.evaluate("window.__smfLanAckTrace")
                received_ack = next(row for row in host_trace["received"]
                                    if row["packet"].get("type") == "result-ack" and row["packet"].get("receiptId") == receipt_id)
                if refuse_ack_once:
                    refused = [row for row in guest_trace["sent"] if row.get("refused") and row["packet"].get("receiptId") == receipt_id]
                    sent_acks = [row for row in guest_trace["sent"] if row.get("ok") and row["packet"].get("type") == "result-ack" and row["packet"].get("receiptId") == receipt_id]
                    assert len(refused) == 1, refused
                    assert sent_acks, "durable terminal receipt ACK was not retried after send refusal"
                    assert refused[0]["at"] < sent_acks[0]["at"], (refused, sent_acks)
                ack_to_host_write = [row for row in host_trace["walletWrites"]
                                     if receipt_id in (row.get("wallet") or {}).get("receipts", [])]
                guest_writes = [row for row in guest_trace["walletWrites"]
                                if receipt_id in (row.get("wallet") or {}).get("receipts", [])]
                host_wallet, guest_wallet = wallet(host), wallet(guest)
                host_receipt_sends = [row for row in host_trace["walletWrites"]
                                      if receipt_id in (row.get("wallet") or {}).get("receipts", [])]
                assert ack_to_host_write and 0 <= ack_to_host_write[0]["at"]-received_ack["at"] < 1000, (received_ack, ack_to_host_write)
                assert len(host_receipt_sends) == 1, host_receipt_sends
                assert len(guest_writes) == 1, guest_writes
                assert host_wallet["tokens"] == 30 and guest_wallet["tokens"] == 20, (host_wallet, guest_wallet)
                duplicate_received = [row for row in guest_trace["received"]
                                      if row["packet"].get("type") == "snapshot" and
                                      row["packet"].get("meta", {}).get("phase") == "finished" and
                                      row["packet"].get("meta", {}).get("matchId") == match_id]
                assert len(duplicate_received) >= 2, duplicate_received
                assert host_trace["terminalDuplicatesInjected"] == 1
                assert not errors, errors
                host.screenshot(path=str(DOCS / "LAN_TOKEN_RESULT_ACK_BROWSER_HOST_RESULT_20261105_50.png"), full_page=False)
                guest.screenshot(path=str(DOCS / "LAN_TOKEN_RESULT_ACK_BROWSER_GUEST_RESULT_20261105_50.png"), full_page=False)
                print("LAN098_BROWSER_ACK_PASS",
                      f"version={host.evaluate('window.NekketsuHD.version')}",
                      f"receipt={receipt_id}",
                      f"ack_to_host_wallet_ms={ack_to_host_write[0]['at']-received_ack['at']:.1f}",
                      f"finished_snapshots_received={len(duplicate_received)}",
                      f"host_tokens={host_wallet['tokens']}", f"guest_tokens={guest_wallet['tokens']}",
                      "host_ack_confirmed_before_3s_fallback=true", "wallet_receipts_per_peer=1")
                if refuse_ack_once:
                    print("LAN098_BROWSER_ACK_SEND_REFUSAL_RETRY_PASS",
                          "guest_send_refusals=1",f"guest_ack_retries={len(sent_acks)}",
                          f"refused_to_success_ms={sent_acks[0]['at']-refused[0]['at']:.1f}",
                          "same_durable_receipt=true", "host_confirmed_before_fallback=true",
                          "wallet_receipts_per_peer=1")
                print("LAN098_BROWSER_NORMAL_INPUT_PASS: guest directional control replicated through the same real DataChannel")
            finally:
                host_context.close()
                guest_context.close()
                browser.close()
    finally:
        stop_server(proc)


if __name__ == "__main__":
    main()
