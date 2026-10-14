// Original, procedural club shields. Offline country flags use the ISO region emoji sequence;
// exact glyph appearance depends on operating-system emoji font. These are NOT licensed club crests.
const toTwo={ENG:'GB',SCO:'GB',WAL:'GB',GER:'DE',ESP:'ES',ITA:'IT',FRA:'FR',POR:'PT',NED:'NL',BEL:'BE',AUT:'AT',GRE:'GR',TUR:'TR',NOR:'NO',CZE:'CZ',SVK:'SK',AZE:'AZ',UKR:'UA',KSA:'SA',UAE:'AE',QAT:'QA',IRN:'IR',UZB:'UZ',IRQ:'IQ',JPN:'JP',KOR:'KR',THA:'TH',CHN:'CN',AUS:'AU',MAS:'MY',VNM:'VN',MAR:'MA',EGY:'EG',NGA:'NG',ZAM:'ZM',TAN:'TZ',ALG:'DZ',RSA:'ZA',SDN:'SD',COD:'CD',TUN:'TN',ANG:'AO',MLI:'ML',CAN:'CA',TRI:'TT',DOM:'DO',JAM:'JM',HON:'HN',GUA:'GT',CRC:'CR',PAN:'PA',USA:'US',MEX:'MX',BRA:'BR',ARG:'AR',URU:'UY',ECU:'EC',PAR:'PY',BOL:'BO',PER:'PE',COL:'CO',CHI:'CL',VEN:'VE',NZL:'NZ',SOL:'SB',TAH:'PF',NCL:'NC',FIJ:'FJ',PNG:'PG',VAN:'VU',COK:'CK',SWI:'CH',SWZ:'CH'};
export function countryCode(team){if(team.group==='bpw_worldcup')return null;const v=(team.flag||'').toUpperCase();return v.length===2?v:toTwo[v]||null}
export function countryFlag(team){const c=countryCode(team);return c&&/^[A-Z]{2}$/.test(c)?String.fromCodePoint(...[...c].map(x=>127397+x.charCodeAt(0))):'🌐'}
export function isClub(team){return team.group==='bpw_worldcup'||team.group==='club26'||team.group==='continental'||team.id?.startsWith('club_')}
// v0.8.10 cartoon identity system. No network, licensed brand art, or platform emoji rendering.
// Flags are simplified artistic interpretations of national flags, not official vector reproductions.
const safeColor=(value,fallback='#325a80')=>/^#[0-9a-f]{6}$/i.test(value||'')?value:fallback;
const xhash=value=>{let h=2166136261;for(const c of String(value||'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const F={
 JP:['#ffffff','#dc3545','disc'],KR:['#ffffff','#e44342','taegeuk'],CN:['#de342e','#f7d455','star'],
 FR:['#2153a6','#ffffff','#e14945','vertical'],IT:['#21965e','#ffffff','#db3e3e','vertical'],DE:['#202020','#d63338','#f3c044','horizontal'],
 ES:['#bd2b31','#f4c647','#bd2b31','horizontal'],PT:['#238c5a','#cf3740','split'],NL:['#bd3846','#ffffff','#3062ad','horizontal'],
 BE:['#222222','#e6c844','#ce3547','vertical'],AT:['#d63a3f','#ffffff','#d63a3f','horizontal'],PL:['#ffffff','#d84352','halfH'],
 CZ:['#ffffff','#cc394d','#2156a3','triangle'],SK:['#ffffff','#315cb1','#d13b45','horizontal'],SI:['#ffffff','#3363ac','#df4242','horizontal'],
 HR:['#c93545','#ffffff','#3158a0','horizontal'],HU:['#c33e48','#ffffff','#277b4a','horizontal'],RO:['#2858aa','#edbf43','#c63f3f','vertical'],
 GR:['#397cb6','#ffffff','stripes'],IE:['#228e58','#ffffff','#f2944c','vertical'],SE:['#2d6ba8','#ebc64c','cross'],
 NO:['#c93d50','#ffffff','#31598c','nordic'],FI:['#ffffff','#3465a1','cross'],DK:['#ce4146','#ffffff','cross'],
 CH:['#d54345','#ffffff','plus'],GB:['#244d86','#ffffff','#e64652','union'],
 TR:['#d83c44','#ffffff','crescent'],UA:['#3374b8','#eacb54','halfH'],RU:['#ffffff','#2c64b2','#cf3e46','horizontal'],
 BR:['#25925e','#f4cb4b','#295da6','diamond'],AR:['#60b2de','#ffffff','#60b2de','horizontal'],UY:['#ffffff','#539fc7','stripes'],
 US:['#ffffff','#cb3a46','#284982','usa'],CA:['#d4434b','#ffffff','#d4434b','canada'],
 MX:['#248f60','#ffffff','#d54042','vertical'],CO:['#e3bf43','#325cb6','#c53a4d','horizontal'],
 CL:['#ffffff','#c83e43','#25649f','chile'],PE:['#ca4450','#ffffff','#ca4450','vertical'],PY:['#d4434b','#ffffff','#2d5ba3','horizontal'],
 EC:['#e7c64c','#3567aa','#c93e46','horizontal'],VE:['#e6bd3f','#3469ad','#c93c50','horizontal'],
 EG:['#c83e48','#ffffff','#282828','horizontal'],MA:['#be3441','#237545','star'],TN:['#cd3844','#ffffff','disc'],
 DZ:['#288d61','#ffffff','#c93c49','vertical'],NG:['#288a59','#ffffff','#288a59','vertical'],
 SN:['#308c57','#ecc54c','#cb4045','vertical'],CM:['#238955','#c93b42','#f0c44c','vertical'],
 ZA:['#d84a47','#ffffff','#2459ac','horizontal'],GH:['#d34148','#f1cd50','#2b8c56','horizontal'],
 CI:['#ec934c','#ffffff','#258c5c','vertical'],KE:['#252525','#c63e4b','#2e915e','horizontal'],
 AU:['#25528d','#ffffff','#e64d52','stars'],NZ:['#275491','#ffffff','#d74752','stars'],
 IR:['#25935f','#ffffff','#d84648','horizontal'],IQ:['#d4434b','#ffffff','#262626','horizontal'],
 SA:['#228d57','#ffffff','star'],AE:['#329365','#ffffff','#202020','horizontal'],
 QA:['#8f3853','#ffffff','split'],IN:['#e9914d','#ffffff','#319a65','horizontal'],
 PK:['#267650','#ffffff','crescent'],ID:['#d8494b','#ffffff','halfH'],TH:['#c64349','#ffffff','#305a9b','horizontal'],
 VN:['#cd3d45','#ecc944','star'],MY:['#d34149','#ffffff','#214f8b','usa'],
};
function flagInner(rawCode){
 const code=String(rawCode||'').toUpperCase();
 const d=F[code], fallback=xhash(code),palette=['#295c9f','#db444a','#f3cd58','#37946b','#f7f5e8'];
 const vals=d||[palette[fallback%5],palette[(fallback>>>5)%5],palette[(fallback>>>11)%5],'vertical'];
 const mode=vals[vals.length-1],colors=vals.slice(0,-1),a=colors[0],b=colors[1],c=colors[2]||colors[0];
 let shapes='';
 const h=(u,v,w)=>`<rect x="0" y="${u}" width="80" height="${w}" fill="${v}"/>`;
 const v=(u,z,w)=>`<rect x="${u}" y="0" width="${w}" height="52" fill="${z}"/>`;
 if(mode==='vertical')shapes=v(0,a,27)+v(27,b,26)+v(53,c,27);
 else if(mode==='horizontal')shapes=h(0,a,17.34)+h(17.34,b,17.33)+h(34.67,c,17.33);
 else if(mode==='halfH')shapes=h(0,a,26)+h(26,b,26);
 else if(mode==='split')shapes=v(0,a,32)+v(32,b,48)+`<circle cx="32" cy="26" r="11" fill="#eecf71" stroke="#fff2b5" stroke-width="2"/>`;
 else if(mode==='cross'||mode==='nordic')shapes=`<rect width="80" height="52" fill="${a}"/><rect x="24" width="${mode==='nordic'?15:12}" height="52" fill="${b}"/><rect y="21" width="80" height="${mode==='nordic'?14:11}" fill="${b}"/>${mode==='nordic'?'<path d="M29 0 V52 M0 26 H80" stroke="#244b84" stroke-width="6"/>':''}`;
 else if(mode==='plus')shapes=`<rect width="80" height="52" fill="${a}"/><path d="M33 10 H47 V20 H57 V32 H47 V42 H33 V32 H23 V20 H33Z" fill="${b}"/>`;
 else if(mode==='disc')shapes=`<rect width="80" height="52" fill="${a}"/><circle cx="40" cy="26" r="14" fill="${b}"/>`;
 else if(mode==='diamond')shapes=`<rect width="80" height="52" fill="${a}"/><path d="M40 5 L72 26 L40 47 L8 26Z" fill="${b}"/><circle cx="40" cy="26" r="11" fill="${c}"/><path d="M27 26 Q40 17 54 27" fill="none" stroke="#f6f2de" stroke-width="3"/>`;
 else if(mode==='star')shapes=`<rect width="80" height="52" fill="${a}"/><path d="M40 9 L44.5 21 L57 21 L47 29 L51 41 L40 34 L29 41 L33 29 L23 21 L35.5 21Z" fill="${b}"/>`;
 else if(mode==='crescent')shapes=`<rect width="80" height="52" fill="${a}"/><circle cx="36" cy="26" r="15" fill="${b}"/><circle cx="42" cy="22" r="12.5" fill="${a}"/><circle cx="55" cy="25" r="3" fill="${b}"/>`;
 else if(mode==='canada')shapes=v(0,a,20)+v(20,b,40)+v(60,c,20)+`<path d="M40 12 L44 19 L50 16 L47 25 L53 27 L44 32 L44 41 L39 41 L39 32 L28 26 L34 25 L31 16 L37 19Z" fill="${a}"/>`;
 else if(mode==='usa'||mode==='stars'){
   shapes=mode==='usa'?`<rect width="80" height="52" fill="${a}"/>${Array.from({length:5},(_,i)=>h(i*10.4,b,5.2)).join('')}<rect width="34" height="29" fill="${c}"/>`:`<rect width="80" height="52" fill="${a}"/>`;
   shapes+=Array.from({length:5},(_,i)=>`<circle cx="${mode==='usa'?7+(i%3)*10:20+i*11}" cy="${mode==='usa'?8+Math.floor(i/3)*11:12+(i%2)*23}" r="${mode==='usa'?2.5:3}" fill="${mode==='usa'?'#fff':'#ebdfbe'}"/>`).join('');
 } else if(mode==='union')shapes=`<rect width="80" height="52" fill="${a}"/><path d="M0 0 L80 52 M80 0 L0 52" stroke="${b}" stroke-width="11"/><path d="M0 0 L80 52 M80 0 L0 52" stroke="${c}" stroke-width="5"/><path d="M40 0 V52 M0 26 H80" stroke="${b}" stroke-width="17"/><path d="M40 0 V52 M0 26 H80" stroke="${c}" stroke-width="9"/>`;
 else if(mode==='taegeuk')shapes=`<rect width="80" height="52" fill="${a}"/><path d="M40 11 A15 15 0 0 1 40 41 A7.5 7.5 0 0 0 40 26 A7.5 7.5 0 0 1 40 11Z" fill="#cb3d49"/><path d="M40 11 A15 15 0 0 0 40 41 A7.5 7.5 0 0 1 40 26 A7.5 7.5 0 0 0 40 11Z" fill="#295ba1"/>`;
 else if(mode==='triangle')shapes=h(0,a,26)+h(26,b,26)+`<path d="M0 0 L35 26 L0 52Z" fill="${c}"/>`;
 else if(mode==='chile')shapes=h(0,a,26)+h(26,b,26)+v(0,c,28)+`<circle cx="14" cy="13" r="5" fill="#fff"/>`;
 else if(mode==='stripes')shapes=`<rect width="80" height="52" fill="${a}"/>${Array.from({length:4},(_,i)=>h(i*13+6,b,6)).join('')}`;
 else shapes=h(0,a,26)+h(26,b,26);
 return shapes;
}
export function cartoonFlagSVG(team){
 const original=String(team.flag||'').toUpperCase();
 const code=original==='ENG'?'ENG':original==='SCO'?'SCO':countryCode(team);
 const special=original==='ENG'?'<rect width="80" height="52" fill="#fff"/><path d="M40 0 V52 M0 26 H80" stroke="#cd3546" stroke-width="10"/>':original==='SCO'?'<rect width="80" height="52" fill="#3266ac"/><path d="M0 0 L80 52 M80 0 L0 52" stroke="#fff" stroke-width="11"/>':null;
 const unknown=!code||(!F[code]&&original.length>3);
 let pattern=unknown?`<rect width="80" height="52" fill="${safeColor(team.primary,'#194a69')}"/><path d="M0 15 Q40 8 80 15 V36 Q40 43 0 36Z" fill="${safeColor(team.trim,'#f1d98e')}"/><path d="M29 13 L40 8 L51 13 V29 L40 38 L29 29Z" fill="${safeColor(team.secondary,'#f1f1e9')}" stroke="#11293b" stroke-width="2"/>`:(special||flagInner(code));
 return `<svg class="cartoonFlagSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 88 60" aria-hidden="true" focusable="false"><g transform="translate(4 4)">${pattern}<path d="M0 0 Q20 5 40 0 Q60 5 80 0 V10 Q55 18 35 12 Q15 10 0 14Z" fill="#fff" opacity=".10"/></g><rect x="4" y="4" width="80" height="52" rx="7" fill="none" stroke="#fff2ce" stroke-width="2"/><path d="M4 6 Q44 9 84 6" fill="none" stroke="#fff" stroke-width="1" opacity=".35"/></svg>`;
}
export function crestText(team){return (team.name||'FC').replace(/[^\p{L}\p{N} ]/gu,' ').trim().split(/\s+/).filter(Boolean).map(w=>w[0]).join('').slice(0,3).toUpperCase()}
export function crestSVG(team){
 const seed=xhash(team.id||team.name),shape=seed%5;
 const c=safeColor(team.primary,'#244d69'),edge=safeColor(team.trim,'#fbe5ab');
 const accent=safeColor(team.secondary,'#faf1d4'),letter=crestText(team),metal=['#f3d37d','#e7f4ff','#fce8ba'][seed%3];
 const outlines=['M40 5 L75 17 L71 64 Q67 82 40 92 Q13 82 9 64 L5 17Z','M11 7 H69 L76 38 L63 78 L40 93 L17 78 L4 38Z','M40 3 L71 17 L78 44 L66 76 L40 94 L14 76 L2 44 L9 17Z','M40 4 C58 4 76 13 76 34 V66 Q59 87 40 94 Q21 87 4 66 V34 C4 13 22 4 40 4Z','M5 9 H75 L69 70 L40 94 L11 70Z'];
 const mark=shape===0?`<path d="M16 30 H64" stroke="${accent}" stroke-width="5" opacity=".75"/>`:shape===1?`<path d="M22 18 V71 M58 18 V71" stroke="${accent}" stroke-width="8" opacity=".3"/>`:shape===2?`<path d="M15 25 L65 66" stroke="${accent}" stroke-width="8" opacity=".25"/>`:shape===3?`<circle cx="40" cy="49" r="25" fill="none" stroke="${accent}" stroke-width="4" opacity=".45"/>`:`<path d="M12 43 H68" stroke="${accent}" stroke-width="10" opacity=".3"/>`;
 const jewel=seed%4===0?'✦':seed%4===1?'★':seed%4===2?'◆':'●';
 return `<svg class="cartoonCrestSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100" aria-hidden="true" focusable="false"><path d="${outlines[shape]}" fill="${c}" stroke="${edge}" stroke-width="6" stroke-linejoin="round"/><path d="${outlines[shape]}" fill="none" stroke="${metal}" stroke-width="2" stroke-linejoin="round"/>${mark}<path d="M23 28 L40 22 L57 28" fill="none" stroke="${metal}" stroke-width="3"/><text x="40" y="55" font-size="20" font-family="Arial,sans-serif" font-weight="900" text-anchor="middle" fill="#fffdf0" stroke="#112435" stroke-width=".7" paint-order="stroke">${letter}</text><text x="40" y="76" font-size="15" text-anchor="middle" fill="${metal}">${jewel}</text></svg>`;
}
export function teamIdentity(team,large=false){
 const safeName=String(team.name||'Team').replace(/[&<>"']/g,'');
 const flag=`<span class="flagGraphic" title="Stylized national flag">${cartoonFlagSVG(team)}</span>`;
 const badge=isClub(team)?`<span class="crestGraphic">${crestSVG(team)}</span>`:'';
 return `<span class="teamIdentity ${large?'identityLarge':''}" role="img" aria-label="${safeName} ${isClub(team)?'original club badge and stylized flag':'stylized flag'}" title="${isClub(team)?'Original generated club emblem':'Stylized national colors'}">${badge}${flag}</span>`;
}
