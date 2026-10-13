from pathlib import Path
import shutil
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
markup=(root/'play.html').read_text()
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium') or None,args=['--no-sandbox'])
 for mode,vp in [('desktop',(1460,900)),('android',(940,438))]:
  page=browser.new_page(viewport={'width':vp[0],'height':vp[1]},is_mobile=mode=='android',has_touch=mode=='android',device_scale_factor=1)
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(markup,wait_until='load');page.wait_for_function("window.SupermagicFootball?.version==='0.8.17.1-alpha'",timeout=25000)
  # Gallery is a QA-only overlay, not a new game menu. Uses the actual live Canvas character renderer.
  result=page.evaluate('''() => {
    const app=window.SupermagicFootball, renderer=app.renderer,game=app.game;
    let holder=document.createElement('div');holder.id='artProof';holder.style.cssText='position:fixed;z-index:99999;inset:0;background:linear-gradient(140deg,#102e45,#192a39);overflow:hidden;color:white;font:900 14px Arial';
    let title=document.createElement('div');title.textContent='SUPERMAGIC FOOTBALL · HD CHARACTER ART · EXPANDED FUNNY FACES';title.style.cssText='text-align:center;padding:15px';holder.appendChild(title);
    let canvas=document.createElement('canvas');canvas.width=1400;canvas.height=570;canvas.style.cssText='display:block;margin:auto;width:98%;max-height:90%;object-fit:contain';holder.appendChild(canvas);document.body.appendChild(holder);
    const ctx=canvas.getContext('2d');const names=['Lionel Messi','Cristiano Ronaldo','Lamine Yamal','Kylian Mbappé','Erling Haaland','Mohamed Salah','Vinícius Júnior','Luka Modrić','Jude Bellingham','Ronaldinho','Ronaldo Nazário','Neymar','Pedri'];
    for(let n=0;n<13;n++){
      let col=n%7,row=Math.floor(n/7),x=100+col*198,y=247+row*254;
      ctx.fillStyle=n%2?'#204854':'#1e3853';ctx.beginPath();ctx.roundRect(x-88,y-194,174,238,18);ctx.fill();ctx.strokeStyle='#85bbca';ctx.stroke();
      const name=names[n];const player={name,num:n+1,role:'FW',appearance:{style:n,face:n%5}};
      const p={t:0,i:n,src:player,x:0,y:0,z:0,dx:0,dy:0,face:1,anim:1,action:n%4===0?'celebrate':n%4===1?'cry':n%4===2?'hurt':'idle',stun:0,fatigue:0};
      ctx.save();ctx.translate(x,y);ctx.scale(1.55,1.55);renderer.drawPlayer(ctx,p,{getTeam:()=>({primary:'#c54757',secondary:'#f7e9ab',trim:'#faf6e3'}),options:{showNames:false},celebrationStyle:n%5});ctx.restore();
      ctx.fillStyle='#fcf0d4';ctx.font='bold 13px Arial';ctx.textAlign='center';ctx.fillText(name.length>17?name.slice(0,17)+'…':name,x,y+21);ctx.font='12px Arial';ctx.fillText('STYLE '+(n+1)+'  /  FACE '+(1+n%5),x,y+38);
    }
    return {drawn:13, width:canvas.width,height:canvas.height};
  }''')
  assert result['drawn']==13
  page.screenshot(path=str(root/'tests'/f'character_art_gallery_{mode}.png'))
  assert not errors,errors[:4]
  page.locator('#artProof').evaluate('(el)=>el.remove()')
  page.locator('[data-action="quick"]').click()
  page.locator('[data-action="kickoff"]').click()
  page.wait_for_timeout(300)
  assert not errors, errors
  page.screenshot(path=str(root/'tests'/f'character_match_{mode}.png'))
  print(mode.upper(),'PASS: 13 silhouette gallery, match render, no browser errors')
  page.close()
 browser.close()
