#!/usr/bin/env python3
"""Refresh 165 actual club teams from the EA FC27 Sep 12 snapshot, with documented fallback.

Source: LakshmiKanth11/EA_FC_ANALYSIS, data/players.csv, 2026-09-12.
Fallback: current Wikipedia club-squad tables where they can be substantiated,
plus an official CONMEBOL registration for Flamengo.
No guessed name is labeled FC27 verified. Honors 2 GK / 3 DF / 4 MF / 3 FW.
"""
import argparse
import collections
import csv
import datetime
import difflib
import io
import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL = "https://raw.githubusercontent.com/LakshmiKanth11/EA_FC_ANALYSIS/main/EA_FC_PLAYERS_DATASET_AND_%20DASHBOARD/data/players.csv"
QUOTAS = {"GK":2,"DF":3,"MF":4,"FW":3}
POS = {"GK":"GK","DF":"DF","MF":"MF","FW":"FW","CB":"DF","LB":"DF","RB":"DF","LWB":"DF","RWB":"DF",
       "CDM":"MF","CM":"MF","CAM":"MF","LM":"MF","RM":"MF",
       "ST":"FW","CF":"FW","LW":"FW","RW":"FW","LF":"FW","RF":"FW"}
ALIASES = {
    "Bayern Munich":"FC Bayern München", "Barcelona":"FC Barcelona",
    "Paris Saint-Germain":"Paris SG", "Manchester United":"Man Utd",
    "Inter Milan":"Lombardia FC", "AC Milan":"Milano FC",
    "Bournemouth":"AFC Bournemouth", "Newcastle United":"Newcastle Utd",
    "Nottingham Forest":"Nott'm Forest", "Atlético Madrid":"Atlético de Madrid",
    "Atletico Madrid":"Atlético de Madrid", "Bayer Leverkusen":"Leverkusen",
    "Roma":"AS Roma", "Napoli":"SSC Napoli", "Porto":"FC Porto",
    "Benfica":"SL Benfica", "Tottenham":"Spurs", "Club Brugge":"Club Brugge",
    "PSV Eindhoven":"PSV", "Lens":"RC Lens", "Lille":"LOSC Lille",
    "Real Betis":"Real Betis", "Slavia Prague":"Slavia Praha",
    "Shakhtar Donetsk":"Shakhtar Donetsk", "RB Leipzig":"RB Leipzig",
    "VfB Stuttgart":"VfB Stuttgart", "Galatasaray":"Galatasaray",
    "Fenerbahçe":"Fenerbahçe", "Como":"Como", "Feyenoord":"Feyenoord",
    "Al Nassr":"Al Nassr", "Al Hilal":"Al Hilal", "Al Ittihad":"Al Ittihad",
    "Al Ahli Saudi":"Al Ahli", "Vissel Kobe":"Vissel Kobe",
    "Kashima Antlers":"Kashima Antlers",
    "Jeonbuk Hyundai Motors":"Jeonbuk Hyundai",
    "Daejeon Hana Citizen":"Daejeon Hana",
    "Pohang Steelers":"Pohang Steelers",
    "Shanghai Port":"Shanghai Port",
    "Beijing Guoan":"Beijing Guoan",
    "Kashiwa Reysol":"Kashiwa Reysol",
    "Cruz Azul":"CF Cruz Azul",
    "LAFC":"Los Angeles FC",
    "Los Angeles FC":"LAFC",
    "Club América":"Club América",
    "Monterrey":"Monterrey", "Pumas UNAM":"Pumas",
    "Villarreal":"Villarreal CF", "VfB Stuttgart":"VfB Stuttgart",
    "Vélez Sarsfield":"Vélez Sarsfield",
}
FALLBACK_FLAMENGO = {
    "GK":[("Agustín Rossi",77),("Andrew da Silva",70)],
    "DF":[("Léo Pereira",78),("Léo Ortiz",77),("Alex Sandro",76)],
    "MF":[("Giorgian de Arrascaeta",80),("Lucas Paquetá",79),
          ("Jorginho",78),("Erick Pulgar",77)],
    "FW":[("Pedro",80),("Samuel Lino",78),("Gonzalo Plata",76)]
}
FLAMENGO_SOURCE="https://gol.conmebol.com/libertadores/en/news/flamengo-2026-conmebol-libertadores-results-squad-and-schedule"
HEADERS={"User-Agent":"SuperMagicFootballRosterAuditor/1.0 (github.com/saeedsai/SuperMagicFootball)",
         "Accept":"text/html,text/csv,application/json"}
