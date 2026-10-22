// Shared, deterministic inline SVG badges for Player Studio and team/player statistics.
// Visual-only: never writes gameplay stats, save fields, or adds action buttons.
const SHOT_ICONS=Object.freeze({nuts:['🥜','#aa713f'],ninja:['🥷','#a33ee8'],wheel:['⚙️','#26b8ff'],mole:['🪨','#a57945'],cannon:['💥','#ff883d'],mega:['🌟','#ffe15d'],ghost:['👻','#94cfff'],target:['🎯','#ef5666'],books:['📚','#ac79fb'],fish:['🐟','#4bcfdd'],banana:['🍌','#ffdc35'],omega:['Ω','#ac9eff'],tiger:['🐯','#ff8d24'],elephant:['🐘','#9eaad4'],horse:['🐎','#c99a70'],lion:['🦁','#fabb44'],bird:['🐦','#58c5ff'],serpent:['🐍','#71d973'],piranha:['🦈','#52baff'],cactus:['🌵','#78c44c'],comet:['☄️','#ff6c50'],eagle:['🦅','#d6ae64'],tornado:['🌪️','#7fd9ef']});
const DEFENCE_ICONS=Object.freeze({drill:['🔩','#48b7fb'],burst:['💢','#ffac44'],spinBumper:['🌀','#74ef82']});
const TRICK_ICONS=Object.freeze({banana:['🍌','#f4cf34'],ice:['🧊','#7ae4ff'],bat:['🏏','#ff6b57'],fireball:['🔥','#ff8647'],freeze:['❄️','#88d9ff'],scream:['📣','#cb86ff'],hideBall:['🎩','#af8eff'],teleport:['🌀','#b17bff']});
const DRIBBLE_ICONS=Object.freeze({sideStep:['↪','#44d3ac'],roulette:['🔄','#ffca58'],elastico:['↔','#6be988'],rainbow:['🌈','#d48aff'],swerve:['〰','#61b8ff'],dragBack:['↩','#ffb36b'],heelFlick:['⤴','#ec8cf0'],stepovers:['♾','#54dceb'],nutmeg:['🥅','#b5da75'],lightningCut:['⚡','#ffe173']});
const CATALOGUES=Object.freeze({shot:SHOT_ICONS,defence:DEFENCE_ICONS,trick:TRICK_ICONS,dribble:DRIBBLE_ICONS});
const escapeMarkup=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function icon(type,id,label=''){
 const item=CATALOGUES[type]?.[id];
 if(!item)return '<span class="abilityGlyph abilityGlyphEmpty" aria-label="Not equipped" title="Not equipped">—</span>';
 const [mark,color]=item,ball=type==='shot';
 const name=escapeMarkup(label||id),title=escapeMarkup(type+' · '+(label||id));
 const lines=ball?`<circle cx="29" cy="31" r="17" fill="#fafbff" stroke="#152846" stroke-width="2"/><path d="M29 22l8 5-3 9h-10l-3-9z" fill="#152846"/><path d="M29 14v8m17 9-9-4m-19 1-7 6m12 13 2-11m9 0 7 10" stroke="#152846" stroke-width="2" fill="none"/>`:`<circle cx="29" cy="31" r="18" fill="#081c3a" stroke="#f8faff" stroke-width="1.5"/>`;
 return `<span class="abilityGlyph abilityGlyph-${type}" title="${title}" role="img" aria-label="${title}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="44" height="44" aria-hidden="true" focusable="false"><rect x="1" y="1" width="62" height="62" rx="13" fill="#0c1d35" stroke="${color}" stroke-width="2.4"/><circle cx="30" cy="30" r="24" fill="${color}" opacity=".22"/>${lines}<text x="${ball?43:31}" y="${ball?52:43}" text-anchor="middle" font-size="${ball?23:28}" fill="white" stroke="#111c32" stroke-width=".65" paint-order="stroke fill">${escapeMarkup(mark)}</text></svg></span>`;
}
function summary(player,shots,defences,dribbles,tricks){
 const p=player||{},shot=p.superAbility?.type==='shoot'&&p.shot&&shots[p.shot]?p.shot:null;
 const defence=p.superAbility?.type==='defence'&&defences[p.superAbility.id]?p.superAbility.id:null;
 const trick=tricks.some(x=>x.id===p.magicTrick)?p.magicTrick:null;
 const dribble=p.role==='GK'?null:dribbles.find(x=>x.id===p.dribbleType)?.id||dribbles[0]?.id;
 const sections=[['shot',shot,shots[shot]?.name||'None'],['defence',defence,defences[defence]?.name||'None'],['trick',trick,tricks.find(x=>x.id===trick)?.name||'None (planned)'],['dribble',dribble,dribbles.find(x=>x.id===dribble)?.name||'None']];
 return '<div class="abilitySummary" aria-label="Player abilities">'+sections.map(([type,id,name])=>'<span class="abilitySummaryEntry">'+icon(type,id,name)+'<span><strong>'+({shot:'SUPER SHOT',defence:'SUPER DEFENCE',trick:'TRICK',dribble:'DRIBBLE STYLE'}[type])+'</strong><small>'+escapeMarkup(name)+'</small></span></span>').join('')+'</div>';
}
const ABILITY_ICONS=Object.freeze({icon,summary,SHOT_ICONS,DEFENCE_ICONS,TRICK_ICONS,DRIBBLE_ICONS});
export {ABILITY_ICONS};
