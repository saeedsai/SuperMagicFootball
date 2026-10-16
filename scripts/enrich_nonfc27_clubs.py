#!/usr/bin/env python3
"""Enrich only unresolved club placeholders from direct current-squad pages.

Never touch an already named player. Retain positional quotas, game IDs and any
FC27 ratings. The Wikipedia current-squad row is the name/position source;
66-79 overall ratings are explicitly editorial, NOT FC27 ratings.
"""
import collections
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path
from bs4 import BeautifulSoup
from update_all_clubs_fc27 import clean, stats, generated_number, QUOTAS

ROOT=Path(__file__).resolve().parents[1]
WIKI={
"Johor Darul Ta'zim":"Johor_Darul_Ta'zim_F.C.",
"Gamba Osaka":"Gamba_Osaka",
"Công An Hà Nội":"Cong_An_Ha_Noi_FC",
"RS Berkane":"RS_Berkane","Pyramids FC":"Pyramids_FC",
"Rivers United":"Rivers_United_F.C.","Power Dynamos":"Power_Dynamos_F.C.",
"Al Ahly":"Al_Ahly_SC","Young Africans":"Young_Africans_S.C.",
"AS FAR Rabat":"AS_FAR","JS Kabylie":"JS_Kabylie",
"Mamelodi Sundowns":"Mamelodi_Sundowns_F.C.",
"Al Hilal Omdurman":"Al-Hilal_SC_(Omdurman)","MC Alger":"MC_Alger",
"Saint Éloi Lupopo":"FC_Saint-Éloi_Lupopo",
"Espérance de Tunis":"Espérance_Sportive_de_Tunis",
"Simba SC":"Simba_S.C.","Petro de Luanda":"Atlético_Petróleos_de_Luanda",
"Stade Malien":"Stade_Malien",
"Vancouver FC":"Vancouver_FC","Defence Force FC":"Defence_Force_F.C.",
"O&M FC":"O%26M_F.C.","Mount Pleasant FA":"Mount_Pleasant_Football_Academy",
"Club Olimpia":"Club_Olimpia","Xelajú MC":"CSD_Xelajú_MC",
"Cartaginés":"C.S._Cartaginés","Alajuelense":"L.D._Alajuelense",
"Real España":"Real_C.D._España",
"Sporting San Miguelito":"Sporting_San_Miguelito",
"Atlético Ottawa":"Atlético_Ottawa",
"Seattle Sounders":"Seattle_Sounders_FC","Tigres UANL":"Tigres_UANL",
"Philadelphia Union":"Philadelphia_Union",
"Vancouver Whitecaps":"Vancouver_Whitecaps_FC",
"Palmeiras":"SE_Palmeiras","Liga de Quito":"L.D.U._Quito",
"Fluminense":"Fluminense_FC",
"Independiente del Valle":"Independiente_del_Valle",
"Estudiantes de La Plata":"Estudiantes_de_La_Plata",
"Cruzeiro":"Cruzeiro_Esporte_Clube",
"Junior Barranquilla":"Atlético_Junior",
"Universidad Católica":"Club_Deportivo_Universidad_Católica",
"Deportivo La Guaira":"Deportivo_La_Guaira",
"Universidad Central":"Universidad_Central_de_Venezuela_Fútbol_Club",
"Independiente Rivadavia":"Independiente_Rivadavia",
"Mirassol":"Mirassol_Futebol_Clube",
"Auckland City":"Auckland_City_FC",
"Central Coast FC":"Central_Coast_FC",
"AS Vénus":"AS_Vénus","AS Tiga Sport":"AS_Tiga_Sport",
"Rewa FC":"Rewa_F.C.","Lae City FC":"Lae_City_F.C.",
"Galaxy FC":"Galaxy_FC",
"Tupapa Maraerenga":"Tupapa_Maraerenga_F.C.",
}
def wiki_players(label):
    slug=WIKI.get(label)
    if not slug:return [],"No canonical page mapped"
    url="https://en.wikipedia.org/wiki/"+urllib.parse.quote(urllib.parse.unquote(slug),safe="()_'./")
    try:
        req=urllib.request.Request(url,headers={"User-Agent":"SuperMagicFootballRosterAuditor/1.0 (github.com/saeedsai/SuperMagicFootball)"})
        with urllib.request.urlopen(req,timeout=15) as r: page=r.read()
        soup=BeautifulSoup(page,"html.parser")
        players={}
        for h in soup.select("h2,h3,h4"):
            if not re.search(r"current squad|first.team squad|first team",h.get_text(" ",strip=True),re.I):continue
            table=h.find_next("table")
            if table is None:continue
            for tr in table.select("tr"):
                cells=tr.find_all(["td","th"],recursive=False)
                for pos in range(0,len(cells),4):
                    group=cells[pos:pos+4]
                    if len(group)<4:continue
                    role=group[1].get_text(" ",strip=True).upper()
                    if role not in QUOTAS:continue
                    name=re.sub(r"\s*\([^)]*\)","",group[3].get_text(" ",strip=True)).strip()
                    name=re.sub(r"\s*\[\d+\]","",name).strip()
                    if len(name)<4:continue
                    number=re.search(r"\b\d{1,2}\b",group[0].get_text(" ",strip=True))
                    num=int(number.group(0)) if number else None
                    # Numbers are a rough indicator of first-team use, never a genuine rating.
                    rank=2 if num is not None and num<=11 else 1 if num is not None and num<=25 else 0
                    rating=min(79,((69 if role=="GK" else 70 if role=="DF" else 71 if role=="MF" else 72)+rank))
                    players.setdefault(clean(name),{"name":name,"role":role,"rating":rating,"num":num})
            if players:break
        return list(players.values()),url
    except Exception as exc:return [],"Unavailable: "+str(exc)[:100]