def fetch(url):
    req=urllib.request.Request(url,headers=HEADERS)
    with urllib.request.urlopen(req,timeout=24) as response:return response.read()
def norm(s):
    s=unicodedata.normalize("NFKD",str(s or ""))
    return re.sub(r"[^a-z0-9]","",s.lower().replace("ı","i") if isinstance(s,str) else "".join(c for c in s if not unicodedata.combining(c))).lower()
def clean(s):
    s=unicodedata.normalize("NFKD",str(s or ""))
    return re.sub(r"[^a-z0-9]","", "".join(c for c in s if not unicodedata.combining(c)).lower())
def display_name(row):
    common=(row.get("common_name") or "").strip()
    if common:return common
    first=(row.get("first_name") or "").strip()
    last=(row.get("last_name") or "").strip()
    # Card records store short first names and sometimes multiword surname.
    return (first+" "+last).strip()
def stats(row,role):
    def n(key,default): 
        try:return int(float(row.get(key) or 0)) or default
        except (TypeError,ValueError):return default
    ovr=n("overall_rating",72)
    if role=="GK":return {"power":max(35,min(75,round(ovr*.62+4))),
                          "shoot":max(10,min(45,round(ovr*.21))),
                          "defense":max(20,min(80,round(ovr*.55))),
                          "speed":"A" if n("goalkeeping_reflexes",0)>=87 else "B"}
    return {"power":max(35,min(76,round((ovr+n("physicality",ovr))*.33))),
            "shoot":max(12,min(70,round(n("shooting",ovr)*.46+8))),
            "defense":max(12,min(70,round(n("defending",ovr)*.47+8))),
            "speed":"A" if n("pace",ovr)>=82 else "B" if n("pace",ovr)>=65 else "C"}
def generated_number(taken,desired=None):
    try:n=int(desired)
    except (ValueError,TypeError):n=0
    if n>0 and n<100 and n not in taken:return n
    return next(i for i in range(1,100) if i not in taken)
def make_candidate(r,kind="FC27"):
    role=POS.get(r.get("position","").upper())
    if not role:return None
    name=display_name(r)
    if not name:return None
    try:ovr=int(r["overall_rating"])
    except (ValueError,TypeError):return None
    dob=r.get("birthdate") or ""
    age=None
    if re.fullmatch(r"\\d{4}-\\d{2}-\\d{2}",dob):
        year,month,day=map(int,dob.split("-"))
        age=2026-year-((10,15)<(month,day))
    extra=re.split(r"[ ,/]+",r.get("alternate_positions") or "")
    eligible={role}|{POS[p] for p in extra if p in POS}
    return {"name":name,"role":role,"eligibleRoles":sorted(eligible),
            "rating":ovr,"age":age,
            "birthDate":dob or None,"nation":r.get("nationality") or None,
            "height":int(r["height_cm"]) if r.get("height_cm","").isdigit() else None,
            "fcId":r.get("player_id") or None,"pos":r.get("position") or None,
            "fc27FaceStats":{key:int(r[key]) for key in ["pace","shooting","passing","dribbling","defending","physicality"] if (r.get(key) or "").isdigit()},
            "stats":stats(r,role),"sourceKind":kind}
