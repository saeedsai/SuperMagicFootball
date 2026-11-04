"""Render and exercise the Online P2P invite-code field in real Chromium."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from functools import partial
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT)))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=["--no-sandbox"])
        page = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        page.goto(f"http://127.0.0.1:{server.server_port}/index.html", wait_until="domcontentloaded")
        page.wait_for_function("Boolean(window.SupermagicFootball)")
        result = page.evaluate("""async () => {
          const {mountAutoLanLobby} = await import('/src/modules/lan-auto-lobby.js');
          const root=document.createElement('div');document.body.append(root);
          Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedInvite=text}}});
          const stop=mountAutoLanLobby(root,{
            internet:true,
            signalFactory:({onState,onEvent})=>{
              const connection={ready:true,close(){},send(message){
                if(message.type==='host')onEvent({type:'host-registered',roomId:message.roomId});
                if(message.type==='rooms')onEvent({type:'rooms-snapshot',rooms:[]});
                return true;
              }};
              queueMicrotask(()=>onState('connected'));
              return connection;
            }
          });
          root.querySelector('#autoHost').click();
          const field=root.querySelector('#autoInviteDisplay');
          const shown=!root.querySelector('#autoInviteShare').hidden;
          const valid=/^room_[a-f0-9]{32}$/i.test(field.value);
          root.querySelector('#autoCopyInvite').click();
          await new Promise(resolve=>setTimeout(resolve,0));
          const copied=window.__copiedInvite===field.value;
          const focusable=Boolean(field.getAttribute('aria-label')&&root.querySelector('label[for="autoInviteDisplay"]'));
          const result={shown,valid,copied,focusable,status:root.querySelector('#autoStatus').textContent};
          stop();root.remove();return result;
        }""")
        browser.close()
    assert result["shown"] and result["valid"] and result["copied"] and result["focusable"], result
    assert "Invite code copied" in result["status"], result
    print("P2P_INVITE_COPY_BROWSER_PASS simulated-touch visible code, valid 128-bit ID, copy action and accessible label")
finally:
    server.shutdown()
    thread.join(timeout=2)
    server.server_close()
