from pathlib import Path
import re
p=Path(__file__).resolve().parents[1]
modules={}
for name in ['dribbles','kits','special_levels','stats','morale','abilities','fitness','roster_corrections','player_identity_registry','data','identity','tactics','ai','expanded','bpw_world_cups','continental','tournaments','career','input','engine','render','club_filters','main']:
 s=(p/'src'/f'{name}.js').read_text()
 s=re.sub(r'^import\b[^\n]*;', '',s,flags=re.M)
 s=re.sub(r'\bexport\s+(?=(const|class|function)\b)', '',s)
 modules[name]=s
parts=[
 'const DRIBBLES=(()=>{'+modules['dribbles']+'\nreturn {DRIBBLE_STYLES,dribbleStyle,assignedDribbleType,dribbleOdds};})();',
 'const KITS=(()=>{'+modules['kits']+'\nreturn {KIT_CHOICES,kitFor,kitsFor};})();',
 'const SPECIALS=(()=>{'+modules['special_levels']+'\nreturn {MAX_SPECIAL_LEVEL,LEVEL_FIVE_STARS,LEVEL_FOUR_STARS,abilityLevel,levelModifiers,shotVelocityModifier};})();',
 'const STATS=(()=>{const {assignedDribbleType}=DRIBBLES;const {abilityLevel}=SPECIALS;'+modules['stats']+'\nreturn {NUMERIC_STATS,withStats,stat,endurance,contest,shotError,POSITION_OVR_STATS,overallForPosition};})();',
 'const MORALE=(()=>{'+modules['morale']+'\nreturn {TEAM_TALKS,clampMorale,personalityOf,moraleFactor,moodLabel,reactToTalk,goalMorale};})();',
 'const ABILITIES=(()=>{const {abilityLevel,levelModifiers}=SPECIALS;'+modules['abilities']+'\nreturn {DEFENCE_MOVES,KEEPER_MOVES,fieldAbility,keeperAbility,abilityReady,keeperInReach};})();',
 'const FITNESS=(()=>{'+modules['fitness']+'\nreturn {MAX_SUBSTITUTIONS,initialFatigue,fatigueTick,actionFatigue,staminaPercent,matchCondition,fatigueStatus,substitutionChanges,recommendSubstitute};})();',
 'const PLAYERIDENTITY=(()=>{'+modules['player_identity_registry']+'\nreturn {normalizePersonName,isPlaceholderIdentity,validBirthDate,canonicalPersonId,buildIdentityRegistry};})();',
 'const DATA=(()=>{const {canonicalPersonId}=PLAYERIDENTITY;'+modules['roster_corrections']+'\n'+modules['data']+'\nreturn {JAPAN_ROSTER,TEAMS,rosterFor,SHOTS,FORMATIONS,DEFAULT_LINEUP,DEFAULT_OPTIONS,WEATHER,TERRAIN,CONDITIONS};})();',
 'const IDENTITY=(()=>{'+modules['identity']+'\nreturn {countryCode,countryFlag,isClub,cartoonFlagSVG,crestText,crestSVG,teamIdentity};})();',
 'const CLUBFILTERS=(()=>{const {countryCode}=IDENTITY;'+modules['club_filters']+'\nreturn {careerClubIds,clubCountry,clubRegion,countryName,availableRegions,availableCountries,clubsInCountry};})();',
 'const TACTICS=(()=>{const {FORMATIONS,DEFAULT_LINEUP}=DATA;'+modules['tactics']+'\nreturn {ATTACK_STYLES,DEFENCE_STYLES,ROLES,defaultPlan,validatePlan,safePlan,tacticModifiers};})();',
 'const AI=(()=>{'+modules['ai']+'\nreturn {AI_LEVELS,aiTuning,defensivePressers};})();',
 'const EXPANDED=(()=>{'+modules['expanded']+'\nreturn {NATIONAL_2026,CLUBS_2026,LEGEND_SQUADS,avatarFor,installExpansion};})();',
 'const BPW=(()=>{'+modules['bpw_world_cups']+'\nreturn {BPW_YEARS,BPW_SELECTIONS,historicalPersonKey,installBPWWorldCups};})();',
 'const CONTINENTAL=(()=>{'+modules['continental']+'\nreturn {CONTINENTS,SIX_TOP_BY_CONTINENT,installContinentalClubs};})();',
 'const TOURNAMENTS=(()=>{const {CONTINENTS}=CONTINENTAL;'+modules['tournaments']+'\nreturn {createTournament,tournamentCurrent,tournamentAdvance,tournamentStandings,tournamentProgress,validateTournament};})();',
 'const CAREER=(()=>{'+modules['career']+'\nreturn {createCareer,currentCareerFixture,advanceCareer,standings,nextSeason,purchase,upgradeFacility,trainPlayer,scoutAcademy,signAcademy,renewContract,recoverPlayer,careerCoverage,recordMatchFitness};})();',
 'const INPUT=(()=>{'+modules['input']+'\nreturn {Input};})();',
 'const ENGINE=(()=>{const {TEAMS,JAPAN_ROSTER,rosterFor,FORMATIONS,DEFAULT_LINEUP,SHOTS}=DATA;const {dribbleStyle,dribbleOdds}=DRIBBLES;const {aiTuning,defensivePressers}=AI;const {withStats,stat,endurance,contest,shotError}=STATS;const {abilityLevel,levelModifiers,shotVelocityModifier}=SPECIALS;const {clampMorale,moraleFactor,reactToTalk,goalMorale,personalityOf,TEAM_TALKS,moodLabel}=MORALE;const {kitFor}=KITS;const {fieldAbility,keeperAbility,abilityReady,keeperInReach}=ABILITIES;const {safePlan,validatePlan,tacticModifiers}=TACTICS;const {MAX_SUBSTITUTIONS,initialFatigue,fatigueTick,actionFatigue,substitutionChanges,recommendSubstitute,matchCondition}=FITNESS;'+modules['engine']+'\nreturn {GameEngine,WORLD};})();',
 'const RENDER=(()=>{const {WORLD}=ENGINE;const {TEAMS,SHOTS}=DATA;const {dribbleStyle}=DRIBBLES;const {avatarFor}=EXPANDED;'+modules['render']+'\nreturn {Renderer};})();',
 '(()=>{const {JAPAN_ROSTER,TEAMS,rosterFor,SHOTS,DEFAULT_OPTIONS,DEFAULT_LINEUP,WEATHER,TERRAIN,CONDITIONS,FORMATIONS}=DATA;const {Input}=INPUT;const {TEAM_TALKS,moodLabel}=MORALE;const {AI_LEVELS,aiTuning}=AI;const {withStats,NUMERIC_STATS,overallForPosition}=STATS;const {abilityLevel}=SPECIALS;const {kitFor,KIT_CHOICES}=KITS;const {teamIdentity,countryFlag,countryCode,isClub}=IDENTITY;const {careerClubIds,clubRegion,clubCountry,countryName,availableRegions,availableCountries,clubsInCountry}=CLUBFILTERS;const {defaultPlan,safePlan,validatePlan,ATTACK_STYLES,DEFENCE_STYLES}=TACTICS;const {GameEngine}=ENGINE;const {Renderer}=RENDER;const {installExpansion,avatarFor}=EXPANDED;const {installBPWWorldCups,BPW_YEARS}=BPW;const {CONTINENTS,SIX_TOP_BY_CONTINENT,installContinentalClubs}=CONTINENTAL;const {createTournament,tournamentCurrent,tournamentAdvance,tournamentStandings,tournamentProgress,validateTournament}=TOURNAMENTS;const {createCareer,currentCareerFixture,advanceCareer,standings,nextSeason,purchase,upgradeFacility,trainPlayer,scoutAcademy,signAcademy,renewContract,recoverPlayer,careerCoverage,recordMatchFitness}=CAREER;'+modules['main']+'\n})();'
]
script='\n'.join(parts)
html=(p/'index.html').read_text().replace('<link rel="stylesheet" href="style.css"/>','<style>\n'+(p/'style.css').read_text()+'\n</style>')
html=html.replace('<script type="module" src="src/main.js"></script>','<script type="module">\n'+script.replace('</script>','<\\/script>')+'\n</script>')
html=html.replace('<link rel="manifest" href="manifest.webmanifest"/>','').replace('<link rel="icon" href="icon.svg"/>','')
(p/'play.html').write_text(html)
print('Portable offline game created',p/'play.html',len(html))
