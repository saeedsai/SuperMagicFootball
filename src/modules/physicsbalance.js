// Independently editable, bounded passing and goalkeeper mechanics.
// Gameplay remains unchanged at the documented defaults in mechanics/gameplay.json.
const PHYSICSBALANCE=(()=>{
 const BOUNDS=Object.freeze({
  'passSpeed.base':[300,650],
  'passSpeed.qualityMultiplier':[0,5],
  'passSpeed.max':[700,1600],
  'keeperDiveRecovery.baseSeconds':[1,3.5],
  'keeperDiveRecovery.referenceSkill':[40,70],
  'keeperDiveRecovery.skillCoefficient':[0,.02],
  'keeperDiveRecovery.divingCoefficient':[0,.02],
  'keeperDiveRecovery.fatigueCoefficient':[0,1.5],
  'keeperDiveRecovery.minSeconds':[.8,2],
  'keeperDiveRecovery.maxSeconds':[2,4]
 });
 function validatePhysicsTuning(config){
  if(!config||typeof config!=='object'||Array.isArray(config))throw Error('physicsTuning: object required');
  const result={};
  for(const [name,range] of Object.entries(BOUNDS)){
   const [group,key]=name.split('.'),value=config[group]?.[key];
   if(typeof value!=='number'||!Number.isFinite(value)||value<range[0]||value>range[1])
    throw Error('physicsTuning.'+name+' outside ['+range.join(', ')+']');
   (result[group]??={})[key]=value;
  }
  if(result.keeperDiveRecovery.minSeconds>result.keeperDiveRecovery.baseSeconds||
     result.keeperDiveRecovery.maxSeconds<result.keeperDiveRecovery.baseSeconds)
   throw Error('physicsTuning.keeperDiveRecovery: min <= base <= max required');
  if(result.passSpeed.max<result.passSpeed.base)throw Error('physicsTuning.passSpeed.max must be >= base');
  return Object.freeze(Object.fromEntries(Object.entries(result).map(([k,v])=>[k,Object.freeze(v)])));
 }
 function passLaunchSpeed(quality,longScale,settings){
  const p=settings.passSpeed;
  return Math.min(p.max,(p.base+quality*p.qualityMultiplier)*longScale);
 }
 function keeperDiveCooldown(skill,diving,fatigue,settings){
  const p=settings.keeperDiveRecovery;
  return Math.min(p.maxSeconds,Math.max(p.minSeconds,p.baseSeconds+
   (p.referenceSkill-skill)*p.skillCoefficient+
   (p.referenceSkill-diving)*p.divingCoefficient+fatigue*p.fatigueCoefficient));
 }
 return {BOUNDS,validatePhysicsTuning,passLaunchSpeed,keeperDiveCooldown};
})();
export {PHYSICSBALANCE};
