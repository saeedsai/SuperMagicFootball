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
 // VIZ-03: retain a direction briefly at atlas boundaries to prevent a player
 // flickering between profile and quarter/front/back art while steering.
 // Only visual headings are affected; movement, collisions and tackle aim are not.
 function stableFacingView(dx=0,dy=0,face=1,previous=null){
  const current=facingView(dx,dy,face),length=Math.hypot(dx,dy);
  if(!previous||!['front','back','side','quarterFront','quarterBack'].includes(previous.kind)||!Number.isFinite(length)||length<.14)return current;
  const x=dx/length,y=dy/length;
  // Do not alternate left/right quarter art on tiny near-vertical input noise.
  const side=Math.abs(x)<.10&&(previous.side===1||previous.side===-1)?previous.side:current.side;
  let kind=current.kind;
  if(previous.kind==='front'&&y>=.82)kind='front';
  else if(previous.kind==='back'&&y<=-.82)kind='back';
  else if(previous.kind==='side'&&Math.abs(y)<=.36)kind='side';
  else if(previous.kind==='quarterFront'&&y>=.26&&y<=.92)kind='quarterFront';
  else if(previous.kind==='quarterBack'&&y<=-.26&&y>=-.92)kind='quarterBack';
  return {kind,side};
 }
 // Resolve a stable compass heading for eight independent directional art frames.
 // This does not change the legacy {kind,side} renderer contract.
 function artHeading(dx=0,dy=0,face=1){
  if(!Number.isFinite(dx)||!Number.isFinite(dy))return face<0?'W':'E';
  const view=facingView(dx,dy,face);
  if(view.kind==='front')return 'S';
  if(view.kind==='back')return 'N';
  const east=view.side>=0;
  if(view.kind==='side')return east?'E':'W';
  if(view.kind==='quarterFront')return east?'SE':'SW';
  return east?'NE':'NW';
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
 return {BALL_MODELS,validBallModel,facingView,stableFacingView,artHeading,rollDelta,impactStun};
})();

// v0.8.25.12 balance rules are deliberately pure to support independent regression checks.

export {VISUALFEEL};