def wiki_squad(name):
    """Best-effort current-squad fallback; never use an arbitrary historical player table."""
    try:
        from bs4 import BeautifulSoup
        query=urllib.parse.quote(name+" football club current squad")
        api="https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch="+query+"&srlimit=4&format=json"
        found=json.loads(fetch(api)).get("query",{}).get("search",[])
        for hit in found[:3]:
            title=hit["title"]
            if any(w in title.lower() for w in ["(women)","(benghazi)","history of"," in international football"]):continue
            if not any(w in clean(title) for w in [clean(name),clean(name).removesuffix("fc"),clean(name).removesuffix("sc")] if len(w)>4):continue
            url="https://en.wikipedia.org/wiki/"+urllib.parse.quote(title.replace(" ","_"))
            soup=BeautifulSoup(fetch(url),"html.parser")
            rows=[]
            for head in soup.select("h2,h3,h4"):
                if not re.search(r"(?:current squad|first.team squad|first team|^squad$)",head.get_text(" ",strip=True),re.I):continue
                nxt=head.find_next("table")
                if not nxt:continue
                # Since the 2026 Wikipedia HTML migration, many current-squad
                # player tables no longer carry the `wikitable` CSS class.
                # Trust the named 'Current squad' section, not table styling.
                for tr in nxt.select("tr"):
                    td=tr.find_all(["td","th"],recursive=False)
                    if len(td)<3:continue
                    t=[c.get_text(" ",strip=True) for c in td]
                    role=POS.get(next((v.upper() for v in t[:4] if v.upper() in POS),""))
                    if not role:continue
                    # Wikipedia table: No | Pos | Nation | Player. Some
                    # articles present two such blocks next to one another.
                    for offset in range(0,len(td),4):
                        block=td[offset:offset+4]
                        if len(block)<4:continue
                        role=POS.get(block[1].get_text(" ",strip=True).upper())
                        if not role:continue
                        named=block[3].get_text(" ",strip=True)
                        named=re.sub(r"\s*\([^)]*\)","",named).strip()
                        named=re.sub(r"\s*\[\d+\]","",named).strip()
                        if not named or len(named)<4 or any(k in named.lower() for k in ["national","football","association"]):continue
                        number_text=block[0].get_text(" ",strip=True)
                        match=re.search(r"\b\d{1,2}\b",number_text)
                        shirt=int(match.group(0)) if match else None
                        rank_bonus=2 if shirt and shirt<=11 else 1 if shirt and shirt<=25 else 0
                        rating=min(78,(72 if role=="GK" else 73 if role=="DF" else 74 if role=="MF" else 75)+rank_bonus)
                        rows.append({"name":named,"role":role,"rating":rating,
                                 "number":shirt,"sourceKind":"WIKIPEDIA","source":url,"age":None,"birthDate":None,
                                 "nation":None,"pos":role,"stats":stats({"overall_rating":str(rating)},role)})
            unique={}
            for q in rows:unique.setdefault(clean(q["name"]),q)
            if len(unique)>=5 and sum(q["role"]=="GK" for q in unique.values())>=1:return list(unique.values()),url
    except Exception as exc:return [],"wiki unavailable: "+str(exc)[:100]
    return [],"no current squad listing"
def sportsdb_role(value):
    p=str(value or "").lower().replace("-"," ").strip()
    if not p or p=="manager" or "coach" in p:return None
    if "goalkeep" in p or p in ("gk","keeper"):return "GK"
    if any(v in p for v in ("defend","back","centre half","center half","sweeper")):return "DF"
    if "wing" in p or any(v in p for v in ("striker","forward","attacker")):return "FW"
    if any(v in p for v in ("midfield","playmaker","midfielder")):return "MF"
    return None
