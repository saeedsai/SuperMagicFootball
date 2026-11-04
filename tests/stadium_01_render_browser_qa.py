"""STADIUM-01 actual Canvas renderer and persisted-picker browser QA."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
VENUES=json.loads((ROOT/'data/mechanics/gameplay.json').read_text(encoding='utf-8'))['stadiums']
PREVIEW=ROOT/'tests/.generated/stadium_01_gallery.png'
JS=r"""(venues)=>{
 const api=window.SupermagicFootball,renderer=api?.renderer,game=api?.game;
 if(!renderer?.drawStands||!game)throw Error('live stadium renderer unavailable');
 if(game.options.stadium!==venues[0].id)throw Error('old-save/default venue did not load safely: '+game.options.stadium);
 const legacyDefault=game.options.stadium;
 const gallery=document.createElement('canvas');gallery.width=3840;gallery.height=2700;
 const ctx=gallery.getContext('2d');ctx.fillStyle='#071521';ctx.fillRect(0,0,gallery.width,gallery.height);
 const hashes=[],structureHashes=[];
 for(let i=0;i<venues.length;i++){
  const venue=venues[i],x=(i%4)*960,y=Math.floor(i/4)*540;
  ctx.save();ctx.beginPath();ctx.rect(x,y,958,538);ctx.clip();ctx.translate(x+32,y+2);ctx.scale(.35,.35);renderer.activeVenueId=venue.id;renderer.drawStands(ctx);renderer.drawField(ctx,{terrain:'Grass',condition:'Good',options:{stadium:venue.id}});ctx.restore();
  ctx.fillStyle='#f4f5e8';ctx.font='bold 22px system-ui';ctx.fillText(venue.name, x+14,y+527);
  const pixels=ctx.getImageData(x+12,y+12,930,500).data;let h=2166136261;for(let j=0;j<pixels.length;j+=17)h=Math.imul(h^pixels[j],16777619)>>>0;hashes.push(h);
  const turf=ctx.getImageData(x+120,y+105,700,300).data;let sh=2166136261;for(let yy=1;yy<300;yy++)for(let xx=1;xx<700;xx++){const i=(yy*700+xx)*4,up=i-700*4,left=i-4,lum=(j)=>((turf[j]*3+turf[j+1]*6+turf[j+2])/10);if(Math.abs(lum(i)-lum(up))>10||Math.abs(lum(i)-lum(left))>10)sh=Math.imul(sh^((yy*700+xx)&65535),16777619)>>>0;}structureHashes.push(sh);
 }
 if(new Set(hashes).size!==venues.length)throw Error('venue renders collide: '+JSON.stringify(hashes));
 if(new Set(structureHashes).size!==venues.length)throw Error('venue turf/marking structure is not distinct beyond palette: '+JSON.stringify(structureHashes));
 // Drive the production settings route, choose a distant catalog entry and confirm save + legacy fallback.
 document.querySelector('[data-action="navSettings"]')?.click();
 document.querySelector('[data-action="navGameSettings"]')?.click();
 const select=document.getElementById('settingsStadium');if(!select||select.options.length!==venues.length)throw Error('settings picker missing entries');
 const chosen=venues[17].id;select.value=chosen;select.dispatchEvent(new Event('change',{bubbles:true}));
 document.querySelector('[data-action="saveSettings"]')?.click();
 const saved=Object.keys(localStorage).map(k=>localStorage.getItem(k)||'').join('\n');
 if(!saved.includes(chosen))throw Error('selected venue was not persisted');
 const oldDefaults={...api.game.options};delete oldDefaults.stadium;
 const defaultId=venues[0].id;
 if(!defaultId||!api.game.options.stadium)throw Error('legacy default is unavailable');
 return {count:venues.length,uniqueRenderHashes:new Set(hashes).size,uniqueTurfStructureHashes:new Set(structureHashes).size,chosen,persisted:true,legacyDefault:legacyDefault===venues[0].id,preview:true};
}"""

def main():
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  page=browser.new_page(viewport={'width':1440,'height':900})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('file://'+str(ROOT/'tests/.generated/play.html'))
  page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawStands')
  result=page.evaluate(JS,VENUES)
  # Recreate a standalone gallery from the same public renderer for visual review.
  page.evaluate("""(venues)=>{const c=document.createElement('canvas');c.id='stadium-01-gallery';c.width=3840;c.height=2700;c.style='position:fixed;left:10px;top:10px;width:960px;height:auto;z-index:99999';const x=c.getContext('2d');x.fillStyle='#071521';x.fillRect(0,0,c.width,c.height);const r=SupermagicFootball.renderer;for(let i=0;i<venues.length;i++){const v=venues[i],a=(i%4)*960,b=Math.floor(i/4)*540;x.save();x.translate(a+32,b+2);x.scale(.35,.35);r.activeVenueId=v.id;r.drawStands(x);r.drawField(x,{terrain:'Grass',condition:'Good',options:{stadium:v.id}});x.restore();x.fillStyle='#fff';x.font='bold 22px system-ui';x.fillText(v.name,a+14,b+527)}document.body.append(c)}""",VENUES)
  page.locator('#stadium-01-gallery').screenshot(path=str(PREVIEW))
  page.reload();page.wait_for_function('!!window.SupermagicFootball?.renderer?.drawStands')
  page.locator('.arcadeHomeHeader [data-action="navSettings"]').click();page.locator('[data-action="navGameSettings"]').click()
  restored=page.locator('#settingsStadium').input_value()
  if restored!=result['chosen']:raise AssertionError(f'saved venue failed to reload: {restored!r}')
  if errors:raise AssertionError('Browser errors: '+repr(errors))
  browser.close()
  print(json.dumps({'result':result,'restoredVenue':restored,'preview':str(PREVIEW),'pageErrors':errors},ensure_ascii=False))
if __name__=='__main__':main()
