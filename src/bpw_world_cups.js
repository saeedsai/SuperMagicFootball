/** BPW: Best Players of each historical World Cup, not a national XI.
 * Six historically inspired *editorial* mixed squads (1998–2018), 12 unique
 * people per edition and 72 distinct people across editions. Selections are
 * based on historical All-Star / fan selections and tournament performances.
 * Names, tournament participation and primary playing roles are sourced.
 * Gameplay ratings/power and approximate tournament ages are arcade balance
 * design choices, not official FIFA/EA Sports player ratings or audited DOBs.
 * Slot IDs are version-stable and never replace legacy club/national team IDs.
 */
export const BPW_YEARS=Object.freeze([1998,2002,2006,2010,2014,2018]);
// [name, role, 2-letter nationality, approximate tournament age]
export const BPW_SELECTIONS=Object.freeze({
  "1998": [
    [
      "Fabien Barthez",
      "GK",
      "FR",
      26
    ],
    [
      "José Luis Chilavert",
      "GK",
      "PY",
      32
    ],
    [
      "Lilian Thuram",
      "DF",
      "FR",
      26
    ],
    [
      "Marcel Desailly",
      "DF",
      "FR",
      29
    ],
    [
      "Frank de Boer",
      "DF",
      "NL",
      27
    ],
    [
      "Zinedine Zidane",
      "MF",
      "FR",
      25
    ],
    [
      "Edgar Davids",
      "MF",
      "NL",
      24
    ],
    [
      "Dunga",
      "MF",
      "BR",
      34
    ],
    [
      "Michael Laudrup",
      "MF",
      "DK",
      33
    ],
    [
      "Davor Šuker",
      "FW",
      "HR",
      30
    ],
    [
      "Dennis Bergkamp",
      "FW",
      "NL",
      28
    ],
    [
      "Ronaldo Nazário",
      "FW",
      "BR",
      21
    ]
  ],
  "2002": [
    [
      "Oliver Kahn",
      "GK",
      "DE",
      32
    ],
    [
      "Rüştü Reçber",
      "GK",
      "TR",
      29
    ],
    [
      "Roberto Carlos",
      "DF",
      "BR",
      29
    ],
    [
      "Hong Myung-bo",
      "DF",
      "KR",
      33
    ],
    [
      "Sol Campbell",
      "DF",
      "GB",
      27
    ],
    [
      "Michael Ballack",
      "MF",
      "DE",
      25
    ],
    [
      "Hasan Şaş",
      "MF",
      "TR",
      25
    ],
    [
      "Yoo Sang-chul",
      "MF",
      "KR",
      30
    ],
    [
      "Claudio Reyna",
      "MF",
      "US",
      28
    ],
    [
      "Rivaldo",
      "FW",
      "BR",
      30
    ],
    [
      "Ronaldinho",
      "FW",
      "BR",
      22
    ],
    [
      "El Hadji Diouf",
      "FW",
      "SN",
      21
    ]
  ],
  "2006": [
    [
      "Gianluigi Buffon",
      "GK",
      "IT",
      28
    ],
    [
      "Ricardo Pereira",
      "GK",
      "PT",
      30
    ],
    [
      "Fabio Cannavaro",
      "DF",
      "IT",
      32
    ],
    [
      "Philipp Lahm",
      "DF",
      "DE",
      22
    ],
    [
      "Gianluca Zambrotta",
      "DF",
      "IT",
      29
    ],
    [
      "Andrea Pirlo",
      "MF",
      "IT",
      27
    ],
    [
      "Gennaro Gattuso",
      "MF",
      "IT",
      28
    ],
    [
      "Maniche",
      "MF",
      "PT",
      28
    ],
    [
      "Patrick Vieira",
      "MF",
      "FR",
      30
    ],
    [
      "Miroslav Klose",
      "FW",
      "DE",
      28
    ],
    [
      "Thierry Henry",
      "FW",
      "FR",
      28
    ],
    [
      "Hernán Crespo",
      "FW",
      "AR",
      30
    ]
  ],
  "2010": [
    [
      "Iker Casillas",
      "GK",
      "ES",
      29
    ],
    [
      "Maarten Stekelenburg",
      "GK",
      "NL",
      27
    ],
    [
      "Carles Puyol",
      "DF",
      "ES",
      32
    ],
    [
      "Sergio Ramos",
      "DF",
      "ES",
      24
    ],
    [
      "Maicon",
      "DF",
      "BR",
      28
    ],
    [
      "Xavi Hernández",
      "MF",
      "ES",
      30
    ],
    [
      "Bastian Schweinsteiger",
      "MF",
      "DE",
      25
    ],
    [
      "Wesley Sneijder",
      "MF",
      "NL",
      26
    ],
    [
      "Andrés Iniesta",
      "MF",
      "ES",
      26
    ],
    [
      "David Villa",
      "FW",
      "ES",
      28
    ],
    [
      "Diego Forlán",
      "FW",
      "UY",
      31
    ],
    [
      "Thomas Müller",
      "FW",
      "DE",
      20
    ]
  ],
  "2014": [
    [
      "Manuel Neuer",
      "GK",
      "DE",
      28
    ],
    [
      "Keylor Navas",
      "GK",
      "CR",
      27
    ],
    [
      "Mats Hummels",
      "DF",
      "DE",
      25
    ],
    [
      "David Luiz",
      "DF",
      "BR",
      27
    ],
    [
      "Thiago Silva",
      "DF",
      "BR",
      29
    ],
    [
      "Toni Kroos",
      "MF",
      "DE",
      24
    ],
    [
      "James Rodríguez",
      "MF",
      "CO",
      22
    ],
    [
      "Ángel Di María",
      "MF",
      "AR",
      26
    ],
    [
      "Javier Mascherano",
      "MF",
      "AR",
      30
    ],
    [
      "Neymar",
      "FW",
      "BR",
      22
    ],
    [
      "Lionel Messi",
      "FW",
      "AR",
      27
    ],
    [
      "Arjen Robben",
      "FW",
      "NL",
      30
    ]
  ],
  "2018": [
    [
      "Thibaut Courtois",
      "GK",
      "BE",
      26
    ],
    [
      "Hugo Lloris",
      "GK",
      "FR",
      31
    ],
    [
      "Raphaël Varane",
      "DF",
      "FR",
      25
    ],
    [
      "Diego Godín",
      "DF",
      "UY",
      32
    ],
    [
      "Yerry Mina",
      "DF",
      "CO",
      23
    ],
    [
      "Luka Modrić",
      "MF",
      "HR",
      32
    ],
    [
      "Kevin De Bruyne",
      "MF",
      "BE",
      27
    ],
    [
      "Philippe Coutinho",
      "MF",
      "BR",
      26
    ],
    [
      "Paul Pogba",
      "MF",
      "FR",
      25
    ],
    [
      "Harry Kane",
      "FW",
      "GB",
      24
    ],
    [
      "Kylian Mbappé",
      "FW",
      "FR",
      19
    ],
    [
      "Antoine Griezmann",
      "FW",
      "FR",
      27
    ]
  ]
});
const COLORS={1998:['#273869','#e1c357','#e7e9fb'],2002:['#f5d056','#27a47e','#3448a2'],2006:['#325ab5','#f3f5f9','#efc65d'],2010:['#d1ab4f','#263c60','#fbefe1'],2014:['#41ab6f','#e8d052','#2c58a0'],2018:['#d63e48','#f0eadf','#315eac']};
const SQUAD_SHOTS={1998:'comet',2002:'omega',2006:'eagle',2010:'target',2014:'tornado',2018:'mega'};
// Game-world identity reference: deterministic within the six BPW variants.
// Separate from verified club canonicalId (name+DOB); a future DOB audit may
// securely link these using variantOf without equating homonymous players.
export function historicalPersonKey(name){return 'worldcup:'+String(name).normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
export function installBPWWorldCups(TEAMS,SHOTS,avatarFor){
 const installed=[];
 for(const year of BPW_YEARS){
  const teamId=`bpw_wc_${year}`;
  const existing=TEAMS.find(t=>t.id===teamId);
  if(existing){installed.push(existing);continue;}
  const colors=COLORS[year];
  const shotKey=SQUAD_SHOTS[year];
  const roster=BPW_SELECTIONS[year].map(([name,role,nationality,age],i)=>{
   const rating=Math.min(99,Math.max(89,98-Math.floor(i/3)+(year%5===0?0:1)));
   const shot=(role==='GK')?'target':shotKey;
   const person=historicalPersonKey(name);
   const player={id:`bpw_wc_${year}_${i}`,name,role,nationality,
    num:i+1,age,ageStatus:'approximate at tournament',rating,
    ratingSource:'editorial arcade gameplay; not FIFA/EA ratings',
    power:Math.round(rating*.64+8),shoot:Math.round(rating*.30+3),defense:Math.round(rating*.30+3),
    speed:(role==='GK'||role==='DF')?'B':'A',shot,shotName:SHOTS[shot].name,
    skill:'World Cup All-Star',level:1,xp:0,fictional:false,
    historicalPersonKey:person,variantOf:person,worldCupYear:year,
    source:'Historical World Cup All-Star/editorial selection; see BPW_SOURCES_v0822.md',
    rosterVerification:'historical_tournament_selection',
    specialTierStatus:'future classification not activated'};
   if(avatarFor)player.avatar=avatarFor(player);
   return player;
  });
  const team={id:teamId,index:TEAMS.length,name:`BPW World Cup ${year}`,group:'bpw_worldcup',
   flag:'WC',primary:colors[0],secondary:colors[1],trim:colors[2],shot:shotKey,
   rank:98,worldCupYear:year,rosterPrecision:'editorial all-star selection',
   customRoster:roster};
  TEAMS.push(team);installed.push(team);
 }
 return installed;
}