def sportsdb_squad(label,club_id):
    """Independent roster service, medium-level editorial ratings, never claimed EA."""
    prefix=club_id.split("_")[1].upper() if club_id.startswith("cont_") else "UEFA"
    bases={"UEFA":75,"AFC":73,"CAF":72,"CONCACAF":73,"CONMEBOL":75,"OFC":68}
    base=bases.get(prefix,73)
    variants=[label,ALIASES.get(label,label)]
    if label.endswith(" FC"):variants.append(label[:-3])
    if label.endswith(" SC"):variants.append(label[:-3])
    if label=="Bodø/Glimt":variants+=["Bodo Glimt","Bodo/Glimt","FK Bodo/Glimt"]
    last=""
    for variant in dict.fromkeys(variants):
        try:
            url="https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t="+urllib.parse.quote(variant)
            data=json.loads(fetch(url)); options=data.get("teams") or []
            normalized=clean(label)
            def matching_team(t):
                if t.get("strSport") not in ("Soccer","Football"):return False
                value=clean(t.get("strTeam",""))
                if not value or any(q in t.get("strTeam","").lower() for q in (" ii"," u18"," u19"," u21"," women"," reserves")):return False
                short=lambda x:re.sub(r"(footballclub|fc|cf|sc|ac|fk|afc|club)$","",x)
                return value==normalized or short(value)==short(normalized) or value==clean(variant)
            club=next((t for t in options if matching_team(t)),None)
            if not club:continue
            api="https://www.thesportsdb.com/api/v1/json/3/lookup_all_players.php?id="+str(club["idTeam"])
            players=json.loads(fetch(api)).get("player") or []
            result=[]
            for p in players:
                role=sportsdb_role(p.get("strPosition"))
                name=(p.get("strPlayer") or "").strip()
                if not role or len(name)<4 or name.lower() in ("unknown","tbd"):continue
                try:num=int(p.get("strNumber") or 99)
                except (TypeError,ValueError):num=99
                # Lower shirt numbers are prioritized when no verified overall exists.
                ovr=max(65,min(79,base+(2 if num<=11 else 0 if num<=25 else -1)
                                +(2 if role=="FW" else 1 if role=="MF" else 0)))
                dob=(p.get("dateBorn") or "").strip()
                try:
                    y,m,d=[int(k) for k in dob.split("-")[:3]]
                    age=2026-y-((10,15)<(m,d))
                except (ValueError,TypeError):dob=None;age=None
                result.append({"name":name,"role":role,"rating":ovr,
                    "sourceKind":"SPORTSDB","birthDate":dob,"age":age,
                    "nation":p.get("strNationality") or None,"pos":p.get("strPosition"),
                    "number":num if num in range(1,100) else None,
                    "stats":stats({"overall_rating":str(ovr)},role)})
            unique={}
            for p in result:unique.setdefault(clean(p["name"]),p)
            result=list(unique.values())
            if result:
                return result,"https://www.thesportsdb.com/team/"+str(club["idTeam"])
        except Exception as e:last=str(e)[:100]
    return [],"SportsDB unavailable: "+last if last else "No matching club roster"
