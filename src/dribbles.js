// v0.8.7: ten gameplay-distinct dribble archetypes. Original remake moves.
// Stable identity selection is based on the person's name, so club/national versions
// use the same style. An explicit, valid roster dribbleType always takes precedence.
export const DRIBBLE_STYLES = Object.freeze([
 {id:'sideStep', name:'Side Step', forward:24, lateral:43, turn:0, evade:.27, stamina:1.00, cooldown:1.45, guard:.19, color:'#7beed3'},
 {id:'roulette', name:'Roulette', forward:6, lateral:55, turn:0, evade:.48, stamina:1.21, cooldown:2.05, guard:.32, color:'#a9a3ff'},
 {id:'elastico', name:'Elastico', forward:37, lateral:39, turn:0, evade:.36, stamina:1.18, cooldown:1.80, guard:.25, color:'#f1c5ff'},
 {id:'rainbow', name:'Rainbow Flick', forward:32, lateral:15, turn:0, evade:.35, stamina:1.52, cooldown:2.40, guard:.25, color:'#ffe18e', loft:48},
 {id:'swerve', name:'Body Swerve', forward:43, lateral:22, turn:0, evade:.20, stamina:.90, cooldown:1.35, guard:.15, color:'#f7b6a6'},
 {id:'dragBack', name:'Drag Back', forward:-31, lateral:35, turn:-1, evade:.38, stamina:1.05, cooldown:1.70, guard:.27, color:'#9adfff'},
 {id:'heelFlick', name:'Heel Flick', forward:39, lateral:9, turn:0, evade:.17, stamina:1.08, cooldown:1.40, guard:.18, color:'#f6d998', loft:23},
 {id:'stepovers', name:'Stepovers', forward:17, lateral:33, turn:0, evade:.44, stamina:1.13, cooldown:1.85, guard:.33, color:'#fbabed'},
 {id:'nutmeg', name:'Nutmeg', forward:57, lateral:0, turn:0, evade:.12, stamina:1.32, cooldown:2.25, guard:.13, color:'#ffbe70', nutmeg:true},
 {id:'lightningCut', name:'Lightning Cut', forward:59, lateral:42, turn:0, evade:.25, stamina:1.50, cooldown:2.30, guard:.21, color:'#a8faff'}
]);
const LOOKUP=new Map(DRIBBLE_STYLES.map(s=>[s.id,s]));
export const dribbleStyle=(id)=>LOOKUP.get(id)||DRIBBLE_STYLES[0];
function stableHash(value){let n=2166136261;for(const c of String(value).normalize('NFKD').toLowerCase())n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n>>>0;}
export function assignedDribbleType(player){
 if(LOOKUP.has(player?.dribbleType))return player.dribbleType;
 // Names, not roster indices: a famous player's trick identity is stable.
 return DRIBBLE_STYLES[stableHash(player?.name||player?.id||'rookie')%DRIBBLE_STYLES.length].id;
}
export function dribbleOdds(p,defender,style){
 const offense=(p.dribbling*.57+p.agility*.43)*(1-(p.fatigue||0)*.28);
 const defense=defender.defence*.67+defender.aggression*.33;
 return Math.max(.12,Math.min(.95,.47+(offense-defense)/155+style.evade*.29));
}
