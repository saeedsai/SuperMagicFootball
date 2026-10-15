#!/usr/bin/env python3
"""Replace role-matching academy slots only with names verified against cited 2026 squads.

This is a conservative curated supplemental pass. No unverified EA ratings.
Retains stable game IDs and original 2/3/4/3 quotas.
"""
import collections,json
from pathlib import Path
from update_all_clubs_fc27 import ROOT,clean,stats,generated_number,QUOTAS

# Each entry is sourced independently from a dated 2026 roster, NOT FC27.
CURATED = {
 "cont_afc_16": {"GK": [
    ("Tomoki Hayakawa",76,1),("Taiki Yamada",71,21),("Yuji Kajikawa",69,29)],
   "source":"https://en.wikipedia.org/wiki/2026_Kashima_Antlers_season"},
 "cont_afc_4": {"GK": [
    ("Khalid Eisa",76,17),("Mohammed Bu Senda",70,1),("Hassan Muhammed",67,35)],
   "source":"https://www.transfermarkt.co.uk/al-ain-fc/kader/verein/2150/saison_id/2026"},
 "cont_conmebol_12": {"GK": [
    ("Hugo de Souza",78,1),("Felipe Longo Fernandes",69,40),("Matheus Corrêa Leite de Moraes",66,50)],
   "source":"https://gol.conmebol.com/libertadores/en/news/corinthians-2026-conmebol-libertadores-results-squad-and-schedule"},
 "cont_conmebol_23": {"GK": [
    ("Rodolfo Anderson",69,1),("Vidal",67,13),("Díaz",68,28)],
   "source":"https://starting11.com/cusco/squad"}
}
def main():
 data_path=ROOT/"data/players/continental.json"
 data=json.loads(data_path.read_text())
 report_path=ROOT/"docs/CLUB_ROSTER_FC27_ALL_CLUBS_20261015.json"
 report=json.loads(report_path.read_text())
 new=0;log=[]
 for team_id,record in CURATED.items():
    roster=data[team_id]
    occupied={clean(p["name"]) for p in roster if not p.get("fictional")}
    nums={int(p["num"]) for p in roster if p.get("num") is not None}
    for role,candidates in record.items():
     if role=="source":continue
     vacancies=[p for p in roster if p["role"]==role and p.get("fictional")]
     for slot in vacancies:
      match=next(((name,ovr,number) for name,ovr,number in candidates if clean(name) not in occupied),None)
      if match is None:continue
      name,ovr,number=match;oldnum=slot.get("num")
      nums.discard(oldnum)
      chosen=generated_number(nums,number)
      nums.add(chosen)
      occupied.add(clean(name))
      slot.update({"name":name,"rating":ovr,"role":role,"fictional":False,"num":chosen,
          "ratingSource":"Editorial medium-level position estimate; not an FC27 OVR",
          "source":record["source"],"sourceSnapshot":"2026-10-15",
          "rosterVerification":"2026_club_squad_source","statsVerified":False,
          "shirtVerified":False,"ageVerified":False,"appearanceVerified":False,
          "fc27Position":role,**stats({"overall_rating":str(ovr)},role)})
      for key in ("fc27Id","birthDate","canonicalId","height","nation","age"):slot.pop(key,None)
      new+=1;log.append((team_id,role,name,ovr))
    assert len(roster)==12 and collections.Counter(p["role"] for p in roster)==QUOTAS
    assert len({clean(p["name"]) for p in roster})==12
    assert len({p["num"] for p in roster})==12
    report[team_id]["selected"]=[{"name":p["name"],"role":p["role"],"rating":p["rating"]} for p in roster]
    report[team_id]["fictionalRemaining"]=sum(bool(p.get("fictional")) for p in roster)
    report[team_id]["origin"]+="+INDEPENDENT_2026_SQUAD"
    report[team_id]["source"]=str(report[team_id].get("source") or "")+"; "+record["source"]
    print("CURATED",team_id,report[team_id]["club"],"remaining",report[team_id]["fictionalRemaining"])
 js_path=ROOT/"src/roster_corrections.js"
 content=js_path.read_text()
 start=content.index("{",content.index("export const ROSTER_CORRECTIONS ="))
 registry,offset=json.JSONDecoder().raw_decode(content[start:])
 for team_id in CURATED:registry[team_id]=data[team_id]
 js_path.write_text(content[:start]+json.dumps(registry,ensure_ascii=False,separators=(",",":"))+
                    ";\n// Source-labeled audited club rosters synchronized with data/players.\n")
 data_path.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
 report_path.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
 print("CURATED SUMMARY",json.dumps({"verifiedPlayersAdded":new,"newNames":log,"fictionalRemaining":sum(v["fictionalRemaining"] for v in report.values())},ensure_ascii=False))
if __name__=="__main__":main()
