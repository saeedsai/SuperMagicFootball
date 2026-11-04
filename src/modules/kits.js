// Supermagic Football v0.8.25.30 | KITS | independently editable module
const KITS=(()=>{// v0.6.3: original procedural home/away kit definitions, no external assets.
// Derivation is deterministic and does not overwrite source team identities or saved rosters.
const KIT_CHOICES = ['home','away'];
const isHex = s => /^#[\da-fA-F]{6}$/.test(String(s));
const rgb = s => [1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
const dist = (a,b) => Math.hypot(...rgb(a).map((x,i)=>x-rgb(b)[i]));
const brightness = s=>rgb(s).reduce((a,c,i)=>a+c*[.2126,.7152,.0722][i],0);
const luminance = s=>rgb(s).reduce((sum,value,i)=>{const c=value/255;return sum+[.2126,.7152,.0722][i]*(c<=.04045?c/12.92:((c+.055)/1.055)**2.4);},0);
const contrast = (a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
function kitFor(team,choice='home'){
 const primary=isHex(team.primary)?team.primary:'#297ea7';
 const secondary=isHex(team.secondary)?team.secondary:'#f3eee3';
 const trim=isHex(team.trim)?team.trim:'#253b54';
 if(choice!=='away')return {...team,primary,secondary,trim,kit:'home',kitLabel:'HOME'};
 // Away kit must be visually distinct from the club's source/home kit.
 const fallback=luminance(primary)>.4?'#162f47':'#f7f2df';
 const candidate=dist(primary,secondary)>112?secondary:fallback;
 // Prefer the club's secondary, but enforce enough light/dark separation for
 // player recognition in crowded play. Fall back deterministically if needed.
 const awayPrimary=contrast(primary,candidate)>=2?candidate:fallback;
 const awaySecondary=brightness(awayPrimary)>145?'#24334c':'#f7ebcf';
 return {...team,primary:awayPrimary,secondary:awaySecondary,trim:primary,kit:'away',kitLabel:'AWAY'};
}
const kitsFor=team=>KIT_CHOICES.map(c=>kitFor(team,c));
function matchContrast(homeTeam,awayTeam,choices=['home','away']){
 return contrast(kitFor(homeTeam,choices?.[0]).primary,kitFor(awayTeam,choices?.[1]).primary);
}
function bestContrastSelections(homeTeam,awayTeam,preferred=['home','away']){
 const current=[KIT_CHOICES.includes(preferred?.[0])?preferred[0]:'home',KIT_CHOICES.includes(preferred?.[1])?preferred[1]:'away'];
 const options=[];
 for(const homeChoice of KIT_CHOICES)for(const awayChoice of KIT_CHOICES){
  const choices=[homeChoice,awayChoice];
  options.push({choices,ratio:matchContrast(homeTeam,awayTeam,choices),changes:Number(homeChoice!==current[0])+Number(awayChoice!==current[1])});
 }
 options.sort((a,b)=>a.changes-b.changes||b.ratio-a.ratio||KIT_CHOICES.indexOf(a.choices[0])-KIT_CHOICES.indexOf(b.choices[0])||KIT_CHOICES.indexOf(a.choices[1])-KIT_CHOICES.indexOf(b.choices[1]));
 const best=options.find(option=>option.ratio>=2)||options[0];
 return {homeChoice:best.choices[0],awayChoice:best.choices[1],ratio:best.ratio,changed:best.changes>0};
}

return {KIT_CHOICES,kitFor,kitsFor,matchContrast,bestContrastSelections};})();

export {KITS};