def match_club(name,byclub):
    wanted=ALIASES.get(name,name)
    key=clean(wanted)
    if key in byclub:return key
    # Avoid cross-club errors: allow only unambiguous, extremely close matches.
    hits=difflib.get_close_matches(key,list(byclub),n=2,cutoff=.96)
    if len(hits)==1:return hits[0]
    return None
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--apply",action="store_true")
    ap.add_argument("--skip-wikipedia",action="store_true")
    args=ap.parse_args()
    rows=list(csv.DictReader(io.StringIO(fetch(URL).decode("utf-8-sig"))))
    # Public snapshot includes FC Women's players under some identical club
    # names (Arsenal, Chelsea, Barcelona, etc.). Never mix women's and men's squads.
    def mens_record(r):
        gender=(r.get("gender") or "").strip().lower()
        league=(r.get("league") or "").strip().lower()
        return gender not in {"female","f","woman","women","women's football","w"} and \
               not any(label in league for label in ("women","female","femenin","frauenliga"))
    men=[r for r in rows if mens_record(r)]
    byclub=collections.defaultdict(list)
    for row in men:
        if not row.get("club"):continue
        byclub[clean(row["club"])].append(row)
    teams={t["id"]:t for t in json.loads((ROOT/"data/teams.json").read_text())}
    group_data={p:json.loads((ROOT/p).read_text()) for p in
                ["data/players/club26.json","data/players/continental.json"]}
    root=(ROOT/"src/roster_corrections.js")
    source=root.read_text()
    start=source.index("{",source.index("export const ROSTER_CORRECTIONS ="))
    registry,end=json.JSONDecoder().raw_decode(source[start:])
    audit=[]
    refs={}
    changed=0
    for file,data in group_data.items():
        for club_id,old in data.items():
            label=teams[club_id]["name"]
            key=match_club(label,byclub)
            origin="FC27" if key else "NOT_IN_FC27"
            candidates=[]
            src=URL
            if key:
                for row in byclub[key]:
                    c=make_candidate(row)
                    if c:candidates.append(c)
            elif label=="Flamengo":
                origin="OFFICIAL_ROSTER_EDITORIAL_OVR";src=FLAMENGO_SOURCE
                for role,group in FALLBACK_FLAMENGO.items():
                    for name,rating in group:
                        candidates.append({"name":name,"role":role,"rating":rating,"age":None,
                            "birthDate":None,"nation":None,"pos":role,"sourceKind":"EDITORIAL",
                            "stats":stats({"overall_rating":str(rating)},role)})
            elif not args.skip_wikipedia:
                candidates,src=wiki_squad(label)
                if candidates:origin="WIKIPEDIA_EDITORIAL_OVR"
                # Many AFC/CAF/CONCACAF/OFC clubs have no FC27 roster or
                # fully structured Wikipedia table. Use independent club lists.
                supplemental,secondary=sportsdb_squad(label,club_id)
                if supplemental:
                    if not candidates:
                        candidates,src=supplemental,secondary
                        origin="SPORTSDB_EDITORIAL_OVR"
                    else:
                        seen={clean(c["name"]) for c in candidates}
                        candidates+=[c for c in supplemental if clean(c["name"]) not in seen]
                        src=src+"; "+secondary
                        origin="WIKIPEDIA_AND_SPORTSDB_EDITORIAL_OVR"
            groups={k:[] for k in QUOTAS}
            for p in candidates:
                for role in p.get("eligibleRoles",[p["role"]]):
                    if role in groups:groups[role].append(p)
            for role in groups:
                dedup={}
                for p in sorted(groups[role],
                                key=lambda p:(-p["rating"],p["role"]!=role,clean(p["name"]))):
                    dedup.setdefault(clean(p["name"]),p)
                groups[role]=list(dedup.values())
            selected={r:[] for r in QUOTAS}
            used_names=set()
            # Scarce positions first; allow verified alternate position assignments.
            for role in ("GK","DF","FW","MF"):
                for p in groups[role]:
                    if len(selected[role])>=QUOTAS[role]:break
                    if clean(p["name"]) in used_names:continue
                    selected[role].append(dict(p,assignedRole=role))
                    used_names.add(clean(p["name"]))
            for role,num in QUOTAS.items():
                for q in old:
                    if len(selected[role])>=num:break
                    if q["role"]!=role or clean(q["name"]) in used_names:continue
                    fallback_ovr=min(78,int(q.get("rating",73)))
                    selected[role].append({"name":q["name"],"role":role,"assignedRole":role,
                        "rating":fallback_ovr,"age":q.get("age"),
                        "birthDate":q.get("birthDate"),"nation":q.get("nation"),
                        "fictional":q.get("fictional",True),
                        "sourceKind":"LEGACY_UNVERIFIED" if not q.get("fictional") else "LEGACY_PLACEHOLDER",
                        "pos":role,"stats":stats({"overall_rating":str(fallback_ovr)},role)})
                    used_names.add(clean(q["name"]))
            used_ids=set()
            used_slots=set()
            taken_nums=set()
            created=[]
            for role,count in QUOTAS.items():
                for p in selected[role]:
                    name_key=clean(p["name"])
                    slot=next((q for q in old if clean(q["name"])==name_key and q["id"] not in used_ids),None)
                    if slot is None:slot=next((q for q in old if q["role"]==role and q["id"] not in used_ids),None)
                    if slot is None:slot=next((q for q in old if q["id"] not in used_ids),None)
                    if slot is None:raise AssertionError("no slot "+club_id)
                    used_ids.add(slot["id"])
                    is_same=clean(slot["name"])==name_key
                    updated={k:v for k,v in slot.items() if k not in
                        ("canonicalId","birthDate","verifiedAsOf","source","ageVerified",
                        "rosterVerification","shirtVerified","appearanceVerified",
                        "statsVerified","ratingSource","nation","nationality","height",
                        "position","fictional","fc27Id","fc27Position","sourceSnapshot")}
                    updated.update({"name":p["name"],"role":role,"rating":p["rating"],"fictional":bool(p.get("fictional",False)),
                        **p["stats"],"ratingSource":("FC27 third-party dataset snapshot 2026-09-12" if p["sourceKind"]=="FC27"
                                      else "Editorial fallback (not FC27 verified)"),
                        "source":src if origin!="FC27" else URL,
                        "statsVerified":False,
                        "appearanceVerified":False,
                        "rosterVerification":(slot.get("rosterVerification") if is_same and slot.get("rosterVerification")=="verified_club_role"
                                                else "fc27_position_club" if p["sourceKind"]=="FC27" else "editorial"),
                        "shirtVerified":bool(is_same and slot.get("shirtVerified")),
                        "sourceClubMatch":origin,
                        "ageVerified":bool(p.get("birthDate") and origin=="FC27"),
                        "sourceSnapshot":"2026-09-12" if origin=="FC27" else "2026-10-15"})
                    if is_same and slot.get("canonicalId") and slot.get("birthDate")==p.get("birthDate"):updated["canonicalId"]=slot["canonicalId"]
                    if p.get("fc27FaceStats"):updated["fc27FaceStats"]=p["fc27FaceStats"]
                    if p.get("age") is not None:updated["age"]=p["age"]
                    elif not is_same:updated.pop("age",None)
                    if p.get("birthDate"):updated["birthDate"]=p["birthDate"]
                    elif is_same and slot.get("birthDate"):updated["birthDate"]=slot["birthDate"]
                    if p.get("nation"):updated["nation"]=p["nation"]
                    if p.get("height"):updated["height"]=p["height"]
                    if p.get("fcId"):updated["fc27Id"]=p["fcId"]
                    if p.get("pos"):updated["fc27Position"]=p["pos"]
                    updated["num"]=generated_number(taken_nums,p.get("number") or (slot.get("num") if is_same else None))
                    taken_nums.add(updated["num"])
                    created.append(updated)
            # Gaps remain explicit and keep their unverified in-game players.
            missing={role:QUOTAS[role]-len(selected[role]) for role in QUOTAS}
            if any(missing.values()):
                # Preserve remaining old slots without making claims of authentic players.
                for role,n in missing.items():
                    for q in old:
                        if n==0:break
                        if q["id"] in used_ids or q["role"]!=role:continue
                        p=dict(q)
                        p["num"]=generated_number(taken_nums,q.get("num"))
                        taken_nums.add(p["num"]);created.append(p);used_ids.add(p["id"]);n-=1
                    if n:raise RuntimeError("role slots unavailable "+club_id+" "+role)
            if len(created)!=12:raise AssertionError((club_id,len(created)))
            if collections.Counter(p["role"] for p in created)!=QUOTAS:raise AssertionError("quota "+club_id)
            if len({p["id"] for p in created})!=12:raise AssertionError("ids "+club_id)
            if len({clean(p["name"]) for p in created})!=12:raise AssertionError("names "+club_id)
            if old!=created:changed+=1
            data[club_id]=created
            registry[club_id]=created
            refs[club_id]={"club":label,"origin":origin,"source":src,
                "found":{r:len(groups[r]) for r in QUOTAS},
                "selected":[{"name":p["name"],"role":p["role"],"rating":p["rating"]} for p in created],
                "fictionalRemaining":sum(p.get("fictional",False) for p in created),
                "oldNames":[q["name"] for q in old]}
            audit.append({"teamId":club_id,"club":label,"origin":origin,
                "found":sum(len(groups[r]) for r in QUOTAS),
                "fictionalRemaining":sum(p.get("fictional",False) for p in created),
                "replaced":sum(p["name"] not in [q["name"] for q in old] for p in created)})
            print("CLUB",club_id,label,origin,
                  "found",sum(len(groups[r]) for r in QUOTAS),
                  "remaining-fictional",audit[-1]["fictionalRemaining"],flush=True)
    total=sum(r["fictionalRemaining"] for r in audit)
    sources=collections.Counter(r["origin"] for r in audit)
    print("AUDIT SUMMARY",json.dumps({"clubs":len(audit),"changed":changed,
        "origin":sources,"fictionalRemaining":total}),flush=True)
    out=ROOT/"docs"/"CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json"
    out.write_text(json.dumps(refs,indent=2,ensure_ascii=False)+"\n")
    if args.apply:
        for file,data in group_data.items():
            (ROOT/file).write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
        # This game's historical one-off JavaScript roster migrations are
        # superseded by the unified, source-labeled club rosters written above.
        # Retaining them would silently undo selected players at runtime and
        # in several cases throw on intentionally replaced old slot IDs.
        final=(source[:start]+json.dumps(registry,ensure_ascii=False,separators=(",",":"))+
               ";\n// 2026-10-15: one-time club mappings consolidated into the source-labeled registry.\n")
        root.write_text(final)
    return 0
if __name__=="__main__":
    raise SystemExit(main())
