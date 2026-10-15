// Supermagic Football v0.8.25.30 | SHOTFEEL | independently editable module
import {AI} from "./ai.js";
const SHOTFEEL=(()=>{
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function launchPower(power,fatigue=0,superShot=false){
  const rating=clamp(Number(power)||50,1,100),tired=clamp(Number(fatigue)||0,0,1);
  return (superShot?1.15:1.19)*(.72+rating*.005)*(.99-.32*tired);
 }
 function flightDrag(dt=1/60,superShot=false){return Math.pow(superShot?.997:.995,Math.max(0,dt)*60);}
 function impactFactor(distance=0,superShot=false){return clamp(1-Math.max(0,distance)/(superShot?1950:1450),superShot?.33:.21,1);}
 function contactEnergy(power,speed,distance,superShot=false){return (Math.max(0,power)+Math.max(0,speed)/45)*impactFactor(distance,superShot);}
 function lanePreference(shooterX,shooterY,goalX,goalY,keeper,accuracy=65){
  const gap=keeper?Math.abs(goalY-keeper.y):145;
  const path=keeper?Math.abs((shooterY+(goalY-shooterY)*clamp((keeper.x-shooterX)/(goalX-shooterX||1),0,1))-keeper.y):145;
  return gap*.42+path*(.45+clamp(accuracy/100,0,1)*.6);
 }
 // Only strong, plausible positions justify an early AI shot over a safety pass.
 // Intent is better shot creation, not more speculative shots from midfield.
 function aiFinishingPriority(distance,nearestDefender,accuracy,baseRate){
  const d=Math.max(0,Number(distance)||0),pressure=Math.max(0,Number(nearestDefender)||0);
  if(d>710)return 0;
  const near=clamp((710-d)/540,0,1),quality=clamp((Number(accuracy)||50)/100,0,1);
  const congestion=pressure<85?.62:pressure<145?.82:1;
  return clamp((.12+near*.51+quality*.18)*congestion*(.72+clamp(Number(baseRate)||0,0,1)),.04,.90);
 }
 function teammateInDirection(from,mates,vector,maxDistance=1300){
  const m=Math.hypot(vector?.x||0,vector?.y||0);if(m<.16)return null;
  const hx=vector.x/m,hy=vector.y/m;
  return mates.map(q=>{const dx=q.x-from.x,dy=q.y-from.y,d=Math.hypot(dx,dy)||1;
   return {q,d,alignment:(dx*hx+dy*hy)/d};
  }).filter(v=>v.d>28&&v.d<maxDistance&&v.alignment>=.77)
    .sort((a,b)=>b.alignment-a.alignment||a.d-b.d)[0]?.q||null;
 }
 return {launchPower,flightDrag,impactFactor,contactEnergy,lanePreference,aiFinishingPriority,teammateInDirection};
})();

export {SHOTFEEL};
