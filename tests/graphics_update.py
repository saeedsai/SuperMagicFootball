from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'src/engine.js';s=p.read_text().replace(',840,{power:5,z:',',620,{power:5,z:')
s=s.replace("else this.tackle(p,true)}\n if(a==='special')", "else {if(distance(p,this.ball)<140)this.tackle(p,true);else{p.chase=1.8;p.action='sprint';p.actionTimer=.3}}}\n if(a==='special')")
s=s.replace("if(a==='shoot'){const mate", "if(a==='shoot'){const mate")
s=s.replace("else this.tackle(p,false)}\n if(a==='pass')", "else this.tackle(p,true)}\n if(a==='pass')")
s=s.replace("p.x+=dx*spd*dt;p.y+=dy*spd*dt;", """if((p.chase||0)>0&&this.ball.owner!==p){p.chase=Math.max(0,p.chase-dt);const target=this.ball.owner||this.ball,dist=Math.hypot(target.x-p.x,target.y-p.y);if(dist>50){dx=(target.x-p.x)/dist;dy=(target.y-p.y)/dist;}else if(p.cd<=0){this.tackle(p,true);p.chase=0}}else p.chase=0;
 p.x+=dx*spd*dt;p.y+=dy*spd*dt;""")
s=s.replace("if(this.input.just(p.t,'shoot')&&this.ball.owner!==p)this.command(p,'shoot');", "if(this.input.just(p.t,'shoot')&&this.ball.owner!==p)this.command(p,'shoot');")
s=s.replace("this.ball.owner===p && s.shoot", "this.ball.owner===p && s.shoot")
s=s.replace("this.tackle(p,Math.random()<.48)","this.tackle(p,Math.random()<.34)")
s=s.replace("if(p.keeper&&b.attacker===p.t&&Math.hypot(b.vx,b.vy)>700)","if(p.keeper&&b.attacker===p.t&&Math.hypot(b.vx,b.vy)>480)")
p.write_text(s)
p=r/'src/render.js';s=p.read_text();s=s.replace("import {TEAMS,SHOTS} from './data.js';", "import {TEAMS,SHOTS} from './data.js';\nimport {avatarFor} from './expanded.js';")
s=s.replace("  const variant=(p.src.num*7+p.t*5)%9;", "  const av={...avatarFor(p.src),...(p.src.appearance||{})};\n  const variant=av.style%13;")
s=s.replace("const skin=skins[(p.i+p.t*2)%5], dark='#222033', hair=['#151a29','#33221e','#0f2734','#352322','#262934','#47342a'][variant%6];", "const skin=av.skin, dark='#222033', hair=av.hair;")
s=s.replace("  ellipse(ctx,0,1,34,30,dark);\n  ellipse(ctx,0,4,31,27,skin);", """  const width=[30,34,31,32,29][av.face%5];
  ellipse(ctx,0,1,width+3,30,dark);ellipse(ctx,0,4,width,27,skin);""")
s=s.replace("if(variant%3===0){", "if(variant%4===0){")
s=s.replace("else if(variant%3===1){", "else if(variant%4===1){")
s=s.replace("  else{poly(ctx,[[-34,-8]", "  else if(variant%4===2){poly(ctx,[[-34,-8]")
s=s.replace("  if(variant===2||variant===5||variant===8){", """  else{ // curly or long hairstyles: distinctive volume
   for(let j=-3;j<=3;j++)ellipse(ctx,j*10,-23+Math.sin(j*2)*5,9+variant%4,10+(j%2)*3,hair);
   poly(ctx,[[-34,-20],[-25,-35],[-12,-40],[0,-36],[15,-38],[28,-29],[33,-16],[24,-9],[8,-16],[-10,-12],[-23,-9]],hair,dark);
  }
  if(variant===2||variant===5||variant===8||av.accessory===1){""")
