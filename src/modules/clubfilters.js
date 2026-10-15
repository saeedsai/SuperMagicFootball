// Supermagic Football v0.8.25.30 | CLUBFILTERS | independently editable module
import {IDENTITY} from "./identity.js";
const CLUBFILTERS=(()=>{const {countryCode}=IDENTITY;// Six-continent, country-first navigation for existing manager clubs.
// Keeps geography separate from the historical/confederation tournament formats.

const REGIONS={
 UEFA:new Set('GB IE FR DE ES IT PT NL BE AT GR TR NO CZ SK AZ UA CH PL DK SE FI HR HU RO RU'.split(' ')),
 AFC:new Set('SA AE QA IR UZ IQ JP KR TH CN AU MY VN IN PK ID'.split(' ')),
 CAF:new Set('MA EG NG ZM TZ DZ ZA SD CD TN AO ML SN CM GH CI KE'.split(' ')),
 CONCACAF:new Set('CA TT DO JM HN GT CR PA US MX'.split(' ')),
 CONMEBOL:new Set('BR AR UY EC PY BO PE CO CL VE'.split(' ')),
 OFC:new Set('NZ SB PF NC FJ PG VU CK'.split(' '))
};
const NAME_OVERRIDE={ENG:'England',SCO:'Scotland',WAL:'Wales',TRI:'Trinidad and Tobago',TAH:'Tahiti',NCL:'New Caledonia',COK:'Cook Islands',SOL:'Solomon Islands',MAS:'Malaysia',RSA:'South Africa',KSA:'Saudi Arabia',UAE:'United Arab Emirates',COD:'DR Congo'};
const careerClubIds=teams=>teams.map((t,i)=>i).filter(i=>['club26','continental'].includes(teams[i].group));
const clubCountry=team=>String(team.flag||'UNKNOWN').toUpperCase();
function clubRegion(team){if(REGIONS[team.continent])return team.continent;const code=countryCode(team);for(const [region,codes] of Object.entries(REGIONS))if(codes.has(code))return region;return 'OTHER';}
function countryName(code,teams=[]){if(NAME_OVERRIDE[code])return NAME_OVERRIDE[code];const t=teams.find(t=>clubCountry(t)===code);const c=t?countryCode(t):code;try{return new Intl.DisplayNames(['en'],{type:'region'}).of(c)||code}catch{return code}}
function availableRegions(teams){const ids=careerClubIds(teams),regions=[...new Set(ids.map(i=>clubRegion(teams[i])))];return ['UEFA','AFC','CAF','CONCACAF','CONMEBOL','OFC','OTHER'].filter(x=>regions.includes(x));}
function availableCountries(teams,region){return [...new Set(careerClubIds(teams).filter(i=>clubRegion(teams[i])===region).map(i=>clubCountry(teams[i])))].sort((a,b)=>countryName(a,teams).localeCompare(countryName(b,teams)));}
function clubsInCountry(teams,region,country){return careerClubIds(teams).filter(i=>clubRegion(teams[i])===region&&clubCountry(teams[i])===country);}

return {careerClubIds,clubCountry,clubRegion,countryName,availableRegions,availableCountries,clubsInCountry};})();

export {CLUBFILTERS};
