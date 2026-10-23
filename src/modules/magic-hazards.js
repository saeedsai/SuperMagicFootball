// Bounded, deterministic on-pitch Magic Trick hazard; no new controls or save schema.
const BANANA_LIFETIME=3, BANANA_ARM_TIME=.25, BANANA_RADIUS=27, MAX_BANANA_PEELS=6;
function placeBananaPeel(active,carrier,field){
 if(!Array.isArray(active)||!carrier||!field||!Number.isFinite(carrier.x)||!Number.isFinite(carrier.y)||![0,1].includes(carrier.t))throw new TypeError('Invalid banana peel placement');
 const moveX=Number(carrier.dx)||0,moveY=Number(carrier.dy)||0;
 const moving=Math.hypot(moveX,moveY)>.1;
 const vx=moving?moveX:Number(carrier.face)||1,vy=moving?moveY:0;
 const magnitude=Math.hypot(vx,vy)||1;
 const x=Math.max(field.x+25,Math.min(field.x+field.w-25,carrier.x-vx/magnitude*42));
 const y=Math.max(field.y+25,Math.min(field.y+field.h-25,carrier.y-vy/magnitude*42));
 return [...active.slice(-(MAX_BANANA_PEELS-1)),Object.freeze({kind:'banana',team:carrier.t,x,y,life:BANANA_LIFETIME,arm:BANANA_ARM_TIME})];
}
function advanceBananaPeels(active,players,dt){
 if(!Array.isArray(active)||!Array.isArray(players)||!Number.isFinite(dt)||dt<0)throw new TypeError('Invalid banana peel tick');
 const hazards=[],slips=[],seen=new Set();
 for(const peel of active){
  if(peel.kind!=='banana')continue;
  const life=peel.life-dt,arm=Math.max(0,peel.arm-dt);
  if(life<=0)continue;
  const victim=arm===0?players.find(p=>p.t!==peel.team&&!p.keeper&&p.stun<=0&&p.z<20&&Math.hypot(p.x-peel.x,p.y-peel.y)<=BANANA_RADIUS):null;
  if(victim){if(!seen.has(victim)){slips.push(victim);seen.add(victim);}continue;}
  hazards.push({...peel,life,arm});
 }
 return {hazards,slips};
}
export {BANANA_LIFETIME,BANANA_ARM_TIME,BANANA_RADIUS,MAX_BANANA_PEELS,placeBananaPeel,advanceBananaPeels};
