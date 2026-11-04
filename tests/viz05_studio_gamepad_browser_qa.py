"""VIZ-05: Player Studio controls are gamepad navigable and save through A/B flows."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
import threading

from playwright.sync_api import sync_playwright
from menu_test_routes import open_feature

ROOT=Path(__file__).resolve().parents[1]
FIXTURE=ROOT/'tests/.generated/play.html'
assert FIXTURE.exists(),'Build the current modular browser fixture first'
FIXTURE_HTML=FIXTURE.read_bytes()

class FixtureHandler(SimpleHTTPRequestHandler):
 def do_GET(self):
  if self.path in ('/','/index.html'):
   self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8')
   self.send_header('Content-Length',str(len(FIXTURE_HTML)));self.end_headers();self.wfile.write(FIXTURE_HTML);return
  super().do_GET()
 def log_message(self,*_args):pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(FixtureHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
origin=f'http://127.0.0.1:{server.server_port}/'

def install_gamepad(context):
 context.add_init_script("""(() => {
   const pad={id:'VIZ05 test pad',index:0,connected:true,mapping:'standard',axes:[0,0],
     buttons:Array.from({length:16},()=>({pressed:false,touched:false,value:0}))};
   Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});
   window.__viz05Pad=pad;
 })();""")
 context.add_init_script("""localStorage.setItem('legend_tokenWallet', JSON.stringify({schema:1,tokens:0,unlocks:[...['appearance','accessory'].flatMap(category=>['skin','hair','style','face','eyes','brows','eyeColor','nose','lips','body','stature','exaggeration','beard','accessory','freckles','scar','tattoo'].flatMap(key=>Array.from({length:64},(_,i)=>`${category}:${key}:${i}`)))],receipts:[]}));""")

def move_to(page,target_id):
 def find_route():
  return page.evaluate("""(targetId)=>{
  const items=[...document.querySelectorAll('button:not([disabled]),select:not([disabled]),input:not([disabled]),textarea:not([disabled]),summary')]
   .filter(el=>!el.disabled&&el.offsetParent!==null);
  const active=items.indexOf(document.activeElement),start=active>=0?active:0;
  const target=items.findIndex(el=>el.id===targetId||el.dataset.action===targetId);
  if(target<0)throw Error('Missing visible target '+targetId);
  if(start===target)return {path:[],goalId:items[target].id,action:items[target].dataset.action};
  const edges=(index)=>{
   const from=items[index].getBoundingClientRect(),fromX=from.left+from.width/2,fromY=from.top+from.height/2;
   return [[true,1],[false,1],[true,-1],[false,-1]].map(([horizontal,direction])=>{
    let next=-1,best=Infinity;
    for(let candidate=0;candidate<items.length;candidate++){
     if(candidate===index)continue;
     const rect=items[candidate].getBoundingClientRect(),x=rect.left+rect.width/2-fromX,y=rect.top+rect.height/2-fromY;
     const primary=direction*(horizontal?x:y);if(primary<=1)continue;
     const score=primary+(horizontal?Math.abs(y):Math.abs(x))*1.5;
     if(score<best){best=score;next=candidate;}
    }
    if(next<0)next=(index+direction+items.length)%items.length;
    return next;
   });
  };
  const queue=[start],parent=new Map([[start,null]]),via=new Map();
  for(let cursor=0;cursor<queue.length&&!parent.has(target);cursor++){
   const current=queue[cursor];for(const [direction,next] of edges(current).entries())if(!parent.has(next)){parent.set(next,current);via.set(next,direction);queue.push(next);}
  }
  if(!parent.has(target))throw Error('Gamepad focus graph cannot reach '+targetId);
  const path=[];for(let node=target;node!==start;node=parent.get(node))path.push(via.get(node));path.reverse();
  return {path,goalId:items[target].id,action:items[target].dataset.action};
 }""",target_id)
 buttons=[15,13,14,12] # right, down, left, up
 used=[]
 for _ in range(100):
  plan=find_route()
  if not plan['path']:
   return {'goalId':plan['goalId'],'action':plan['action'],'steps':used}
  direction=plan['path'][0];button=buttons[direction];used.append(direction)
  page.evaluate('(button)=>window.__viz05Pad.buttons[button].pressed=true',button)
  page.wait_for_timeout(35)
  page.evaluate('(button)=>window.__viz05Pad.buttons[button].pressed=false',button)
  page.wait_for_timeout(195)
 current=page.evaluate("(()=>{const el=document.activeElement;return {id:el?.id,action:el?.dataset?.action}})()")
 raise AssertionError((target_id,'spatial navigation did not reach target after recalculating scrolled layout',current,used))

def press(page,index):
 page.evaluate('(button)=>window.__viz05Pad.buttons[button].pressed=true',index)
 page.wait_for_timeout(45)
 page.evaluate('(button)=>window.__viz05Pad.buttons[button].pressed=false',index)
 page.wait_for_timeout(80)

def verify_manager_appearance_gamepad(page,label):
 open_feature(page,'manager')
 page.locator('[data-action="startManager"]').click()
 page.locator('[data-action="editManagerAppearance"]').click()
 pose=page.locator('#customPose');pose.wait_for(state='visible')
 old=pose.input_value()
 new=pose.locator('option').evaluate_all('(options,old)=>options.find(option=>option.value!==old&&!option.disabled)?.value',old)
 assert new is not None,(label,'Manager Appearance motion selector must expose another enabled choice')
 pose.focus();page.wait_for_timeout(220);press(page,15)
 assert pose.input_value()==new,(label,'Manager Appearance D-pad right changes the focused selection')
 assert page.evaluate("document.activeElement?.id")=='customPose',(label,'Manager Appearance selection change retains focus')
 page.evaluate("() => {window.__managerPoseSelectClicks=0;document.querySelector('#customPose').addEventListener('click',()=>window.__managerPoseSelectClicks++)}")
 press(page,0)
 assert page.evaluate('window.__managerPoseSelectClicks')==1,(label,'Manager Appearance A activates the focused selector')

def verify_studio_gallery_slider(page,label):
 toggle=page.locator('[data-action="studioGalleryToggle"]')
 toggle.click()
 slider=page.locator('#studioGalleryPhase');slider.wait_for(state='visible')
 before=int(slider.input_value())
 slider.focus();page.wait_for_timeout(220);press(page,15)
 after=int(slider.input_value())
 assert after>before,(label,'D-pad right advances the focused Studio gallery slider',before,after)
 assert page.evaluate("document.activeElement?.id")=='studioGalleryPhase',(label,'range adjustment retains slider focus')
 page.wait_for_timeout(220)
 press(page,14)
 assert int(slider.input_value())==before,(label,'D-pad left reverses the gallery slider step')
 toggle.click()

def run_device(browser,label,viewport,touch):
 context=browser.new_context(viewport=viewport,is_mobile=touch,has_touch=touch,accept_downloads=True)
 install_gamepad(context);page=context.new_page();errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 page.goto(origin,wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
 open_feature(page,'playerStudio')
 page.locator('#face_skin').wait_for(state='visible')
 page.wait_for_timeout(240) # Let the menu-only repeat guard settle after route entry.
 selector_path=move_to(page,'customPlayer')
 verify_studio_gallery_slider(page,label)
 if touch:
  dialogs=[]
  page.on('dialog',lambda dialog:(dialogs.append(dialog.message),dialog.accept()))
  press(page,1) # B follows the regular Back action when the mobile form has no edits.
  assert page.locator('#face_skin').count()==0,(label,'B should leave the clean Player Studio form')
  assert not dialogs,(label,'clean form Back should not invent an unsaved-change prompt',dialogs)
  verify_manager_appearance_gamepad(page,label)
  assert not errors,(label,errors)
  print('VIZ05_STUDIO_GAMEPAD_BROWSER_PASS',label,'selector focus and clean Back; Manager Appearance selection and A',flush=True)
  context.close();return
 skin=page.locator('#face_skin')
 old=skin.input_value();new=skin.locator('option').evaluate_all('(options,old)=>options.find(option=>option.value!==old)?.value',old)
 assert new is not None,(label,'skin selector must expose a second value')
 skin.select_option(new)
 pose=page.locator('#customPose')
 old_pose=pose.input_value()
 new_pose=pose.locator('option').evaluate_all('(options,old)=>options.find(option=>option.value!==old&&!option.disabled)?.value',old_pose)
 assert new_pose is not None,(label,'motion selector must expose another enabled choice')
 pose.focus()
 assert page.evaluate("document.activeElement?.id")=='customPose',(label,'motion selector accepts browser focus before gamepad input',page.evaluate("({active:document.activeElement?.id,connected:document.querySelector('#customPose')?.isConnected})"))
 page.wait_for_timeout(220)
 press(page,15) # D-pad right adjusts the focused select without moving focus.
 assert pose.input_value()==new_pose,(label,'D-pad right changes a focused Studio selection',pose.input_value(),new_pose,page.evaluate("({active:document.activeElement?.id,screen:document.querySelector('#menu')?.dataset.screen,buttons:window.__viz05Pad.buttons.map((button,index)=>button.pressed?index:null).filter(index=>index!==null)})"))
 assert page.evaluate("document.activeElement?.id")=='customPose',(label,'select changes retain focus')
 page.evaluate("() => {window.__poseSelectClicks=0;document.querySelector('#customPose').addEventListener('click',()=>window.__poseSelectClicks++)}")
 press(page,0)
 assert page.evaluate('window.__poseSelectClicks')==1,(label,'A activates the focused selector')
 dialog_messages=[]
 page.once('dialog',lambda dialog:(dialog_messages.append(dialog.message),dialog.dismiss()))
 press(page,1) # B invokes Back; cancelling its unsaved-change prompt keeps Studio open.
 assert page.locator('#face_skin').count()==1,(label,'cancelled B should preserve the unsaved Studio form')
 assert dialog_messages,(label,'B should use the existing unsaved-change confirmation')

 save_path=move_to(page,'saveAppearance')
 press(page,0) # A saves the changed appearance.
 page.wait_for_function("(expected)=>Object.values(JSON.parse(localStorage.getItem('legend_edits')||'{}')).some(rows=>Array.isArray(rows)&&rows.some(player=>player.appearance?.skin===expected))",arg=new,timeout=15000)
 saved=page.evaluate("""()=>{
  const edits=JSON.parse(localStorage.getItem('legend_edits')||'{}');
  const rows=Object.values(edits).find(value=>Array.isArray(value)&&value[0]?.appearance);
  return rows?.[0]?.appearance?.skin||null;
 }""")
 assert saved==new,(label,'A on SAVE CHARACTER must persist the edited selection',saved,new,save_path)
 page.reload(wait_until='load');page.wait_for_function('!!window.SupermagicFootball?.game',timeout=60000)
 open_feature(page,'playerStudio')
 assert page.locator('#face_skin').input_value()==new,(label,'saved appearance remains readable after reload')
 verify_manager_appearance_gamepad(page,label)
 assert selector_path['goalId']=='customPlayer' and save_path['action']=='saveAppearance',(label,selector_path,save_path)
 assert not errors,(label,errors)
 print('VIZ05_STUDIO_GAMEPAD_BROWSER_PASS',label,'Player Studio save/reload and Manager Appearance selection/A, D-pad focus, B Back checks',flush=True)
 context.close()

try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,args=['--no-sandbox','--disable-dev-shm-usage'])
  run_device(browser,'desktop',{'width':1280,'height':800},False)
  run_device(browser,'simulated-touch',{'width':844,'height':390},True)
  browser.close()
finally:
 server.shutdown();server.server_close()