def main():
    audit_path=ROOT/"docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json"
    audit=json.loads(audit_path.read_text())
    data_path=ROOT/"data/players/continental.json"
    data=json.loads(data_path.read_text())
    updated=0
    improved_clubs=0
    attempted=0
    for club_id,record in audit.items():
        if club_id not in data or not record["fictionalRemaining"]:continue
        if record["origin"]=="FC27":continue
        attempted+=1
        roster=data[club_id]
        options,url=wiki_players(record["club"])
        before=sum(bool(p.get("fictional")) for p in roster)
        existing={clean(p["name"]) for p in roster if not p.get("fictional")}
        taken_nums={p["num"] for p in roster if isinstance(p.get("num"),int)}
        choices={role:sorted([p for p in options if p["role"]==role],
                            key=lambda p:(-p["rating"],p["num"] or 99)) for role in QUOTAS}
        for old in roster:
            if not old.get("fictional"):continue
            role=old["role"]
            matched=next((p for p in choices[role] if clean(p["name"]) not in existing),None)
            if not matched:continue
            existing.add(clean(matched["name"]))
            rating=matched["rating"]
            old.update({"name":matched["name"],"rating":rating,"fictional":False,
                        "source":url,"ratingSource":"Editorial medium-level fallback; FC27 not available",
                        "sourceSnapshot":"2026-10-15","rosterVerification":"editorial",
                        "statsVerified":False,"shirtVerified":False,"ageVerified":False,
                        "appearanceVerified":False,"fc27Position":role,**stats({"overall_rating":str(rating)},role)})
            for k in ("birthDate","canonicalId","fc27Id","height","nation"):old.pop(k,None)
            old.pop("age",None)
            taken_nums.discard(old.get("num"))
            number=matched["num"] if matched["num"] not in taken_nums else old.get("num")
            old["num"]=generated_number(taken_nums,number)
            taken_nums.add(old["num"])
            updated+=1
        remaining=sum(bool(p.get("fictional")) for p in roster)
        if remaining<before:
            improved_clubs+=1
            record["source"]=(record.get("source") or "")+"; "+url
            record["origin"]=record["origin"]+"+DIRECT_WIKIPEDIA"
            record["selected"]=[{"name":p["name"],"role":p["role"],"rating":p["rating"]} for p in roster]
            record["fictionalRemaining"]=remaining
        if collections.Counter(p["role"] for p in roster)!=QUOTAS:raise RuntimeError("Role quota "+club_id)
        if len({clean(p["name"]) for p in roster})!=12:raise RuntimeError("Repeated name "+club_id)
        if len({p["num"] for p in roster})!=12:raise RuntimeError("Repeated shirt "+club_id)
        print("DIRECT",club_id,record["club"],len(options),"replaced",before-remaining,"remaining",remaining,url,flush=True)
    all_sources=ROOT/"src/roster_corrections.js"
    content=all_sources.read_text()
    start=content.index("{",content.index("export const ROSTER_CORRECTIONS ="))
    registry,end=json.JSONDecoder().raw_decode(content[start:])
    for key,roster in data.items():registry[key]=roster
    all_sources.write_text(content[:start]+json.dumps(registry,ensure_ascii=False,separators=(",",":"))+
                           ";\n// All club source records are synchronized with data/players.\n")
    data_path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
    audit_path.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+"\n")
    print("DIRECT SUMMARY",json.dumps({"attempted":attempted,"enrichedClubs":improved_clubs,
                                        "namedPlayersAdded":updated,
                                        "fictionalRemaining":sum(v["fictionalRemaining"] for v in audit.values())}),flush=True)
if __name__=="__main__":main()
