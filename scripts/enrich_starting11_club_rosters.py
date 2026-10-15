#!/usr/bin/env python3
"""Enrich missing real-player names from 2026/27 dated starting11 squad pages.

Only updates fictional unfilled slots. Never changes FC27-sourced records or
assigns FC27 ratings to unknown players. Source has first-team matches/starts.
"""
import collections
import json
import re
import unicodedata
import urllib.error
import urllib.request
from pathlib import Path
from bs4 import BeautifulSoup
from update_all_clubs_fc27 import ROOT,clean,stats,generated_number,QUOTAS

NAME_SLUG_OVERRIDES = {
    "Al Gharafa":"al-gharafa","Mamelodi Sundowns":"mamelodi-sundowns",
    "Vancouver FC":"vancouver-fc","Seattle Sounders":"seattle-sounders",
    "Philadelphia Union":"philadelphia-union","Vancouver Whitecaps":"vancouver-whitecaps",
    "Corinthians":"corinthians","Independiente Santa Fe":"independiente-santa-fe",
    "Al Ain":"al-ain","Cusco FC":"cusco",
    "Independiente Medellín":"independiente-medellin",
    "Universidad Católica":"universidad-catolica",
    "Al Hilal Omdurman":"al-hilal-omdurman",
    "Atlético Ottawa":"atletico-ottawa",
    "Al Sadd":"al-sadd",
    "Toluca":"toluca","Kashima Antlers":"kashima-antlers",
    "Young Africans":"young-africans",
    "Lae City FC":"lae-city",
}
PREFIX = "https://starting11.com/"
def slug(name):
    if name in NAME_SLUG_OVERRIDES:return NAME_SLUG_OVERRIDES[name]
    plain=unicodedata.normalize("NFKD",name)
    ascii_name="".join(c for c in plain if not unicodedata.combining(c)).lower()
    return re.sub(r"(^-|-$)","",re.sub(r"[^a-z0-9]+","-",ascii_name))
def fetch_club(name):
    url=PREFIX+slug(name)+"/squad"
    try:
        request=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (compatible; SuperMagicFootball roster QA)","Accept":"text/html"})
        with urllib.request.urlopen(request,timeout=15) as response:
            html=response.read().decode("utf8")
        soup=BeautifulSoup(html,"html.parser")
        h=soup.find("h1")
        heading=h.get_text(" ",strip=True) if h else ""
        # Reject unrelated, redirected or stale preseason roster pages.
        if "2026/27" not in heading or "squad" not in heading.lower():
            return [],url,"No 2026/27 squad heading"
        title=heading.split(" squad")[0]
        if clean(title)!=clean(name):
            return [],url,"Unrelated club: "+title
        records=[]
        for role,code in (("GK","gk"),("DF","def"),("MF","mid"),("FW","fwd")):
            section=soup.find("section",id="squad-"+code)
            if section is None:continue
            for item in section.select("ul > li"):
                anchor=item.find("a",href=re.compile(r"^/player/"))
                if anchor is None:continue
                name_display=anchor.get_text(" ",strip=True)
                if not 3<=len(name_display)<=72 or name_display.lower() in ("unknown","tbd","player"):
                    continue
                # Collect starts directly from mobile responsive stat column.
                mobile=item.select_one("div.md\\:hidden")
                text=item.get_text(" ",strip=True)
                match=re.search(r"(\\d+)\\s*st(?:\\s|$)",text)
                starts=int(match.group(1)) if match else 0
                apps=re.search(r"(\\d+)\\s*apps",text)
                apps_count=int(apps.group(1)) if apps else 0
                badge=item.find("span",attrs={"aria-hidden":"true"})
                try:shirt=int(badge.get_text(" ",strip=True))
                except (TypeError,ValueError,AttributeError):shirt=None
                if shirt not in range(1,100):shirt=None
                records.append({"name":name_display,"role":role,"starts":starts,
                                "apps":apps_count,"num":shirt,"playerURL":PREFIX.rstrip("/")+anchor.get("href")})
        # Avoid accepting a dubious page with only a few youth-team players.
        if len(records)<6:return [],url,"Insufficient documented first-team players"
        return records,url,"OK"
    except (urllib.error.URLError,TimeoutError,ValueError) as exc:
        return [],url,type(exc).__name__+": "+str(exc)[:80]

