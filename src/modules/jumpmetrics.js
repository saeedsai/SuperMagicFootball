// Shared, deterministic Jumping mechanics for match physics and Player Studio.
// A rating of 100 preserves the original 420/535 impulses and minimum Energy cost.
// No state, roster edits, random values or save schema changes.
const JUMPMETRICS=(()=>{
 function jumpMetrics(jumping){
  const n=Number(jumping);
  const rating=Number.isFinite(n)?Math.max(1,Math.min(100,Math.round(n))):1;
  const heightRatio=.30+.70*(rating-1)/99;
  const velocityRatio=Math.sqrt(heightRatio);
  return Object.freeze({
   rating,heightRatio,velocityRatio,
   energyCostMultiplier:1+(100-rating)/100,
   firstImpulse:420*velocityRatio,
   doubleImpulse:535*velocityRatio,
   initialLift:2*heightRatio,
   doubleLift:14*heightRatio
  });
 }
 return {jumpMetrics};
})();
export {JUMPMETRICS};
