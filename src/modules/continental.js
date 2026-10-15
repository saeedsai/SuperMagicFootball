import {GAME_ASSETS} from "../assets.js";
// Supermagic Football v0.8.25.30 | CONTINENTAL | independently editable module
const CONTINENTAL=(()=>{// 2026-10-13 verified continental participants; identity and roster are separate.
// Africa uses verified 2025/26 group stage because 2026/27 group stage not confirmed yet.
// Participants are REAL clubs; generated youth prospects (where needed) are explicitly fictional.
// Different calendar years follow each confederation's actual competition season.
const CONTINENTS=GAME_ASSETS.confederations;
const COUNTRY={
 'AEK Athens':'GRE','Arsenal':'ENG','Aston Villa':'ENG','Atlético Madrid':'ESP','Barcelona':'ESP','Bayern Munich':'GER','Bodø/Glimt':'NOR','Borussia Dortmund':'GER','Club Brugge':'BEL','Como':'ITA','Fenerbahçe':'TUR','Feyenoord':'NED','Galatasaray':'TUR','Inter Milan':'ITA','LASK':'AUT','RB Leipzig':'GER','Lens':'FRA','Lille':'FRA','Liverpool':'ENG','Manchester City':'ENG','Manchester United':'ENG','Napoli':'ITA','Paris Saint-Germain':'FRA','Porto':'POR','PSV Eindhoven':'NED','Real Betis':'ESP','Real Madrid':'ESP','Roma':'ITA','Sabah FK':'AZE','Shakhtar Donetsk':'UKR','Slavia Prague':'CZE','Slovan Bratislava':'SVK','Sporting CP':'POR','VfB Stuttgart':'GER','Viking FK':'NOR','Villarreal':'ESP',
 'Al Ahli Saudi':'KSA','Al Nassr':'KSA','Al Hilal':'KSA','Al Qadsiah':'KSA','Al Ain':'UAE','Shabab Al Ahli':'UAE','Al Wasl':'UAE','Al Sadd':'QAT','Al Gharafa':'QAT','Al Shamal':'QAT','Esteghlal':'IRN','Tractor SC':'IRN','Neftchi Fergana':'UZB','Al Quwa Al Jawiya':'IRQ','Al Ittihad':'KSA','Pakhtakor':'UZB','Kashima Antlers':'JPN','Vissel Kobe':'JPN','Kashiwa Reysol':'JPN','Kyoto Sanga':'JPN','Jeonbuk Hyundai Motors':'KOR','Daejeon Hana Citizen':'KOR','Pohang Steelers':'KOR','Buriram United':'THA','Port FC':'THA','Ratchaburi':'THA','Shanghai Port':'CHN','Beijing Guoan':'CHN','Newcastle Jets':'AUS','Johor Darul Ta\'zim':'MAS','Gamba Osaka':'JPN','Công An Hà Nội':'VNM',
 'RS Berkane':'MAR','Pyramids FC':'EGY','Rivers United':'NGA','Power Dynamos':'ZAM','Al Ahly':'EGY','Young Africans':'TAN','AS FAR Rabat':'MAR','JS Kabylie':'ALG','Mamelodi Sundowns':'RSA','Al Hilal Omdurman':'SDN','MC Alger':'ALG','Saint Éloi Lupopo':'COD','Espérance de Tunis':'TUN','Simba SC':'TAN','Petro de Luanda':'ANG','Stade Malien':'MLI',
 'Vancouver FC':'CAN','Defence Force FC':'TRI','O&M FC':'DOM','Mount Pleasant FA':'JAM','Club Olimpia':'HON','Xelajú MC':'GUA','Cartaginés':'CRC','Alajuelense':'CRC','Real España':'HON','Sporting San Miguelito':'PAN','Atlético Ottawa':'CAN','Forge FC':'CAN','LA Galaxy':'USA','Seattle Sounders':'USA','Monterrey':'MEX','Club América':'MEX','Cruz Azul':'MEX','Toluca':'MEX','Pumas UNAM':'MEX','Tigres UANL':'MEX','FC Cincinnati':'USA','Inter Miami':'USA','Los Angeles FC':'USA','Philadelphia Union':'USA','San Diego FC':'USA','Vancouver Whitecaps':'CAN','Nashville SC':'USA',
 'Flamengo':'BRA','Palmeiras':'BRA','Boca Juniors':'ARG','Peñarol':'URU','Nacional':'URU','Liga de Quito':'ECU','Fluminense':'BRA','Independiente del Valle':'ECU','Lanús':'ARG','Libertad':'PAR','Estudiantes de La Plata':'ARG','Cerro Porteño':'PAR','Corinthians':'BRA','Bolívar':'BOL','Cruzeiro':'BRA','Universitario':'PER','Junior Barranquilla':'COL','Universidad Católica':'CHI','Rosario Central':'ARG','Independiente Santa Fe':'COL','Always Ready':'BOL','Coquimbo Unido':'CHI','Deportivo La Guaira':'VEN','Cusco FC':'PER','Universidad Central':'VEN','Platense':'ARG','Independiente Rivadavia':'ARG','Mirassol':'BRA','Independiente Medellín':'COL','Deportes Tolima':'COL','Sporting Cristal':'PER','Barcelona SC':'ECU',
 'Auckland City':'NZL','Central Coast FC':'SOL','AS Vénus':'TAH','AS Tiga Sport':'NCL','Rewa FC':'FIJ','Lae City FC':'PNG','Galaxy FC':'VAN','Tupapa Maraerenga':'COK'};
const ALIASES={'Al Ahli Saudi':'Al Ahli Saudi','Espérance de Tunis':'Espérance de Tunis','Al Hilal Omdurman':'Al Hilal Omdurman','Inter Milan':'Inter Milan','Atlético Madrid':'Atlético Madrid','Barcelona':'Barcelona','Manchester City':'Manchester City','VfB Stuttgart':'VfB Stuttgart','RB Leipzig':'RB Leipzig','Bodø/Glimt':'Bodø/Glimt'};
const PALETTE=['#e2434b','#2b65bd','#e7ce4f','#3d9f66','#f7f4e2','#9b48bc','#1c424b','#e88833'];
const ROSTER_EXAMPLES={
 'Al Nassr':'Cristiano Ronaldo|Sadio Mané|João Félix|Kingsley Coman|Marcelo Brozović|Mohamed Simakan|Ângelo Gabriel|Aymeric Laporte|David Ospina',
 'Al Hilal':'Salem Al Dawsari|Sergej Milinković-Savić|Rúben Neves|Malcom|Kalidou Koulibaly|Yassine Bounou',
 'Inter Miami':'Lionel Messi|Luis Suárez|Rodrigo De Paul|Sergio Busquets|Jordi Alba',
 'Los Angeles FC':'Son Heung-min|Denis Bouanga|Hugo Lloris',
 'Al Ittihad':'Karim Benzema|N’Golo Kanté|Fabinho|Moussa Diaby',
 'Flamengo':'Agustín Rossi|Alex Sandro|Danilo Luiz|Léo Pereira|Lucas Paquetá|Nicolás de la Cruz|Giorgian de Arrascaeta|Jorge Carrascal',
 'Palmeiras':'Weverton|Gustavo Gómez|Raphael Veiga|José Manuel López',
 'Boca Juniors':'Edinson Cavani|Leandro Paredes|Miguel Merentiel',
 'Al Ahly':'Mohamed El Shenawy|Emam Ashour|Ahmed Sayed Zizo|Mohamed Hany',
 'Auckland City':'Angus Kilkolly|Cam Howieson|Gerard Garriga',
 'Galatasaray':'Victor Osimhen|Mauro Icardi|Lucas Torreira|Barış Alper Yılmaz',
 'Fenerbahçe':'Fred|Anderson Talisca|Ederson|Milan Škriniar',
 'PSV Eindhoven':'Joey Veerman|Ismael Saibari|Ivan Perišić',
 'Feyenoord':'Quinten Timber|Anis Hadj Moussa',
 'Shakhtar Donetsk':'Marlon Gomes|Pedrinho',
 'Villarreal':'Gerard Moreno|Santi Comesaña|Álex Baena'
};
const rankFor=(name,comp,index,featured)=>{
 const known={'Al Ahli Saudi':89,'Al Nassr':88,'Al Hilal':91,'Al Ittihad':85,'Kashima Antlers':84,'Al Ain':84,'Esteghlal':78,'Tractor SC':78,'Flamengo':91,'Palmeiras':91,'Boca Juniors':86,'Auckland City':79,'Al Ahly':87,'Mamelodi Sundowns':85,'Pyramids FC':86,'Inter Miami':86,'Cruz Azul':85,'Club América':85};
 return known[name]||Math.max(59,(comp==='UEFA'?79:comp==='AFC'?71:comp==='CAF'?68:comp==='CONMEBOL'?72:comp==='CONCACAF'?70:61)+(featured?8:0)-(index%5)*2);
};
function installContinentalClubs(teams,shots){
 const keys=Object.keys(shots),mapping={};const clubsByName=new Map(teams.filter(t=>t.group==='club26').map(t=>[t.name,t]));
 for(const confed of CONTINENTS){const list=confed.clubs.split('|'),featured=new Set(confed.featured.split('|'));
 mapping[confed.id]=[];
 for(let i=0;i<list.length;i++){
   const name=list[i],existing=clubsByName.get(name);
   if(existing){existing.continent=confed.id;existing.topSix=featured.has(name);mapping[confed.id].push(existing.index);continue;}
   const seed=Array.from(name).reduce((s,c)=>s*31+c.charCodeAt(0),17)>>>0;
   const rank=rankFor(name,confed.id,i,featured.has(name)),shot=keys[(seed>>>4)%keys.length],id='cont_'+confed.id.toLowerCase()+'_'+i;
   const named=(ROSTER_EXAMPLES[name]||'').split('|').filter(Boolean).slice(0,12);const playerSlots=[...named];
   while(playerSlots.length<12)playerSlots.push(`${name} • Academy ${playerSlots.length+1}`);
   const customRoster=playerSlots.map((person,n)=>({id:id+'_'+n,name:person,num:n+1,role:n===0||n===11?'GK':n===1||n===2||n===6?'DF':n===3||n===4||n===7?'MF':'FW',power:Math.min(80,Math.round(rank*.6+n%5)),shoot:Math.round(rank*.22+n%5),defense:Math.round(rank*.23+n%4),speed:['B','A','B','C'][n%4],shot,shotName:shots[shot].name,skill:'Arcade technique',age:18+(seed+n*7)%15,rating:Math.max(49,rank-n%7),xp:0,level:1,value:Math.round(Math.pow(rank-40,2)*22000),fictional:n>=named.length,source:n>=named.length?'generated stand-in (NOT verified player)':'illustrative player name; historical assignment not yet verified'}));
   const team={id,index:teams.length,name,flag:COUNTRY[name]||confed.id,primary:PALETTE[(seed>>>5)%PALETTE.length],secondary:'#fff2dc',trim:PALETTE[(seed>>>9)%PALETTE.length],shot,rank,group:'continental',continent:confed.id,topSix:featured.has(name),customRoster,rosterPrecision:'limited sourced roster; generated placeholders clearly marked'};
   teams.push(team);clubsByName.set(name,team);mapping[confed.id].push(team.index);
 }
 }
 return mapping;
}
const SIX_TOP_BY_CONTINENT=Object.fromEntries(CONTINENTS.map(c=>[c.id,c.featured.split('|')]));

return {CONTINENTS,SIX_TOP_BY_CONTINENT,installContinentalClubs};})();

export {CONTINENTAL};