def equivalent(name,existing):
    value=clean(name)
    if value in existing:return True
    # Avoid surname-only duplicate when original has a verified full name.
    if len(value)>=5 and any(full.endswith(value) for full in existing):
        return True
    return False

def main():
    path=ROOT/"data/players/continental.json"
    data=json.loads(path.read_text())
    audit_path=ROOT/"docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json"
    audits=json.loads(audit_path.read_text())
    added=0;visited=0;found=0
    for team_id,record in audits.items():
        if team_id not in data or not record.get("fictionalRemaining"):continue
        if record["origin"]=="FC27":continue
        visited+=1
        squad=data[team_id]
        options,url,reason=fetch_club(record["club"])
        if not options:
            print("STARTING11_UNAVAILABLE",team_id,record["club"],reason,flush=True)
            continue
        occupied={clean(p["name"]) for p in squad if not p.get("fictional")}
        original_names={p["name"] for p in squad if not p.get("fictional")}
        taken={p["num"] for p in squad if p.get("num") is not None}
        replacements=0
        for role in QUOTAS:
            pool=sorted((p for p in options if p["role"]==role),
                        key=lambda p:(-p["starts"],-p["apps"],p["num"] is None,p["num"] or 99,clean(p["name"])))
            for slot in [p for p in squad if p["role"]==role and p.get("fictional")]:
                candidate=next((p for p in pool if not equivalent(p["name"],occupied)),None)
                if candidate is None:continue
                name=candidate["name"]
                # Explicit, position-based editorial mid-level OVR; never EA.
                position_base={"GK":69,"DF":70,"MF":71,"FW":72}[role]
                rating=max(65,min(79,position_base+(3 if candidate["starts"]>=20 else 2 if candidate["starts"]>=8 else 1 if candidate["starts"]>=3 else 0)))
                taken.discard(slot.get("num"))
                number=generated_number(taken,candidate["num"])
                taken.add(number)
                slot.update({"name":name,"role":role,"num":number,"rating":rating,
                    "fictional":False,"ratingSource":"Editorial position/2026 starts estimate; not FC27",
                    "source":url+"#squad-"+{"GK":"gk","DF":"def","MF":"mid","FW":"fwd"}[role],
                    "sourceSnapshot":"2026-10-15",
                    "rosterVerification":"2026_27_first_team_source",
                    "statsVerified":False,"shirtVerified":False,"ageVerified":False,
                    "appearanceVerified":False,"fc27Position":role,
                    **stats({"overall_rating":str(rating)},role)})
                for key in ("fc27Id","birthDate","canonicalId","height","nation","age"):slot.pop(key,None)
                occupied.add(clean(name))
                replacements+=1;added+=1
        if replacements:
            found+=1
            record["source"]=str(record.get("source") or "")+"; "+url
            record["origin"]+="+STARTING11_2026_27"
            record["selected"]=[{"name":p["name"],"role":p["role"],"rating":p["rating"]} for p in squad]
            record["fictionalRemaining"]=sum(bool(p.get("fictional")) for p in squad)
        assert len(squad)==12 and collections.Counter(p["role"] for p in squad)==QUOTAS
        assert len({clean(p["name"]) for p in squad})==12,team_id+" duplicate names"
        assert len({p["num"] for p in squad})==12,team_id+" duplicate shirt numbers"
        print("STARTING11",team_id,record["club"],"source",url,"replaced",replacements,
              "remaining",record["fictionalRemaining"],flush=True)
    if added:
        js_path=ROOT/"src/roster_corrections.js"
        source=js_path.read_text()
        start=source.index("{",source.index("export const ROSTER_CORRECTIONS ="))
        registry,_=json.JSONDecoder().raw_decode(source[start:])
        for id,roster in data.items():registry[id]=roster
        js_path.write_text(source[:start]+json.dumps(registry,separators=(",",":"),ensure_ascii=False)+
                           ";\n// Roster updates preserve positional quotas and independently cited fallback provenance.\n")
        path.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
        audit_path.write_text(json.dumps(audits,indent=2,ensure_ascii=False)+"\n")
    print("STARTING11_SUMMARY",json.dumps({"visited":visited,"clubsImproved":found,"playersAdded":added,
            "fictionalRemaining":sum(v["fictionalRemaining"] for v in audits.values())}),flush=True)
if __name__=="__main__":main()
