from pathlib import Path
p=Path(__file__).resolve().parents[1]
def change(path,old,new,n=1):
 f=p/path;s=f.read_text();c=s.count(old)
 if c<n: raise RuntimeError(f'{path}: missing {old[:100]!r}; count={c}')
 f.write_text(s.replace(old,new,n))
(p/'src/kits.js').write_text('''// v0.6.3: original procedural home/away kit definitions, no external assets.
// Derivation is deterministic and does not overwrite source team identities or saved rosters.
export const KIT_CHOICES = ['home','away'];
const isHex = s => /^#[\\da-fA-F]{6}$/.test(String(s));
const rgb = s => [1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
const dist = (a,b) => Math.hypot(...rgb(a).map((x,i)=>x-rgb(b)[i]));
const brightness = s=>rgb(s).reduce((a,c,i)=>a+c*[.2126,.7152,.0722][i],0);
export function kitFor(team,choice='home'){
 const primary=isHex(team.primary)?team.primary:'#297ea7';
 const secondary=isHex(team.secondary)?team.secondary:'#f3eee3';
 const trim=isHex(team.trim)?team.trim:'#253b54';
 if(choice!=='away')return {...team,primary,secondary,trim,kit:'home',kitLabel:'HOME'};
 // Away kit must be visually distinct from the club's source/home kit.
 const fallback=brightness(primary)>132?'#162f47':'#f7f2df';
 const awayPrimary=dist(primary,secondary)>112?secondary:fallback;
 const awaySecondary=brightness(awayPrimary)>145?'#24334c':'#f7ebcf';
 return {...team,primary:awayPrimary,secondary:awaySecondary,trim:primary,kit:'away',kitLabel:'AWAY'};
}
export const kitsFor=team=>KIT_CHOICES.map(c=>kitFor(team,c));
''')
# stats (agility; preserve running speed in speedRating)
change(Path('src/stats.js'),"'speedRating','shootPower'","'speedRating','agility','shootPower'")
change(Path('src/stats.js'),"  speedRating:Math.round(legacySpeed),","  speedRating:Math.round(legacySpeed),\n  agility:Math.round(overall*.55+legacySpeed*.27+14+off(2)),")
# engine
change(Path('src/engine.js'),"import {withStats,stat,endurance,contest,shotError} from './stats.js';","import {withStats,stat,endurance,contest,shotError} from './stats.js';\nimport {kitFor} from './kits.js';")
change(Path('src/engine.js'),"fatigue:old.get(`${t}:${src.id}`)?.fatigue??Math.max(0,(100-(src.condition??100))*.003),mood:9", "fatigue:old.get(`${t}:${src.id}`)?.fatigue??Math.max(0,(100-(src.condition??100))*.003),moveVX:0,moveVY:0,mood:9")
change(Path('src/engine.js')," getTeam(t){return TEAMS[this.teamIds[t]]}", " getTeam(t){return kitFor(TEAMS[this.teamIds[t]],this.options.kitChoices?.[t]|| (t===0?'home':'away'))}")
change(Path('src/engine.js')," playerSpeed(p){return (191+stat(p,'speedRating')*1.24)*(this.options.gameSpeed||1)*endurance(p)}",''' playerSpeed(p){return (191+stat(p,'speedRating')*1.24)*(this.options.gameSpeed||1)*endurance(p)}
 // Speed rating controls top speed, agility controls acceleration, stopping and turns.
 moveAgile(p,dx,dy,maxSpeed,dt){
  const mag=Math.hypot(dx,dy),n=mag>1?1/mag:1;
  const targetVX=dx*n*maxSpeed,targetVY=dy*n*maxSpeed;
  const turn=Math.max(0,Math.min(1,(3.0+stat(p,'agility')*.13)*dt));
  p.moveVX=(p.moveVX||0)+(targetVX-(p.moveVX||0))*turn;
  p.moveVY=(p.moveVY||0)+(targetVY-(p.moveVY||0))*turn;
  const move=Math.hypot(p.moveVX,p.moveVY);
  if(move>maxSpeed&&move>0){p.moveVX=p.moveVX/move*maxSpeed;p.moveVY=p.moveVY/move*maxSpeed;}
  p.x+=p.moveVX*dt;p.y+=p.moveVY*dt;
  p.dx=maxSpeed?p.moveVX/maxSpeed:0;p.dy=maxSpeed?p.moveVY/maxSpeed:0;
 }
''')
change(Path('src/engine.js'),"if(p.stun>0){p.stun-=dt;this.staminaTick(p,dt,0);continue}","if(p.stun>0){p.stun-=dt;p.moveVX=0;p.moveVY=0;this.staminaTick(p,dt,0);continue}")
change(Path('src/engine.js'),"p.x+=dx*spd*dt;p.y+=dy*spd*dt;if(Math.abs(dx)>.04)p.face=dx>0?1:-1;", "this.moveAgile(p,dx,dy,spd,dt);if(Math.abs(p.dx)>.04)p.face=p.dx>0?1:-1;")
change(Path('src/engine.js'),"if(d>8){const step=Math.min(d,speed*dt);p.x+=dx/d*step;p.y+=dy/d*step;p.dx=dx/d;p.dy=dy/d;if(Math.abs(dx)>10)p.face=dx>0?1:-1}this.staminaTick", "if(d>8){const step=Math.min(speed,d/Math.max(dt,.001));this.moveAgile(p,dx/d,dy/d,step,dt);if(Math.abs(p.dx)>.04)p.face=p.dx>0?1:-1}else this.moveAgile(p,0,0,speed,dt);this.staminaTick")
# main setup UI, menu state
change(Path('src/main.js'),"import {withStats,NUMERIC_STATS} from './stats.js';","import {withStats,NUMERIC_STATS} from './stats.js';\nimport {kitFor,KIT_CHOICES} from './kits.js';")
change(Path('src/main.js'),"const opt={...DEFAULT_OPTIONS,...store.get('options',{})};","const opt={...DEFAULT_OPTIONS,...store.get('options',{})};\nconst kitSelections=store.get('kitSelections',['home','away']).map(k=>KIT_CHOICES.includes(k)?k:'home');")
change(Path('src/main.js'),"VERSION 0.6.2","VERSION 0.6.3")
change(Path('src/main.js'),"<span class=\"nationSub\">HOME • ATTACK →</span>","<span class=\"nationSub\" id=\"homeKitCaption\">HOME • ATTACK →</span>")
change(Path('src/main.js'),"<span class=\"nationSub\">← ATTACK • AWAY</span>","<span class=\"nationSub\" id=\"awayKitCaption\">← ATTACK • AWAY</span>")
change(Path('src/main.js'),"<div class=\"matchupInfo\"><span>HOME SPECIAL:",'''<div class="kitChooser"><div class="kitSelector"><span class="kitDot" id="homeKitDot"></span>${field('HOME TEAM KIT','homeKit',[['home','HOME KIT'],['away','AWAY KIT']],kitSelections[0])}</div><div class="kitSelector"><span class="kitDot" id="awayKitDot"></span>${field('AWAY TEAM KIT','awayKit',[['home','HOME KIT'],['away','AWAY KIT']],kitSelections[1])}</div></div>
 <div class="matchupInfo"><span>HOME SPECIAL:''')
