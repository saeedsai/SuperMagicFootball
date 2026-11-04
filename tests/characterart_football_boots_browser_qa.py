from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
fixture=root/'tests' / '.generated' / 'play.html'
output=root/'tests' / '.generated' / 'football_boots_five_views.png'
markup=fixture.read_text(encoding='utf-8')

DRAW=r'''()=>{
 const e=window.SupermagicFootball;
 if(!e?.renderer?.drawPlayer||!e.game?.players?.length)throw Error('live player renderer is unavailable');
 const samples=[e.game.players.find(p=>!p.keeper&&p.t===0),e.game.players.find(p=>!p.keeper&&p.t===1)];
 if(samples.some(p=>!p))throw Error('outfield players for both teams are unavailable');
 const canvas=document.createElement('canvas');canvas.width=850;canvas.height=660;canvas.id='footballBootsPreview';canvas.style.cssText='position:fixed;inset:30px auto auto 30px;width:850px;height:660px;display:block;z-index:9999;box-shadow:0 0 0 4px #fff';
 const ctx=canvas.getContext('2d');ctx.fillStyle='#e4edf5';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.strokeStyle='#c4cfdb';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,330);ctx.lineTo(850,330);ctx.stroke();
 const dirs=[['FRONT',0,1,'front'],['3/4 FRONT',.707,.707,'quarterFront'],['PROFILE',1,0,'side'],['3/4 BACK',.707,-.707,'quarterBack'],['BACK',0,-1,'back']];
 for(let row=0;row<samples.length;row++){
  const base=samples[row],team=e.game.getTeam(base.t),baseline=row*330+265;
  ctx.fillStyle='#203244';ctx.font='bold 13px system-ui';ctx.textAlign='left';ctx.fillText('TEAM '+(row+1)+' · '+team.name,8,row*330+25);
  for(let i=0;i<dirs.length;i++){
   const [label,dx,dy,kind]=dirs[i],tile=i*170;
   ctx.textAlign='center';ctx.fillText(label,tile+85,row*330+48);
   ctx.save();ctx.translate(tile+85,baseline);ctx.scale(1.7,1.7);
   const p={...base,src:base.src,t:base.t,i:0,keeper:false,x:0,y:0,z:0,dx,dy,face:1,visualFacing:null,action:'idle',anim:0,controlled:false,preview:true,stun:0,cryTimer:0,firstTouchFx:0,turnLag:0};
   e.renderer.drawPlayer(ctx,p,{getTeam:()=>team,options:{showNames:false},celebrationStyle:0});ctx.restore();
  }
 }
 document.body.appendChild(canvas);return {width:canvas.width,height:canvas.height,views:dirs.map(x=>x[3])};
}'''

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=shutil.which('chromium') or None,headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':920,'height':390})
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.set_content(markup,wait_until='load')
 page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawPlayer',timeout=20000)
 result=page.evaluate(DRAW)
 page.locator('#footballBootsPreview').screenshot(path=str(output))
 visible=page.locator('#footballBootsPreview').evaluate('(c)=>{const d=c.getContext("2d").getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;return n}')
 assert result['views']==['front','quarterFront','side','quarterBack','back'],result
 assert visible>10000,('renderer preview unexpectedly blank',visible)
 assert not errors,errors
 print('PASS live renderer five-view cleat comparison for both teams; painted pixels',visible,'preview',output)
 browser.close()
