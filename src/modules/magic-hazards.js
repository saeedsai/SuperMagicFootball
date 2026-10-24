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
 // A rival's traps must not consume this team's independent placement budget.
 const bananas=active.filter(h=>h.kind==='banana'&&h.team===carrier.t).slice(-(MAX_BANANA_PEELS-1));
 return [...active.filter(h=>h.kind!=='banana'||h.team!==carrier.t),...bananas,Object.freeze({kind:'banana',team:carrier.t,x,y,life:BANANA_LIFETIME,arm:BANANA_ARM_TIME})];
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

// Ice Patch: distinct persistent trap; shorter chill than banana slip.
// Each team has its own bounded capacity for each trap type; no effect on airborne,
// friendly, keeper, or already-stunned players.
const ICE_LIFETIME=2.5,ICE_ARM_TIME=.3,ICE_RADIUS=35,MAX_ICE_PATCHES=6;
function placeIcePatch(active,carrier,field){
 if(!Array.isArray(active)||!carrier||!field||![0,1].includes(carrier.t)||
    !Number.isFinite(carrier.x)||!Number.isFinite(carrier.y))throw new TypeError('Invalid ice patch placement');
 const moveX=Number(carrier.dx)||0,moveY=Number(carrier.dy)||0;
 const moving=Math.hypot(moveX,moveY)>.1;
 const vx=moving?moveX:Number(carrier.face)||1,vy=moving?moveY:0;
 const magnitude=Math.hypot(vx,vy)||1;
 const x=Math.max(field.x+35,Math.min(field.x+field.w-35,carrier.x-vx/magnitude*48));
 const y=Math.max(field.y+35,Math.min(field.y+field.h-35,carrier.y-vy/magnitude*48));
 // Ice uses its own per-team budget, independent of bananas and enemy ice.
 const ice=active.filter(h=>h.kind==='ice'&&h.team===carrier.t).slice(-(MAX_ICE_PATCHES-1));
 return [...active.filter(h=>h.kind!=='ice'||h.team!==carrier.t),...ice,Object.freeze({kind:'ice',team:carrier.t,x,y,life:ICE_LIFETIME,arm:ICE_ARM_TIME})];
}
function advanceIcePatches(active,players,dt){
 if(!Array.isArray(active)||!Array.isArray(players)||!Number.isFinite(dt)||dt<0)throw new TypeError('Invalid ice patch tick');
 const hazards=[],slips=[],seen=new Set();
 for(const patch of active){
  if(patch.kind!=='ice')continue;
  const life=patch.life-dt,arm=Math.max(0,patch.arm-dt);
  if(life<=0)continue;
  const victim=arm===0?players.find(p=>p.t!==patch.team&&!p.keeper&&p.stun<=0&&p.z<20&&Math.hypot(p.x-patch.x,p.y-patch.y)<=ICE_RADIUS):null;
  if(victim){if(!seen.has(victim)){slips.push(victim);seen.add(victim);}continue;}
  hazards.push({...patch,life,arm});
 }
 return {hazards,slips};
}

/**
 * Defensive SHOOT slide clears nearby enemy ground traps before contact damage.
 * This is deliberately an on-pitch counter using an existing action button;
 * teammates, airborne players, keepers and stunned players cannot clear traps.
 * A single active slide may sweep several traps in its physical path.
 */
function disarmMagicHazards(active,players){
 if(!Array.isArray(active)||!Array.isArray(players))throw new TypeError('Invalid magic hazard disarm input');
 const hazards=[],disarmed=[];
 for(const hazard of active){
  if(hazard.kind!=='banana'&&hazard.kind!=='ice'){hazards.push(hazard);continue;}
  const radius=(hazard.kind==='ice'?ICE_RADIUS:BANANA_RADIUS)+8;
  const defender=players.find(p=>p&&p.t!==hazard.team&&!p.keeper&&p.stun<=0&&p.z<20&&
   p.action==='slide'&&p.actionTimer>0&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&
   Math.hypot(p.x-hazard.x,p.y-hazard.y)<=radius);
  if(defender)disarmed.push({hazard,player:defender});
  else hazards.push(hazard);
 }
 return {hazards,disarmed};
}
export {disarmMagicHazards,ICE_LIFETIME,ICE_ARM_TIME,ICE_RADIUS,MAX_ICE_PATCHES,placeIcePatch,advanceIcePatches,BANANA_LIFETIME,BANANA_ARM_TIME,BANANA_RADIUS,MAX_BANANA_PEELS,placeBananaPeel,advanceBananaPeels};