s=s.replace("  // Strong comic eyebrows, deliberately asymmetric.", """  // Signature facial hair, individual nose shapes and face marks.
  if(av.beard===2||av.beard===3||/Salah|Messi|Benzema|Giroud|Modrić|De Bruyne|Ronaldo Nazário/i.test(p.src.name)){
    ctx.fillStyle=hair;ctx.beginPath();ctx.moveTo(-19,16);ctx.quadraticCurveTo(-20,35,0,35);ctx.quadraticCurveTo(21,33,20,16);ctx.lineTo(13,18);ctx.quadraticCurveTo(0,29,-13,18);ctx.fill();
  }
  if(av.beard===1||av.beard===4)rr(ctx,-10,20,19,3,2,hair);
  if(av.freckles===2)for(const fx of [-22,-17,16,21])ellipse(ctx,fx,15,1.4,1.4,'#aa6351');
  if(av.scar===2)line(ctx,[[19,-1],[24,11]],'#bb6b5b',2);
  if(av.accessory===4){line(ctx,[[-26,9],[-4,9]],'#37343d',3);line(ctx,[[5,9],[26,9]],'#37343d',3)}
  if(av.accessory===5){rr(ctx,-28,-15,55,8,2,'#eee4b7',dark)}
  // Strong comic eyebrows, deliberately asymmetric.""")
s=s.replace("const brows=isHurt?12:(p.action==='super'?-2:-3);", "const brows=isHurt?12:(p.action==='super'?-2:-3)+(av.brows%4-1)*1.6;")
s=s.replace("  else{line(ctx,[[-5,21],[0,24],[7,20]],'#7b3639',3)}", """  else if(av.mouth%3===0){ellipse(ctx,1,22,7,4,'#7b3639');line(ctx,[[-4,23],[5,23]],'#fdf6dc',2)}
  else if(av.mouth%3===1){line(ctx,[[-7,21],[0,24],[9,19]],'#7b3639',3)}
  else{line(ctx,[[-6,20],[1,23],[8,22]],'#7b3639',3)}
  if(p.action==='celebrate'){ellipse(ctx,0,23,10,9,'#662b40');rr(ctx,-8,23,16,4,1,'#fff9e4');for(let j=0;j<5;j++)ellipse(ctx,-34+j*14,-40+Math.sin(this.time*12+j)*5,2.4,2.4,j%2?'#ffeb70':'#fff')}
""")
s=s.replace("  const kick=p.action==='kick'||p.action==='super';", "  const kick=p.action==='kick'||p.action==='super'||p.action==='celebrate';")
s=s.replace("  const swing=kick?20:sliding?-13:run*13;", "  const swing=p.action==='celebrate'?45: kick?20:sliding?-13:run*13;")
s=s.replace("  const stride=run*12;", "  const stride=(p.action==='celebrate'?Math.sin(this.time*11+p.i):run)*12;")
s=s.replace("  if(game.matchState==='penalty')this.drawPenaltyPlayers", "  if(game.matchState==='penalty')this.drawPenaltyPlayers")
s=s.replace("this.drawBorder(ctx,game);this.drawMiniMap(ctx,game);ctx.restore();", "this.drawBorder(ctx,game);this.drawMiniMap(ctx,game);if(game.celebration>0)this.drawGoalCelebration(ctx,game);ctx.restore();")
pos=s.index(' drawStands(ctx){');s=s[:pos]+''' drawGoalCelebration(ctx,game){
   const t=game.pendingKickoff?.scorer??0,team=game.getTeam(t),hero=game.goalHero||team.name;
   const elapsed=3.3-game.celebration;
   ctx.save();ctx.textAlign='center';ctx.translate(640,130);
   ctx.rotate(Math.sin(elapsed*7)*.019);ctx.shadowColor='#081621';ctx.shadowBlur=19;
   ctx.fillStyle='#0b263cdc';ctx.beginPath();ctx.roundRect(-285,-73,570,152,27);ctx.fill();ctx.strokeStyle='#ffdb6d';ctx.lineWidth=5;ctx.stroke();
   ctx.font='1000 60px system-ui';ctx.lineWidth=9;ctx.strokeStyle='#0d2032';ctx.strokeText('GOOOOAL!!',0,-8);ctx.fillStyle='#ffe273';ctx.fillText('GOOOOAL!!',0,-8);
   ctx.shadowBlur=0;ctx.font='900 23px system-ui';ctx.fillStyle='#f2fafc';ctx.fillText(hero.toUpperCase().slice(0,25)+'   ✦   '+team.name.toUpperCase(),0,40);
   for(let i=0;i<18;i++){const x=(i*79+elapsed*60)%1100-550,y=Math.sin(i*4+elapsed*7)*65+83;ctx.fillStyle=i%3?'#b5f6e4':'#ffad5d';ctx.fillRect(x,y,8,20)}
   ctx.restore();
 }
''' +s[pos:]
p.write_text(s)
