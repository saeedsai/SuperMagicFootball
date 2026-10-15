// Supermagic Football v0.8.25.30 | KITS | independently editable module
const KITS=(()=>{// v0.6.3: original procedural home/away kit definitions, no external assets.
// Derivation is deterministic and does not overwrite source team identities or saved rosters.
const KIT_CHOICES = ['home','away'];
const isHex = s => /^#[\da-fA-F]{6}$/.test(String(s));
const rgb = s => [1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
const dist = (a,b) => Math.hypot(...rgb(a).map((x,i)=>x-rgb(b)[i]));
const brightness = s=>rgb(s).reduce((a,c,i)=>a+c*[.2126,.7152,.0722][i],0);
function kitFor(team,choice='home'){
 const primary=isHex(team.primary)?team.primary:'#297ea7';
 const secondary=isHex(team.secondary)?team.secondary:'#f3eee3';
 const trim=isHex(team.trim)?team.trim:'#253b54';
 if(choice!=='away')return {...team,primary,secondary,trim,kit:'home',kitLabel:'HOME'};
 // Away kit must be visually distinct from the club's source/home kit.
 const fallback=brightness(primary)>132?'#162f47':'#f7f2df';
 const awayPrimary=dist(primary,secondary)>112?secondary:fallback;
 const awaySecondary=brightness(awayPrimary)>145?'#24334c':'#f7ebcf';
 return {...team,primary:awayPrimary,secondary:awaySecondary,trim:primary,kit:'away',kitLabel:'AWAY'};
}
const kitsFor=team=>KIT_CHOICES.map(c=>kitFor(team,c));

return {KIT_CHOICES,kitFor,kitsFor};})();

export {KITS};
