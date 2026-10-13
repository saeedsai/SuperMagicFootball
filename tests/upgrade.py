from pathlib import Path
root=Path(__file__).resolve().parents[1]
def edit(name,a,b,n=1):
 p=root/name;s=p.read_text();assert a in s,(name,a[:120]);s=s.replace(a,b,n);p.write_text(s)
# engine speed and celebrations
edit('src/engine.js','this.celebration=0;this.cooldown=0;this.pk=null;', 'this.celebration=0;this.pendingKickoff=null;this.goalHero=null;this.cooldown=0;this.pk=null;')
edit('src/engine.js','this.celebration=0;this.cooldown=0;this.stormTimer=2;', 'this.celebration=0;this.pendingKickoff=null;this.goalHero=null;this.cooldown=0;this.stormTimer=2;')
edit('src/engine.js','{A:390,B:365,C:338,D:308}[p.src.speed]||345','{A:300,B:283,C:261,D:242}[p.src.speed]||262')
edit('src/engine.js','1250*spec.speed','850*spec.speed')
edit('src/engine.js','(790+p.src.shoot*14)','(535+p.src.shoot*10)')
edit('src/engine.js','const spd=','const spd=') if False else None
edit('src/engine.js','this.clock+=dt;this.cooldown=Math.max(0,this.cooldown-dt);','''if(this.celebration>0){this.celebration=Math.max(0,this.celebration-dt);this.updateEffects(dt);
   for(const p of this.players){p.anim+=dt;if(p.t===this.pendingKickoff?.scorer){p.action='celebrate';p.actionTimer=.25}}
   if(this.celebration===0&&this.pendingKickoff){const k=this.pendingKickoff;this.pendingKickoff=null;this.resetKickoff(1-k.scorer);}return}
 this.clock+=dt;this.cooldown=Math.max(0,this.cooldown-dt);''')
edit('src/engine.js','this.celebration=Math.max(0,this.celebration-dt);this.updateWeather(dt);','this.updateWeather(dt);')
# fix bug: right side scoring -> goal captured prior reset
old="this.score[t]++;this.shake=.45;this.flash=.2;this.burst(b.x,b.y,'#ffdf79',60);this.emit('goal',{team:t,score:this.score.slice()});this.resetKickoff(1-t);this.cooldown=2"
new="this.score[t]++;this.shake=.45;this.flash=.2;this.burst(b.x,b.y,'#ffdf79',60);const scorers=this.players.filter(p=>p.t===t).sort((p,q)=>distance(p,b)-distance(q,b));this.goalHero=scorers[0]?.src?.name||this.getTeam(t).name;this.pendingKickoff={scorer:t,hero:this.goalHero};this.celebration=3.3;this.ball.owner=null;this.ball.vx=this.ball.vy=this.ball.vz=0;this.emit('goal',{team:t,hero:this.goalHero,score:this.score.slice()});this.cooldown=3.3"
edit('src/engine.js',old,new)
# pass speed
s=(root/'src/engine.js').read_text()
print([x for x in s.splitlines() if 'this.freeBall(p' in x])