change(Path('src/main.js'),"const ctx=c.getContext('2d'),team=TEAMS[id],r=roster(id),star=r[id===0?0:8]||r[0];", "const ctx=c.getContext('2d'),team=kitFor(TEAMS[id],kitSelections[side==='home'?0:1]),r=roster(id),star=r[id===0?0:8]||r[0];\n const dot=$(side+'KitDot');if(dot){dot.style.background=team.primary;dot.style.borderColor=team.secondary;}\n const caption=$(side+'KitCaption');if(caption)caption.textContent=(side==='home'?'HOME • ATTACK →':'← ATTACK • AWAY')+' · '+team.kitLabel+' KIT';")
change(Path('src/main.js'),"formations:[formation,'2-1-2'],options:opt", "formations:[formation,'2-1-2'],options:{...opt,kitChoices:kitSelections.slice()}")
change(Path('src/main.js'),"case 'weather':opt.weather=e.target.value;break;", "case 'homeKit':case 'awayKit':{let side=id==='homeKit'?0:1;kitSelections[side]=e.target.value;store.put('kitSelections',kitSelections);paintTeamPreviews();break;}case 'weather':opt.weather=e.target.value;break;")
change(Path('src/main.js'),"version:'0.6.3-alpha'","version:'0.6.3-alpha'")
change(Path('src/main.js'),"continentalMapping:CONTINENTAL_TEAMS};showHome()","continentalMapping:CONTINENTAL_TEAMS,kitsFor:team=>KIT_CHOICES.map(k=>kitFor(team,k)),getKitChoices:()=>kitSelections.slice()};showHome()")
# render preview colors require game.getTeam modified no extra renderer modifications.
# build script bundle support
change(Path('tests/build.py'),"for name in ['stats','data'", "for name in ['kits','stats','data'")
change(Path('tests/build.py'),"parts=[\n 'const STATS", "parts=[\n 'const KITS=(()=>{'+modules['kits']+'\\nreturn {KIT_CHOICES,kitFor,kitsFor};})();',\n 'const STATS")
change(Path('tests/build.py'),"const {withStats,stat,endurance,contest,shotError}=STATS;'+modules['engine']", "const {withStats,stat,endurance,contest,shotError}=STATS;const {kitFor}=KITS;'+modules['engine']")
change(Path('tests/build.py'),"const {withStats,NUMERIC_STATS}=STATS;const {GameEngine}=ENGINE;", "const {withStats,NUMERIC_STATS}=STATS;const {kitFor,KIT_CHOICES}=KITS;const {GameEngine}=ENGINE;")
# UI styles
f=p/'style.css';f.write_text(f.read_text()+'''\n/* v0.6.3: visually paired team kits, responsive for landscape phones. */
.kitChooser{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;border:1px solid #5897a583;border-radius:11px;padding:10px;background:#0c3042}
.kitSelector{display:grid;grid-template-columns:35px 1fr;grid-template-rows:auto auto;column-gap:9px;align-items:center;min-width:0}
.kitSelector .fieldLabel{grid-column:2;margin:0 0 4px}
.kitSelector .choice{grid-column:2;min-width:0}
.kitDot{grid-row:1/span 2;display:block;width:34px;height:45px;border:5px solid #fff;border-radius:8px;box-shadow:0 2px 8px #0008,inset 0 0 8px #ffffff44}
@media(max-width:650px){.kitChooser{gap:5px;padding:5px}.kitSelector{grid-template-columns:24px 1fr;gap:4px}.kitDot{width:23px;height:32px;border-width:3px}.kitSelector .choice{font-size:10px;padding:5px}}
@media(max-height:540px){.kitChooser{margin-top:5px;padding:5px}.kitDot{height:26px}.kitSelector .fieldLabel{font-size:8px}}
''')
# bump package version, readme later
change(Path('package.json'),'"version": "0.6.3-alpha"','"version": "0.6.3-alpha"')
change(Path('package.json'),'"test": "node tests/simulation.mjs','"test": "node tests/kits_agility.mjs && node tests/simulation.mjs')
change(Path('package.json'),'"qa": "python tests/v060_qa.py','"qa": "python tests/kits_browser_qa.py && python tests/v060_qa.py')
print('Applied v0.6.3 changes')
