import {GAME_ASSETS} from "../assets.js";
// Supermagic Football v0.8.25.30 | VISUALFEEL | independently editable module
const VISUALFEEL=(()=>{
 const BALL_MODELS=Object.freeze(GAME_ASSETS.mechanics.ballModels);
 const validBallModel=id=>BALL_MODELS.some(m=>m.id===id)?id:'classic';
 // World coordinates: negative Y is moving away from the camera; positive Y is towards us.
 function facingView(dx=0,dy=0,face=1){
  const length=Math.hypot(dx,dy);
  if(length<.14)return {kind:'side',side:face>=0?1:-1};
  const x=dx/length,y=dy/length,side=x<-.05?-1:x>.05?1:(face<0?-1:1);
  // Eight-direction atlas: true profile, frontal, rear and both oblique directions.
  // World positive y approaches camera; no diagonal snapping to flat side sprites.
  if(y>=.87)return {kind:'front',side};
  if(y<=-.87)return {kind:'back',side};
  if(Math.abs(y)<=.31)return {kind:'side',side};
  return {kind:y>0?'quarterFront':'quarterBack',side};
 }
 // World-space travelled distance: one radius of travel is one radian of rolling.
 function rollDelta(dx,dy,radius=15){return Math.hypot(dx,dy)/Math.max(1,radius);}
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 // Severity values are arcade units; strength is the victim's actual STRENGTH (1-100).
 function impactStun(kind,power,strength){
  const resistance=clamp(Number(strength)||50,1,100);
  const amount=clamp(Number(power)||0,0,250);
  const profile={slide:[.48,.014,3.1],tackle:[.32,.010,2.5],super:[.8,.023,4.3],lightning:[1.25,.020,3.9],defence:[.65,.019,3.5],aerial:[.44,.013,2.9],collision:[.1,.005,1.4],ordinaryShot:[.28,.011,1.9]};
  const [base,factor,limit]=profile[kind]||profile.collision;
  return clamp((base+amount*factor)*(1.42-resistance*.0064),.12,limit);
 }
 return {BALL_MODELS,validBallModel,facingView,rollDelta,impactStun};
})();

// v0.8.25.12 balance rules are deliberately pure to support independent regression checks.

export {VISUALFEEL};
