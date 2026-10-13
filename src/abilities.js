import {abilityLevel,levelModifiers} from './special_levels.js';
// v0.8.0 experimental arcade ability system. These animated mechanics are original.
// Ability identifiers in this file are intentionally not claims of Famicom frame parity.
export const DEFENCE_MOVES = Object.freeze({
 drill: Object.freeze({id:'drill',name:'DRILL ATTACK',cooldown:7.5,cost:.055,range:170,radius:46,stun:1.1,color:'#ffde76'}),
 burst: Object.freeze({id:'burst',name:'SHOCK BURST',cooldown:9,cost:.075,range:0,radius:126,stun:.8,color:'#a7fff0'}),
});
export const KEEPER_MOVES = Object.freeze({
 megaPalm: Object.freeze({id:'megaPalm',name:'MEGA PALM',cooldown:9,cost:.065,reachX:220,reachY:130,power:760,color:'#90f5ff'}),
 tornadoPunch: Object.freeze({id:'tornadoPunch',name:'TORNADO PUNCH',cooldown:11,cost:.085,reachX:260,reachY:160,power:910,color:'#fbd788'}),
});
export function fieldAbility(player){const a=player?.superAbility;return a?.type==='defence' ? DEFENCE_MOVES[a.id]??null : null;}
export function keeperAbility(player){const a=player?.gkSuperAbility;return a?.type==='defence' ? KEEPER_MOVES[a.id]??null : null;}
export function abilityReady(player,ability){return !!(ability&&player&&player.stun<=0&&(player.abilityCd||0)<=0&&(player.fatigue||0)+ability.cost*levelModifiers(abilityLevel(player,player.keeper?'keeper':'defence')).fatigue<=.98);}
export function keeperInReach(keeper,ball,move){return !!(keeper&&ball&&!ball.owner&&move&&ball.attacker!==keeper.t&&Math.abs(ball.x-keeper.x)<=move.reachX&&Math.abs(ball.y-keeper.y)<=move.reachY&&ball.z<=210);}
