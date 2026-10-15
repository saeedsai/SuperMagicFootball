// Supermagic Football v0.8.25.30 | ABILITIES | independently editable module
import {SPECIALS} from "./specials.js";
import {GAME_ASSETS} from "../assets.js";
const ABILITIES=(()=>{const {abilityLevel,levelModifiers}=SPECIALS;
// v0.8.0 experimental arcade ability system. These animated mechanics are original.
// Ability identifiers in this file are intentionally not claims of Famicom frame parity.
const DEFENCE_MOVES=Object.freeze(GAME_ASSETS.mechanics.defensiveAbilities);
const KEEPER_MOVES=Object.freeze(GAME_ASSETS.mechanics.keeperAbilities);
function fieldAbility(player){const a=player?.superAbility;return a?.type==='defence' ? DEFENCE_MOVES[a.id]??null : null;}
function keeperAbility(player){const a=player?.gkSuperAbility;return a?.type==='defence' ? KEEPER_MOVES[a.id]??null : null;}
function abilityReady(player,ability){return !!(ability&&player&&player.stun<=0&&(player.abilityCd||0)<=0&&(player.fatigue||0)+ability.cost*levelModifiers(abilityLevel(player,player.keeper?'keeper':'defence')).fatigue<=.98);}
function keeperInReach(keeper,ball,move){return !!(keeper&&ball&&!ball.owner&&move&&ball.attacker!==keeper.t&&Math.abs(ball.x-keeper.x)<=move.reachX&&Math.abs(ball.y-keeper.y)<=move.reachY&&ball.z<=210);}

return {DEFENCE_MOVES,KEEPER_MOVES,fieldAbility,keeperAbility,abilityReady,keeperInReach};})();

export {ABILITIES};
