"""Capture the actual-engine Super Shot contact and recovery transition."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / 'tests/.generated/play.html'
PREVIEW = ROOT / 'tests/.generated/shot_impact_contact_transition.png'

SETUP_AND_CAPTURE = r"""(field) => {
 const api=window.SupermagicFootball,game=api?.game,renderer=api?.renderer;
 if(!game||!renderer?.drawPlayer||typeof game.updateBall!=='function'||typeof game.updatePlayers!=='function')
  throw Error('actual match engine and player renderer are required');
 if(!field||![field.x,field.y,field.w,field.h].every(Number.isFinite))throw Error('shipped match-field bounds are invalid');
 const victim=game.players.find(p=>p.t===1&&p.i===3),attacker=game.players.find(p=>p.t===0&&p.i===4);
 if(!victim||!attacker)throw Error('shot actors are unavailable');
 const cx=field.x+field.w*.52,cy=field.y+field.h*.5;
 for(const p of game.players){
  p.x=field.x+field.w*.35;p.y=field.y+field.h-36;p.z=0;p.vz=0;p.stun=0;
  p.action='idle';p.actionTimer=0;p.shotImpactWeakness=0;p.shotImpactWeaknessTimer=0;
 }
 victim.x=cx;victim.y=cy;victim.src.strength=5;victim.src.defence=5;victim.fatigue=0;victim.breath=100;
 attacker.x=field.x+field.w*.2;attacker.y=field.y+field.h-90;
 game.ball={x:cx-14,y:cy,z:0,vx:1450,vy:0,vz:0,owner:null,
  shot:{id:'nuts',behavior:'ricochet',level:4,direction:1,transformSeconds:1.65},
  strike:{kind:'super',energy:520,hits:0,originX:cx-214,originY:cy},attacker:0,lastTouchTeam:0,
  trail:[],age:.2,power:520,canCollect:0,targetY:cy,pass:false,ordinaryShot:false};
 game.updateBall(1/60);
 if(victim.action!=='launched'||!(victim.shotImpactKnockdownPending>0))
  throw Error('live Super Shot did not launch the selected victim: '+JSON.stringify({action:victim.action,pending:victim.shotImpactKnockdownPending}));
 const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=300;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#10283c';ctx.fillRect(0,0,canvas.width,canvas.height);
 const labels=[],hashes=[];
 function capture(label){
  const index=labels.length,x=80+index*160;labels.push(label);ctx.save();ctx.translate(x,250);
  renderer.drawPlayer(ctx,{...victim,x:0,y:0,preview:false,controlled:false,dx:0,dy:0},game);ctx.restore();
  ctx.fillStyle='#f5edcf';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(label,x,284);
  const data=ctx.getImageData(index*160,0,160,290).data;let hash=2166136261;
  for(const value of data)hash=Math.imul(hash^value,16777619);hashes.push(hash>>>0);
 }
 capture('CONTACT');
 for(let i=0;i<12;i++)game.updatePlayers(1/60);
 capture('LAUNCH');
 for(let i=0;i<12;i++)game.updatePlayers(1/60);
 capture('AIRBORNE');
 let frames=0;while((victim.shotImpactKnockdownPending>0||victim.z>0)&&frames<180){game.updatePlayers(1/60);frames++;}
 if(frames>=180||victim.action!=='shotDown'||victim.shotImpactKnockdownTimer<=0)
  throw Error('live launch did not transition into a grounded hold');
 capture('LAND');
 const groundedStart=victim.shotImpactKnockdownTimer;
 for(let i=0;i<Math.min(30,Math.ceil(groundedStart*60)-2);i++)game.updatePlayers(1/60);
 if(victim.action!=='shotDown')throw Error('victim left the ground before the strength-scaled hold elapsed');
 capture('DOWNED HOLD');
 let downFrames=0;while(victim.shotImpactKnockdownTimer>0&&downFrames<240){game.updatePlayers(1/60);downFrames++;}
 if(downFrames>=240||victim.action!=='shotGetUp')throw Error('grounded hold did not transition into get-up');
 capture('GET-UP START');
 for(let i=0;i<7;i++)game.updatePlayers(1/60);capture('GET-UP PUSH');
 for(let i=0;i<8;i++)game.updatePlayers(1/60);capture('STANDING');
 if(new Set(hashes).size!==labels.length)throw Error('contact/recovery frames are not all visually distinct '+JSON.stringify({labels,hashes}));
 canvas.id='shot-impact-contact-transition';canvas.style.cssText='position:fixed;left:10px;top:10px;width:1280px;height:300px;z-index:99999';document.body.append(canvas);
 return {labels,distinctFrames:new Set(hashes).size,groundedSeconds:Number(groundedStart.toFixed(3)),groundedHoldFrames:downFrames,landed:true,recovered:true};
}"""


def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 1280, 'height': 720})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(HTML.as_uri())
        page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer')
        mechanics = json.loads((ROOT / 'data/mechanics/gameplay.json').read_text(encoding='utf-8'))
        result = page.evaluate(SETUP_AND_CAPTURE, mechanics['world']['field'])
        page.locator('#shot-impact-contact-transition').screenshot(path=str(PREVIEW))
        if errors:
            raise AssertionError(f'Browser errors: {errors}')
        browser.close()
        print({**result, 'preview': str(PREVIEW), 'pageErrors': errors})


if __name__ == '__main__':
    main()
